package com.kaazing.krhoyt;

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

import java.util.ArrayList;


public class ChatActivity extends ActionBarActivity {

    ArrayList<ChatMessage>  items;
    ChatAdapter             adapter;
    ListView                history;

    EditText                message;

    Gateway                 gateway;

    int                     style = 0;
    long                    now = 0;

    @Override
    protected void onCreate( Bundle savedInstanceState ) {
        super.onCreate( savedInstanceState );
        setContentView( R.layout.activity_chat );

        // User color
        int red = ( int )( Math.random() * 255 );
        int green = ( int )( Math.random() * 255 );
        int blue = ( int )( Math.random() * 255 );

        style = Color.rgb( red, green, blue );

        // User identification
        now = System.currentTimeMillis();

        // Permissions
        Log.i( "Permissions ", Boolean.toString( hasPermission( "android.permission.INTERNET" ) ) );

        // Gateway
        gateway = new Gateway();
        gateway.callback = new ChatCallback() {
            @Override
            public void onAllClear() {
                Log.i( "Gateway", "Ready for publish and consume." );
            }

            @Override
            public void onMessage( ChatMessage message ) {
                // Add to collection
                items.add( message );

                // Update list
                history.post( new Runnable() {
                    @Override
                    public void run() {
                        adapter.notifyDataSetChanged();
                    }
                } );
            }
        };

        // List
        items = new ArrayList<>();
        adapter = new ChatAdapter( this, items );
        history = ( ListView )findViewById( R.id.history );
        history.setAdapter( adapter );

        // Text field
        message = ( EditText )findViewById( R.id.message );
        message.setOnKeyListener( new View.OnKeyListener() {
            @Override
            public boolean onKey( View v, int keyCode, KeyEvent event ) {
                ChatMessage chat;

                // Send
                if( event.getAction() == KeyEvent.ACTION_DOWN ) {
                    // Message present
                    if( message.getText().toString().trim().length() > 0 ) {
                        // Build message
                        chat = new ChatMessage();
                        chat.content = message.getText().toString();
                        chat.user = "user_" + now;
                        chat.color = style;

                        // Publish to other clients
                        gateway.send(chat);

                        /*
                        // Add to collection
                        items.add( chat );

                        // Update list
                        history.post( new Runnable() {
                            @Override
                            public void run() {
                                adapter.notifyDataSetChanged();
                            }
                        } );
                        */

                        // Clear field
                        message.setText( null );
                    }
                }

                return false;
            }
        } );
    }

    // Permissions check
    public boolean hasPermission( String permission ) {
        PackageInfo info;

        try {
            info = getPackageManager().getPackageInfo( this.getApplicationContext().getPackageName(), PackageManager.GET_PERMISSIONS );

            if( info.requestedPermissions != null ) {
                for( String p : info.requestedPermissions ) {
                    if( p.equals( permission ) ) {
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
    public boolean onCreateOptionsMenu( Menu menu ) {
        // No menu
        return true;
    }

    @Override
    public boolean onOptionsItemSelected( MenuItem item ) {
        // No menu
        return super.onOptionsItemSelected( item );
    }
}
