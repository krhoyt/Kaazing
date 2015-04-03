import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;

public class Location implements SerialPortEventListener {

	private static final double KNOTS_TO_MPH = 1.15078;
	private static final String	DIRECTION_SOUTH = "S";
	private static final String	DIRECTION_WEST = "W";	
	
	private RecommendedMinimum	latest = null;	
	private SerialPort			serial = null;
	private String				port = null;
	private StringBuilder		builder = null;
	
	public Location( String port ) {
		this.port = port;		
		
		latest = new RecommendedMinimum();
		builder = new StringBuilder();

		initSerial();
	}	
	
	private void initSerial() {
		serial = new SerialPort( port );
		
		try {
			// Open serial port
			// Listen for data
			serial.openPort();
			serial.setParams( 
				SerialPort.BAUDRATE_4800,
				SerialPort.DATABITS_8,
				SerialPort.STOPBITS_1,
				SerialPort.PARITY_NONE
			);
			serial.addEventListener( this );	
		} catch( SerialPortException spe ) {
			spe.printStackTrace();
		}			
	}	
	
	private double parsePosition( String nmea, String direction ) {
		double 	result;
		double	minutes;
		int		period;
		int		degrees;
		
		period = nmea.indexOf( "." );
		degrees = Integer.valueOf( nmea.substring( 0, period - 2 ) );
		minutes = Double.valueOf( nmea.substring( period - 2, nmea.length() ) );
		
		result = degrees + ( minutes / 60 );
		
		if( direction.equals( DIRECTION_SOUTH ) || direction.equals( DIRECTION_WEST ) ) {
			result = 0 - result;
		}
		
		return result;
	}
	
	public RecommendedMinimum getLatest() {
		return latest;
	}
	
	// Incoming serial data
	// Parse record
	// Store values
	@Override
	public void serialEvent( SerialPortEvent event ) {
		byte[]		buffer;        			
		String		raw;
		String[]	parts;
    	
		// Receiving
        if( event.isRXCHAR() ) {
        	try {
        		// Latest bytes
                buffer = serial.readBytes( event.getEventValue() );

                for( byte b:buffer ) {
                	// Look for record end
                    if( b == '\r' ) {
                    	raw = builder.toString().trim();
                    	
                    	if( raw.indexOf( "$GPRMC" ) == 0 ) {
                    		parts = raw.split( "," );
                    		latest.latitude = parsePosition( parts[3], parts[4] );
                    		latest.longitude = parsePosition( parts[5], parts[6] );
                    		latest.speed = Double.parseDouble( parts[7] ) * KNOTS_TO_MPH;
                    		latest.angle = Double.parseDouble( parts[8] );

                    		System.out.println( latest.latitude + " " + latest.longitude );                    		
                    	}

                    	builder.setLength( 0 );
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
