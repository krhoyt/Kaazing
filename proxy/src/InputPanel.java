import java.awt.BorderLayout;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;

import javax.swing.BorderFactory;
// import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;

public class InputPanel extends JPanel
{
	private static final long serialVersionUID = 1L;		
	
	public InputPanel()
	{
		init();
	}
	
	protected void init()
	{
    	GridBagConstraints gbc = null;
    	JPanel			   newline = null;
    	JPanel			   entry = null;
		
    	// Frame
    	setBorder( BorderFactory.createEmptyBorder( 5, 5, 5, 5 ) );
		
    	// GridBagLayout
		setLayout( new GridBagLayout() );    	

		// Input area
		entry = new JPanel();
		entry.setLayout( new BorderLayout() );
		entry.add( new JLabel( "Input:" ), BorderLayout.WEST );		
		entry.add( new JTextField(), BorderLayout.CENTER );
		entry.add( new JButton( "Send" ), BorderLayout.EAST );		
		
    	gbc = new GridBagConstraints();
    	gbc.fill = GridBagConstraints.BOTH;
    	gbc.weightx = 1; 
    	add( entry, gbc );    			
		
    	// History
    	gbc = new GridBagConstraints();
    	gbc.gridy = 1;
    	gbc.fill = GridBagConstraints.BOTH;
    	gbc.weightx = 1;
    	gbc.weighty = 1; 
    	add( new JScrollPane( new JTextArea() ), gbc );    	
    	
    	// Appending character
    	newline = new JPanel();
    	newline.setLayout( new BorderLayout() );
    	newline.add( new JButton( "Newline" ), BorderLayout.EAST ); 	
    	
    	gbc = new GridBagConstraints();
    	gbc.gridy = 2;
    	gbc.weightx = 1;
    	gbc.fill = GridBagConstraints.HORIZONTAL;
    	add( newline, gbc );		
	}
}
