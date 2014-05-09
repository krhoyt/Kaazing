// Bluetooth
#include <SoftwareSerial.h>

// NeoPixel
#include <Adafruit_NeoPixel.h>

// Pin constants
#define RX_PIN       3
#define TX_PIN       2
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

// Setup
void setup() 
{
  // NeoPixel
  pixel.begin();
  pixel.show();
  
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
// Reads serial data
// Controls NeoPixel
void loop() 
{
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

