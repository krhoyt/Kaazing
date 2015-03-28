package org.kaazing.stores;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import java.util.ArrayList;

public class StoreAdapter extends ArrayAdapter<StoreItem> {

    private final ArrayList<StoreItem>  items;
    private final Context               context;

    public StoreAdapter( Context context, ArrayList<StoreItem> list ) {
        super( context, R.layout.item_row, list );

        this.context = context;
        this.items = list;
    }

    @Override
    public View getView( int position, View convert, ViewGroup parent ) {
        LayoutInflater  inflater;
        TextView        label;
        View            row;

        // Layout access
        inflater = ( LayoutInflater )context.getSystemService( Context.LAYOUT_INFLATER_SERVICE );

        // Get row layout
        row = inflater.inflate( R.layout.item_row, parent, false );

        // Get label
        label = ( TextView )row.findViewById( R.id.title );

        // Set the text
        label.setText( items.get( position ).title );

        // Return row
        return row;
    }

}
