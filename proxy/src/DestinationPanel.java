import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextField;

public class DestinationPanel extends JPanel
{
	private static final long serialVersionUID = 1L;	
	
	public DestinationPanel()
	{
		init();
	}
	
	protected void init()
	{
    	GridBagConstraints gbc = null;		
		
    	// Frame with slight padding
    	setBorder( BorderFactory.createEmptyBorder( 5, 5, 5, 5 ) );
    	
		// GridBagLayout
    	setLayout( new GridBagLayout() );
    	
    	// Port label
    	gbc = new GridBagConstraints();    	
    	add( new JLabel( "Serial port:" ), gbc );
    	
    	// Port field
    	gbc = new GridBagConstraints();
    	gbc.fill = GridBagConstraints.HORIZONTAL;
    	gbc.weightx = 1;    	
    	add( new JTextField(), gbc );

    	// Baud label
    	gbc = new GridBagConstraints();    	
    	add( new JLabel( "Baud:" ), gbc );    	
    	
    	// Baud field
    	gbc = new GridBagConstraints();
    	gbc.fill = GridBagConstraints.HORIZONTAL;
    	gbc.weightx = 1;    	
    	add( new JTextField(), gbc );    	
    	
    	// Endpoint label
    	gbc = new GridBagConstraints();
    	gbc.gridy = 1;
    	gbc.anchor = GridBagConstraints.WEST;    	
    	add( new JLabel( "Endpoint:" ), gbc );    	
    	
    	// Endpoint field
    	gbc = new GridBagConstraints();
    	gbc.fill = GridBagConstraints.HORIZONTAL;
    	gbc.weightx = 1;  
    	gbc.gridy = 1;
    	gbc.gridwidth = 3;
    	add( new JTextField(), gbc );    	    	
    	
    	// Topic label
    	gbc = new GridBagConstraints();
    	gbc.gridy = 2;
    	gbc.anchor = GridBagConstraints.WEST;    	
    	add( new JLabel( "Topic:" ), gbc );    
    	
    	// Topic field
    	gbc = new GridBagConstraints();
    	gbc.fill = GridBagConstraints.HORIZONTAL;
    	gbc.weightx = 1;  
    	gbc.gridy = 2;
    	gbc.gridwidth = 3;
    	add( new JTextField(), gbc );    	    	    	

    	// Start button
    	gbc = new GridBagConstraints();
    	gbc.gridy = 3;
    	gbc.gridwidth = 4;
    	gbc.anchor = GridBagConstraints.EAST;
    	add( new JButton( "Start" ), gbc );    		
	}
}
