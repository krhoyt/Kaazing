package com.example.kevin.myapplication;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import java.util.ArrayList;

public class ChatAdapter extends ArrayAdapter<ChatMessage>
{
    private final Context context;
    private final ArrayList<ChatMessage> itemsArrayList;

    public ChatAdapter(Context context, ArrayList<ChatMessage> itemsArrayList)
    {
        super(context, R.layout.chat_row, itemsArrayList);

        this.context = context;
        this.itemsArrayList = itemsArrayList;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent)
    {

        // 1. Create inflater
        LayoutInflater inflater = (LayoutInflater) context
                .getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        // 2. Get rowView from inflater
        View rowView = inflater.inflate(R.layout.chat_row, parent, false);

        // 3. Get the two text view from the rowView
        TextView labelView = (TextView) rowView.findViewById(R.id.content);

        // 4. Set the text for textView
        labelView.setText(itemsArrayList.get(position).content);

        // 5. return rowView
        return rowView;
    }
}
