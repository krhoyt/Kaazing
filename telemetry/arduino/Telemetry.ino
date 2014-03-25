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
  byte  state;
  float meters;
  float feet;
  float celcius;
  float farenheit;
  float humidity;
  float latitude;
  float longitude;

  // GPS
  while( ss.available() > 0 )
  {
    if( gps.encode( ss.read() ) )
    {
      if( gps.location.isValid() )
      {
        meters = gps.altitude.meters();
        feet = meters * 3.2808;
        latitude = gps.location.lat();
        longitude = gps.location.lng();    
      }
    }
  }

  // Read the values from the sensor
  // Takes local values to place sensor values
  // Returns sensor state
  state = getTemperatureHumidity( humidity, celcius );
  farenheit = ( celcius *  9 ) / 5 + 32;

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

  // Output
  Serial.print( latitude );
  Serial.print( "," ); 
  Serial.print( longitude );
  Serial.print( "," );  
  Serial.print( meters );
  Serial.print( "," );    
  Serial.print( feet );
  Serial.print( "," );      
  Serial.print( celcius );
  Serial.print( "," );
  Serial.print( farenheit );
  Serial.print( "," );
  Serial.print( humidity );
  Serial.print( "," );
  Serial.print( xRead );  
  Serial.print( "," );
  Serial.print( yRead );  
  Serial.print( "," );
  Serial.print( zRead );      
  Serial.print( "," );
  Serial.print( xAng );  
  Serial.print( "," );
  Serial.print( yAng );  
  Serial.print( "," );
  Serial.print( zAng );      
  Serial.print( "," );
  Serial.print( xDeg );  
  Serial.print( "," );
  Serial.print( yDeg );  
  Serial.print( "," );
  Serial.println( zDeg );    

  // Wait for next round
  delay( 100 );
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

