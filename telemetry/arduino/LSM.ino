// I2C
#include <Wire.h>

// LSM
#include <LSM303.h>

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
  compass.m_min = (LSM303::vector<int16_t>){-648, -667, -654};
  compass.m_max = (LSM303::vector<int16_t>){+477, +496, +488};  
  
  // Serial output
  Serial.begin( 9600 );
}

void loop()
{
  // Read compass
  compass.read();

  // Convert read values to degrees -90 to 90
  // Needed for atan2
  int xAng = map( compass.m.x, 497, -685, -90, 90 );
  int yAng = map( compass.m.y, 471, -682, -90, 90 );
  int zAng = map( compass.m.z, 470, -656, -90, 90 );

  // Caculate 360 degree values like so: atan2( -yAng, -zAng )
  // Outputs the value of -π to π (radians)
  // Converting the radians to degrees
  double xDeg = RAD_TO_DEG * ( atan2( -yAng, -zAng ) + PI );
  double yDeg = RAD_TO_DEG * ( atan2( -xAng, -zAng ) + PI );
  double zDeg = RAD_TO_DEG * ( atan2( -yAng, -xAng ) + PI );  

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
