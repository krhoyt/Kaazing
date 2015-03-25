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
import jssc.SerialPortList;

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

// Apache Commons Codec
// http://commons.apache.org/proper/commons-codec/

public class Stores implements SerialPortEventListener {

	// Constants
	private static final char 	SERIAL_END = '\r';	
	private static final String ACTION_SHOW = "show";
	private static final String KAAZING_ID = "nKkG23KJnb";
	private static final String KEY_ACTION = "action";
	private static final String KEY_IMAGE = "image";	
	private static final String KEY_PRICE = "price";	
	private static final String KEY_TITLE = "title";
	private static final String KEY_UPC = "upc";	
	private static final String SERIAL_PORT = "port.txt";	
	private static final String TOPIC = "stores_topic";			
	
	// Amazon
	private Amazon			amazon = null;
	
	// Gateway
	private Gateway			gateway = null;
	
	// Serial port
	private SerialPort		serial = null;
	private StringBuilder	builder = null;
	
	// Constructor
	// Open serial port
	// Connect to Gateway
	public Stores( boolean list ) {
		initAmazon();
		initGateway();
		initSerial( list );
	}
	
	public Stores() {
		this( false );
	}
	
	private void initAmazon() {
		amazon = new Amazon();
		
		amazon.callback = new AmazonListener() {
			
			@Override
			public void onResult( AmazonResult scan ) {
				System.out.println( scan.getUpc() );
				System.out.println( scan.getTitle() );
				System.out.println( scan.getPrice() );				
				System.out.println( scan.getImage() );			
				
                // Process message
                // Send to gateway
                EventQueue.invokeLater( new Runnable() {
                	
                	@Override 
                	public void run() {
                		process(  scan );                            		
                	}
                    
                } );
				
			}
			
		};
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
								break;
						}
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
	private void initSerial( boolean list ) {
		byte[]			data;
		File			file;
		FileInputStream	stream;
		String[]		names;
		String			port;
		
		// List serial ports (optional)
		if( list ) {
			names = SerialPortList.getPortNames();
			
	        for( int p = 0; p < names.length; p++ ) {
	            System.out.println( "List: " + names[p] );
	        }					
		}
		
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
			
			port = new String( data, StandardCharsets.UTF_8 ).trim();
		} catch( UnsupportedEncodingException uee ) {
			uee.printStackTrace();
		} catch( IOException ioe ) {
			ioe.printStackTrace();
		}
		
		if( port != null ) {
			// Serial port
			System.out.println( "Port: " + port );
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
                    	amazon.search( builder.toString().trim() );                    	
                    	
                    	builder.setLength( 0 );
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
	private void process( AmazonResult scan ) {
		JsonObject			result;
		JsonObjectBuilder	builder;
		StringWriter		sw;
				
		// Build JSON structure
		builder = Json.createObjectBuilder();
		builder.add( KEY_ACTION, ACTION_SHOW );
		builder.add( KEY_UPC, scan.getUpc() );
		builder.add( KEY_TITLE, scan.getTitle() );
		builder.add( KEY_IMAGE, scan.getImage() );
		builder.add( KEY_PRICE, scan.getPrice() );		
		
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
				Stores iot;
				
				if( args.length > 0 ) {
					if( args[0].equals( "-list" ) ) {
						iot = new Stores( true );
					}
				} else {
					iot = new Stores();
				}
			}
			
		} );		
	}	
}
