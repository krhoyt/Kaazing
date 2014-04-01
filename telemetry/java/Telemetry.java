import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Enumeration;
import java.util.Properties;

import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.ExceptionListener;
import javax.jms.JMSException;
import javax.jms.MessageProducer;
import javax.jms.Session;
import javax.jms.TextMessage;
import javax.jms.Topic;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;

import gnu.io.CommPortIdentifier; 
import gnu.io.SerialPort;
import gnu.io.SerialPortEvent; 
import gnu.io.SerialPortEventListener; 

/*
 * RXTX uses a lock directory
 * This will need to be created to work
 * ---
 * sudo mkdir /var/lock 
 * sudo chmod 777 /var/lock
 */

public class Telemetry implements SerialPortEventListener 
{
	// Gateway constants
	public static final String CONNECTION_FACTORY = "ConnectionFactory";
	public static final String KAAZING_FACTORY = "com.kaazing.gateway.jms.client.JmsInitialContextFactory";
	public static final String PROVIDER_URL = "ws://localhost:8001/jms";
	public static final String TOPIC = "/topic/telemetry";	
	
	// Desired ports
	private static final String PORT_NAMES[] = { 
		"/dev/tty.usbserial-A6007to5", // Mac OS X
		"/dev/ttyACM0", // Raspberry Pi
		"/dev/ttyUSB0", // Linux
		"COM3", // Windows
	};
	
	// How long to wait for the port to open
	private static final int TIME_OUT = 2000;
	
	// Data bit rate from device
	private static final int DATA_RATE = 9600;	
	
	// Bytes to characters
	private BufferedReader  input = null;
	
	static Connection		connection = null;	
	static MessageProducer	producer = null;
	static Session			session = null;	
	static Topic			topic = null;	
	
	SerialPort 				arduino = null;		
	
	public void initialize() 
	{
		// For Raspberry Pi 
		// http://www.raspberrypi.org/phpBB3/viewtopic.php?f=81&t=32186
		// System.setProperty( "gnu.io.rxtx.SerialPorts", "/dev/ttyACM0" );

		CommPortIdentifier  current = null;		
		CommPortIdentifier	usb = null;
		Enumeration 		ports = CommPortIdentifier.getPortIdentifiers();

		// Find serial port
		while( ports.hasMoreElements() ) 
		{
			current = ( CommPortIdentifier )ports.nextElement();
			
			// Debug
			// System.out.println( currPortId.getName() );
			
			for( String portName:PORT_NAMES ) 
			{
				if( current.getName().equals( portName ) ) 
				{
					usb = current;
					break;
				}
			}
		}
		
		if( usb == null ) 
		{
			System.out.println( "Could not find desired port." );
			return;
		}

		try {
			// Open serial port
			arduino = ( SerialPort )usb.open( this.getClass().getName(), TIME_OUT );

			// Set port parameters
			arduino.setSerialPortParams( DATA_RATE, SerialPort.DATABITS_8, SerialPort.STOPBITS_1, SerialPort.PARITY_NONE );

			// Open input stream
			input = new BufferedReader( new InputStreamReader( arduino.getInputStream() ) );

			// Add event listeners
			arduino.addEventListener( this );
			arduino.notifyOnDataAvailable( true );
		} catch( Exception e ) {
			System.err.println( e.toString() );
		}
	}

	// Close port when finished
	public synchronized void close() 
	{
		if( arduino != null ) 
		{
			arduino.removeEventListener();
			arduino.close();
		}
	}	
	
	// Serial port event
	public synchronized void serialEvent( SerialPortEvent oEvent ) 
	{
		String		incoming = null;
		TextMessage	message = null;		
		
		if( oEvent.getEventType() == SerialPortEvent.DATA_AVAILABLE ) 
		{
			try {
				incoming = input.readLine();
				
				// Debug
				// System.out.println( "Line: " + inputLine );
			
                try {
            	 	producer = session.createProducer( topic );
                    message = session.createTextMessage( incoming );
                    producer.send( message );	 	                                        	
                } catch( JMSException jmse ) {
                	System.out.println( jmse.getStackTrace() );
                }
            } catch( Exception e ) {
				System.err.println( e.toString() );
			}
		}
	}	
	
	public static void main( String[] args ) throws JMSException, NamingException
	{
		ConnectionFactory	factory = null;
		InitialContext		context = null;
		Properties			properties = null;
		Telemetry 			telemetry = null;
		
		// Connect to gateway
		properties = new Properties();
		properties.put( InitialContext.INITIAL_CONTEXT_FACTORY, KAAZING_FACTORY );		
	
		properties.put( Context.PROVIDER_URL, PROVIDER_URL );
	 	context = new InitialContext( properties );	
	 	
	 	factory = ( ConnectionFactory )context.lookup( CONNECTION_FACTORY );	 	
	 	connection = factory.createConnection( null, null );	 	
	 	connection.setExceptionListener( new ExceptionListener() {
	 	    @Override
	 	    public void onException( JMSException jmse ) { 
	 	    	jmse.printStackTrace(); 
	 	    }
	 	} );	 	
	 	
	 	// Session
	 	session = connection.createSession( false, Session.AUTO_ACKNOWLEDGE );
	 	
	 	// Topic
	 	topic  = ( Topic )context.lookup( TOPIC );		
		
	 	// Start the connection
	 	connection.start();	 		 	
	 	
	 	// Initialize serial port
	 	telemetry = new Telemetry();
		telemetry.initialize();	 	
	 	
		Thread t = new Thread() 
		{
			public void run() 
			{
				// Keep alive
				try {
					Thread.sleep( 1000000 );
				} catch( InterruptedException ie ) {}
			}
		};
		
		t.start();
		
		// Debug
		// System.out.println( "Started" );
	}
}
