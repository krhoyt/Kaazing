import java.awt.Color;
import java.awt.Dimension;
import java.awt.EventQueue;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.event.FocusEvent;
import java.awt.event.FocusListener;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.StringWriter;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonWriter;
import javax.json.stream.JsonParser;
import javax.json.stream.JsonParser.Event;
import javax.swing.DefaultListModel;
import javax.swing.JFrame;
import javax.swing.JList;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextField;
import javax.swing.border.CompoundBorder;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;

import org.kaazing.net.ws.amqp.AmqpChannel;
import org.kaazing.net.ws.amqp.AmqpClient;
import org.kaazing.net.ws.amqp.AmqpClientFactory;
import org.kaazing.net.ws.amqp.AmqpProperties;
import org.kaazing.net.ws.amqp.ChannelAdapter;
import org.kaazing.net.ws.amqp.ChannelEvent;
import org.kaazing.net.ws.amqp.ConnectionEvent;
import org.kaazing.net.ws.amqp.ConnectionListener;

public class Chat extends JFrame implements FocusListener, KeyListener
{
	private static final long serialVersionUID = -3061886736036510444L;

	// Chat
	private Color							style = null;
	private DefaultListModel<ChatMessage>	history = null;	
	private JTextField						field = null;
	private long							now = 0;
	
	// Kaazing
	private AmqpClient			client = null;
	private AmqpClientFactory	factory = null;
	private AmqpChannel			consume = null;
	private AmqpChannel			publish = null;
	
	// Constructor
	// Layout user interface
	// Establish connection
	public Chat()
	{
		style = new Color(
			( int )( Math.random() * 255 ),
			( int )( Math.random() * 255 ),
			( int )( Math.random() * 255 )
		);
		now = System.currentTimeMillis();
		
		initUI();
		initConnection();
	}

	// Establish connection
	private void initConnection()
	{
		// Factory
		factory = AmqpClientFactory.createAmqpClientFactory();
		
		try {
			// Client
			client = factory.createAmqpClient();
			
			// Connection listeners
			client.addConnectionListener( new ConnectionListener() {
				// Connecting
				public void onConnecting( ConnectionEvent ce ) 
				{
					EventQueue.invokeLater( new Runnable() {
						public void run()
						{
							System.out.println( "Connecting..." );
						}
					} );
				}
				
				// Error
				public void onConnectionError( ConnectionEvent ce ) 
				{
					EventQueue.invokeLater( new Runnable() {
						public void run()
						{
							System.out.println( "Connection error." );
						}
					} );
				}								
				
				// Open
				public void onConnectionOpen( ConnectionEvent ce ) 
				{
					EventQueue.invokeLater( new Runnable() {
						public void run()
						{
							System.out.println( "Connection open." );
							
							// Setup publisher
							doClientOpen();
						}
					} );
				}
				
				// Close
				public void onConnectionClose( ConnectionEvent ce ) 
				{
					EventQueue.invokeLater( new Runnable() {
						public void run()
						{
							System.out.println( "Connection closed." );
						}
					} );
				}
			} );
			
			// Connect to server
			client.connect(
				"wss://sandbox.kaazing.net/amqp091", 
				"/", 
				"guest", 
				"guest"
			);
		} catch( Exception e ) {
			e.printStackTrace();
		}
	}
	
	// Layout user interface
	private void initUI()
	{
		GridBagConstraints	gbc = null;
		
		JPanel				message = null;
		JList<ChatMessage>	list = null;		
		JScrollPane			scroll = null;
		
		// Root panel layout
		getContentPane().setLayout( new GridBagLayout() );
		
		// Chat history panel
		history = new DefaultListModel<ChatMessage>();
		
		list = new JList<ChatMessage>( history );
		list.setFont( new Font( "Helvetica", Font.PLAIN, 14 ) );
		list.setBackground( Color.WHITE );
		list.setCellRenderer( new ChatRenderer() );
		
		// Allow scrolling
		scroll = new JScrollPane( list );
		scroll.setBorder( new CompoundBorder(
			new EmptyBorder( 10, 10, 10, 10 ),
			new LineBorder( new Color( 0, 0, 0, 51 ) )			
		) );
		
		// Constraints for history panel
		gbc = new GridBagConstraints();
		gbc.gridx = GridBagConstraints.REMAINDER; 
		gbc.gridy = GridBagConstraints.REMAINDER; 
		gbc.weightx = 1.0; 
		gbc.weighty = 1.0; 
		gbc.fill = GridBagConstraints.BOTH; 
		getContentPane().add( scroll, gbc );
		
		// Message panel
		message = new JPanel();
		message.setBackground( Color.WHITE );
		message.setLayout( new GridBagLayout() );
		message.setBorder( new EmptyBorder( 0, 10, 10, 10 ) );

		// Constraints for message panel
		gbc = new GridBagConstraints();
		gbc.gridy = 1; 
		gbc.fill = GridBagConstraints.HORIZONTAL; 
		getContentPane().add( message, gbc );		
		
		// Message field
		field = new JTextField( "Press <Enter> to send." );
		field.setBorder( new CompoundBorder(
			new LineBorder( new Color( 0, 0, 0, 51 ) ),
			new EmptyBorder( 0, 10, 0, 10 )			
		) );
		field.setPreferredSize( new Dimension( 100, 35 ) );
		field.setFont( new Font( "Helvetica", Font.PLAIN, 14 ) );
		field.setForeground( new Color( 0, 0, 0, 102 ) );
		field.setEnabled( false );
		field.addFocusListener( this );
		field.addKeyListener( this );
		
		// Constraints for message field
		gbc = new GridBagConstraints();
		gbc.weightx = 1.0;
		gbc.fill = GridBagConstraints.HORIZONTAL;
		message.add( field, gbc );
	
		// Pack layout to fit
		pack();
		
		// Window operations
		setTitle( "Chat" );
		setSize( 640, 480 );
		setLocationRelativeTo( null );
		setDefaultCloseOperation( EXIT_ON_CLOSE );
	}
	
