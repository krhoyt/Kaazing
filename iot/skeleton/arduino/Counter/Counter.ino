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
void loop() {
  
  // Increment
  counter = counter + 1;
  
  // Print
  // Record starts with hash
  // Record ends with newline
  Serial.print( "#" );
  Serial.println( counter );
  
  // Buffer
  delay( 25 );
  
}

