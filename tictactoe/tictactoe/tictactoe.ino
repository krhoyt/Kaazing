// Libraries
#include <Bridge.h>
#include <YunClient.h>

// Constants for STOMP
const int DISCONNECTED = 0;
const int CONNECTING = 1;
const int CONNECTED = 2;
const int WAITING = 3;
const int SUBSCRIBING = 4;
const int SUBSCRIBED = 5;

// Constants for application
const String TOPIC = "/topic/tictactoe";

// Global
int       state;
String    session;
YunClient client;

// Setup
void setup() 
{
  // Initially disconnected
  state = DISCONNECTED;
  
  // Serial for debugging
  Serial.begin( 9600 );
  
  // Start Yun bridge
  // Used for network connectivity
  Bridge.begin();
  
  // Wait until bridge is open
  while( !Serial );
}

// Loop
void loop() 
{
  int    start;
  String response;
  
  // If disconnected
  if( state == DISCONNECTED )
  {
    // Connect to server
    if( client.connect( "kaazing.kevinhoyt.com", 61613 ) )
    {
      // Set connecting state
      state = CONNECTING;
      Serial.println( "Connecting..." );
    } else {
      // Problem connecting
      Serial.println( "Not connected" );
    }    
  // Connected to server
  } else if( state == CONNECTING ) {
    // Initiate STOMP connection
    client.println( "CONNECT" );
    client.println( "accept-version:1.2" );
    client.println( "host:kaazing.kevinhoyt.com" );
    client.println();
    client.write( 0x0 );
    
    // Waiting for response  
    Serial.println( "Connect header sent..." );
    state = WAITING;
  // Connected to STOMP broker
  } else if( state == CONNECTED ) {
    // Subscribe to specified destination
    client.println( "SUBSCRIBE" );
    client.print( "id:" );
    client.println( session );
    client.print( "destination:" );
    client.println( TOPIC );
    client.println();
    client.write( 0x0 );
  
    // Wait for acknowledge
    Serial.println( "Subscribing to topic..." );
    state = SUBSCRIBING;  
  }
  
  // Incoming data from broker
  if( client.available() > 0 ) 
  {
    // Read STOMP frame indicator
    response = client.readStringUntil( '\n' );
    
    // Debug response content
    Serial.print( "Debug: " );
    Serial.println( response );
    
    // If waiting to subscribe
    if( state == SUBSCRIBING )
    {
      // Now subscribed
      state = SUBSCRIBED;
      Serial.println( "Subscribed." );
    }
    
    // If frame if connected
    if( response == "CONNECTED" )
    {
      // Set state
      state = CONNECTED;
      Serial.println( "Connected." );
      
      // Read session ID
      // Used for subscription purposes
      response = client.readStringUntil( '\n' );
      start = response.indexOf( ":" ) + 1;
      session = response.substring( start );
      
      // Display session ID
      Serial.print( "Session: " );
      Serial.println( session );
    // If frame is a message
    } else if( response == "MESSAGE" ) {
      Serial.print( "Message: " );      
      
      // Process message content
      // TODO: Appropriately parse response headers
      response = client.readStringUntil( 0x0 );
      start = response.indexOf( "\n\n" ) + 2;
      response = response.substring( start );

      // Display message
      // TODO: Parse body and take action
      Serial.println( response ); 
    }
  }
}

