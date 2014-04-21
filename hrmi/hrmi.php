<?php

// Library
require_once( "Stomp.php" );

// Connection
$con = new Stomp( "tcp://ec2-54-211-72-62.compute-1.amazonaws.com:61613" );

// Connect
$con->connect();

// Send a message
$con -> send( "/topic/heart", $argv[1] );
echo "Sent message.\n";

// Disconnect
$con -> disconnect();

?>