import java.util.Properties;

import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.ExceptionListener;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageConsumer;
import javax.jms.MessageListener;
import javax.jms.MessageProducer;
import javax.jms.Session;
import javax.jms.TextMessage;
import javax.jms.Topic;
import javax.naming.InitialContext;
import javax.naming.Context;
import javax.naming.NamingException;

public class GatewayTest 
{
	public static final String CONNECTION_FACTORY = "ConnectionFactory";
	public static final String KAAZING_FACTORY = "com.kaazing.gateway.jms.client.JmsInitialContextFactory";
	public static final String PROVIDER_URL = "ws://localhost:8001/jms";
	public static final String TOPIC = "/topic/first";
	
	public static void main( String[] args ) throws NamingException, JMSException
	{
		Connection			connection = null;
		ConnectionFactory	factory = null;
		InitialContext		context = null;
		MessageConsumer		consumer = null;
		MessageProducer		producer = null;
		Properties			properties = null;
		Session				session = null;
		TextMessage			message = null;
		Topic				topic = null;
		
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
	 	
	 	// Consume messages
	 	consumer = session.createConsumer( topic );
	 	consumer.setMessageListener( new MessageListener() {
	 		@Override
	 		public void onMessage( Message message ) {
	 			try {
	 				System.out.println( "Message arrived: " + ( ( TextMessage )message ).getText() );
	 			} catch ( JMSException jmse ) {
	 				jmse.printStackTrace();
	 			}
	 		}
	 	} );
	 	
	 	// Start the connection
	 	connection.start();	 	
	 	
	 	// Wait before sending a message
	 	try { 
	 		Thread.sleep( 2000 ); 
	 	} catch ( InterruptedException ie ) { 
	 		ie.printStackTrace(); 
	 	}	 	
	 	
	 	// Send a message
	 	producer = session.createProducer( topic );
        message = session.createTextMessage( "999" );
        producer.send( message );	 	
	}
}
