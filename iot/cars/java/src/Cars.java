import java.awt.EventQueue;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
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

public class Cars {
	
	private static final int	PLAYBACK_DELAY = 5000;
	private static final int	PLAYBACK_RATE = 1000;	
	private static final String	FILE_CONFIG = "port.txt";
	private static final String	FILE_LOG = "log.txt";
	private static final String	FILE_PLAY = "playback.txt";	
	private static final String KAAZING_ID = "nKkG23KJnb";
	private static final String KEY_ANGLE = "angle";	
	private static final String KEY_COOLANT = "coolant";
	private static final String KEY_LATITUDE = "latitude";
	private static final String KEY_LONGITUDE = "longitude";	
	private static final String KEY_RPM = "rpm";
	private static final String KEY_CAR_SPEED = "speed";
	private static final String KEY_GPS_SPEED = "gps";	
	private static final String KEY_TIME = "time";
	private static final String TOPIC = "cars_topic";	
	
	private EngineControlUnit			ecu = null;
	private Gateway						kaazing = null;
	private Location					location = null;
	
	private int							record = -1;
	private String						port = null;
	private String[]					history = null;
	private ScheduledExecutorService	service = null;
	
	public Cars( boolean playback, boolean offline ) {
		if( playback ) {
			initGateway();			
			initPlayback();
		} else if( offline ) {
			loadConfig();
			initSerial();
			initLocation();
		} else {
			loadConfig();
			initSerial();
			initLocation();
			initGateway();						
		}
	}
		
	public Cars() {
		this( false, false );
	}
	
	private void initGateway() {
		// Instantiate
		kaazing = new Gateway();

		// Debugging
		kaazing.setVerbose( false );
		
		// Event handlers
		kaazing.callback = new GatewayListener() {
			
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
				// System.out.println( "Message arrived." );
				System.out.println( body );
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
				kaazing.subscribe( TOPIC );
			}
			
		};
		
		// Connect to gateway
		kaazing.connect( KAAZING_ID );			
	}
	
	private void initLocation() {
		location = new Location( "/dev/tty.usbserial" );
	}
	
	private void initPlayback() {
		byte[]			data;		
		File			file;
		FileInputStream	stream;
		int				end;
		int				start;
		long			difference;
		long 			previous;
		long 			sum;
		long			timing;
		String			contents;
		
		// Seed delay values			
		previous = -1;
		sum = 0;		
		
		try {
			// Read previously recorded data
			file = new File( FILE_PLAY );			
			stream = new FileInputStream( file );
			data = new byte[( int )file.length()];
			stream.read( data );
			stream.close();
			
			// Trim up and split out to array
			contents = new String( data, StandardCharsets.UTF_8 ).trim();
			history = contents.split( "\n" );
		
			// Calculate delay
			for( int h = 0; h < history.length; h++ ) {
				start = history[h].indexOf( "time\":" ) + 6;
				end = history[h].indexOf( "," );
				timing = Long.parseLong( history[h].substring( start, end ) );
				
				if( previous == -1 ) {
					previous = timing;
					sum = 0;
				} else {
					difference = timing - previous;
					previous = timing;
					sum = sum + difference;
				}
			}
			
			System.out.println( "Average delay: " + ( int )( sum / history.length ) );
		} catch( UnsupportedEncodingException uee ) {
			uee.printStackTrace();
		} catch( IOException ioe ) {
			ioe.printStackTrace();
		}			
		
		if( sum == 0 ) {
			sum = PLAYBACK_RATE;
		}
		
		// Iterate over array values
		service = Executors.newSingleThreadScheduledExecutor();
		service.scheduleWithFixedDelay( new Runnable() {
			
			@Override
			public void run() {
				// If connected to Kaazing Gateway
				// Loop through rows at set interval
				if( kaazing != null ) {
					if( record == -1 ) {
						record = 0;
					} else {
						record = record + 1;
					}
					
					if( record == history.length ) {
						record = 0;
					}	
					
					kaazing.publish( TOPIC, history[record].trim() );				
				}			
			}
			
		}, PLAYBACK_DELAY, ( int )( sum / history.length ), TimeUnit.MILLISECONDS );		
	}
	
	private void initSerial() {
		String[]	preferred;
		
		// Close port when exiting
		Runtime.getRuntime().addShutdownHook( new Thread() {
			public void run() {
				ecu.close();
			}
		} );		
		
		preferred = new String[3];
		preferred[0] = EngineControlUnit.PID_COOLANT_TEMP;
		preferred[1] = EngineControlUnit.PID_ENGINE_RPM;
		preferred[2] = EngineControlUnit.PID_VEHICLE_VSS;
		
		ecu = new EngineControlUnit( port, preferred );
		ecu.callback = new CarsListener() {
			
			@Override
			public void onUpdate() {
				BufferedWriter		bw;
				double				coolant;
				double				rpm;				
				double				speed;
				FileWriter			fw;
				JsonObject			result;
				JsonObjectBuilder	builder;				
				Parameter			pid;	
				PrintWriter			out;
				RecommendedMinimum	latest;
				StringWriter		sw;
				
				// Get values
				pid = ecu.find( EngineControlUnit.PID_COOLANT_TEMP );
				coolant = ecu.calculate( pid );
				
				pid = ecu.find( EngineControlUnit.PID_ENGINE_RPM );
				rpm = ecu.calculate( pid );				
				
				pid = ecu.find( EngineControlUnit.PID_VEHICLE_VSS );
				speed = ecu.calculate( pid );
						
				// Build JSON structure
				builder = Json.createObjectBuilder();
				
				// ODB
				builder.add( KEY_TIME, System.currentTimeMillis() );
				builder.add( KEY_COOLANT, coolant );
				builder.add( KEY_CAR_SPEED, speed );
				builder.add( KEY_RPM, rpm );		
				
				// GPS
				latest = location.getLatest();
				builder.add( KEY_LATITUDE, latest.latitude );
				builder.add( KEY_LONGITUDE, latest.longitude );
				builder.add( KEY_GPS_SPEED, latest.speed );
				builder.add( KEY_ANGLE, latest.angle );						
				
				// Encode
				result = builder.build();
				
				// Stringify
				sw = new StringWriter();
				
				try( JsonWriter writer = Json.createWriter( sw ) ) {
					writer.writeObject( result );
				}
				
				// Log to recording file
				// Future playback without car
				try {
					fw = new FileWriter( FILE_LOG, true );
					bw = new BufferedWriter( fw );
				    
					out = new PrintWriter( bw );
				    out.println( sw.toString() );
				    out.close();
				} catch( IOException ioe ) {
					ioe.printStackTrace();
				}				
				
				// Publish message
				// May be working offline				
				// May not be connected yet
				if( kaazing != null ) {
					if( kaazing.isConnected() ) {
						kaazing.publish( TOPIC, sw.toString() );
					}									
				}
			}
			
		};
	}	
	
	private void loadConfig() {
		byte[]			data;		
		File			file;
		FileInputStream	stream;
		
		try {
			// Read port from file
			file = new File( FILE_CONFIG );			
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
	}
	
	public static void main( String[] args ) {
		EventQueue.invokeLater( new Runnable() {
			
			@Override
			public void run() 
			{
				Cars	iot;
				
				if( args.length > 0 ) {
					if( args[0].equals( "playback" ) ) {
						iot = new Cars( true, false );
					} else if( args[0].equals( "offline" ) ) {
						iot = new Cars( false, true );
					}
				} else {
					iot = new Cars();
				}									
			}
			
		} );
	}
	
}
