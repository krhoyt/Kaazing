import javax.swing.SwingUtilities;


public class KaazingSerialProxy 
{	
	public static void main( String[] args ) 
	{
       SwingUtilities.invokeLater( new Runnable() {
            @Override
            public void run() 
            {
                ProxySettingsFrame proxy = new ProxySettingsFrame();
                proxy.setVisible( true );
            }
        } );
	}
}
