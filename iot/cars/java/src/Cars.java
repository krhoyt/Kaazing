import java.awt.EventQueue;
import java.math.BigInteger;

public class Cars {
	
	private EngineControlUnit	ecu = null;
	
	public Cars() {
		// initSerial();
		boolean		supported;
		BigInteger	convert;
		String		binary;
		String		pids;
		String[]	parts;
		String		result;
		
		pids = "41 00 BE 3F A8 13" + '\r' + "41 00 98 3A 80 13";
		System.out.println( "Original: " + pids );
				
		pids = pids.replaceAll( "\r", " " );
		pids = pids.replaceAll( "41 00 ", "" );
		System.out.println( "Cleaned: " + pids );
		
		parts = pids.split( " " );
		System.out.println( "Count: " + parts.length );
		
		result = new String();
		
		for( int p = 0; p < parts.length; p++ ) {
			convert = new BigInteger( parts[p], 16 );
			binary = convert.toString( 2 );
			
			while( binary.length() < 8 ) {
				binary = "0" + binary;
			}
			
			System.out.println( parts[p] + ": " + binary );
			
			result = result + binary;			
		}
		
		System.out.println( "Full: " + result );
		
		for( int c = 0; c < result.length(); c++ ) {
			convert = new BigInteger(  String.valueOf( c ), 10 );			
			binary = convert.toString( 16 );
			
			while( binary.length() < 2 ) {
				binary = "0" + binary;
			}
			
			if( result.substring( c, c + 1 ).equals( "0" ) )
			{
				supported = false;
			} else {
				supported = true;
			}
			
			System.out.println( binary + ": " + supported );
		}
	}
		
	private void initSerial() {
		ecu = new EngineControlUnit();
	}	
	
	public static void main( String[] args ) {
		EventQueue.invokeLater( new Runnable() {
			
			@Override
			public void run() 
			{
				Cars iot = new Cars();
			}
			
		} );
	}
	
}
