import java.awt.EventQueue;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;

public class IoT implements SerialPortEventListener {

	// Constants
	private static final char 	SERIAL_END = '\r';
	private static final char 	SERIAL_START = '#';	
	private static final String KAAZING_ID = "nKkG23KJnb";
	private static final String SERIAL_PORT = "port.txt";
	private static final String TOPIC = "iot_topic";	
	
	// Gateway
	private Gateway	gateway = null;
	
	// Serial port
	private boolean			reading = false;
	private SerialPort		serial = null;
	private StringBuilder	builder = null;
	
	// Constructor
	// Initialize gateway
	// Initialize serial port
	public IoT() {
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
			public void onMessage( String value ) {
				System.out.println( value );
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
		gateway.publish( TOPIC, message );		
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
