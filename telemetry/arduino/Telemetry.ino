// EM-506 (GPS)
// http://arduiniana.org/libraries/tinygpsplus/

// HIH-6130 (Temperature and Humidity)
// http://www.phanderson.com/arduino/hih6130.html

// LSM303 (Accelerometer and Compass)
// https://github.com/pololu/lsm303-arduino

// HIH
// LSM
#include <Wire.h>

// LSM
#include <LSM303.h>

// NeoPixel
#include <Adafruit_NeoPixel.h>

// For GPS
#include <TinyGPS++.h>
#include <SoftwareSerial.h>

// Constants
#define GPS_BAUD     4800
#define GPS_RX       2
#define GPS_TX       3
#define HIH_ADDRESS  0x27
#define HIH_DATA     4
#define HIH_CLOCK    5
#define X_CALIBRATE  -6
#define Y_CALIBRATE  -2
#define NEO_PIXEL    7
#define NEO_CYCLES   2
#define NEO_OFF      48
#define NEO_ON       49

// NeoPixel
Adafruit_NeoPixel pixel = Adafruit_NeoPixel( 1, NEO_PIXEL, NEO_RGB + NEO_KHZ800 );
boolean lightOn = false;
boolean isRed = false;
int     cycles = 0;

// GPS
TinyGPSPlus gps;
SoftwareSerial ss( GPS_RX, GPS_TX );

// LSM
LSM303 compass;

// Setup Arduino
// Setup HIH
// Serial output
void setup()
{
  // NeoPixel
  pixel.begin();
  pixel.show(); 
  
  // GPS
  ss.begin( GPS_BAUD );  
  
  // I2C
  Wire.begin();

  // LSM
  compass.init();
  compass.enableDefault();
  compass.m_min = ( LSM303::vector<int16_t> ) {-618, -679, -589};
  compass.m_max = ( LSM303::vector<int16_t> ) {+514, +501, +539};  
   
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
  
  // LSM
  compass.read();
  
  // Convert read values to degrees
  int xAng = map( compass.a.x, -18400, 15968, -90, 90 );
  int yAng = map( compass.a.y, -26528, 20480, -90, 90 );
  int zAng = map( compass.a.z, -20752, 18608, -90, 90 );

  // Caculate 360 degree values
  double xDeg = RAD_TO_DEG * ( atan2( yAng, zAng ) + PI );
  double yDeg = RAD_TO_DEG * ( atan2( xAng, zAng ) + PI );
  double zDeg = RAD_TO_DEG * ( atan2( yAng, xAng ) + PI );  

  // Calibrate x-axis
  xDeg = xDeg + X_CALIBRATE;
  yDeg = yDeg + Y_CALIBRATE;

  // Heading
  Serial.print( compass.heading(), 2 );
  Serial.print( "," );
  
  // Tilt and pitch
  Serial.print( xDeg );
  Serial.print( "," );
  Serial.print( yDeg );
  Serial.print( "," );  
  Serial.print( zDeg );
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

  /*
  // NeoPixel
  */
  
  // Check for serial data
  if( Serial.available() )
  {
    // Read available serial data
    int incoming = Serial.read();
    
    // Turn on or off based on incoming value
    if( incoming == NEO_OFF )
    {
      // Logical off
      lightOn = false;
      cycles = 0;
      
      // Actual off by set to black
      pixel.setPixelColor( 0, pixel.Color( 0, 0, 0 ) );      
      pixel.show();       
    } else if( incoming == NEO_ON ) {
      // On
      lightOn = true;
    }
  }    

  // Should flash light
  if( lightOn == true )
  {
    // Increment cycles since change
    cycles = cycles + 1;     
    
    // Alternate between colors
    if( cycles % NEO_CYCLES == 0 )
    {
      if( isRed == true )
      {
        // Set blue
        pixel.setPixelColor( 0, pixel.Color( 0, 0, 255 ) );
        pixel.show();
        
        isRed = false;
      } else {
        // Set red
        pixel.setPixelColor( 0, pixel.Color( 0, 255, 0 ) );
        pixel.show(); 
 
         isRed = true;       
      }
      
      // Reset counter
      cycles = 0;  
    }
  }

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

