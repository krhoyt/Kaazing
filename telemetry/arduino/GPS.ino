// EM-506 (GPS)
// http://arduiniana.org/libraries/tinygpsplus/

// For GPS
#include <TinyGPS++.h>
#include <SoftwareSerial.h>

// Constants
#define GPS_BAUD     4800
#define GPS_RX       2
#define GPS_TX       3

// GPS
// Software serial
TinyGPSPlus gps;
SoftwareSerial ss( GPS_RX, GPS_TX );

// Setup
void setup()
{
  // Software serial to GPS
  ss.begin( GPS_BAUD );  
  
  // Serial output
  Serial.begin( 9600 );
}

void loop()
{
  // Location
  Serial.print( gps.location.lat(), 7 );
  Serial.print( "," );        
  Serial.print( gps.location.lng(), 7 );
  Serial.print( "," );   
  
  // Altitude
  Serial.print( gps.altitude.meters(), 2 );        
  Serial.print( "," );
  Serial.print( gps.altitude.feet(), 2 );
  Serial.print( "," );
  
  // Speed
  Serial.print( gps.speed.mps(), 2 );
  Serial.print( "," );
  Serial.print( gps.speed.mph(), 2 );
  Serial.print( "," );
  
  // Heading
  Serial.println( gps.course.deg(), 2 );
  
  // Feeds GPS data
  smartDelay( 100 );  
}

static void smartDelay( unsigned long ms )
{
  unsigned long start = millis();
  
  do {
    while( ss.available() )
    {
      gps.encode( ss.read() );
    }
  } while( millis() - start < ms );
}

