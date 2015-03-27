package org.kaazing.cars;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

public class CarsActivity extends ActionBarActivity {

    private BluetoothAdapter    adapter = null;
    private BluetoothSocket     socket = null;
    private InputStream         input = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cars);

        adapter = BluetoothAdapter.getDefaultAdapter();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_cars, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onStart() {
        super.onStart();

        BluetoothDevice         device = null;

        device = adapter.getRemoteDevice( "00:06:66:68:36:84" );

        try {
            socket = device.createRfcommSocketToServiceRecord( UUID.randomUUID() );
        } catch( IOException ioe ) {
            Log.e( "Telemetry", "SPP socket.", ioe );
        }

        adapter.cancelDiscovery();

        try {
            socket.connect();
        } catch( IOException ioeOpen ) {
            try {
                socket.close();
            } catch( IOException ioeClose ) {
                Log.e( "Telemetry", "Closing.", ioeClose );
            }
        }

        Log.i( "Telemetry", "Socket -> " + socket.isConnected() );

        try {
            input = socket.getInputStream();
        } catch( IOException ioe ) {
            Log.e( "Telemetry", "Input stream.", ioe );
        }
    }
}