	private Color parseRgb( String rgb )
	{
		int			blue = 0;
		int			end = 0;
		int			green = 0;
		int  		red = 0;
		int			start = 0;
		String		raw = null;
		String[]	values = null;
		
		// Find parentheses
		start = rgb.indexOf( "( " ) + 2;
		end = rgb.indexOf( " )", start );
		
		// Grab values
		// Split into an array
		raw = rgb.substring( start, end );
		values = raw.split( "," );
		
		// Parse out integer values
		red = Integer.parseInt( values[0].trim() );
		green = Integer.parseInt( values[1].trim() );
		blue = Integer.parseInt( values[2].trim() );
		
		return new Color( red, green, blue );
	}
	
	private void doClientOpen()
	{
		// Send messages
		publish = client.openChannel();
		
		// Channel listeners
		publish.addChannelListener( new ChannelAdapter() {
			// Close
			public void onClose( ChannelEvent ce ) 
			{
				EventQueue.invokeLater( new Runnable() {
					public void run()
					{
						System.out.println( "Publish closed." );
					}
				} );
			}
			
			// Error
			public void onError( ChannelEvent ce ) 
			{
				EventQueue.invokeLater( new Runnable() {
					public void run()
					{
						System.out.println( "Publish error." );
					}
				} );
			}			
			
			// Declare exchange
			public void onDeclareExchange( ChannelEvent ce ) 
			{
				EventQueue.invokeLater( new Runnable() {
					public void run()
					{
						System.out.println( "Exchange declared." );
						
						// Setup consumer
						doPublishReady();
					}
				} );
			}			
			
			// Open
			public void onOpen( ChannelEvent ce ) 
			{
				EventQueue.invokeLater( new Runnable() {
					public void run()
					{
						System.out.println( "Publish open." );
						
						// Declare exchange
						publish.declareExchange( "exchange_WLRNhKKM7d", "direct", false, false, false, null );
					}
				} );
			}			
		} );
	}
	
	private void doConsumeReady()
	{
		field.setEnabled( true );
	}
	
	private void doMessageArrived( String body )
	{
		ChatMessage message = null;
		Event		e = null;
		InputStream	stream = null;
		JsonParser	parser = null;
		
		// String to InputStream
		stream = new ByteArrayInputStream( body.getBytes( StandardCharsets.UTF_8 ) );
		parser = Json.createParser( stream );
		
		// New chat message
		message = new ChatMessage();
		message.raw = body;
		
		// Parse JSON
		while( parser.hasNext() )
		{
			e = parser.next();
			
			if( e == Event.KEY_NAME )
			{
				switch( parser.getString() )
				{
					case "color":
						parser.next();
						message.color = parseRgb( parser.getString() );
						break;
						
					case "message":
						parser.next();
						message.content = parser.getString();
						break;
						
					case "user":
						parser.next();
						message.user = parser.getString();
						break;
				}
			}
		}
		
		history.addElement( message );
	}
	
