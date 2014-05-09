// SparkFun BlueSMiRF (Bluetooth)
// https://www.sparkfun.com/products/12582
// https://learn.sparkfun.com/tutorials/using-the-bluesmirf/hardware-hookup

// LSM303 (Accelerometer and Compass)
// https://github.com/pololu/lsm303-arduino
// https://www.sparkfun.com/products/10888

// NeoPixel
// https://github.com/adafruit/Adafruit_NeoPixel
// https://www.adafruit.com/products/1312

// TrueRandom
// UUID generation
// https://code.google.com/p/tinkerit/wiki/TrueRandom

// I2C
#include <Wire.h>

// Software serial
// Bluetooth
#include <SoftwareSerial.h>

// LSM
#include <LSM303.h>

// NeoPixel
#include <Adafruit_NeoPixel.h>

// UUID
#include <TrueRandom.h>

// Pin constants
#define RX_PIN       3
#define TX_PIN       2
#define X_CALIBRATE  -6
#define Y_CALIBRATE  -2
#define NEO_PIXEL    7
#define NEO_CYCLES   2
#define NEO_OFF      48
#define NEO_ON       49

// Bluetooth
SoftwareSerial bluetooth( TX_PIN, RX_PIN );

// NeoPixel
Adafruit_NeoPixel pixel = Adafruit_NeoPixel( 1, NEO_PIXEL, NEO_RGB + NEO_KHZ800 );
boolean lightOn = false;
boolean isRed = false;
int     cycles = 0;

// LSM
LSM303 compass;

// UUID
byte uuid[16];

// Setup
void setup()
{
  // NeoPixel
  pixel.begin();
  pixel.show();   

  // I2C
  Wire.begin();  
  
  // LSM
  compass.init();
  compass.enableDefault();
  
  // Magentometer ranges for calibration  
  compass.m_min = ( LSM303::vector<int16_t> ){-467, -659, -434};
  compass.m_max = ( LSM303::vector<int16_t> ){+634, +544, +646};

  // UUID
  TrueRandom.uuid( uuid );  

  // Bluetooth defaults to 115200
  // 115200 too fast for software serial  
  bluetooth.begin( 115200 ); 

  // Enter command mode
  bluetooth.print( "$" );
  bluetooth.print ("$" );
  bluetooth.print( "$" );
  delay( 100 );
  
  // Set 9600  
  bluetooth.println( "U,9600,N" );
  
  // Bluetooth serial
  bluetooth.begin( 9600 );   
}

// Infinite loop
// Reads sensor values
// Output to serial
void loop()
{
  // Aircraft identifier
  bluetooth.print( "$KAAZING" );
  bluetooth.print( "," );  
  
  // GPS (not present)
  // Latitude
  // Longitude
  // Altitude (meters)
  // Altitude (feet)
  // Speed (MPS)
  // Speed (MPH)
  // Heading
  // Month
  // Day
  // Year
  // Hour
  // Minute
  // Second
  // Centisecond
  bluetooth.print( "0,0,0,0,0,0,0,0,0,0,0,0,0,0," );        

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
  bluetooth.print( compass.heading(), 2 );
  bluetooth.print( "," );
  
  // Tilt and pitch
  bluetooth.print( xDeg );
  bluetooth.print( "," );
  bluetooth.print( yDeg );
  bluetooth.print( "," );  
  bluetooth.print( zDeg );
  bluetooth.print( "," );   
  
  // HIH (not present)
  // Farenheit
  // Celcuis
  // Humidity
  bluetooth.print( "0,0,0," );
  
  // UUID
  printUuid( uuid );
  bluetooth.println();  
  
  /*
  // NeoPixel
  */
  
  // Check for serial data
  if( bluetooth.available() )
  {
    // Read available serial data
    int incoming = bluetooth.read();
    
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
    // Colors in G, R, B order
    if( cycles % NEO_CYCLES == 0 )
    {
      if( isRed == true )
      {
        // Set blue
        pixel.setPixelColor( 0, pixel.Color( 136, 73, 179 ) );
        pixel.show();
        
        isRed = false;
      } else {
        // Set orange
        pixel.setPixelColor( 0, pixel.Color( 124, 245, 30 ) );
        pixel.show(); 
 
         isRed = true;       
      }
      
      // Reset counter
      cycles = 0;  
    }
  }  
  
  // Wait
  delay( 100 );
}

void printHex( byte number ) 
{
  int topDigit = number >> 4;
  int bottomDigit = number & 0x0f;

  // Print high hex digit
  bluetooth.print( "0123456789ABCDEF"[topDigit] );

  // Low hex digit
  bluetooth.print( "0123456789ABCDEF"[bottomDigit] );
}

void printUuid( byte* uuidNumber ) 
{
  int i;
  
  for( i = 0; i < 16; i++ ) 
  {
    if( i == 4 ) bluetooth.print( "-" );
    if( i == 6 ) bluetooth.print( "-" );
    if( i == 8 ) bluetooth.print( "-" );
    if( i == 10 ) bluetooth.print( "-" );
    printHex( uuidNumber[i] );
  }
}

