package org.kaazing.gateway;

import android.os.Message;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import java.util.Timer;
import java.util.TimerTask;

public class GatewayActivity extends ActionBarActivity {

    private static final String KAAZING_ID = "nKkG23KJnb";
    private static final String TOPIC = "counter_topic";

    private GatewayHandler  gateway = null;

    private Button          btnConnect = null;
    private Button          btnCount = null;
    private TextView        txtCount = null;

    private int             counter = 0;
    private Timer           timer = null;

    // User interface being created
    // Wire up all dependencies
    @Override
    protected void onCreate( Bundle savedInstanceState ) {

        // Inflate user interface
        super.onCreate( savedInstanceState );
        setContentView(R.layout.activity_gateway);

        // Kaazing Gateway for messaging
        gateway = new GatewayHandler();
        gateway.setVerbose( true );

        // Counter display
        txtCount = ( TextView )findViewById( R.id.count_text );

        // Button to control counting
        btnCount = ( Button )findViewById( R.id.count_button );
        btnCount.setOnClickListener( new View.OnClickListener() {

            // Count button clicked
            // Start timer for counting
            @Override
            public void onClick( View v ) {

                // If not already counting
                if( timer == null ) {

                    // Seed counter
                    counter = 0;

                    // Start timer
                    // Start immediately
                    // One second intervals
                    timer = new Timer();
                    timer.schedule( new TimerTask() {

                        @Override
                        public void run() {

                            // Increment counter
                            // Send value to Kaazing Gateway
                            counter = counter + 1;
                            gateway.publish( TOPIC, Integer.toString( counter ) );
                        }
                    }, 0, 1000 );

                    // Label button to stop counting
                    btnCount.setText( "Stop Counting" );
                } else {

                    // Timer already running
                    // Cancel counting
                    timer.cancel();
                    timer = null;

                    // Label button to start counting
                    btnCount.setText( "Start Counting" );
                }
            }

        } );

        // Button to control connection
        btnConnect = ( Button )findViewById( R.id.connect_button );
        btnConnect.setOnClickListener( new View.OnClickListener() {

            // Connection button clicked
            // Connect or disconnect from Kaazing Gateway
            @Override
            public void onClick( View v ) {
                if( gateway.isConnected() ) {

                } else {
                    // Do no allow multiple presses
                    // Wait for message of connect completion
                    // Connect Kaazing Gateway
                    btnConnect.setEnabled( false );
                    gateway.connect( KAAZING_ID );
                }
            }

        } );
    }

    // No menu here
    @Override
    public boolean onCreateOptionsMenu( Menu menu ) {
        // Inflate the menu; this adds items to the action bar if it is present.
        // getMenuInflater().inflate(R.menu.menu_gateway, menu);
        return true;
    }

    // No menu handler needed
    @Override
    public boolean onOptionsItemSelected( MenuItem item ) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        // What menu was clicked
        if( id == R.id.action_settings )
        {
            return true;
        }

        return super.onOptionsItemSelected( item );
    }

    // Inner class for Kaazing Gateway thread
    // Using message queue so minimal chance of leak
    private class GatewayHandler extends Gateway {

        // Override message handler
        // Evaluate inter-processes message
        public void handleMessage( Message message ) {
            Bundle  bundle;

            // Get message content
            bundle = message.getData();

            // Evaluate action key in message data
            switch( bundle.getString( Gateway.KEY_ACTION ) ) {

                // Kaazing Gateway is connected
                case Gateway.ACTION_CONNECTED:

                    // Set button to indicate disconnect
                    btnConnect.setText( "Disconnect" );
                    btnConnect.setEnabled( true );

                    // Subscribe to topic for application
                    gateway.subscribe( TOPIC );
                    break;

                // Subscribed to application topic
                case Gateway.ACTION_SUBSCRIBED:

                    // Enable button to manage counting
                    btnCount.setEnabled( true );
                    break;

                // Message arrived from Kaazing Gateway
                case Gateway.ACTION_MESSAGE:

                    // Update the counter on the screen
                    txtCount.setText( bundle.getString( KEY_MESSAGE ) );
                    break;
            }
        }
    }

}
