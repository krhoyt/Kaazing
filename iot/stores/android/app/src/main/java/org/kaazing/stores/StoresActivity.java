package org.kaazing.stores;

import android.content.Intent;
import android.graphics.Color;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Adapter;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import java.util.ArrayList;

public class StoresActivity extends ActionBarActivity {

    private ListView                lstItems = null;
    private RelativeLayout          btnScan = null;

    private ArrayList<StoreItem>    items = null;
    private StoreAdapter            adapter = null;

    public void onActivityResult( int requestCode, int resultCode, Intent intent ) {
        IntentResult    scanResult;
        StoreItem       item;
        String          resultContents;

        scanResult = IntentIntegrator.parseActivityResult( requestCode, resultCode, intent );

        if( scanResult != null) {
            resultContents = scanResult.getContents();

            item = new StoreItem();
            item.title = resultContents;
            items.add( 0, item );
            adapter.notifyDataSetChanged();

            Log.i( "SCAN", resultContents );
        }
    }

    @Override
    protected void onCreate( Bundle savedInstanceState ) {
        super.onCreate( savedInstanceState );
        setContentView( R.layout.activity_stores );

        // TODO: Testing
        StoreItem   item = null;

        items = new ArrayList<StoreItem>();
        adapter = new StoreAdapter( this, items );
        lstItems = ( ListView )findViewById( R.id.list_view );
        lstItems.setAdapter( adapter );

        // TODO: Testing
        for( int i = 0; i < 100; i++ ) {
            item = new StoreItem();
            item.title = "Test";
            items.add( item );
        }

        // TODO: Testing
        adapter.notifyDataSetChanged();

        btnScan = ( RelativeLayout )findViewById( R.id.scan_button );
        btnScan.setOnClickListener( new View.OnClickListener() {
            @Override
            public void onClick( View v ) {
                IntentIntegrator integrator = new IntentIntegrator( StoresActivity.this );
                integrator.initiateScan();
            }
        } );
    }


    @Override
    public boolean onCreateOptionsMenu( Menu menu ) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate( R.menu.menu_stores, menu );
        return true;
    }

    @Override
    public boolean onOptionsItemSelected( MenuItem item ) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if( id == R.id.action_settings ) {
            return true;
        }

        return super.onOptionsItemSelected( item );
    }

    // TODO: Remove item from list
    public void onRemoveItem( View view ) {
        RelativeLayout  parent;
        TextView        txtTitle;

        for( int i = 0; i < lstItems.getChildCount(); i++ ) {
            lstItems.getChildAt( i ).setBackgroundColor( Color.BLUE );
        }

        // Get row of click
        parent = ( RelativeLayout )view.getParent();

        // Reference to child
        txtTitle = ( TextView )parent.getChildAt( 0 );
        txtTitle.setText( "Removed!" );

        // Refresh display
        parent.setBackgroundColor( Color.CYAN );
        parent.refreshDrawableState();
    }
}
