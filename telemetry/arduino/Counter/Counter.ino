int count = 0;

void setup()
{
  Serial.begin( 9600 );  
}

void loop()
{
  count = count + 1;
  Serial.println( count );  
  
  delay( 1000 );
}
