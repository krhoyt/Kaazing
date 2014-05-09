// Bluetooth
#include <SoftwareSerial.h>

// Pin constants
#define RX_PIN 3
#define TX_PIN 2

// Bluetooth
SoftwareSerial bluetooth( TX_PIN, RX_PIN );

// Increment counter
int count = 0;

// Setup
void setup()
{
  // Arduino serial
  Serial.begin( 9600 );  

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

void loop()
{
  count = count + 1;
  bluetooth.println( count );  
  
  delay( 1000 );
}
