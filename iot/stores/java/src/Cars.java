import java.awt.EventQueue;
import java.util.Vector;

import javax.bluetooth.DeviceClass;
import javax.bluetooth.DiscoveryAgent;
import javax.bluetooth.DiscoveryListener;
import javax.bluetooth.LocalDevice;
import javax.bluetooth.RemoteDevice;
import javax.bluetooth.ServiceRecord;

public class Cars implements DiscoveryListener {

	public static final Vector<RemoteDevice> devicesDiscovered = new Vector();	
	
	private static Object lock = new Object();	
	
	public Cars() {
		initBluetooth();
	}
		
	private void initBluetooth() {
		DiscoveryAgent	agent;
		LocalDevice		local;
		
		try {
			local = LocalDevice.getLocalDevice();
			
			agent = local.getDiscoveryAgent();
			agent.startInquiry( DiscoveryAgent.GIAC, this );
			
			try {
				synchronized( lock ) {
					lock.wait();
				}
			} catch( InterruptedException ie ) {
				ie.printStackTrace();
			}
		} catch( Exception e ) {
			e.printStackTrace();
		}
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

	@Override
	public void deviceDiscovered( RemoteDevice device, DeviceClass deviceClass ) {
		String name;
		        
		try {
			name = device.getFriendlyName( false );
		} catch (Exception e) {
			name = device.getBluetoothAddress();
		}

		System.out.println( "Device found: " + name );
	}

	@Override
	public void inquiryCompleted( int state ) {
		synchronized( lock ) {
			lock.notify();
		}
	}

	@Override
	public void serviceSearchCompleted(int arg0, int arg1) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void servicesDiscovered(int arg0, ServiceRecord[] arg1) {
		// TODO Auto-generated method stub
		
	}

}
