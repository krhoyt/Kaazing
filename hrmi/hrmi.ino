// HRMI
// http://bildr.org/2011/08/heartrate-arduino/
// http://www.sparkfun.com/products/8661

// Yun bridge
#include <Process.h>

// I2C
#include "Wire.h"

// HRMI
// 1 = Average sample
// 0 = Raw sample
#define HRMI_I2C_ADDR 127
#define HRMI_HR_ALG   1

// Bridge
// Path to PHP executable
// Path to PHP script to use
#define PHP_CLI "/usr/bin/php-cli"
#define PHP_FILE "/mnt/sd/arduino/hrmi.php"

// Setup bridge
// Setup HRMI
void setup()
{
  // Start bridge
  Bridge.begin();  
  Serial.begin( 9600 );
  
  // Setup HRMI
  Wire.begin();
  writeRegister( HRMI_I2C_ADDR, 0x53, HRMI_HR_ALG );
}

// Infinite loop
// Read HRML
// Output to bridge
void loop()
{
  char    c;
  int     heartRate;
  Process p;

  // Get heart rate from HRMI
  heartRate = getHeartRate();

  // Debug
  Serial.println( heartRate );

  // Run PHP on the Yun
  p.begin( PHP_CLI );
  
  // Path to PHP file to run
  p.addParameter( PHP_FILE );

  // Heart rate value to PHP script
  p.addParameter( String( heartRate ) );
  
  // Run process over bridge
  p.run();

  // Display resulting message
  while( p.available() > 0 ) 
  {
    c = p.read();
    Serial.print( c );
  }
  
  // Ensure all data has been sent
  Serial.flush();

  // Wait a second
  delay( 1000 );
}

// Get heart rate from HRMI
// Return zero if not available
int getHeartRate()
{
  // Response array
  byte i2cRspArray[3];
  
  // Default to zero
  i2cRspArray[2] = 0;

  // Request heart rate value
  writeRegister( HRMI_I2C_ADDR,  0x47, 0x1 );

  // Got data back from HRMI
  if( hrmiGetData(127, 3, i2cRspArray ) ) 
  {
    // Return value
    return i2cRspArray[2];
  } else{
    // Return zero if not available
    return 0;
  }
}

// Write to the HRMI
void writeRegister( int deviceAddress, byte address, byte val ) 
{
  Wire.beginTransmission( deviceAddress ); // Start transmission to device 
  Wire.write( address );                   // Send register address
  Wire.write( val );                       // Send value to write
  Wire.endTransmission();                  // End transmission
}

// Get data from HRMI
// Fill array with response
boolean hrmiGetData( byte addr, byte numBytes, byte* dataArray )
{
  // Request HRMI bytes
  Wire.requestFrom( addr, numBytes );
  
  // Response from HRMI
  if( Wire.available() ) 
  {
    // Read bytes into array
    for( int i = 0; i < numBytes; i++ )
    {
      dataArray[i] = Wire.read();
    }

    // True if able to read values
    return true;
  } else{
    // False if not able to read
    return false;
  }
}

