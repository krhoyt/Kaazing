import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;

import javax.swing.BorderFactory;
import javax.swing.JCheckBox;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;

public class OutputPanel extends JPanel
{
	private static final long serialVersionUID = 1L;		
	
	public OutputPanel()
	{
		init();
	}
	
	protected void init()
	{
    	GridBagConstraints gbc = null;

    	// Frame
    	setBorder( BorderFactory.createEmptyBorder( 5, 5, 5, 5 ) );
    	
    	// GridBagLayout
    	setLayout( new GridBagLayout() );
    	
    	// Autoscroll checkbox
    	gbc = new GridBagConstraints();
    	gbc.anchor = GridBagConstraints.WEST;
    	add( new JLabel( "Output:" ), gbc );    	
    	
    	// Autoscroll checkbox
    	gbc = new GridBagConstraints();
    	gbc.anchor = GridBagConstraints.EAST;
    	add( new JCheckBox( "Autoscroll" ), gbc );
    	
    	// Output area
    	gbc = new GridBagConstraints();
    	gbc.gridy = 1;
    	gbc.fill = GridBagConstraints.BOTH;
    	gbc.weightx = 2;
    	gbc.weighty = 1;
    	gbc.gridwidth = 2;
    	add( new JScrollPane( new JTextArea() ), gbc );
	}
}
