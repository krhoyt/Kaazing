package org.kaazing.stores;

import android.content.Intent;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

public class StoresActivity extends ActionBarActivity {

    private RelativeLayout  btnScan = null;
    private TextView        txtScan = null;

    public void onActivityResult( int requestCode, int resultCode, Intent intent ) {
        IntentResult    scanResult;
        String          resultContents;

        scanResult = IntentIntegrator.parseActivityResult( requestCode, resultCode, intent );

        if( scanResult != null) {
            resultContents = scanResult.getContents();
            txtScan.setText( resultContents );
        }
    }

    @Override
    protected void onCreate( Bundle savedInstanceState ) {
        super.onCreate( savedInstanceState );
        setContentView( R.layout.activity_stores );

        txtScan = ( TextView )findViewById( R.id.scan_code );
        txtScan.setText( "" );

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
}
