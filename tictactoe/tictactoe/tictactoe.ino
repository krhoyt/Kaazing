#include <Bridge.h>
#include <YunClient.h>

const int DISCONNECTED = 0;
const int CONNECTING = 1;
const int CONNECTED = 2;
const int WAITING = 3;
const int SUBSCRIBING = 4;
const int SUBSCRIBED = 5;

const String TOPIC = "/topic/tictactoe";

int       state;
String    session;
YunClient client;

void setup() 
{
  state = DISCONNECTED;
  
  Serial.begin( 9600 );
  Bridge.begin();
  while( !Serial );
}

void loop() 
{
  int    start;
  String response;
  
  if( state == DISCONNECTED )
  {
    if( client.connect( "kaazing.kevinhoyt.com", 61613 ) )
    {
      state = CONNECTING;
      Serial.println( "Connecting..." );
    } else {
      Serial.println( "Not connected" );
    }    
  } else if( state == CONNECTING ) {
    client.println( "CONNECT" );
    client.println( "accept-version:1.2" );
    client.println( "host:kaazing.kevinhoyt.com" );
    client.println();
    client.write( 0x0 );
    
    Serial.println( "Connect header sent..." );
    state = WAITING;
  } else if( state == CONNECTED ) {
    client.println( "SUBSCRIBE" );
    client.print( "id:" );
    client.println( session );
    client.print( "destination:" );
    client.println( TOPIC );
    client.println();
    client.write( 0x0 );
  
    Serial.println( "Subscribing to topic..." );
    state = SUBSCRIBING;  
  }
  
  if( client.available() > 0 ) 
  {
    response = client.readStringUntil( '\n' );
    
    Serial.print( "Debug: " );
    Serial.println( response );
    
    if( state == SUBSCRIBING )
    {
      state = SUBSCRIBED;
      Serial.println( "Subscribed." );
      
      client.flush();  
    }
    
    if( response == "CONNECTED" )
    {
      state = CONNECTED;
      Serial.println( "Connected." );
      
      response = client.readStringUntil( '\n' );
      start = response.indexOf( ":" ) + 1;
      session = response.substring( start );
      Serial.print( "Session: " );
      Serial.println( session );

      client.flush();
    }
  }
}

