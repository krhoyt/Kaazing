// Java Simple Serial Connector (jSSC)
// https://code.google.com/p/java-simple-serial-connector/
import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;
import jssc.SerialPortList;

public class JSSCTest
{
	static SerialPort arduino = null;	
	
	public static void main( String[] args ) 
	{
		SerialReader	reader = null;
		String[]		ports = null;
		
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
		byte[] buffer = null;
		String output = null;
		
        public void serialEvent( SerialPortEvent event ) 
        {
        	// Data available
            if( event.isRXCHAR() )
            {
            	// Read some bytes
            	// Display resulting string
                try {
                    buffer = arduino.readBytes( event.getEventValue() );
                    output = new String( buffer );
                    System.out.print( output );
                } catch ( SerialPortException spe ) {
                    System.out.println( spe );
                }
            }
        }
    }	
}
