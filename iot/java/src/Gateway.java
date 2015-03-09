import java.awt.EventQueue;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.sql.Timestamp;

import org.kaazing.net.ws.amqp.AmqpChannel;
import org.kaazing.net.ws.amqp.AmqpClient;
import org.kaazing.net.ws.amqp.AmqpClientFactory;
import org.kaazing.net.ws.amqp.AmqpProperties;
import org.kaazing.net.ws.amqp.ChannelEvent;
import org.kaazing.net.ws.amqp.ChannelListener;
import org.kaazing.net.ws.amqp.ConnectionEvent;
import org.kaazing.net.ws.amqp.ConnectionListener;


public class Gateway {
	
	private static final String CLIENT_ID = "abc123";
	
	public static final String SERVER_URL = "wss://sandbox.kaazing.net/amqp091";
	public static final String SERVER_HOST = "/";
	public static final String SERVER_USER = "guest";
	public static final String SERVER_PASSWORD = "guest";
	
	private static final String EXCHANGE_PREFIX = "exchange_";
	private static final String	QUEUE_PREFIX = "queue_";
	private static final String TAG = "iot";	
	
	private AmqpChannel			consume = null;
	private AmqpChannel			publish = null;
	private AmqpClientFactory	factory = null;
	private AmqpClient			client = null;
	
	private boolean	connected = false;
	private boolean verbose = false;
	private long	now = 0;
	private String	clientId = null;
	private String	topic = null;
	
	private String	host = null;
	private String	password = null;
	private String	url = null;
	private String	user = null;
	
	public GatewayListener	callback = null;
	
	public Gateway( String url, String host, String user, String password ) {
		this.url = url;
		this.host = host;
		this.user = user;
		this.password = password;
		
		now = System.currentTimeMillis();
	}
	
	public Gateway() {
		this( Gateway.SERVER_URL, Gateway.SERVER_HOST, Gateway.SERVER_USER, Gateway.SERVER_PASSWORD );
	}
	
	public void close() {
		// TODO: Close connection
	}
	
	public void connect( String clientId ) {
		this.setClientId( clientId );
		
		factory = AmqpClientFactory.createAmqpClientFactory();
		
		try {
			client = factory.createAmqpClient();
			client.addConnectionListener( new ConnectionListener() {
				
				@Override
				public void onConnectionOpen( ConnectionEvent ce ) {
					if( isVerbose() ) {
						System.out.println( "Connection open." );
					}
					
					doClientOpen();
				}
				
				@Override
				public void onConnectionError( ConnectionEvent ce ) {
					if( isVerbose() ) {
						System.out.println( "Connection error." );
					}
				}
				
				@Override
				public void onConnectionClose( ConnectionEvent ce ) {
					if( isVerbose() ) {
						System.out.println( "Connection closed." );
					}
				}
				
				@Override
				public void onConnecting( ConnectionEvent ce ) {
					if( isVerbose() ) {
						System.out.println( "Connecting..." );
					}
				}
			} );
			
			client.connect( url, host, user, password );
		} catch( Exception e ) {
			e.printStackTrace();
		}
	}
	
	public void connect() {
		connect( Gateway.CLIENT_ID );
	}
	
	public void publish( String topic, String message ) {
		final AmqpProperties    properties;
        final ByteBuffer        buffer;
        final Timestamp			stamp;

        // Encode for AMQP
        buffer = ByteBuffer.allocate( 512 );
        buffer.put( message.getBytes( Charset.forName( "UTF-8" ) ) );
        buffer.flip();

        stamp = new Timestamp( System.currentTimeMillis() );

        // Publish parameters
        properties = new AmqpProperties();
        properties.setContentType( "text/plain" );
        properties.setContentEncoding( "UTF-8" );
        properties.setPriority( 6 );
        properties.setDeliveryMode( 1 );
        properties.setTimestamp( stamp );

        publish.publishBasic(
        	buffer,
            properties,
            EXCHANGE_PREFIX + "iot",
            topic,
            false,
            false
        );
	}
	
	public void subscribe( String topic ) {
		this.topic = topic;
		
		consume.bindQueue( 
			QUEUE_PREFIX + now, 
			EXCHANGE_PREFIX + "iot", 
			topic, 
			false, 
			null 
		);
	}
	
	public void unsubscribe( String topic ) {
		consume.cancelBasic( topic, true );
	}
	
	/*
	 * Internal methods
	 */
	
	private void doClientOpen() {
		publish = client.openChannel();
		publish.addChannelListener( new ChannelListener() {
			
			@Override
			public void onUnbind( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish unbind." );
				}
			}
			
			@Override
			public void onSelect( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish select." );
				}
			}
			
			@Override
			public void onRollback( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish rollback." );
				}
			}
			
