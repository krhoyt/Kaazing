// LSM303 (Accelerometer and Compass)
// https://github.com/pololu/lsm303-arduino
// https://www.sparkfun.com/products/10888

// I2C
#include <Wire.h>

// Software serial
// Bluetooth
#include <SoftwareSerial.h>

// LSM
#include <LSM303.h>

// Pin constants
#define RX_PIN       3
#define TX_PIN       2
#define X_CALIBRATE  -6
#define Y_CALIBRATE  -2

// Bluetooth
SoftwareSerial bluetooth( TX_PIN, RX_PIN );

// LSM
LSM303 compass;

// Setup
void setup()
{
  // I2C
  Wire.begin();  
  
  // LSM
  compass.init();
  compass.enableDefault();
  
  // Magentometer ranges for calibration  
  compass.m_min = ( LSM303::vector<int16_t> ){-467, -659, -434};
  compass.m_max = ( LSM303::vector<int16_t> ){+634, +544, +646};

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
  bluetooth.println( zDeg );
  
  // Wait
  delay( 100 );
}

