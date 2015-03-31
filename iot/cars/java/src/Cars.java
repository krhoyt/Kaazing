import java.awt.EventQueue;

public class Cars {
	
	private EngineControlUnit	ecu = null;
	
	public Cars() {
		// Close port when exiting
		Runtime.getRuntime().addShutdownHook( new Thread() {
			public void run() {
				ecu.close();
			}
		} );
		
		initSerial();		
	}
		
	private void initSerial() {
		String[]	preferred;
		
		preferred = new String[3];
		preferred[0] = EngineControlUnit.PID_COOLANT_TEMP;
		preferred[1] = EngineControlUnit.PID_ENGINE_RPM;
		preferred[2] = EngineControlUnit.PID_VEHICLE_VSS;
		
		ecu = new EngineControlUnit( preferred );
		ecu.callback = new CarsListener() {
			
			@Override
			public void onUpdate() {
				Parameter	pid;
				
				pid = ecu.find( EngineControlUnit.PID_COOLANT_TEMP );
				System.out.println( "Coolant: " + ecu.calculate( pid ) );
				
				pid = ecu.find( EngineControlUnit.PID_ENGINE_RPM );
				System.out.println( "RPM: " + ecu.calculate( pid ) );				
				
				pid = ecu.find( EngineControlUnit.PID_VEHICLE_VSS );
				System.out.println( "Speed: " + ecu.calculate( pid ) );							
			}
			
		};
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
