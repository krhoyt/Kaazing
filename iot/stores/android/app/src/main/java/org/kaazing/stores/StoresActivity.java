package org.kaazing.stores;

import android.content.Intent;
import android.graphics.Color;
import android.os.Message;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.text.DecimalFormat;
import java.util.ArrayList;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonWriter;
import javax.json.stream.JsonParser;

public class StoresActivity extends ActionBarActivity {

    private static final String ACTION_REMOVE = "remove";
    private static final String ACTION_SHOW = "show";
    private static final String KAAZING_ID = "nKkG23KJnb";
    private static final String KEY_ACTION = "action";
    private static final String KEY_IMAGE = "image";
    private static final String KEY_PRICE = "price";
    private static final String KEY_TITLE = "title";
    private static final String KEY_UPC = "upc";
    private static final String TOPIC = "stores_topic";

    private float                   total = 0;

    private ListView                lstItems = null;
    private TextView                txtTotal = null;

    private ArrayList<StoreItem>    items = null;
    private StoreAdapter            adapter = null;

    private GatewayHandler          gateway = null;

    // Scan complete
    // Lookup details from Amazon
    // Send message over Kaazing Gateway
    public void onActivityResult( int requestCode, int resultCode, Intent intent ) {
        AmazonTask      amazonTask;
        IntentResult    scanResult;
        String          resultContents;

        // Results
        scanResult = IntentIntegrator.parseActivityResult( requestCode, resultCode, intent );

        // Make sure something was scanned
        if( scanResult != null ) {

            // Get the UPC from the scan results
            resultContents = scanResult.getContents();

            // Asynchronous Amazon search
            amazonTask = new AmazonTask();
            amazonTask.callback = new AmazonListener() {

                // Called with Amazon search result
                // Process and send to Kaazing Gateway
                @Override
                public void onSearchResult( AmazonResult result ) {
                    process( result );
                }

            };
            amazonTask.execute( resultContents );

            Log.i( "SCAN", resultContents );
        }
    }

    @Override
    protected void onCreate( Bundle savedInstanceState ) {

        // Build main user interface
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_stores);

        // Kaazing Gateway for messaging
        gateway = new GatewayHandler();
        gateway.setVerbose( true );
        gateway.connect( KAAZING_ID );

        // Custom list display
        items = new ArrayList<StoreItem>();
        adapter = new StoreAdapter( this, items );
        lstItems = ( ListView )findViewById( R.id.list_view );
        lstItems.setAdapter(adapter);

