import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;

import javax.swing.BorderFactory;
import javax.swing.JFrame;
import javax.swing.JSplitPane;

public class ProxySettingsFrame extends JFrame 
{
	private static final long serialVersionUID = 1L;

	public ProxySettingsFrame() 
    {    
       setTitle( "Kaazing Serial Proxy" );
       setSize( 445, 550 );
       setLocationRelativeTo( null );
       setDefaultCloseOperation( EXIT_ON_CLOSE );  
       
       init();
    }
    
    public void init()
    {
    	GridBagConstraints gbc = null;    	
    	JSplitPane	       inOut = null;
    	
    	// Split pane on input and output panes
    	inOut = new JSplitPane( JSplitPane.VERTICAL_SPLIT, new OutputPanel(), new InputPanel() );
    	inOut.setResizeWeight( 0.50 );
    	inOut.setBorder( BorderFactory.createEmptyBorder( 0, 0, 0, 0 ) );
    	
    	// GridBagLayout
    	setLayout( new GridBagLayout() );

    	// Settings
    	gbc = new GridBagConstraints();
    	gbc.fill = GridBagConstraints.HORIZONTAL;
    	gbc.weightx = 1;    	
    	add( new DestinationPanel(), gbc );    	    	
    	
    	// Input and output
    	gbc = new GridBagConstraints();
    	gbc.fill = GridBagConstraints.BOTH;
    	gbc.weightx = 1;
    	gbc.weighty = 1;
    	gbc.gridy = 1;
    	add( inOut, gbc );    	
    }
}
