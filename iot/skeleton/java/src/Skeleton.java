import java.awt.EventQueue;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;

// JSSC (Java Simple Serial Connection) 
// http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22jssc%22

// Gateway Java transport
// http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22gateway.client.java.transport%22

// Gateway Java client
// http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22gateway.client.java%22

// Gateway AMQP client
// http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22amqp.client.java%22

public class Skeleton implements SerialPortEventListener {

	// Constants
	private static final String KAAZING_ID = "nKkG23KJnb";
	private static final char 	SERIAL_END = '\r';
	private static final char 	SERIAL_START = '#';
	private static final String SERIAL_PORT = "port.txt";	
	private static final String TOPIC = "skeleton_topic";		
	
	// Gateway
	private Gateway			gateway = null;
	
	// Serial port
	private boolean			reading = false;
	private SerialPort		serial = null;
	private StringBuilder	builder = null;
	
	// Constructor
	// Open serial port
	// Connect to Gateway
	public Skeleton() {
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
				System.out.println( "Message: " + body );
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
				serial.setParams( 115200, 8, 1, 0 );
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
                	// Look for record start
                    if( b == SERIAL_START ) {
                        reading = true;
                        builder.setLength( 0 );
                    } else if( reading == true ) {
                    	// Look for record end
                        if( b == SERIAL_END ) {
                            reading = false;

                            System.out.println( "Arduino: " + builder.toString() );                            
                            
                            // Process message
                            // Send to gateway
                            EventQueue.invokeLater( new Runnable() {
                            	
                            	@Override 
                            	public void run() {
                            		process( builder.toString() );                            		
                            	}
                                
                            } );                         
                        } else {
                        	// Keep adding until complete record
                            builder.append( ( char )b );
                        }
                    }
                }                        
            } catch ( SerialPortException spe ) {
                spe.printStackTrace();
            }
        }
	}

	// Process serial port data
	// Send to gateway
	private void process( String message ) {
		gateway.publish( TOPIC, message );		
	}	
	
	public static void main( String[] args ) {
		EventQueue.invokeLater( new Runnable() {
			
			@Override
			public void run() 
			{
				Skeleton iot = new Skeleton();
			}
			
		} );		
	}	
}
