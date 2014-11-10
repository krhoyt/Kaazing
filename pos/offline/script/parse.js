var PARSE_APPLICATION = "BkyGNTBvPzhwd32zSiKmsxaFN719abjjQ4lPySiv";
var PARSE_KEY = "0KDnIgzlUzQryGTjgw3ObhM2yEW0Bkrh1m6Qs8ck";

var Clerk = Parse.Object.extend( "Clerk" );
var Configuration = Parse.Object.extend( "Configuration" );
var Handshake = Parse.Object.extend( "Handshake" );
var Layout = Parse.Object.extend( "Layout" );
var Login = Parse.Object.extend( "Login" );
var Product = Parse.Object.extend( "Product" );
var Purchase = Parse.Object.extend( "Purchase" );
var Register = Parse.Object.extend( "Register" );
var Transaction = Parse.Object.extend( "Transaction" );

Parse.initialize( PARSE_APPLICATION, PARSE_KEY );
