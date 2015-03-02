package com.example.kevin.myapplication;

import android.app.ListActivity;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.EditText;
import android.widget.ListView;

import org.kaazing.net.ws.amqp.AmqpProperties;
import org.kaazing.net.ws.amqp.ChannelEvent;
import org.kaazing.net.ws.amqp.AmqpChannel;
import org.kaazing.net.ws.amqp.AmqpClient;
import org.kaazing.net.ws.amqp.AmqpClientFactory;
import org.kaazing.net.ws.amqp.ChannelAdapter;
import org.kaazing.net.ws.amqp.ConnectionEvent;
import org.kaazing.net.ws.amqp.ConnectionListener;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.StringWriter;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.util.ArrayList;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonWriter;
import javax.json.stream.JsonParser;

public class MainActivity extends ActionBarActivity
{
    AmqpChannel             consume = null;
    AmqpChannel			    publish = null;
    AmqpClientFactory       factory = null;
    AmqpClient              client = null;

    DispatchQueue           dispatch = null;

    ArrayList<ChatMessage>  items = null;
    ChatAdapter             adapter = null;
    EditText                message = null;
    ListView                history = null;

    int                     style = 0;
    long                    now = 0;

    @Override
    protected void onCreate( Bundle savedInstanceState )
    {
        super.onCreate( savedInstanceState );
        setContentView(R.layout.activity_main);

        int red = ( int )( Math.random() * 255 );
        int green = ( int )( Math.random() * 255 );
        int blue = ( int )( Math.random() * 255 );

        style = Color.rgb( red, green, blue );

        now = System.currentTimeMillis();

        Log.i( "Permissions ", Boolean.toString( hasPermission( "android.permission.INTERNET" ) ) );

        // Gateway
        connect();

        items = new ArrayList<>();
        adapter = new ChatAdapter(this, items);
        history = ( ListView )findViewById( R.id.history );

        history.setAdapter(adapter);

        message = ( EditText )findViewById( R.id.message );
        message.setOnKeyListener( new View.OnKeyListener()
        {
            @Override
            public boolean onKey( View v, int keyCode, KeyEvent event )
            {
                ChatMessage chat;

                if( event.getAction() == KeyEvent.ACTION_DOWN )
                {
                    if( message.getText().toString().trim().length() > 0 )
                    {
                        chat = new ChatMessage();
                        chat.content = message.getText().toString();
                        chat.user = "user_" + now;
                        chat.color = style;

                        sendMessage( chat );

                        message.setText( null );
                    }
                }

                return false;
            }
        } );
    }

    private ArrayList<ChatMessage> generateData(){
        ArrayList<ChatMessage> items = new ArrayList<>();
        items.add(new ChatMessage("Item 1"));
        items.add(new ChatMessage("Item 2") );
        items.add(new ChatMessage("Item 3") );

        return items;
    }

    public boolean hasPermission( String permission )
    {
        PackageInfo info;

        try {
            info = getPackageManager().getPackageInfo( this.getApplicationContext().getPackageName(), PackageManager.GET_PERMISSIONS );

            if( info.requestedPermissions != null )
            {
                for( String p : info.requestedPermissions )
                {
                    if( p.equals( permission ) )
                    {
                        return true;
                    }
                }
            }
        } catch ( Exception e ) {
            e.printStackTrace();
        }

        return false;
    }

    @Override
    public boolean onCreateOptionsMenu( Menu menu )
    {
        // No menu
        return true;
    }

    @Override
    public boolean onOptionsItemSelected( MenuItem item )
    {
        // No menu
        return super.onOptionsItemSelected(item);
    }

    /*
     * Kaazing
     */

