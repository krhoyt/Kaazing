package org.kaazing.amazon;

// Interface for event handling in asynchronous search
public interface AmazonListener {

    void onSearchResult( AmazonResult result );

}
