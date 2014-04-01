import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Enumeration;

import gnu.io.CommPortIdentifier; 
import gnu.io.SerialPort;
import gnu.io.SerialPortEvent; 
import gnu.io.SerialPortEventListener; 

public class RXTXTest implements SerialPortEventListener 
{
	SerialPort serialPort = null;

	// Desired port
	private static final String PORT_NAMES[] = { 
		"/dev/tty.usbserial-A6007to5", // Mac OS X
		"/dev/ttyACM0", // Raspberry Pi
		"/dev/ttyUSB0", // Linux
		"COM3", // Windows
	};
	
	// Bytes to characters
	private BufferedReader input;
	
	// How long to wait for the port to open
	private static final int TIME_OUT = 2000;
	
	// Data bit rate from device
	private static final int DATA_RATE = 9600;

	public void initialize() 
	{
		// For Raspberry Pi 
		// http://www.raspberrypi.org/phpBB3/viewtopic.php?f=81&t=32186
		// System.setProperty( "gnu.io.rxtx.SerialPorts", "/dev/ttyACM0" );

		CommPortIdentifier portId = null;
		Enumeration portEnum = CommPortIdentifier.getPortIdentifiers();

		// Find serial port
		while (portEnum.hasMoreElements()) 
		{
			CommPortIdentifier currPortId = (CommPortIdentifier)portEnum.nextElement();
			
			System.out.println( currPortId.getName() );
			
			for( String portName:PORT_NAMES ) 
			{
				if( currPortId.getName().equals( portName ) ) 
				{
					portId = currPortId;
					break;
				}
			}
		}
		
		if( portId == null ) 
		{
			System.out.println( "Could not find desired port." );
			return;
		}

		try {
			// Open serial port
			serialPort = ( SerialPort )portId.open( this.getClass().getName(), TIME_OUT );

			// Set port parameters
			serialPort.setSerialPortParams( DATA_RATE, SerialPort.DATABITS_8, SerialPort.STOPBITS_1, SerialPort.PARITY_NONE );

			// Open input stream
			input = new BufferedReader( new InputStreamReader( serialPort.getInputStream() ) );

			// Add event listeners
			serialPort.addEventListener( this );
			serialPort.notifyOnDataAvailable( true );
		} catch( Exception e ) {
			System.err.println( e.toString() );
		}
	}

	// Close port when finished
	public synchronized void close() 
	{
		if( serialPort != null ) 
		{
			serialPort.removeEventListener();
			serialPort.close();
		}
	}

	// Serial port event
	public synchronized void serialEvent( SerialPortEvent oEvent ) 
	{
		if( oEvent.getEventType() == SerialPortEvent.DATA_AVAILABLE ) 
		{
			try {
				String inputLine=input.readLine();
				System.out.println( "Line: " + inputLine );
			} catch( Exception e ) {
				System.err.println( e.toString() );
			}
		}
	}

	public static void main( String[] args ) throws Exception 
	{
		RXTXTest main = new RXTXTest();
		
		main.initialize();
		
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
		System.out.println( "Started" );
	}
}
