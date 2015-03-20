// Counter
int counter;

// Setup
// Seed values
// Configure serial
void setup() {
  
  // Seed counter
  counter = 0;
  
  // Serial
  Serial.begin( 115200 );

}

// Loop
// Increment counter
// Print counter
// Check for seed
void loop() {
  // Increment
  counter = counter + 1;
  
  // Print
  // Record starts with hash
  // Record ends with newline
  Serial.print( "#" );
  Serial.println( counter );
  
  // Set new seed
  if( Serial.available() ) {
    counter = Serial.read();
  }
  
  // Buffer
  delay( 25 );
  
}