	private void doPublishReady()
	{
		// Consume
		consume = client.openChannel();
		
		// Channel listeners
		consume.addChannelListener( new ChannelAdapter() {
			// Bind queue
			public void onBindQueue( ChannelEvent ce )
			{
				EventQueue.invokeLater( new Runnable() {
					public void run()
					{
						System.out.println( "Queue bound." );
					}
				} );
			}
			
			// Close
			public void onClose( ChannelEvent ce )
			{
				EventQueue.invokeLater( new Runnable() {
					public void run()
					{
						System.out.println( "Consume closed." );
					}
				} );
			}			
			
			// Consume
			public void onConsumeBasic( ChannelEvent ce )
			{
				EventQueue.invokeLater( new Runnable() {
					public void run()
					{
						System.out.println( "Consuming..." );
						
						// Open user interface for sending messages
						doConsumeReady();
					}
				} );
			}			
			
			// Declare queue
			public void onDeclareQueue( ChannelEvent ce )
			{
				EventQueue.invokeLater( new Runnable() {
					public void run()
					{
						System.out.println( "Queue declared." );
					}
				} );
			}			
			
			// Flow
			public void onFlow( ChannelEvent ce )
			{
				try {
					final boolean isActive = ce.isFlowActive();
					
					EventQueue.invokeLater( new Runnable() {
						public void run()
						{
							System.out.println( "Flow is " + ( isActive ? "on" : "off" ) + "." );
						}
					} );					
				} catch( Exception e ) {
					e.printStackTrace();
				}
			}			
			
			// Message
			public void onMessage( ChannelEvent ce )
			{
				byte[]	bytes;
				
				bytes = new byte[ce.getBody().remaining()];
				ce.getBody().get( bytes );
				
				final Long		tag = ( Long )ce.getArgument( "deliveryTag" );
				final String	value = new String( bytes, Charset.forName( "UTF-8" ) );
				
				EventQueue.invokeLater( new Runnable() {
					public void run()
					{
						AmqpChannel channel = null;
						
						System.out.println( "Message: " + value );
						
						// Place in user interface
						doMessageArrived( value );
						
						// Acknowledge
						channel = ce.getChannel();
						channel.ackBasic( tag.longValue(), true );
					}
				} );
			}			
			
			// Open
			public void onOpen( ChannelEvent ce )
			{
				EventQueue.invokeLater( new Runnable() {
					public void run()
					{
						System.out.println( "Consume open." );
						
						// Declare queue
						// Bind queue to exchange
						// Start consuming
						consume.declareQueue( "queue_AND_123", false, false, false, false, false, null )
							   .bindQueue( "queue_AND_123", "exchange_WLRNhKKM7d", "chat_topic", false, null )
							   .consumeBasic( "queue_AND_123", "start_tag", false, false, false, false, null );
					}
				} );
			}						
		} );
	}
	
	// Entry point
	// Instantiate window
	// Show window	
	public static void main( String[] args )
	{
		EventQueue.invokeLater( new Runnable() 
		{
			@Override
			public void run() 
			{
				Chat chat = new Chat();
				chat.setVisible( true );
			}
		} );
	}
	
	/*
	 * Focus events
	 */

	public void focusGained( FocusEvent fe ) 
	{
		// Change color to black
		field.setForeground( Color.BLACK );
		
		// Clear field
		if( field.getText().trim().equals( "Press <Enter> to send." ) )
		{
			field.setText( "" );
		}
	}

	public void focusLost( FocusEvent fe ) 
	{
		// Grey out color
		field.setForeground( new Color( 0, 0, 0, 102 ) );
		
		// Populate with prompt
		if( field.getText().trim().length() == 0 )
		{
			field.setText( "Press <Enter> to send." );
		}
	}

	/*
	 * Keyboard events
	 */
	
	public void keyTyped( KeyEvent ke ) {;}
	public void keyPressed( KeyEvent ke ) {;}

	public void keyReleased( KeyEvent ke ) 
	{
		AmqpProperties		properties = null;
		ByteBuffer			buffer = null;
		JsonObject			result = null;
		JsonObjectBuilder	builder = null;
		StringWriter		sw = null;
		Timestamp			stamp = null;
		
		// There is a message to send
		if( ke.getKeyCode() == 10 && field.getText().trim().length() > 0 )
		{
			// Build JSON object
			// Interacting with the web
			builder = Json.createObjectBuilder();
			builder.add( "message", field.getText().trim() );
			builder.add( "color", "rgb( " + style.getRed() + ", " + style.getGreen() + ", " + style.getBlue() + " )" );
			builder.add( "user", "user_" + now );
			
			result = builder.build();
			
			// Java JSON object to String
			sw = new StringWriter();
			
			try( JsonWriter writer = Json.createWriter( sw ) ) {
				writer.writeObject( result );
			}
			
			// Here is what we are going to send
			System.out.println( "Sending: " + sw.toString() );
			
			// Encode for AMQP
			buffer = ByteBuffer.allocate( 512 );
			buffer.put( sw.toString().getBytes( Charset.forName( "UTF-8" ) ) );
			buffer.flip();
			
			stamp = new Timestamp( System.currentTimeMillis() );
			
			// Publish parameters
			properties = new AmqpProperties();
			properties.setMessageId( "1" );
			properties.setCorrelationId( "4" );
			properties.setAppId( "java_chat" );
			properties.setUserId( "user_" + now );
			properties.setContentType( "text/plain" );
			properties.setContentEncoding( "UTF-8" );
			properties.setPriority( 6 );
			properties.setDeliveryMode( 1 );
			properties.setTimestamp( stamp );
			
			// Send
			publish.publishBasic( buffer, properties, "exchange_WLRNhKKM7d", "chat_topic", false, false );
			
			// Clear text just sent
			field.setText( "" );
		}
	}
}
