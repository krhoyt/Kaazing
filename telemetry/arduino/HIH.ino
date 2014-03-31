// HIH-6130 (Temperature and Humidity)
// http://www.phanderson.com/arduino/hih6130.html

// I2C
#include <Wire.h>

// Pin constants
#define HIH_ADDRESS  0x27
#define HIH_DATA     4
#define HIH_CLOCK    5

// Setup
void setup()
{
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

void loop()
{
  float celcius;
  float humidity;  
  
  // Read sensor
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
  
  // Wait
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
