package com.example.kevin.myapplication;

// Generic type for chat message content
public class ChatMessage
{
    public int      color = 0;
    public String	content = null;
    public String	raw = null;
    public String	user = null;

    public ChatMessage() {;}

    public ChatMessage( String content )
    {
        this.content = content;
    }
}
