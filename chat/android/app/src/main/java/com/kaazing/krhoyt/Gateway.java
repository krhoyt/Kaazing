package com.kaazing.krhoyt;

import android.graphics.Color;
import android.util.Log;

import org.kaazing.net.ws.amqp.AmqpChannel;
import org.kaazing.net.ws.amqp.AmqpClient;
import org.kaazing.net.ws.amqp.AmqpClientFactory;
import org.kaazing.net.ws.amqp.AmqpProperties;
import org.kaazing.net.ws.amqp.ChannelAdapter;
import org.kaazing.net.ws.amqp.ChannelEvent;
import org.kaazing.net.ws.amqp.ConnectionEvent;
import org.kaazing.net.ws.amqp.ConnectionListener;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.StringWriter;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonWriter;
import javax.json.stream.JsonParser;

public class Gateway {

    AmqpChannel         consume = null;
    AmqpChannel         publish = null;
    AmqpClientFactory   factory = null;
    AmqpClient          client = null;

    DispatchQueue       dispatch = null;

    ChatCallback        callback = null;

    public Gateway() {
        dispatch = new DispatchQueue( "Async Dispatch Queue" );
        dispatch.start();
        dispatch.waitUntilReady();

        dispatch.dispatchAsync( new Runnable() {
            public void run() {
                try {
                    // Factory
                    factory = AmqpClientFactory.createAmqpClientFactory();

                    client = factory.createAmqpClient();

                    // Connection listeners
                    client.addConnectionListener( new ConnectionListener() {
                        // Connecting
                        public void onConnecting( ConnectionEvent ce ) {
                            dispatch.dispatchAsync(
                                new Runnable() {
                                    public void run() {
                                        System.out.println( "Connecting..." );
                                    }
                                }
                            );
                        }

                        // Error
                        public void onConnectionError( ConnectionEvent ce ) {
                            dispatch.dispatchAsync(
                                new Runnable() {
                                    public void run() {
                                        System.out.println( "Connection error." );
                                    }
                                }
                            );
                        }

                        // Open
                        public void onConnectionOpen( ConnectionEvent ce ) {
                            dispatch.dispatchAsync(
                                new Runnable() {
                                    public void run() {
                                        System.out.println( "Connection open." );

                                        // Open publish channel
                                        doClientOpen();
                                    }
                                }
                            );
                        }

                        // Close
                        public void onConnectionClose( ConnectionEvent ce ) {
                            dispatch.dispatchAsync(
                                new Runnable() {
                                    public void run() {
                                        System.out.println( "Connection close." );
                                    }
                                }
                            );
                        }
                    } );

                    // Connect to server
                    client.connect(
                        "wss://sandbox.kaazing.net/amqp091",
                        "/",
                        "guest",
                        "guest"
                    );
                } catch( Exception e ) {
                    e.printStackTrace();
                }
            }
        } );
    }

    private void doClientOpen() {
        Log.i( "Gateway", "Connection ready." );

        // Send messages
        publish = client.openChannel();

        // Channel listeners
        publish.addChannelListener( new ChannelAdapter() {
            // Close
            public void onClose( ChannelEvent ce ) {
                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        System.out.println( "Publish closed." );
                    }
                } );
            }

