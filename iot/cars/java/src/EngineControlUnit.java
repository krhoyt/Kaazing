import java.math.BigInteger;
import java.util.Vector;

import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;


public class EngineControlUnit implements SerialPortEventListener {
	
	private static final boolean	DEBUG_OUTPUT = false;	
	private static final char 		COMMAND_RESPONSE = '>';
	private static final double		KPH_TO_MPH = 0.6214;
	private static final int		SEND_DELAY = 200;
	private static final String		DEFAULT_PORT = "/dev/tty.CANOBDII-DevB";	
	private static final String 	AT_ECHO_OFF = "ate0";
	private static final String		AT_SUPPORTED_PIDS = "0100";
	private static final String 	COMMAND_REQUEST = "\r";
	
	public static final String	PID_COOLANT_TEMP = "05";	
	public static final String	PID_ENGINE_RPM = "0c";
	public static final String	PID_VEHICLE_VSS = "0d";	
		
	private int				index = -1;
	private SerialPort		serial = null;	
	private String			port = null;
	private String			state = null;
	private StringBuilder	builder = null;	
	
	public CarsListener			callback = null;	
	public Vector<Parameter>	parameters = null;	
	
	public EngineControlUnit( String port, String[] preferred ) {
		Parameter	pid;
		
		this.port = port;
		
		parameters = new Vector<Parameter>();
		
		for( String code:preferred ) {
			pid = new Parameter();
			pid.code = code;
			pid.supported = true;
			parameters.add( pid );
		}
		
		builder = new StringBuilder();

		initSerial();
		initPort();
	}
	
	public EngineControlUnit( String[] preferred ) {
		this( DEFAULT_PORT, preferred );
	}
	
	public EngineControlUnit( String port ) {
		this( port, null );
	}
	
	public EngineControlUnit() {
		this( DEFAULT_PORT );
	}
	
	private void buildParameters( String raw ) {
		BigInteger	convert;
		Parameter	pid;
		String		binary;
		String		hex;
		String		result;
		String[]	parts;
		
		// Clean up
		raw = raw.replaceAll( "\r", "" );
		raw = raw.replaceAll( "41 00 ", "" );	
		
		if( DEBUG_OUTPUT ) {
			System.out.println( "Cleaned: " + raw );
		}
		
		// Get parts
		parts = raw.split( " " );
		
		result = new String();
		
		// Convert parts to binary
		for( int p = 0; p < parts.length; p++ ) {
			convert = new BigInteger( parts[p], 16 );
			binary = convert.toString( 2 );
			
			while( binary.length() < 8 ) {
				binary = "0" + binary;
			}
			
			if( DEBUG_OUTPUT ) {
				System.out.println( parts[p] + ": " + binary );
			}
			
			result = result + binary;			
		}
		
		if( DEBUG_OUTPUT ) {
			System.out.println( "Full: " + result );
		}
		
		parameters = new Vector<Parameter>();
		
		// Build parameter list
		for( int c = 0; c < result.length(); c++ ) {
			pid = new Parameter();
			
			convert = new BigInteger(  String.valueOf( c ), 10 );			
			hex = convert.toString( 16 );
			
			while( hex.length() < 2 ) {
				hex = "0" + hex;
			}
			
			pid.code = hex;
			
			if( result.substring( c, c + 1 ).equals( "0" ) )
			{
				pid.supported = false;
			} else {
				pid.supported = true;
			}
			
			// Skip unsupported parameters
			if( c > 0 ) {
				if( pid.supported ) {
					parameters.add( pid );
				}
			}
			
			if( DEBUG_OUTPUT ) {
				System.out.println( pid.code + ": " + pid.supported );
			}
		}		
	}
	
	public double calculate( Parameter pid ) {
		BigInteger	convert;
		BigInteger	second;
		double		result;
		String		sensor;
		String[]	parts;
		
		if( pid == null ) {
			return -1;
		}
		
		result = 0;

		// Clean up
		sensor = pid.sensor;
		sensor = sensor.replaceAll( "\r", "" );		
		parts = sensor.split( " " );		
		
		// Evaluate
		if( pid.code.equals( PID_COOLANT_TEMP ) ) {
			convert = new BigInteger( parts[parts.length - 1], 16 );
			result = convert.intValue();
			result = ( ( result - 40 ) * 1.8 ) + 32;
		} else if( pid.code.equals( PID_ENGINE_RPM ) ) {
			convert = new BigInteger( parts[parts.length - 1], 16 );
			second = new BigInteger( parts[parts.length - 2], 16 );
			result = ( ( second.intValue() * 256 ) + convert.intValue() ) / 4;
		} else if( pid.code.equals( PID_VEHICLE_VSS ) ) {
			convert = new BigInteger( parts[parts.length - 1], 16 );
			result = convert.intValue();
			result = result * KPH_TO_MPH;
		}
		
		return result;
	}
	
	public void close() {
		try {
			if( serial != null ) {
				serial.closePort();
			}
		} catch( SerialPortException spe ) {
			spe.printStackTrace();
		}
	}
	
	private void cycle() {
		if( index == -1 ) {
			index = 0;
		} else {
			index = index + 1;
		}
		
		if( index == ( parameters.size() ) ) {
			index = 0;
			callback.onUpdate();
		}
		
		send( "01" + parameters.get( index ).code );
	}
	
	public Parameter find( String code ) {
		Parameter result;
		
		result = null;
		
		for( Parameter pid:parameters ) {
			if( pid.code.equals( code ) ) {
				result = pid;
				break;
			}
		}
		
		return result;
	}
	
	private void initPort() {
		send( AT_ECHO_OFF );
	}
	
	private void initSerial() {
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
	
	private void send( String command ) {
		try {
			Thread.sleep( SEND_DELAY );
		} catch( InterruptedException ie ) {
			ie.printStackTrace();
		}		
		
		try {
			state = command;
			builder.setLength( 0 );
			serial.writeBytes( ( command + COMMAND_REQUEST ).getBytes() );
		} catch( SerialPortException spe ) {
			spe.printStackTrace();			
		}
	}
	
	// Incoming serial data
	// Parse record
	// Store values
	@Override
	public void serialEvent( SerialPortEvent event ) {
		byte[]		buffer;        	
		Parameter	pid;
		String		raw;
    	
		// Receiving
        if( event.isRXCHAR() ) {
        	try {
        		// Latest bytes
                buffer = serial.readBytes( event.getEventValue() );

                for( byte b:buffer ) {
                	// Look for record end
                    if( b == COMMAND_RESPONSE ) {
                    	raw = builder.toString().trim();
                    	
                    	if( state.equals( AT_ECHO_OFF ) ) {
                    		if( DEBUG_OUTPUT ) {
                    			System.out.println( "Echo off: " + raw );
                    		}
                    		
                    		state = null;
                    		
                    		if( parameters == null ) {
                    			send( AT_SUPPORTED_PIDS );
                    		} else {
                    			cycle();
                    		}
                    	} else if( state.equalsIgnoreCase( AT_SUPPORTED_PIDS ) ) {
                    		if( DEBUG_OUTPUT ) {
                    			System.out.println( "Supported PIDs: " );
                    			System.out.println( raw );
                    		}
                    		
                			buildParameters( raw );
                			state = null;                    	
                			cycle();
                    	} else {
                    		pid = parameters.get( index );
                    		pid.sensor = raw;
                    		
                    		if( DEBUG_OUTPUT ) {
                    			System.out.println( pid.code + ": " + pid.sensor );
                    		}
                    		
                    		state = null;
                    		cycle();
                    	}
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
	
}
