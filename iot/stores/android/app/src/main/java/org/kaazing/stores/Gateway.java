package org.kaazing.stores;

import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

import org.kaazing.net.ws.amqp.AmqpChannel;
import org.kaazing.net.ws.amqp.AmqpClient;
import org.kaazing.net.ws.amqp.AmqpClientFactory;
import org.kaazing.net.ws.amqp.AmqpProperties;
import org.kaazing.net.ws.amqp.ChannelAdapter;
import org.kaazing.net.ws.amqp.ChannelEvent;
import org.kaazing.net.ws.amqp.ConnectionEvent;
import org.kaazing.net.ws.amqp.ConnectionListener;

import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.sql.Timestamp;

// Kaazing Gateway helper class
// Uses handler for own thread
public class Gateway extends Handler {

    private static final String TEXT_PLAIN = "text/plain";
    private static final String UTF_8 = "UTF-8";

    private static final String CLIENT_ID = "abc123";

    public static final String ACTION_CONNECTED = "connected";
    public static final String ACTION_MESSAGE = "message";
    public static final String ACTION_SUBSCRIBED = "subscribed";
    public static final String ACTION_UNSUBSCRIBED = "unsubscribed";
    public static final String ACTION_ERROR = "error";
    public static final String KEY_ACTION = "action";
    public static final String KEY_MESSAGE = "message";

    public static final String SERVER_URL = "wss://sandbox.kaazing.net/amqp091";
    public static final String SERVER_HOST = "/";
    public static final String SERVER_USER = "guest";
    public static final String SERVER_PASSWORD = "guest";

    private static final String EXCHANGE_PREFIX = "exchange_";
    private static final String	QUEUE_PREFIX = "queue_";
    private static final String TAG = "start_tag";

    AmqpChannel         consume = null;
    AmqpChannel         publish = null;
    AmqpClientFactory   factory = null;
    AmqpClient          client = null;

    DispatchQueue       dispatch = null;

    private boolean     connected = false;
    private boolean     verbose = false;
    private long	    now = 0;
    private String	    clientId = null;
    private String	    topic = null;

    private String	    host = null;
    private String	    password = null;
    private String	    url = null;
    private String	    user = null;

    // Instantiate handler
    // Store connectivity endpoints
    // Timestamp for client identification
    // Asynchronous Kaazing Gateway interaction
    public Gateway( String url, String host, String user, String password ) {

        // Connectivity endpoints
        this.url = url;
        this.host = host;
        this.user = user;
        this.password = password;

        // Client identification
        now = System.currentTimeMillis();

        // Asynchronous operation when communicating to Kaazing Gateway
        dispatch = new DispatchQueue( "Async Dispatch Queue" );
        dispatch.start();
        dispatch.waitUntilReady();
    }

    // Empty constructor
    // Provides Kaazing Sandbox endpoints
    public Gateway() {

        // Kaazing Sandbox
        this(
                Gateway.SERVER_URL,
                Gateway.SERVER_HOST,
                Gateway.SERVER_USER,
                Gateway.SERVER_PASSWORD
        );
    }

    // Call to close connection
    public void close() {
        // TODO: Close connection
    }

