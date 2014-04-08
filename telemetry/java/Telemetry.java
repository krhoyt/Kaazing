import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.URI;
import java.util.Enumeration;

import javax.jms.Connection;
import javax.jms.ExceptionListener;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageConsumer;
import javax.jms.MessageListener;
import javax.jms.MessageProducer;
import javax.jms.Session;
import javax.jms.TextMessage;
import javax.jms.Topic;
import javax.naming.NamingException;

import com.kaazing.gateway.jms.client.JmsConnectionFactory;

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
	public static final String PROVIDER_URL = "ws://localhost:8001/jms";
	public static final String TOPIC_COMMAND = "/topic/telemetry/command";	
	public static final String TOPIC_DATA = "/topic/telemetry/data";
	
	// Device constants
	public static final String LIGHT_ON = "on";
	public static final String LIGHT_OFF = "off";
	
	// Desired ports
	private static final String PORT_NAMES[] = { 
		"/dev/tty.usbmodem1421", // Mac OS X
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
	static OutputStream	    output = null;		
	static MessageProducer	producer = null;
	static MessageConsumer  consumer = null;
	static Session			session = null;	
	static Topic			topicIn = null;	
	static Topic			topicOut = null;		
	
	private SerialPort      arduino = null;		
	
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

			// Input stream
			input = new BufferedReader( new InputStreamReader( arduino.getInputStream() ) );

			// Output stream
			output = arduino.getOutputStream();
			
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
            	 	producer = session.createProducer( topicOut );
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
		JmsConnectionFactory	factory = null;
		Telemetry 			    telemetry = null;
	
		// Connect to Gateway
		factory = JmsConnectionFactory.createConnectionFactory( URI.create( PROVIDER_URL ) );
	
		connection = factory.createConnection();
	 	connection.setExceptionListener( new ExceptionListener() {
	 	    @Override
	 	    public void onException( JMSException jmse ) { 
	 	    	jmse.printStackTrace(); 
	 	    }
	 	} );	 			
		
	 	// Session
	 	session = connection.createSession( false, Session.AUTO_ACKNOWLEDGE );
	 	
	 	// Topics
	 	topicOut = session.createTopic( TOPIC_DATA );
	 	topicIn = session.createTopic( TOPIC_COMMAND );
	 	
	 	// Consumer
	 	consumer = session.createConsumer( topicIn );
	 	consumer.setMessageListener( new MessageListener() {
            @Override
            public void onMessage( Message message ) {
            	String		messageData = null;
            	TextMessage textMessage = null;
            	
                try {
                    textMessage = ( TextMessage )message;
                    messageData = textMessage.getText();
                    
                    // Debug
                    // System.out.println( messageData );
                    
                    // Control light on device
                    try {
                        if( messageData.equals( LIGHT_ON ) ) 
                        {
                        	// Turn on
                        	output.write( "1".getBytes() );
                        } else if( messageData.equals( LIGHT_OFF ) ) {
                        	// Turn off
                        	output.write( "0".getBytes() );
                        }                    	
                    } catch( IOException ioe ) {
                    	ioe.printStackTrace();
                    }
                } catch( JMSException jmse ) {
                    jmse.printStackTrace();
                }
            }
        } );
	 
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
