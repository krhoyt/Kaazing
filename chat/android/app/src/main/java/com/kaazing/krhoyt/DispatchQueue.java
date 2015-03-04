package com.kaazing.krhoyt;

import android.os.Handler;
import android.os.HandlerThread;

public class DispatchQueue extends HandlerThread {

    private Handler handler;

    public DispatchQueue( String name ) {
        super( name );
    }

    // Ensure thread ready
    public void waitUntilReady() {
        handler = new Handler( getLooper() );
    }

    // Add to message queue
    public void dispatchAsync( Runnable task ) {
        handler.post( task );
    }

    public void removePendingJobs() {
        handler.removeCallbacksAndMessages( null );
    }
}
