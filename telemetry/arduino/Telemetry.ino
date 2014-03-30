// EM-506 (GPS)
// http://arduiniana.org/libraries/tinygpsplus/

// HIH-6130 (Temperature and Humidity)
// http://www.phanderson.com/arduino/hih6130.html

// ADXL335 (Accelerometer)
// http://bildr.org/2011/04/sensing-orientation-with-the-adxl335-arduino/

// For HIH
#include <Wire.h>

// For GPS
#include <TinyGPS++.h>
#include <SoftwareSerial.h>

// Constants
#define ADXL_MIN     260
#define ADXL_MAX     411
#define ADXL_X       0
#define ADXL_Y       1
#define ADXL_Z       2
#define GPS_BAUD     4800
#define GPS_RX       2
#define GPS_TX       3
#define HIH_ADDRESS  0x27
#define HIH_DATA     4
#define HIH_CLOCK    5

// GPS
TinyGPSPlus gps;
SoftwareSerial ss( GPS_RX, GPS_TX );

// Setup Arduino
// Setup HIH
// Serial output
void setup()
{
  // GPS
  ss.begin( GPS_BAUD );  
  
  // I2C
  Wire.begin();
   
  // Turn on the HIH6130 sensor 
  pinMode( HIH_DATA, OUTPUT );
  digitalWrite( HIH_DATA, HIGH );   
  
  // Serial output
  Serial.begin( 9600 );
  
  // Let HIH warm up
  delay( 5000 );
}

// Infinite loop
// Reads sensor values
// Output to serial
void loop()
{
  // HIH
  float celcius;
  float humidity;

  /*
  // Output
  */
  
  Serial.print( "$KAAZING" );
  Serial.print( "," );
 
  // GPS
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
  Serial.print( gps.course.deg(), 2 );
  Serial.print( "," );
  
  // Date
  Serial.print( gps.date.month() );
  Serial.print( "," );        
  Serial.print( gps.date.day() );
  Serial.print( "," );                
  Serial.print( gps.date.year() );
  Serial.print( "," );                
  
  // Time
  Serial.print( gps.time.hour() );
  Serial.print( "," );     
  Serial.print( gps.time.minute() );
  Serial.print( "," );         
  Serial.print( gps.time.second() );
  Serial.print( "," );   
  
  // ADXL
  // Raw read
  int xRead = analogRead( ADXL_X );
  int yRead = analogRead( ADXL_Y );
  int zRead = analogRead( ADXL_Z );

  // Convert read values to degrees -90 to 90
  // Needed for atan2
  int xAng = map( xRead, ADXL_MIN, ADXL_MAX, -90, 90 );
  int yAng = map( yRead, ADXL_MIN, ADXL_MAX, -90, 90 );
  int zAng = map( zRead, ADXL_MIN, ADXL_MAX, -90, 90 );

  // Caculate 360 degree values like so: atan2( -yAng, -zAng )
  // Outputs the value of -π to π (radians)
  // Converting the radians to degrees
  double xDeg = RAD_TO_DEG * ( atan2( -yAng, -zAng ) + PI );
  double yDeg = RAD_TO_DEG * ( atan2( -xAng, -zAng ) + PI );
  double zDeg = RAD_TO_DEG * ( atan2( -yAng, -xAng ) + PI );  
  
  // X-Axis
  Serial.print( xDeg, 2 );
  Serial.print( "," );
  
  // Y-Axis
  Serial.print( yDeg, 2 );
  Serial.print( "," );  
  
  // Z-Axis
  Serial.print( zDeg, 2 );
  Serial.print( "," );  
  
  // HIH
  byte state = getTemperatureHumidity( humidity, celcius );
  float farenheit = ( celcius *  9 ) / 5 + 32;  
  
  // Temperature
  Serial.print( farenheit, 2 );
  Serial.print( "," );
  
  Serial.print( celcius, 2 );
  Serial.print( "," );
  
  // Humidity
  // Also prints newline
  Serial.println( humidity, 2 );

  // Feeds GPS data
  smartDelay( 100 );
}

// Retrieve temperature and humidity values from HIH6130
// Takes humidity and temperature references
// Updates them inside the function
// Returns the sensor state as a value directly
byte getTemperatureHumidity( float &hdata, float &tdata )
{
  byte hhigh;
  byte hlow;
  byte state;
  byte thigh;
  byte tlow;

  // Let the sensor know we are coming
  Wire.beginTransmission( HIH_ADDRESS ); 
  Wire.endTransmission();
  delay( 100 );
      
  // Read the data packets
  Wire.requestFrom( (int)HIH_ADDRESS, 4 );
  hhigh = Wire.read();
  hlow = Wire.read();
  thigh = Wire.read();
  tlow = Wire.read();
  Wire.endTransmission();
      
  // Slice of state bytes
  state = ( hhigh >> 6 ) & 0x03;
  
  // Clean up remaining humidity bytes
  hhigh = hhigh & 0x3f;
  
  // Shift humidity bytes into a value
  // Convert value to humidity per data sheet  
  hdata = ( ( (unsigned int)hhigh ) << 8 ) | hlow;
  hdata = hdata * 6.10e-3;
      
  // Shift temperature bytes into a value
  // Convert value to temperature per data sheet
  tdata = ( ( (unsigned int)thigh ) << 8 ) | tlow;
  tdata = tdata / 4;
  tdata = tdata * 1.007e-2 - 40.0;

  // Return the sensor state
  return state;
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

