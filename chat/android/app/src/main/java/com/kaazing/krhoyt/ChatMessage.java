package com.kaazing.krhoyt;

// Chat message
public class ChatMessage {

    public int      color = 0;
    public String	content = null;
    public String	raw = null;
    public String	user = null;

    public ChatMessage() {}

    public ChatMessage( String content ) {
        this.content = content;
    }
}
