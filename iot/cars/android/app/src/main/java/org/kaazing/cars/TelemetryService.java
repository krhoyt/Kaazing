package org.kaazing.cars;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.os.Handler;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;

public class TelemetryService {

    // Debug
    private static final String     TAG = "TelemetryService";
    private static final boolean    D = true;

    // Server socket
    private static final String     NAME = "Telemetry";

    // UUID
    private static final UUID       TELEMETRY_UUID = UUID.randomUUID();

    // Properties
    private final BluetoothAdapter  adapter;
    private final Handler           handler;
    private ConnectThread           connect;
    private ConnectedThread         connected;
    private int                     state;

    // Connection state
    public static final int STATE_NONE = 0;
    public static final int STATE_LISTEN = 1;
    public static final int STATE_CONNECTING = 2;
    public static final int STATE_CONNECTED = 3;

    public TelemetryService( Context context, Handler handler ) {
        adapter = BluetoothAdapter.getDefaultAdapter();
        state = STATE_NONE;
        this.handler = handler;
    }

    private synchronized void setState( int state ) {
        if( D ) {
            Log.d( TAG, "State -> " + state );
        }

        this.state = state;

        // TOOD: Hand off to user interface
        // handler.obtainMessage()
    }

    public synchronized int getState() {
        return state;
    }

    public synchronized void start() {
        if( D ) {
            Log.d( TAG, "Start" );
        }

        if( connect != null ) {
            connect.cancel();
            connect = null;
        }

        if( connected != null ) {
            connected.cancel();
            connected = null;
        }

        // TODO: Server accept
        // TODO: Set state
    }

    public synchronized void connect( BluetoothDevice device ) {
        if( D ) {
            Log.d( TAG, "Connect to: " + device );
        }

        // Cancel previous
        if( state == STATE_CONNECTING ) {
            if( connect != null ) {
                connect.cancel();
                connect = null;
            }
        }

        // Cancel existing
        if( connected != null ) {
            connected.cancel();
            connected = null;
        }

        // Start new
        connect = new ConnectThread( device );
        connect.start();

        setState( STATE_CONNECTING );
    }

    public synchronized void connected( BluetoothSocket socket, BluetoothDevice device ) {
        if( D ) {
            Log.d( TAG, "Connected." );
        }

        // Cancel connecting thread
        if( connect != null ) {
            connect.cancel();
            connect = null;
        }

        // Cancel any current
        if( connected != null ) {
            connected.cancel();
            connected = null;
        }

        // TODO: Cancel accept

        // Start
        connected = new ConnectedThread( socket );
        connected.start();

        // TODO: Send back to UI

        setState( STATE_CONNECTED );
    }

    public synchronized void stop() {
        if( D ) {
            Log.d( TAG, "Stop." );
        }

        if( connect != null ) {
            connect.cancel();
            connect = null;
        }

        if( connected != null ) {
            connected.cancel();
            connected = null;
        }

        // TODO: Close out accept

        setState( STATE_NONE );
    }

    // TODO: Write

    private void connectionFailed() {
        Log.d( TAG, "Connection failed." );

        setState( STATE_LISTEN );

        // TODO: Send to UI
    }

    private void connectionLost() {
        setState( STATE_LISTEN );

        // TODO: Send to UI
    }

    // TODO: Accept thread

    private class ConnectThread extends Thread {
        private final BluetoothSocket   socket;
        private final BluetoothDevice   device;

        public ConnectThread( BluetoothDevice device ) {
            BluetoothSocket temporary = null;

            this.device = device;

            try {
                temporary = device.createRfcommSocketToServiceRecord( TELEMETRY_UUID );
            } catch( IOException ioe ) {
                Log.e( TAG, "Create failed.", ioe );
            }

            this.socket = temporary;
        }

        public void run() {
            Log.d( TAG, "Begin connect thread." );

            setName( "ConnectThread" );

            // Speed up connecting
            adapter.cancelDiscovery();

            try {
                // socket = device.createRfcommSocketToServiceRecord( TELEMETRY_UUID );
                socket.connect();
            } catch ( IOException ioOpen ) {
                connectionFailed();

                try {
                    socket.close();
                } catch( IOException ioClose ) {
                    Log.e( TAG, "Unable to close.", ioClose );
                }

                // Listening
                // TelemetryService.this.start();

                return;
            }

            synchronized ( TelemetryService.this ) {
                connect = null;
            }

            connected( socket, device );
        }

        public void cancel() {
            try {
                socket.close();
            } catch( IOException ioe ) {
                Log.e( TAG, "Close failed.", ioe );
            }
        }
    }

    public class ConnectedThread extends Thread {
        private final BluetoothSocket   socket;
        private final InputStream       input;
        private final OutputStream      output;

        public ConnectedThread( BluetoothSocket socket ) {
            InputStream     temporaryIn = null;
            OutputStream    temporaryOut = null;

            Log.d( TAG, "Connected thread." );

            this.socket = socket;

            try {
                temporaryIn = socket.getInputStream();
                temporaryOut = socket.getOutputStream();
            } catch( IOException ioe ) {
                Log.e( TAG, "Sockets not created.", ioe );
            }

            input = temporaryIn;
            output = temporaryOut;
        }

        public void run() {
            byte[]  buffer = null;
            int     bytes = 0;

            Log.i( TAG, "Begin connected." );

            buffer = new byte[1024];

            // Listen while connected
            while( true ) {
                try {
                    bytes = input.read( buffer );

                    // TODO: Send to UI
                    handler.obtainMessage( 1, bytes, -1, buffer ).sendToTarget();
                } catch( IOException ioe ) {
                    Log.e( TAG, "Disconnected.", ioe );
                    connectionLost();
                    break;
                }
            }
        }

        // TODO: Write to output

        public void cancel() {
            try {
                socket.close();
            } catch( IOException ioe ) {
                Log.e( TAG, "Close failed.", ioe );
            }
        }
    }
}
