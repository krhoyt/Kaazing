// Software serial for Bluetooth
#include <SoftwareSerial.h>  

// LED
const int LED_OFF = 48;
const int LED_ON = 49;
const int LED_PIN = 13;

// Bluetooth
const int BLUETOOTH_TX = 2;
const int BLUETOOTH_RX = 3;

// Instance
SoftwareSerial bluetooth( BLUETOOTH_TX, BLUETOOTH_RX );

// Counter
int count = 0;

// Setup
void setup()
{
  // Setup LED pin
  pinMode( LED_PIN, OUTPUT );
  digitalWrite( LED_PIN, LOW );    
  
  // Defaults to 115200
  bluetooth.begin( 115200 );  // The Bluetooth Mate defaults to 115200bps

  // Enter command mode
  bluetooth.print( "$" );
  bluetooth.print( "$" );
  bluetooth.print( "$" );
  
  // Wait for CMD  
  delay( 100 );
  
  // Change to 9600
  // 115200 too fast for software serial
  bluetooth.println( "U,9600,N" );
  
  // Start Bluetooth serial
  bluetooth.begin( 9600 );
}

void loop()
{
  int incoming = 0;
  
  // Check for serial over Bluetooth
  if( bluetooth.available() )
  {
    // Read available serial data
    incoming = bluetooth.read();    
   
    // Turn on or off LED based on incoming value
    if( incoming == LED_OFF )
    {
      // Off
      digitalWrite( LED_PIN, LOW );  
    } else if( incoming == LED_ON ) {
      // On
      digitalWrite( LED_PIN, HIGH );
    }    
  }
}