    // Call to connect to Kaazing Gateway
    public void connect( String clientId ) {

        // Store client identification
        this.setClientId( clientId );

        // Asynchronous operation to connect to Kaazing Gateway
        dispatch.dispatchAsync( new Runnable() {
            public void run() {
                try {
                    // Factory
                    factory = AmqpClientFactory.createAmqpClientFactory();

                    // Client
                    client = factory.createAmqpClient();

                    // Connection listeners
                    client.addConnectionListener( new ConnectionListener() {

                        // Open
                        public void onConnectionOpen( ConnectionEvent ce ) {
                            if( isVerbose() ) {
                                Log.i( "GATEWAY", "Connection open." );
                            }

                            doClientOpen();
                        }

                        // Error
                        public void onConnectionError( ConnectionEvent ce ) {
                            if( isVerbose() ) {
                                Log.i( "GATEWAY", "Connection error." );
                            }
                        }

                        // Close
                        public void onConnectionClose(ConnectionEvent ce) {
                            if (isVerbose()) {
                                Log.i("GATEWAY", "Connection close.");
                            }
                        }

                        // Connecting
                        public void onConnecting(ConnectionEvent ce) {
                            if (isVerbose()) {
                                Log.i("GATEWAY", "Connecting...");
                            }
                        }
                    });

                    // Connect to server
                    client.connect(url, host, user, password);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }

    // Connect to Kaazing Gateway
    // Use provided client identification
    public void connect() {
        connect(Gateway.CLIENT_ID);
    }

    // Publish a message to Kaazing Gateway
    // Encodes for AMQP
    // Sends asynchronously
    public void publish( final String topic, String message ) {
        final AmqpProperties    properties;
        final ByteBuffer        buffer;
        final Timestamp         stamp;

        // Encode for AMQP
        buffer = ByteBuffer.allocate( 512 );
        buffer.put(message.getBytes( Charset.forName( UTF_8 ) ) );
        buffer.flip();

        // Timestamp on message
        stamp = new Timestamp(System.currentTimeMillis());

        // Publish parameters
        properties = new AmqpProperties();
        properties.setContentType( TEXT_PLAIN );
        properties.setContentEncoding( UTF_8 );
        properties.setPriority( 6 );
        properties.setDeliveryMode( 1 );
        properties.setTimestamp( stamp );

        // Send asynchronously
        dispatch.dispatchAsync( new Runnable() {
            public void run() {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Send message." );
                }

                // Publish
                publish.publishBasic(
                        buffer,
                        properties,
                        EXCHANGE_PREFIX + getClientId(),
                        topic,
                        false,
                        false
                );
            }
        } );
    }

    // Subscribe to a topic
    public void subscribe( final String topic ) {

        // Store topic for reference
        this.topic = topic;

        // Subscribe
        dispatch.dispatchAsync(new Runnable() {
            public void run() {
                if (isVerbose()) {
                    Log.i("GATEWAY", "Subscribing...");
                }

                // Bind to queue
                // Just the first step in subscribing
                consume.bindQueue(
                        QUEUE_PREFIX + now,
                        EXCHANGE_PREFIX + getClientId(),
                        topic,
                        false,
                        null
                );
            }
        });
    }

    // Unsubscribe from a topic
    public void unsubscribe( final String topic ) {

        // Unsubscribe
        dispatch.dispatchAsync(new Runnable() {
            public void run() {
                if (isVerbose()) {
                    Log.i("GATEWAY", "Subscribing...");
                }

                // Cancel subscription
                consume.cancelBasic(topic, true);
            }
        });
    }

	/*
	 * Internal methods
	 */

    // Called when a connection has been established
    // Start the process of opening a publish channel
    // Effectively creating an AMQP exchange
    private void doClientOpen() {
        if( isVerbose() ) {
            Log.i( "GATEWAY", "Connection ready." );
        }

        // Open channel for sending messages
        publish = client.openChannel();

        // Channel listeners
        publish.addChannelListener( new ChannelAdapter() {

            // Unbind
            public void onUnbind(ChannelEvent ce) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish unbind." );
                }
            }

            // Select
            public void onSelect( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish select." );
                }
            }

            // Rollback
            public void onRollback( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish rollback." );
                }
            }

            // Reject
            public void onRejectBasic( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish reject." );
                }
            }

            // Recover
            public void onRecoverBasic( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish recover." );
                }
            }

