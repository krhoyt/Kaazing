package com.kaazing.krhoyt;

public interface ChatCallback {

    void onAllClear();
    void onMessage( ChatMessage message );

}
