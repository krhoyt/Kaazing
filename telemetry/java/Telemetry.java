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

import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;
import jssc.SerialPortList;

public class Telemetry
{
	public static final String CONNECTION_FACTORY = "ConnectionFactory";
	public static final String KAAZING_FACTORY = "com.kaazing.gateway.jms.client.JmsInitialContextFactory";
	public static final String PROVIDER_URL = "ws://localhost:8001/jms";
	public static final String TOPIC = "/topic/telemetry";	
	
	static Connection		connection = null;	
	static MessageProducer	producer = null;
	static SerialPort 		arduino = null;			
	static Session			session = null;
	static Topic			topic = null;	
	
	public static void main( String[] args ) throws JMSException, NamingException
	{
		ConnectionFactory	factory = null;
		InitialContext		context = null;
		Properties			properties = null;
		SerialReader		reader = null;
		String[]			ports = null;
		
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
	 	
		// Get port names
		// Assume only Arduino connected
		ports = SerialPortList.getPortNames();
		arduino = new SerialPort( ports[0] );
		
		// Open the serial port
		try {
			arduino.openPort();
			arduino.setParams( 9600, 8, 1, 0 );
			
			// Listen for incoming data
			reader = new SerialReader();
			arduino.addEventListener( reader );
		} catch( SerialPortException spe ) {
			System.out.println( "Cannot open port: " + ports[0] );
		}
	}
	
	static class SerialReader implements SerialPortEventListener
	{
		byte[] 		buffer = null;
		String 		incoming = null;
		TextMessage	message = null;
		
        public void serialEvent( SerialPortEvent event )
        {
        	// Data available
            if( event.isRXCHAR() )
            {
            	// Read some bytes
            	// Display resulting string
                try {
                    buffer = arduino.readBytes( event.getEventValue() );
                    
                    // Create new string if empty
                    if( incoming == null )
                    {
                        incoming = new String( buffer );
                    } else {
                        // Append data until full line                    	
                        incoming = incoming + new String( buffer );                    	
                    }

                    // Make sure we have a complete line
                    if( incoming.indexOf( '$' ) >= 0 && incoming.indexOf( '\n' ) >= 0 )
                    {
                    	// Debug
                    	System.out.print( incoming );
                    	
                    	// Send message to KAAZING Gateway
                        try {
                    	 	producer = session.createProducer( topic );
                            message = session.createTextMessage( incoming );
                            producer.send( message );	 	                                        	
                        } catch( JMSException jmse ) {
                        	System.out.println( jmse.getStackTrace() );
                        }
                        
                        // Reset message holder
                        incoming = null;
                    }
                } catch ( SerialPortException spe ) {
                    System.out.println( spe );
                }
            }
        }
    }		
}
