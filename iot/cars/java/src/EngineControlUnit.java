import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;


public class EngineControlUnit implements SerialPortEventListener {
	
	private static final char 	COMMAND_RESPONSE = '>';	
	private static final String AT_DISPLAY_PORT = "atdp";
	private static final String AT_ECHO_OFF = "ate0";
	private static final String AT_LINE_FEED_OFF = "atl0";
	private static final String	AT_SUPPORTED_PIDS = "0100";
	private static final String COMMAND_REQUEST = "\r";
	
	private static final String	DEFAULT_PORT = "/dev/tty.CANOBDII-DevB";		
	
	private SerialPort		serial = null;	
	private String			port = null;
	private String			state = null;
	private StringBuilder	builder = null;
	
	public EngineControlUnit( String port ) {
		this.port = port;
		
		builder = new StringBuilder();
		
		initSerial();
		initPort();
	}
	
	public EngineControlUnit() {
		this( DEFAULT_PORT );
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
			send( AT_SUPPORTED_PIDS );
		} catch( SerialPortException spe ) {
			spe.printStackTrace();
		}			
	}
	
	private void send( String command ) {
		try {
			Thread.sleep( 200 );
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
		byte[]	buffer;        	
		String	raw;
    	
		// Receiving
        if( event.isRXCHAR() ) {
        	try {
        		// Latest bytes
                buffer = serial.readBytes( event.getEventValue() );

                for( byte b:buffer ) {
                	// Look for record end
                    if( b == COMMAND_RESPONSE ) {
                    	System.out.println( builder.toString() );
                    	raw = builder.toString().trim();
                    	// raw = raw.substring( raw.lastIndexOf( 13 ) + 1 );
                    	
                    	switch( state ) {
                    		case AT_ECHO_OFF:
                    			System.out.println( "Echo off: " + raw );
                    			send( AT_SUPPORTED_PIDS );
                    			break;
                    		case AT_SUPPORTED_PIDS:
                    			System.out.println( "Supported PIDs: " );
                    			System.out.println( raw );
                    			// 41 00 98 3A 80 13
                    			// 41 00 BE 3F A8 13
                    			state = null;
                    			break;
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
