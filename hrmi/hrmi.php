<?php

// Library
require_once( "library/Stomp.php" );

// Broker URI
$BROKER_URI = "tcp://kaazing.kevinhoyt.com:61613";
$TOPIC = "/topic/heart";

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