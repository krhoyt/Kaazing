package com.example.kevin.myapplication;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.EditText;
import android.widget.ListView;

public class MainActivity extends ActionBarActivity
{
    EditText message = null;
    Gateway  gateway = null;
    ListView history = null;

    @Override
    protected void onCreate( Bundle savedInstanceState )
    {
        super.onCreate( savedInstanceState );
        setContentView( R.layout.activity_main );

        Log.i( "Permissions: ", Boolean.toString( hasPermission( "android.permission.INTERNET" ) ) );

        gateway = new Gateway();
        // gateway.connect();

        history = ( ListView )findViewById( R.id.history );

        message = ( EditText )findViewById( R.id.message );
        message.setOnKeyListener( new View.OnKeyListener()
        {
            @Override
            public boolean onKey( View v, int keyCode, KeyEvent event )
            {
                if( event.getAction() == KeyEvent.ACTION_DOWN )
                {
                    if( message.getText().toString().trim().length() > 0 )
                    {
                        Log.i( "Message", message.getText().toString() );
                        message.setText( null );
                    }
                }

                return false;
            }
        } );
    }

    public boolean hasPermission( String permission )
    {
        PackageInfo info = null;

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
}
