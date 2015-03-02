package com.example.kevin.myapplication;

import android.os.Handler;
import android.os.HandlerThread;

public class DispatchQueue extends HandlerThread
{
    private Handler handler;

    public DispatchQueue( String name )
    {
        super( name );
    }

    // The message blocks until the thread is started. This should be called
    // after call to start() to ensure the thread is ready.   
    public void waitUntilReady()
    {
        handler = new Handler( getLooper() );
    }

    // Adds the Runnable to the message queue which will be run on the thread.
    // The runnable will be run in a first-in first-out basis.   
    public void dispatchAsync( Runnable task )
    {
        handler.post( task );
    }

    public void removePendingJobs()
    {
        handler.removeCallbacksAndMessages( null );
    }
}
