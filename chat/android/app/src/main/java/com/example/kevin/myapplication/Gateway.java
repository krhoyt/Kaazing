package com.example.kevin.myapplication;

import android.os.Handler;
import android.util.Log;

import org.kaazing.net.ws.amqp.AmqpClient;
import org.kaazing.net.ws.amqp.AmqpClientFactory;
import org.kaazing.net.ws.amqp.ConnectionEvent;
import org.kaazing.net.ws.amqp.ConnectionListener;

public class Gateway
{
    AmqpClientFactory   factory = null;
    AmqpClient          client = null;

    Handler             handler = null;

    public Gateway()
    {
        handler = new Handler();
    }

    public void connect()
    {
        // Factory
        factory = AmqpClientFactory.createAmqpClientFactory();

        try {
            // Client
            client = factory.createAmqpClient();

            // Connection listeners
            client.addConnectionListener( new ConnectionListener() {
                // Connecting
                public void onConnecting( ConnectionEvent ce )
                {
                    handler.post( new Runnable() {
                        public void run()
                        {
                        System.out.println( "Connecting..." );
                        }
                    } );
                }

                // Error
                public void onConnectionError( ConnectionEvent ce )
                {
                    handler.post( new Runnable() {
                        public void run()
                        {
                        System.out.println( "Connection error." );
                        }
                    } );
                }

                // Open
                public void onConnectionOpen( ConnectionEvent ce )
                {
                    handler.post( new Runnable() {
                        public void run()
                        {
                        System.out.println( "Connection open." );

                        // Setup publisher
                        doClientOpen();
                        }
                    } );
                }

                // Close
                public void onConnectionClose( ConnectionEvent ce )
                {
                    handler.post( new Runnable() {
                        public void run()
                        {
                        Log.i( "Gateway", "Connection closed." );
                        }
                    } );
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

    public void doClientOpen()
    {
        Log.i( "Gateway", "Connection ready." );
    }
}