    public void connect()
    {
        dispatch = new DispatchQueue( "Async Dispatch Queue" );
        dispatch.start();
        dispatch.waitUntilReady();

        dispatch.dispatchAsync( new Runnable() {
            public void run()
            {
                try {
                    // Factory
                    factory = AmqpClientFactory.createAmqpClientFactory();

                    client = factory.createAmqpClient();

                    // Connection listeners
                    client.addConnectionListener( new ConnectionListener() {
                        // Connecting
                        public void onConnecting(ConnectionEvent ce) {
                            dispatch.dispatchAsync(
                                new Runnable() {
                                    public void run() {
                                        System.out.println("Connecting...");
                                    }
                                }
                            );
                        }

                        // Error
                        public void onConnectionError(ConnectionEvent ce) {
                            dispatch.dispatchAsync(
                                new Runnable() {
                                    public void run() {
                                        System.out.println("Connection error...");
                                    }
                                }
                            );
                        }

                        // Open
                        public void onConnectionOpen(ConnectionEvent ce) {
                            dispatch.dispatchAsync(
                                new Runnable() {
                                    public void run() {
                                        System.out.println("Connection open...");
                                        doClientOpen();
                                    }
                                }
                            );
                        }

                        // Close
                        public void onConnectionClose(ConnectionEvent ce) {
                            dispatch.dispatchAsync(
                                new Runnable() {
                                    public void run() {
                                        System.out.println("Connection close...");
                                    }
                                }
                            );
                        }
                    } );

                    // Connect to server
                    client.connect(
                        getString(R.string.sandbox_url),
                        getString(R.string.virtual_host),
                        getString(R.string.sandbox_user),
                        getString(R.string.sandbox_password)
                    );
                } catch( Exception e ) {
                    e.printStackTrace();
                }
            }
        } );
    }

    public void doClientOpen()
    {
        Log.i( "Gateway", "Connection ready." );

        // Send messages
        publish = client.openChannel();

        // Channel listeners
        publish.addChannelListener( new ChannelAdapter() {
            // Close
            public void onClose( ChannelEvent ce )
            {
                dispatch.dispatchAsync( new Runnable() {
                    public void run()
                    {
                        System.out.println( "Publish closed." );
                    }
                } );
            }

            // Error
            public void onError( ChannelEvent ce )
            {
                dispatch.dispatchAsync( new Runnable() {
                    public void run()
                    {
                        System.out.println( "Publish error." );
                    }
                } );
            }

            // Declare exchange
            public void onDeclareExchange( ChannelEvent ce )
            {
                dispatch.dispatchAsync( new Runnable() {
                    public void run()
                    {
                        System.out.println( "Exchange declared." );

                        // Setup consumer
                        doPublishReady();
                    }
                } );
            }

            // Open
            public void onOpen( ChannelEvent ce )
            {
                dispatch.dispatchAsync( new Runnable() {
                    public void run()
                    {
                        System.out.println( "Publish open." );

                        // Declare exchange
                        publish.declareExchange( "exchange_WLRNhKKM7d", "direct", false, false, false, null );
                    }
                } );
            }
        } );
    }

    public void doPublishReady()
    {
        Log.i( "Gateway", "Publish ready..." );

        // Consume
        consume = client.openChannel();

        // Channel listeners
        consume.addChannelListener( new ChannelAdapter() {
            // Bind queue
            public void onBindQueue( ChannelEvent ce )
            {
                dispatch.dispatchAsync( new Runnable() {
                    public void run()
                    {
                        System.out.println( "Queue bound." );
                    }
                } );
            }

            // Close
            public void onClose( ChannelEvent ce )
            {
                dispatch.dispatchAsync(new Runnable() {
                    public void run() {
                        System.out.println("Consume closed.");
                    }
                });
            }

            // Consume
            public void onConsumeBasic( ChannelEvent ce )
            {
                dispatch.dispatchAsync(new Runnable() {
                    public void run() {
                        System.out.println("Consuming...");

                        // Open user interface for sending messages
                        doConsumeReady();
                    }
                });
            }

            // Declare queue
            public void onDeclareQueue( ChannelEvent ce )
            {
                dispatch.dispatchAsync(new Runnable() {
                    public void run() {
                        System.out.println("Queue declared.");
                    }
                });
            }

            // Flow
            public void onFlow( ChannelEvent ce )
            {
                try {
                    final boolean isActive = ce.isFlowActive();

                    dispatch.dispatchAsync( new Runnable() {
                        public void run()
                        {
                            System.out.println( "Flow is " + ( isActive ? "on" : "off" ) + "." );
                        }
                    } );
                } catch( Exception e ) {
                    e.printStackTrace();
                }
            }

            // Message
            public void onMessage( ChannelEvent ce )
            {
                byte[]	bytes;

                bytes = new byte[ce.getBody().remaining()];
                ce.getBody().get( bytes );

                final Long		tag = ( Long )ce.getArgument( "deliveryTag" );
                final String	value = new String( bytes, Charset.forName("UTF-8") );

                dispatch.dispatchAsync(new Runnable() {
                    public void run() {
                        System.out.println("Message: " + value);

                        // Place in user interface
                        doMessageArrived(value);

                        // Acknowledge
                        consume.ackBasic(tag, true);
                    }
                });
            }

            // Open
            public void onOpen( ChannelEvent ce )
            {
                dispatch.dispatchAsync(new Runnable() {
                    public void run() {
                        System.out.println("Consume open.");

                        // Declare queue
                        // Bind queue to exchange
                        // Start consuming
                        consume.declareQueue(getString( R.string.chat_queue ), false, false, false, false, false, null)
                                .bindQueue(getString(R.string.chat_queue), getString(R.string.chat_exchange), getString(R.string.chat_topic), false, null)
                                .consumeBasic(getString(R.string.chat_queue), getString(R.string.chat_tag), false, false, false, false, null);
                    }
                });
            }
        } );
    }

