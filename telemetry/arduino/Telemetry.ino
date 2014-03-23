// http://bildr.org/2011/04/sensing-orientation-with-the-adxl335-arduino/
// https://github.com/practicalarduino/SHT1x

// Libraries
#include <SHT1x.h>

// Constants
#define ADXL_MIN  260
#define ADXL_MAX  411
#define ADXL_X    0
#define ADXL_Y    1
#define ADXL_Z    2
#define SHT_DATA  5
#define SHT_CLOCK 6

// Instantiate SHT
SHT1x sht1x( SHT_DATA, SHT_CLOCK );

// Setup Arduino
// Serial output
void setup()
{
   Serial.begin( 9600 );
}

// Infinite loop
// Reads sensor values
// Output to serial
void loop()
{
  // SHT
  float celcius = sht1x.readTemperatureC();
  float farenheit = sht1x.readTemperatureF();
  float humidity = sht1x.readHumidity();

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
  // SHT has a hard delay of one second
  delay( 1000 );
}
