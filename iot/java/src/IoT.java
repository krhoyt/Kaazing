import java.awt.EventQueue;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonWriter;
import javax.json.stream.JsonParser;
import javax.json.stream.JsonParser.Event;

import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;

public class IoT implements SerialPortEventListener {

	// Constants
	private static final char 	SERIAL_END = '\r';
	private static final char 	SERIAL_START = '#';
	private static final int	REAL_TIME_OFF = 0;	
	private static final int	REAL_TIME_ON = 1;
	private static final String KAAZING_ID = "nKkG23KJnb";
	private static final String SERIAL_PORT = "port.txt";	
	private static final String TOPIC = "iot_topic";	
	
	// Gateway
	private boolean	realtime = false;
	private Gateway	gateway = null;
	
	// Parse
	private Parse	parse = null;
	
	// Serial port
	private boolean			reading = false;
	private SerialPort		serial = null;
	private String			latest = null;
	private StringBuilder	builder = null;
	
	// Timer
	private ScheduledExecutorService	service;	
	
	// Constructor
	// Initialize gateway
	// Initialize serial port
	public IoT() {
		initParse();
		initGateway();
		initSerial();
	}
	
	// Initialize gateway
	private void initGateway() {
		
		// Instantiate
		gateway = new Gateway();

		// Debugging
		gateway.setVerbose( false );
		
		// Event handlers
		gateway.callback = new GatewayListener() {
			
			@Override
			public void onUnsubscribe() {
				System.out.println( "Client unsubscribed." );				
			}
			
			@Override
			public void onSubscribe() {
				System.out.println( "Client subscribed." );
			}
			
			@Override
			public void onMessage( String body ) {
				Event		e = null;
				InputStream	stream = null;
				JsonParser	parser = null;
				String		attention = null;
				String		value = null;
				
				// String to InputStream
				stream = new ByteArrayInputStream( body.getBytes( StandardCharsets.UTF_8 ) );
				parser = Json.createParser( stream );				
				
				// System.out.println( "Message: " + body );
				
				while( parser.hasNext() ) {
					e = parser.next();
					
					if( e == Event.KEY_NAME ) {
						switch( parser.getString() ) {
							case "attention":
								parser.next();
								attention = parser.getString();
								break;
								
							case "value":
								parser.next();
								value = parser.getString();
								break;								
						}
					}
				}
				
				if( attention.equals( "server" ) ) {
					if( Integer.parseInt( value ) == REAL_TIME_OFF ) {
						System.out.println( "REAL TIME OFF." );
						realtime = false;						
					} else if( Integer.parseInt( value ) == REAL_TIME_ON ) {
						System.out.println( "REAL TIME ON!" );
						realtime = true;
					}
				}
			}
			
			@Override
			public void onError( String message ) {
				System.out.println( message );
			}
			
			@Override
			public void onDisconnect() {
				// TODO Auto-generated method stub				
			}
			
			@Override
			public void onConnect() {
				System.out.println( "Client connected." );	
				gateway.subscribe( TOPIC );
			}
		};
		
		// Connect to gateway
		gateway.connect( KAAZING_ID );		
	}
	
	// Initialize data storage
	private void initParse() {
		parse = new Parse();
		parse.callback = new ParseListener() {
			
			@Override
			public void onSave( String message ) {
				System.out.println( message );
			}
			
		};
		
		service = Executors.newSingleThreadScheduledExecutor();
		service.scheduleWithFixedDelay( new Runnable() {
			
			@Override
			public void run() {
				System.out.println( latest );
				parse.save( latest );
			}
			
		}, 5, 5, TimeUnit.SECONDS );
	}
	
	// Initialize serial port
	private void initSerial() {
		byte[]			data;
		File			file;
		FileInputStream	stream;
		String			port;
		
		// Incoming stream
		builder = new StringBuilder();
		
		// Hardware port
		port = null;
		
		try {
			// Read port from file
			file = new File( SERIAL_PORT );			
			stream = new FileInputStream( file );
			data = new byte[( int )file.length()];
			stream.read( data );
			stream.close();
			
			port = new String( data, "UTF-8" );
		} catch( UnsupportedEncodingException uee ) {
			uee.printStackTrace();
		} catch( IOException ioe ) {
			ioe.printStackTrace();
		}
		
		if( port != null ) {
			// Serial port
			serial = new SerialPort( port );
			
			try {
				// Open serial port
				// Listen for data
				serial.openPort();
				serial.setParams( 9600, 8, 1, 0 );
				serial.addEventListener( this );			
			} catch( SerialPortException spe ) {
				spe.printStackTrace();
			}			
		}
	}
	
	// Process serial port data
	// Send to gateway
	private void process( String message ) {
		JsonObject			result;
		JsonObjectBuilder	builder;
		StringWriter		sw;
		
		builder = Json.createObjectBuilder();
		builder.add( "attention", "client" );
		builder.add( "value", message );
		
		result = builder.build();
		
		sw = new StringWriter();
		
		try( JsonWriter writer = Json.createWriter( sw ) ) {
			writer.writeObject( result );
		}
		
		gateway.publish( TOPIC, sw.toString() );		
	}
	
	// Incoming serial data
	// Parse complete record
	// Send to gateway
    public void serialEvent( SerialPortEvent event ) {
		byte[] buffer = null;        	
    	
		// Receiving
        if( event.isRXCHAR() ) {
        	try {
        		// Latest bytes
                buffer = serial.readBytes( event.getEventValue() );
                
                for( byte b:buffer ) {
                	// Look for record start
                    if( b == SERIAL_START ) {
                        reading = true;
                        builder.setLength( 0 );
                    } else if( reading == true ) {
                    	// Look for record end
                        if( b == SERIAL_END ) {
                            reading = false;
                            
                            // Process message
                            // Send to gateway
                            EventQueue.invokeLater( new Runnable() {
                            	
                            	@Override 
                            	public void run() {
                            		latest = builder.toString();
                            		
                            		if( realtime ) {
                            			process( latest );                            			
                            		} 
                            	}
                                
                            } );
                        } else {
                        	// Keep adding until complete record
                            builder.append( ( char )b );
                        }
                    }
                }                        
            } catch ( SerialPortException spe ) {
                System.out.println( spe );
            }
        }
    }	
	
    // Main
	public static void main( String[] args ) {
		
		EventQueue.invokeLater( new Runnable() {
			
			@Override
			public void run() 
			{
				IoT iot = new IoT();
			}
			
		} );
		
	}
	
}
