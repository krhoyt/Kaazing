package org.kaazing.amazon;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.AsyncTask;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.text.DecimalFormat;


public class AmazonActivity extends ActionBarActivity {

    private EditText    txtUpc = null;
    private ImageView   imgProduct = null;
    private TextView    txtCurrency = null;
    private TextView    txtPrice = null;
    private TextView    txtTitle = null;

    // Called at startup
    // Build user interface
    // Set event listener for search
    @Override
    protected void onCreate( Bundle savedInstanceState ) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_amazon);

        txtUpc = ( EditText )findViewById( R.id.upc );
        txtUpc.setOnKeyListener( new View.OnKeyListener() {

            // Keyboard handler for search
            // Looks for enter key
            // Performs Amazon search
            @Override
            public boolean onKey( View view, int keyCode, KeyEvent event ) {
                AmazonTask  task = null;

                if( event.getAction() == KeyEvent.ACTION_DOWN && keyCode == KeyEvent.KEYCODE_ENTER )
                {
                    Log.i( "SEARCH", txtUpc.getText().toString() );

                    // Asynchronous Amazon search
                    task = new AmazonTask();
                    task.callback = new AmazonListener() {

                        // Called with Amazon search result
                        @Override
                        public void onSearchResult( AmazonResult result ) {
                            DecimalFormat   decimal = null;
                            DownloadTask    download = null;

                            Log.i( "AMAZON", result.getTitle() );

                            download = new DownloadTask( imgProduct );
                            download.execute( result.getImage() );

                            txtTitle.setText(result.getTitle());

                            txtCurrency.setVisibility( View.VISIBLE );

                            decimal = new DecimalFormat( "0.##" );
                            txtPrice.setText( decimal.format( result.getPrice() ) );
                        }

                    };
                    task.execute( txtUpc.getText().toString() );

                    return true;
                }

                return false;
            }

        } );

        imgProduct = ( ImageView )findViewById( R.id.product_image );
        txtTitle = ( TextView )findViewById( R.id.product_title );
        txtCurrency = ( TextView )findViewById( R.id.product_currency );
        txtPrice = ( TextView )findViewById( R.id.product_price );
    }

    // Load menu
    // No menu here
    // Stubbed in for future use
    @Override
    public boolean onCreateOptionsMenu( Menu menu ) {
        // Inflate the menu; this adds items to the action bar if it is present.
        // getMenuInflater().inflate( R.menu.menu_amazon, menu );
        return true;
    }

    // Handle menu
    // No menu  here
    // Stubbed in for future use
    @Override
    public boolean onOptionsItemSelected( MenuItem item ) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = 0;

        id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if( id == R.id.action_settings )
        {
            return true;
        }

        return super.onOptionsItemSelected( item );
    }

}
