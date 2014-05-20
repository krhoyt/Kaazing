// Libraries
#include <Bridge.h>
#include <Adafruit_NeoPixel.h>
#include <YunClient.h>

// Defines
#define NEOPIXEL_PIN 8

// Constants for STOMP
const int DISCONNECTED = 0;
const int CONNECTING = 1;
const int CONNECTED = 2;
const int WAITING = 3;
const int SUBSCRIBING = 4;
const int SUBSCRIBED = 5;

// Constants for application
const int    PORT = 61613;
const String ENDPOINT = "ec2-54-81-93-202.compute-1.amazonaws.com";
const String TOPIC = "/topic/tictactoe";

// NeoPixel
Adafruit_NeoPixel pixels = Adafruit_NeoPixel( 9, NEOPIXEL_PIN, NEO_RGB + NEO_KHZ800 );

// Global
int       state;
String    session;
String    subscription;
YunClient client;

// Setup
void setup() 
{
  // Initially disconnected
  state = DISCONNECTED;
  
  // Turn off pixels
  pixels.begin();
  pixels.show();
  
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
  int    blue;
  int    end;
  int    green;
  int    led;
  int    red;
  int    start;
  String response;
  
  // If disconnected
  if( state == DISCONNECTED )
  {
    // Connect to server
    if( client.connect( "ec2-54-81-93-202.compute-1.amazonaws.com", 61613 ) )
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
    client.print( "host:" );
    client.println( "ec2-54-81-93-202.compute-1.amazonaws.com" );
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
        
    // If waiting to subscribe
    if( state == SUBSCRIBING )
    {
      // Now subscribed
      state = SUBSCRIBED;
      Serial.println( "Subscribed." );
    }
    
    // If frame is connected
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
      // Process message content
      // TODO: Appropriately parse response headers
      response = client.readStringUntil( 0x0 );
      start = response.indexOf( "\n\n" ) + 2;
      response = response.substring( start );

      // Display message
      Serial.print( "Message body: " );
      Serial.println( response );
      
      // Parse message parts
      // LED and color
      led = getValue( response, 0, "," ).toInt();
      red = getValue( response, 1, "," ).toInt();
      green = getValue( response, 2, "," ).toInt();
      blue = getValue( response, 3, "," ).toInt();

      // Set pixel color
      pixels.setPixelColor( led - 1, green, red, blue );
      pixels.show();
    }
  }
}

// Count the number of parts in a string
// Used to help replace lack of split
int count( String content, String delimeter )
{
  int count = 0;
  int end;
  int start = 0;
 
  // Count occurances of delimeter
  do {
    end = content.indexOf( delimeter, start );
    start = end + 1;
    count = count + 1;
  } while( end > 0 );
  
  // Return occurance count
  return count;
}

// Get a specific section of a string
// Based on delimeters
// Used to replace lack of split
String getValue( String content, int part, String delimeter )
{
  int    end;
  int    start = 0;
  String result;

  // Iterate past unwanted values
  for( int count = 0; count < part; count++ )
  {
    end = content.indexOf( delimeter, start );
    start = end + 1;
  }
  
  // Get next occurance of delimeter
  // May return -1 if not found
  end = content.indexOf( delimeter, start );
  
  // If no more occurances
  if( end == -1 )
  {
    // Must be last value in content
    // Parse out remainder
    result = content.substring( start );
  } else {
    // Otherwise parse out segment of content
    result = content.substring( start, end );
  }
  
  // Return resulting content
  return result;
}

