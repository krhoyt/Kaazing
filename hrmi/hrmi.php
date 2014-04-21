<?php

// Library
require_once( "Stomp.php" );

// Broker URI
$BROKER_URI = "tcp://ec2-54-211-72-62.compute-1.amazonaws.com:61613";
$TOPIC = "/topic/hrmi";

// Connection
$conn = new Stomp( $BROKER_URI );

// Connect
$conn -> connect();

// Send a message
$conn -> send( $TOPIC, $argv[1] );

// Debug
// echo "Sent message.\n";

// Disconnect
$conn -> disconnect();

?>