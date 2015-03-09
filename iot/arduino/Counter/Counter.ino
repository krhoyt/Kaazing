// Counter
int count = 0;

// Setup
// Configure serial
void setup() {
  Serial.begin( 9600 );
}

// Loop
// Print counter
void loop() {
  // Increment counter
  count = count + 1;
  
  // Print record
  Serial.print( "#" );
  Serial.println( count );
  
  // Wait a second
  delay( 1000 );
}