            // Quality of service
            public void onQos( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish quality of service." );
                }
            }

            // Purge
            public void onPurgeQueue( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish purge." );
                }
            }

            // Channel for exchange is open
            // Declare the publish exchange on the broker
            public void onOpen( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish open." );
                }

                // Declare exchange
                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        publish.declareExchange(
                                EXCHANGE_PREFIX + getClientId(),
                                "direct",
                                false,
                                false,
                                false,
                                null
                        );
                    }
                } );
            }

            // Message
            public void onMessage( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish message." );
                }
            }

            // Empty
            public void onGetEmpty( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish get empty." );
                }
            }

            // Basic
            public void onGetBasic( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish get basic." );
                }
            }

            // Flow
            public void onFlow( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish flow." );
                }
            }

            // Error
            // Send on Android message queue
            public void onError( ChannelEvent ce ) {
                Bundle  bundle;
                Message message;

                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish error." );
                }

                bundle = new Bundle();
                bundle.putString( KEY_ACTION, ACTION_ERROR );
                bundle.putString( KEY_MESSAGE, ce.getMessage() );

                message = new Message();
                message.setData( bundle );

                sendMessage( message );
            }

            // Deliver
            public void onDeliver( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish deliver." );
                }
            }

            // Delete queue
            public void onDeleteQueue( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish delete queue." );
                }
            }

            // Delete exchange
            public void onDeleteExchange( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish delete exchange." );
                }
            }

            // Declare queue
            public void onDeclareQueue( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish declare queue." );
                }
            }

            // Declare exchange
            // Ready to publish message
            // Not ready to consume messages
            public void onDeclareExchange( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Exchange declared." );
                }

                doPublishReady();
            }

            // Consume
            public void onConsumeBasic( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish consume." );
                }
            }

            // Commit
            public void onCommit( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish commit." );
                }
            }

            // Close
            public void onClose( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish closed." );
                }
            }

            // Cancel
            public void onCancelBasic( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish cancel." );
                }
            }

            // Bind queue
            public void onBindQueue( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Publish bind queue." );
                }
            }
        } );
    }

    // Ready to publish
    // Start process to open consumer channel
    private void doPublishReady() {
        Log.i( "GATEWAY", "Publish ready..." );

        // Consume
        consume = client.openChannel();

        // Channel listeners
        consume.addChannelListener( new ChannelAdapter() {

            // Unbind
            public void onUnbind( ChannelEvent ce ) {
                Bundle  bundle;
                Message message;

                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume unbind." );
                }

                // Remove topic reference
                topic = null;

                // Send message to other Android processes
                bundle = new Bundle();
                bundle.putString( KEY_ACTION, ACTION_UNSUBSCRIBED );

                message = new Message();
                message.setData( bundle );

                sendMessage( message );
            }

            // Select
            public void onSelect( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume select." );
                }
            }

            // Rollback
            public void onRollback( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume rollback." );
                }
            }

            // Reject
            public void onRejectBasic( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume reject." );
                }
            }

            // Recover
            public void onRecoverBasic( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume recover." );
                }
            }

            // Quality of service
            public void onQos( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume quality of service." );
                }
            }

            // Purge
            public void onPurgeQueue( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume purge." );
                }
            }

            // Open
            public void onOpen( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume open." );
                }

                // Channel created
                // Declare the consumer queue
                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        consume.declareQueue(
                                QUEUE_PREFIX + now,
                                false,
                                false,
                                false,
                                false,
                                false,
                                null
                        );
                    }
                } );
            }

            // Message
            public void onMessage( ChannelEvent ce ) {
                final Long tag;

                Bundle  bundle;
                byte[]  bytes;
                Message message;
                String  value;

                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume message." );
                }


                // Delivery tag
                tag = ( Long )ce.getArgument( "deliveryTag" );

                // Get message contents
                bytes = new byte[ce.getBody().remaining()];
                ce.getBody().get( bytes );
                value = new String( bytes, Charset.forName( UTF_8 ) );

                // Send message to other Android processes
                bundle = new Bundle();
                bundle.putString( KEY_ACTION, ACTION_MESSAGE );
                bundle.putString( KEY_MESSAGE, value );

                message = new Message();
                message.setData( bundle );

                sendMessage( message );

                // Acknowledge that we got the message
                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        consume.ackBasic( tag, true );
                    }
                } );
            }

            // Empty
            public void onGetEmpty( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume empty." );
                }
            }

            // Basic
            public void onGetBasic( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume basic." );
                }
            }

            // Flow
            public void onFlow( ChannelEvent ce ) {
                try {
                    final boolean isActive = ce.isFlowActive();

                    Log.i( "GATEWAY", "Flow is " + ( isActive ? "on" : "off" ) + "." );
                } catch( Exception e ) {
                    e.printStackTrace();
                }
            }

            // Error
            // Let other Android processes know
            public void onError( ChannelEvent ce ) {
                Bundle  bundle;
                Message message;

                if( isVerbose() ) {
                    Log.i("GATEWAY", "Consume error.");
                    Log.i("GATEWAY", ce.getMessage());
                }

                // Send inter-process message
                bundle = new Bundle();
                bundle.putString( KEY_ACTION, ACTION_ERROR );
                bundle.putString( KEY_MESSAGE, ce.getMessage() );

                message = new Message();
                message.setData( bundle );

                sendMessage( message );
            }

            // Deliver
            public void onDeliver( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume deliver." );
                }
            }

            // Delete queue
            public void onDeleteQueue( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume delete queue." );
                }
            }

            // Delete exchange
            public void onDeleteExchange( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume delete exchange." );
                }
            }

            // Declare queue
            // Formally connected
            // Let other Android processes know
            public void onDeclareQueue( ChannelEvent ce ) {
                Bundle  bundle;
                Message message;

                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Queue declared." );
                }

                // Connected
                connected = true;

                // Send process message
                bundle = new Bundle();
                bundle.putString( KEY_ACTION, ACTION_CONNECTED );

                message = new Message();
                message.setData( bundle );

                sendMessage( message );
            }

            // Declare exchange
            public void onDeclareExchange( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume declare exchange." );
                }
            }

            // Consume
            // Formally subscribed
            // Let other Android processes know
            public void onConsumeBasic( ChannelEvent ce ) {
                Bundle  bundle;
                Message message;

                bundle = new Bundle();
                bundle.putString( KEY_ACTION, ACTION_SUBSCRIBED );

                message = new Message();
                message.setData( bundle );

                sendMessage( message );
            }

            // Commit
            public void onCommit( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume commit." );
                }
            }

            // Close
            public void onClose(ChannelEvent ce) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume closed." );
                }
            }

            // Cancel
            // Unbind queue from exchange
            public void onCancelBasic( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i( "GATEWAY", "Consume cancel." );
                }

                // Unbind
                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        consume.unbindQueue(
                                QUEUE_PREFIX + now,
                                EXCHANGE_PREFIX + getClientId(),
                                topic,
                                null
                        );
                    }
                } );
            }

            // Bind queue to exchange
            public void onBindQueue( ChannelEvent ce ) {
                if( isVerbose() ) {
                    Log.i("GATEWAY", "Queue bound.");
                }

                // Setup consumer
                dispatch.dispatchAsync( new Runnable() {
                    public void run() {
                        consume.consumeBasic(
                                QUEUE_PREFIX + now,
                                TAG,
                                false,
                                false,
                                false,
                                false,
                                null
                        );
                    }
                } );
            }
        } );
    }

	/*
	 * Access methods
	 */

    public boolean isConnected() {
        return connected;
    }

    public boolean isVerbose() {
        return verbose;
    }

    public void setVerbose( boolean verbose ) {
        this.verbose = verbose;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId( String clientId ) {
        this.clientId = clientId;
    }

}
