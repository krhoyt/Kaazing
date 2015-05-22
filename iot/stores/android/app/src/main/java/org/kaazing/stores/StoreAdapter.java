package org.kaazing.stores;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import java.text.DecimalFormat;
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
        DecimalFormat   decimal;
        DownloadTask    download;
        ImageView       image;
        LayoutInflater  inflater;
        TextView        label;
        TextView        price;
        View            row;

        // Layout access
        inflater = ( LayoutInflater )context.getSystemService( Context.LAYOUT_INFLATER_SERVICE );

        // Get row layout
        row = inflater.inflate( R.layout.item_row, parent, false );

        // Get image
        image = ( ImageView )row.findViewById( R.id.item_image );

        // Download image
        download = new DownloadTask( image );
        download.execute( items.get( position ).image );

        // Get label
        label = ( TextView )row.findViewById( R.id.item_title );

        // Set the text
        label.setText( items.get( position ).title );

        // Get price
        price = ( TextView )row.findViewById( R.id.item_price );

        // Format price
        decimal = new DecimalFormat( "0.00" );

        // Set the text
        price.setText( decimal.format( items.get( position ).price ) );

        // Return row
        return row;
    }

}