    private void doConsumeReady()
    {
        Log.i( "Gateway", "Consume ready..." );
        // field.setEnabled( true );
    }

    public void doMessageArrived( String body )
    {
        ChatMessage message;
        JsonParser.Event e;
        InputStream stream;
        JsonParser parser;

        // String to InputStream
        stream = new ByteArrayInputStream( body.getBytes( StandardCharsets.UTF_8 ) );
        parser = Json.createParser(stream);

        // New chat message
        message = new ChatMessage();
        message.raw = body;

        // Parse JSON
        while( parser.hasNext() )
        {
            e = parser.next();

            if( e == JsonParser.Event.KEY_NAME )
            {
                switch( parser.getString() )
                {
                    case "color":
                        parser.next();
                        message.color = parseRgb(parser.getString());
                        Log.i("Chat", Integer.toString(message.color));
                        break;

                    case "message":
                        parser.next();
                        message.content = parser.getString();
                        break;

                    case "user":
                        parser.next();
                        message.user = parser.getString();
                        break;
                }
            }
        }

        items.add( message );
        adapter.notifyDataSetChanged();
    }

    private int parseRgb( String rgb )
    {
        int			blue;
        int			end;
        int			green;
        int  		red;
        int			start;
        String		raw;
        String[]	values;

        // Find parentheses
        start = rgb.indexOf( "( " ) + 2;
        end = rgb.indexOf( " )", start );

        // Grab values
        // Split into an array
        raw = rgb.substring( start, end );
        values = raw.split( "," );

        // Parse out integer values
        // Bitwise shit
        red = Integer.parseInt( values[0].trim() );
        green = Integer.parseInt( values[1].trim() );
        blue = Integer.parseInt( values[2].trim() );

        // Into single integer
        return Color.rgb( red, green, blue );
    }

    public void sendMessage( ChatMessage message )
    {
        AmqpProperties      properties;
        ByteBuffer          buffer;
        JsonObject          result;
        JsonObjectBuilder   builder;
        StringWriter        sw;
        Timestamp           stamp;

        // Build JSON object
        // Interacting with the web
        builder = Json.createObjectBuilder();
        builder.add( "message", message.content );
        builder.add( "color", "rgb( " + Color.red( message.color ) + ", " + Color.green( message.color ) + ", " + Color.blue( message.color ) + " )" );
        builder.add( "user", message.user );

        result = builder.build();

        // Java JSON object to String
        sw = new StringWriter();

        try( JsonWriter writer = Json.createWriter( sw ) ) {
            writer.writeObject( result );
        }

        // Here is what we are going to send
        System.out.println( "Sending: " + sw.toString() );

        // Encode for AMQP
        buffer = ByteBuffer.allocate( 512 );
        buffer.put( sw.toString().getBytes( Charset.forName( "UTF-8" ) ) );
        buffer.flip();

        stamp = new Timestamp( System.currentTimeMillis() );

        // Publish parameters
        properties = new AmqpProperties();
        properties.setMessageId( "1" );
        properties.setCorrelationId( "4" );
        properties.setAppId( "java_chat" );
        properties.setUserId( "user_" + now );
        properties.setContentType( "text/plain" );
        properties.setContentEncoding( "UTF-8" );
        properties.setPriority( 6 );
        properties.setDeliveryMode( 1 );
        properties.setTimestamp( stamp );

        Log.i( "Strings", getString(R.string.chat_exchange) );
        Log.i( "Strings", getString(R.string.chat_topic) );

        if( publish == null )
        {
            Log.i( "Publish", "Is null." );
        } else {
            Log.i( "Publish", "Not null." );
        }

        // Send
        publish.publishBasic(
            buffer,
            properties,
            getString( R.string.chat_exchange ),
            getString( R.string.chat_topic ),
            false,
            false
        );
    }
}
