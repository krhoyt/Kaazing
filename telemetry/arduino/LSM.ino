// I2C
#include <Wire.h>

// LSM
#include <LSM303.h>

// Constant
#define X_CALIBRATE 20

// Compass
LSM303 compass;

// Setup
void setup()
{
  // I2C
  Wire.begin(); 
  
  // LSM
  compass.init();
  compass.enableDefault();
  compass.m_min = (LSM303::vector<int16_t>){-618, -679, -589};
  compass.m_max = (LSM303::vector<int16_t>){+514, +501, +539};  
  
  // Serial output
  Serial.begin( 9600 );
}

void loop()
{
  // Read compass
  compass.read();

  // Convert read values to degrees
  int xAng = map( compass.m.x, -618, 514, -90, 90 );
  int yAng = map( compass.m.y, -679, 501, -90, 90 );
  int zAng = map( compass.m.z, -589, 539, -90, 90 );

  // Caculate 360 degree values
  double xDeg = RAD_TO_DEG * ( atan2( yAng, zAng ) + PI );
  double yDeg = RAD_TO_DEG * ( atan2( xAng, zAng ) + PI );
  double zDeg = RAD_TO_DEG * ( atan2( yAng, xAng ) + PI );  

  // Calibrate x-axis
  if( xDeg > X_CALIBRATE )
  {
    xDeg = xDeg - X_CALIBRATE;
  } else {
    xDeg = 360 + ( xDeg - X_CALIBRATE );
  }

  // Display values
  Serial.print( compass.heading(), 2 );
  Serial.print( "," );
  Serial.print( xDeg );
  Serial.print( "," );
  Serial.print( yDeg );
  Serial.print( "," );  
  Serial.println( zDeg );
  
  // Wait
  delay( 100 );
}