        // Total shopping cart price
        txtTotal = ( TextView )findViewById( R.id.total_text );
    }

    // Build menu
    @Override
    public boolean onCreateOptionsMenu( Menu menu ) {
        getMenuInflater().inflate( R.menu.menu_stores, menu );
        return true;
    }

    // Handle menu events
    @Override
    public boolean onOptionsItemSelected( MenuItem item ) {
        AmazonResult        dobos = null;
        IntentIntegrator    integrator = null;

        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if( id == R.id.action_scan ) {
            integrator = new IntentIntegrator( StoresActivity.this );
            integrator.initiateScan();

            return true;
        } else if( id == R.id.action_checkout ) {
            dobos = new AmazonResult();
            dobos.setTitle( "Dobos Torta" );
            dobos.setPrice(3);
            dobos.setUpc("1432309173055");
            dobos.setImage("http://temp.kevinhoyt.com/kaazing/iot/stores/img/dobos-torta.jpg");

            process( dobos );
        }

        return super.onOptionsItemSelected( item );
    }

    // TODO: Remove item from list
    public void onRemoveItem( View view ) {
        RelativeLayout  parent;
        TextView        txtTitle;

        for( int i = 0; i < lstItems.getChildCount(); i++ ) {
            lstItems.getChildAt( i ).setBackgroundColor( Color.BLUE );
        }

        // Get row of click
        parent = ( RelativeLayout )view.getParent();

        // Reference to child
        txtTitle = ( TextView )parent.getChildAt( 0 );
        txtTitle.setText( "Removed!" );

        // Refresh display
        parent.setBackgroundColor( Color.CYAN );
        parent.refreshDrawableState();
    }

    // Format into JSON
    // Send to Kaazing Gateway
    private void process( AmazonResult result ) {
        JsonObject			json;
        JsonObjectBuilder	builder;
        JsonWriter          writer;
        StringWriter		sw;

        // Build JSON structure
        builder = Json.createObjectBuilder();
        builder.add( KEY_ACTION, ACTION_SHOW );
        builder.add( KEY_UPC, result.getUpc() );
        builder.add( KEY_TITLE, result.getTitle() );
        builder.add( KEY_IMAGE, result.getImage() );
        builder.add( KEY_PRICE, result.getPrice() );

        // Encode
        json = builder.build();

        // Stringify
        sw = new StringWriter();

        writer = Json.createWriter( sw );
        writer.writeObject(json);

        // Publish message
        // May not be connected yet
        if( gateway.isConnected() ) {
            gateway.publish( TOPIC, sw.toString() );
        }
    }

    private void remove( String body ) {
        DecimalFormat       decimal = null;
        JsonParser.Event    e = null;
        InputStream	        stream = null;
        JsonParser	        parser = null;
        StoreItem           item = null;
        String              upc = null;

        try {
            // String to InputStream
            stream = new ByteArrayInputStream( body.getBytes( "UTF-8" ) );
            parser = Json.createParser( stream );
        } catch( UnsupportedEncodingException uee ) {
            uee.printStackTrace();
        }

        // Iterate through map keys
        // Populate line item as needed
        while( parser.hasNext() ) {
            e = parser.next();

            if( e == JsonParser.Event.KEY_NAME ) {
                switch( parser.getString() ) {
                    case KEY_UPC:
                        parser.next();
                        upc = parser.getString();
                        break;
                }
            }
        }

        // Remove matching item from data model
        for( int i = 0; i < items.size(); i++ ) {
            item = items.get( i );

            if( item.upc.equals( upc ) ) {

                // Track cart total
                total = total - item.price;

                // Remove item from list
                items.remove( i );
                break;
            }
        }

        // Tell list that data has changed
        adapter.notifyDataSetChanged();

        // Format and display cart total
        decimal = new DecimalFormat( "0.00" );
        txtTotal.setText( decimal.format( total ) );
    }

    private void show( String body ) {
        DecimalFormat       decimal = null;
        JsonParser.Event    e = null;
        InputStream	        stream = null;
        JsonParser	        parser = null;
        StoreItem           item = null;

        try {
            // String to InputStream
            stream = new ByteArrayInputStream( body.getBytes( "UTF-8" ) );
            parser = Json.createParser( stream );
        } catch( UnsupportedEncodingException uee ) {
            uee.printStackTrace();
        }

        // New list line item
        item = new StoreItem();

        // Iterate through map keys
        // Populate line item as needed
        while( parser.hasNext() ) {
            e = parser.next();

            if( e == JsonParser.Event.KEY_NAME ) {
                switch( parser.getString() ) {
                    case KEY_PRICE:
                        parser.next();
                        item.price = Float.parseFloat( parser.getString() );
                        total = total + item.price;
                        break;

                    case KEY_IMAGE:
                        parser.next();
                        item.image = parser.getString();
                        break;

                    case KEY_TITLE:
                        parser.next();
                        item.title = parser.getString();
                        break;

                    case KEY_UPC:
                        parser.next();
                        item.upc = parser.getString();
                        break;
                }
            }
        }

        // Put item in list
        // Tell list that data has changed
        items.add( item );
        adapter.notifyDataSetChanged();

        // Format and display cart total
        decimal = new DecimalFormat( "0.00" );
        txtTotal.setText( decimal.format( total ) );
    }

    // Inner class for Kaazing Gateway thread
    // Using message queue so minimal chance of leak
    private class GatewayHandler extends Gateway {

        // Override message handler
        // Evaluate inter-processes message
        public void handleMessage( Message message ) {
            Bundle  bundle;
            String  body;

            // Get message content
            bundle = message.getData();

            // Evaluate action key in message data
            switch( bundle.getString( KEY_ACTION ) ) {

                // Kaazing Gateway is connected
                case ACTION_CONNECTED:

                    // Subscribe to topic for application
                    gateway.subscribe( TOPIC );
                    break;

                // Message arrived from Kaazing Gateway
                case ACTION_MESSAGE:

                    // Raw JSON
                    body = bundle.getString( KEY_MESSAGE );
                    Log.i( "MESSAGE", body );

                    if( body.indexOf( ACTION_REMOVE ) >= 0 ) {
                        remove(body);
                    } else if( body.indexOf( ACTION_SHOW ) >= 0 ) {
                        show(body);
                    }

                    break;
            }
        }
    }

}