			@Override
			public void onRejectBasic( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish reject." );
				}
			}
			
			@Override
			public void onRecoverBasic( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish recover." );
				}
			}
			
			@Override
			public void onQos( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish quality of service." );
				}
			}
			
			@Override
			public void onPurgeQueue( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish purge." );
				}
			}
			
			@Override
			public void onOpen( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish open." );
				}
				
				EventQueue.invokeLater( new Runnable() {
					
					@Override
					public void run() {
						publish.declareExchange( 
							EXCHANGE_PREFIX + "iot", 
							"direct", 
							false, 
							false, 
							false, 
							null 
						);
						
					}
				} );
			}
			
			@Override
			public void onMessage( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish message." );
				}	
			}
			
			@Override
			public void onGetEmpty( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish get empty." );
				}
			}
			
			@Override
			public void onGetBasic( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish get basic." );
				}
			}
			
			@Override
			public void onFlow( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish flow." );
				}
			}
			
			@Override
			public void onError( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish error." );
					System.out.println( ce.getMessage() );
				}
				
				if( callback != null ) {
					callback.onError( "Publish: " + ce.getMessage() );
				}
			}
			
			@Override
			public void onDeliver( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish deliver." );
				}
			}
			
			@Override
			public void onDeleteQueue( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish delete queue." );
				}
			}
			
			@Override
			public void onDeleteExchange( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish delete exchange." );
				}
			}
			
			@Override
			public void onDeclareQueue( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish declare queue." );
				}
			}
			
			@Override
			public void onDeclareExchange( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish declare exchange." );
				}				
				
				EventQueue.invokeLater( new Runnable() {	
					
					@Override
					public void run() {
						doPublishReady();
					}
					
				} );				
			}
			
			@Override
			public void onConsumeBasic( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish consume." );
				}
			}

			@Override
			public void onCommit( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish commit." );
				}
			}
			
			@Override
			public void onClose( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish close." );
				}
			}
			
			@Override
			public void onCancelBasic( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish cancel." );
				}
			}
			
			@Override
			public void onBindQueue( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Publish bind queue." );
				}
			}
		} );
	}
	
	private void doPublishReady() {
		consume = client.openChannel();
		consume.addChannelListener( new ChannelListener() {
			
			@Override
			public void onUnbind( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume unbind." );
				}				
				
				if( callback != null ) {
					callback.onUnsubscribe();
				}
				
				topic = null;
			}
			
			@Override
			public void onSelect( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume select." );
				}				
			}
			
			@Override
			public void onRollback( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume rollback." );
				}				
			}
			
			@Override
			public void onRejectBasic( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume reject." );
				}				
			}
			
			@Override
			public void onRecoverBasic( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume recover." );
				}				
			}
			
			@Override
			public void onQos( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume quality of service." );
				}				
			}
			
			@Override
			public void onPurgeQueue( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume purge." );
				}				
			}
			
			@Override
			public void onOpen( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume open." );
				}				
				
				EventQueue.invokeLater( new Runnable() {
					
					@Override
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
			
			@Override
			public void onMessage( ChannelEvent ce ) {
				final Long	tag;
				
				byte[]	bytes;
				String	value;

				if( isVerbose() ) {
					System.out.println( "Consume message." );
				}								
				
				tag = ( Long )ce.getArgument( "deliveryTag" );				
				
				if( callback != null ) {
					bytes = new byte[ce.getBody().remaining()];
					ce.getBody().get( bytes );
					value = new String( bytes, Charset.forName( "UTF-8" ) );									
					
					callback.onMessage( value );
				}				
				
				EventQueue.invokeLater( new Runnable() {
					
					@Override
					public void run() {
						consume.ackBasic( tag, true );
					}
					
				} );				
			}
			
			@Override
			public void onGetEmpty( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume empty." );
				}				
			}
			
			@Override
			public void onGetBasic( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume basic." );
				}				
			}
			
			@Override
			public void onFlow( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume flow." );
				}				
			}
			
			@Override
			public void onError( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume error." );
					System.out.println( ce.getMessage() );
				}
				
				if( callback != null ) {
					callback.onError( "Consume: " + ce.getMessage() );
				}				
			}
			
			@Override
			public void onDeliver( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume deliver." );
				}				
			}
			
			@Override
			public void onDeleteQueue( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume delete queue." );
				}				
			}
			
			@Override
			public void onDeleteExchange( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume delete exchange." );
				}				
			}
			
			@Override
			public void onDeclareQueue( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume declare queue." );
				}		
				
				connected = true;
				
				if( callback != null ) {
					callback.onConnect();
				}								
			}
			
			@Override
			public void onDeclareExchange( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume declare exchange." );
				}				
			}
			
			@Override
			public void onConsumeBasic( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume basic." );
				}								
				
				if( callback != null ) {
					callback.onSubscribe();
				}
			}
			
			@Override
			public void onCommit( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume commit." );
				}				
			}
			
			@Override
			public void onClose( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume close." );
				}				
			}
			
			@Override
			public void onCancelBasic( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume cancel." );
				}				
				
				consume.unbindQueue( 
					QUEUE_PREFIX + now, 
					EXCHANGE_PREFIX + "iot", 
					topic, 
					null 
				);
			}
			
			@Override
			public void onBindQueue( ChannelEvent ce ) {
				if( isVerbose() ) {
					System.out.println( "Consume bind queue." );
				}				
				
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

	public void setClientId(String clientId) {
		this.clientId = clientId;
	}
	
}
