import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;

import javax.swing.BorderFactory;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.ListCellRenderer;
import javax.swing.border.CompoundBorder;
import javax.swing.border.EmptyBorder;

public class ChatRenderer extends JLabel implements ListCellRenderer<ChatMessage> 
{
	private static final long serialVersionUID = -2130454108929362563L;

	// JList cell rendering
	public Component getListCellRendererComponent(
		JList<? extends ChatMessage> list, 
		ChatMessage value, 
		int index,
		boolean isSelected, 
		boolean cellHasFocus ) {
		
		// Bottom border
		// Side spacing
		setBorder( new CompoundBorder( 
			BorderFactory.createMatteBorder( 0, 0, 1, 0, new Color( 0, 0, 0, 51 ) ),				
			new EmptyBorder( 0, 10, 0, 10 )
		) );
		
		// Content
		setText( value.content );
		
		// User color
		setForeground( value.color );
		
		// Font set at JList level
		setFont( list.getFont() );
		
		// Specify height
		setPreferredSize( new Dimension( 100, 35 ) );
		
		return this;
	}
}
