#include <Adafruit_NeoPixel.h>

// Constant
#define PIN 7

// Parameter 1 = number of pixels in strip
// Parameter 2 = Arduino pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
Adafruit_NeoPixel pixel = Adafruit_NeoPixel( 1, PIN, NEO_RGB + NEO_KHZ800 );

// Setup
void setup() 
{
  // Start LED
  pixel.begin();
  
  // Turn off LED
  pixel.show(); 
}

void loop() 
{
  // Set red
  pixel.setPixelColor( 0, pixel.Color( 0, 255, 0 ) );
  pixel.show();
  delay( 500 );
  
  // Set blue
  pixel.setPixelColor( 0, pixel.Color( 0, 0, 255 ) );
  pixel.show();
  delay( 500 );  
}

