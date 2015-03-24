import java.awt.EventQueue;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

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

// Amazon (Product Advertising API)
// https://aws.amazon.com/tools

// JSSC (Java Simple Serial Connection) 
// http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22jssc%22

// Gateway Java transport
// http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22gateway.client.java.transport%22

// Gateway Java client
// http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22gateway.client.java%22

// Gateway AMQP client
// http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22amqp.client.java%22

// Java JSON processing
// http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22javax.json%22

public class Stores implements SerialPortEventListener {

	// Constants
	private static final char 	SERIAL_END = '\r';	
	private static final String ACTION_GET = "get";
	private static final String	ACTION_SET = "set";
	private static final String KAAZING_ID = "nKkG23KJnb";
	private static final String KEY_ACTION = "action";
	private static final String KEY_COUNTER = "counter";
	private static final String SERIAL_PORT = "port.txt";	
	private static final String TOPIC = "stores_topic";			
	
	// Gateway
	private Gateway			gateway = null;
	
	// Serial port
	private SerialPort		serial = null;
	private StringBuilder	builder = null;
	
	// Constructor
	// Open serial port
	// Connect to Gateway
	public Stores() {
		initAmazon();
		// initGateway();
		initSerial();
	}
	
	private void initAmazon() {
		
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
				String		action = null;
				String		counter = null;
				
				// String to InputStream
				stream = new ByteArrayInputStream( body.getBytes( StandardCharsets.UTF_8 ) );
				parser = Json.createParser( stream );				
				
				// Iterate through map keys
				while( parser.hasNext() ) {
					e = parser.next();
					
					if( e == Event.KEY_NAME ) {
						switch( parser.getString() ) {
							case KEY_ACTION:
								parser.next();
								action = parser.getString();
								break;
								
							case KEY_COUNTER:
								parser.next();
								counter = parser.getString();
								break;								
						}
					}
				}
				
				// Send new counter value
				if( action.equals( ACTION_SET ) ) {
					System.out.println( "Seed: " + counter );
					
					// Serial send
					try {
						serial.writeInt( Integer.parseInt( counter ) );
					} catch( SerialPortException spe ) {
						spe.printStackTrace();
					}
				}
			}
			
			@Override
			public void onError( String message ) {
				System.out.println( message );
			}
			
			@Override
			public void onDisconnect() {
				System.out.println( "Client disconnected." );			
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

	// Initialize serial port
	// Serial port in external text file
	private void initSerial() {
		byte[]			data;
		File			file;
		FileInputStream	stream;
		String			port;
		
		// Incoming stream
		builder = new StringBuilder();
		builder.setLength( 0 );
		
		// Hardware port
		port = null;
		
		try {
			// Read port from file
			file = new File( SERIAL_PORT );			
			stream = new FileInputStream( file );
			data = new byte[( int )file.length()];
			stream.read( data );
			stream.close();
			
			port = new String( data, StandardCharsets.UTF_8 );
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
				serial.setParams( 
					SerialPort.BAUDRATE_9600,
					SerialPort.DATABITS_8,
					SerialPort.STOPBITS_1,
					SerialPort.PARITY_NONE
				);
				serial.addEventListener( this );			
			} catch( SerialPortException spe ) {
				spe.printStackTrace();
			}			
		}
	}	
	
	// Incoming serial data
	// Parse complete record
	// Send to gateway
	@Override
	public void serialEvent( SerialPortEvent event ) {
		byte[] buffer = null;        	
    	
		// Receiving
        if( event.isRXCHAR() ) {
        	try {
        		// Latest bytes
                buffer = serial.readBytes( event.getEventValue() );
                
                for( byte b:buffer ) {
                	// Look for record end
                    if( b == SERIAL_END ) {
                    	System.out.println( builder.toString() );
                    	builder.setLength( 0 );
                    	
                    	/*
                        // Process message
                        // Send to gateway
                        EventQueue.invokeLater( new Runnable() {
                        	
                        	@Override 
                        	public void run() {
                        		process(  builder.toString() );                            		
                        	}
                            
                        } );
                        */
                    	
                    } else {
                    	// Keep adding until complete record
                        builder.append( ( char )b );
                    }
                }                        
            } catch ( SerialPortException spe ) {
                spe.printStackTrace();
            }
        }
	}

	// Process serial port data
	// Send to gateway
	// Send as JSON
	private void process( String message ) {
		JsonObject			result;
		JsonObjectBuilder	builder;
		StringWriter		sw;
				
		// Build JSON structure
		builder = Json.createObjectBuilder();
		builder.add( "action", ACTION_GET );
		builder.add( "counter", message );
		
		// Encode
		result = builder.build();
		
		// Stringify
		sw = new StringWriter();
		
		try( JsonWriter writer = Json.createWriter( sw ) ) {
			writer.writeObject( result );
		}
		
		// Publish message
		// May not be connected yet
		if( gateway.isConnected() ) {
			gateway.publish( TOPIC, sw.toString() );
		}
	}	
	
	public static void main( String[] args ) {
		EventQueue.invokeLater( new Runnable() {
			
			@Override
			public void run() 
			{
				Stores iot = new Stores();
			}
			
		} );		
	}	
}