            // Error
            public void onError( ChannelEvent ce ) {
                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        System.out.println( "Publish error." );
                    }
                } );
            }

            // Declare exchange
            public void onDeclareExchange( ChannelEvent ce ) {
                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        System.out.println( "Exchange declared." );

                        // Setup consumer
                        doPublishReady();
                    }
                } );
            }

            // Open
            public void onOpen( ChannelEvent ce ) {
                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        System.out.println( "Publish open." );

                        // Declare exchange
                        publish.declareExchange( "exchange_WLRNhKKM7d", "direct", false, false, false, null );
                    }
                } );
            }
        } );
    }

    public void doMessageArrived( String body ) {
        ChatMessage         message;
        JsonParser.Event    event;
        InputStream         stream;
        JsonParser          parser;

        // String to InputStream
        stream = new ByteArrayInputStream( body.getBytes( StandardCharsets.UTF_8 ) );
        parser = Json.createParser( stream );

        // New chat message
        message = new ChatMessage();
        message.raw = body;

        // Parse JSON
        while( parser.hasNext() ) {
            event = parser.next();

            if( event == JsonParser.Event.KEY_NAME ) {
                switch( parser.getString() ) {
                    case "color":
                        parser.next();
                        message.color = parseRgb( parser.getString() );
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

        callback.onMessage( message );
    }

    private void doPublishReady() {
        Log.i( "Gateway", "Publish ready..." );

        // Consume
        consume = client.openChannel();

        // Channel listeners
        consume.addChannelListener( new ChannelAdapter() {
            // Bind queue
            public void onBindQueue( ChannelEvent ce ) {
                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        System.out.println( "Queue bound." );
                    }
                } );
            }

            // Close
            public void onClose( ChannelEvent ce ) {
                dispatch.dispatchAsync(new Runnable() {
                    public void run() {
                        System.out.println( "Consume closed." );
                    }
                } );
            }

            // Consume
            public void onConsumeBasic( ChannelEvent ce ) {
                dispatch.dispatchAsync(new Runnable() {
                    public void run() {
                        System.out.println( "Consuming..." );

                        callback.onAllClear();
                    }
                } );
            }

            // Declare queue
            public void onDeclareQueue( ChannelEvent ce ) {
                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        System.out.println( "Queue declared." );
                    }
                } );
            }

            // Flow
            public void onFlow( ChannelEvent ce ) {
                try {
                    final boolean isActive = ce.isFlowActive();

                    dispatch.dispatchAsync( new Runnable() {
                        public void run() {
                            System.out.println( "Flow is " + ( isActive ? "on" : "off" ) + "." );
                        }
                    } );
                } catch( Exception e ) {
                    e.printStackTrace();
                }
            }

            // Message
            public void onMessage( ChannelEvent ce ) {
                byte[]	bytes;

                bytes = new byte[ce.getBody().remaining()];
                ce.getBody().get( bytes );

                final Long		tag = ( Long )ce.getArgument( "deliveryTag" );
                final String	value = new String( bytes, Charset.forName( "UTF-8" ) );

                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        System.out.println( "Message: " + value );

                        // Parse incoming message
                        doMessageArrived( value );

                        // Acknowledge
                        consume.ackBasic( tag, true );
                    }
                } );
            }

            // Open
            public void onOpen( ChannelEvent ce ) {
                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        System.out.println( "Consume open." );

                        // Declare queue
                        // Bind queue to exchange
                        // Start consuming
                        consume.declareQueue( "queue_AND_123", false, false, false, false, false, null )
                               .bindQueue("queue_AND_123", "exchange_WLRNhKKM7d", "chat_topic", false, null)
                               .consumeBasic("queue_AND_123", "start_tag", false, false, false, false, null);
                    }
                } );
            }
        } );
    }

    private int parseRgb( String rgb ) {
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

    public void send( ChatMessage message ) {
        final AmqpProperties    properties;
        final ByteBuffer        buffer;

        JsonObject              result;
        JsonObjectBuilder       builder;
        StringWriter            stringWriter;
        Timestamp               stamp;

        // Build JSON object
        // Interacting with the web
        builder = Json.createObjectBuilder();
        builder.add( "message", message.content );
        builder.add( "color", "rgb( " + Color.red( message.color ) + ", " + Color.green( message.color ) + ", " + Color.blue( message.color ) + " )" );
        builder.add( "user", message.user );

        result = builder.build();

        // Java JSON object to String
        stringWriter = new StringWriter();

        try( JsonWriter jsonWriter = Json.createWriter( stringWriter ) ) {
            jsonWriter.writeObject( result );
        }

        // Here is what we are going to send
        System.out.println( "Sending: " + stringWriter.toString() );

        // Encode for AMQP
        buffer = ByteBuffer.allocate( 512 );
        buffer.put( stringWriter.toString().getBytes( Charset.forName( "UTF-8" ) ) );
        buffer.flip();

        stamp = new Timestamp( System.currentTimeMillis() );

        // Publish parameters
        properties = new AmqpProperties();
        properties.setMessageId( "1" );
        properties.setCorrelationId( "4" );
        properties.setAppId( "java_chat" );
        properties.setUserId( message.user );
        properties.setContentType( "text/plain" );
        properties.setContentEncoding( "UTF-8" );
        properties.setPriority( 6 );
        properties.setDeliveryMode(1);
        properties.setTimestamp(stamp);

        // Send
        dispatch.dispatchAsync(new Runnable() {
            public void run() {
                System.out.println( "Send message." );

                publish.publishBasic(
                    buffer,
                    properties,
                    "exchange_WLRNhKKM7d",
                    "chat_topic",
                    false,
                    false
                );
            }
        } );
    }
}
