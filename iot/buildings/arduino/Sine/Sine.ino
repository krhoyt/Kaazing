// Counters
int comfort;
int index;
int usage;

// Setup
// Configure serial
void setup() {
  comfort = random( 360 );
  index = random( 360 );
  usage = random( 360 );
  
  Serial.begin( 115200 );
}

// Loop
// Print counter
void loop() {  
  // Print record
  Serial.print( "#" );
  Serial.print( sin( toRadians( usage ) ) );
  Serial.print( "," );
  Serial.print( sin( toRadians( index ) ) );
  Serial.print( "," );
  Serial.println( sin( toRadians( comfort ) ) );
  
  // Increment counters
  index = index + 1;  
  comfort = comfort + 1;  
  usage = usage + 1;    
  
  // Buffer
  delay( 25 );
}

float toRadians( int deg )  {
  return deg * ( PI / 180 );
}

