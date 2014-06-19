// NOTES
// -
// STOMP client content-length header must be commented out
// ActiveMQ uses the header as a JMS flag
// Header can be found in frame.js
// -
// Using Forever to run as daemon on Linux
// https://github.com/nodejitsu/forever
// END

// Modules
// http://www.parse.com
// https://github.com/easternbloc/node-stomp-client
// https://www.twilio.com
var Https = require( "https" );
var Parse = require( "parse").Parse;
var Stomp = require( "stomp-client" );
var Twilio = require( "twilio" );

// Constants
var BROKER_ADDRESS = "kaazing.kevinhoyt.com";
var DEBUG_RULES = true;
var GOOGLE_KEY = "__GOOGLE_KEY__";
var PARSE_APPLICATION = "__PARSE_APPLICATION__";
var PARSE_KEY = "__PARSE_KEY__";
var TOPIC_CONNECT = "/topic/pos/connect";
var TOPIC_GEOCODE = "/topic/pos/geocode";
var TOPIC_LOCATION = "/topic/pos/location";
var TOPIC_NOTIFICATION = "/topic/pos/notification";
var TOPIC_PRODUCTS_LIST = "/topic/pos/products/list";
var TOPIC_PRODUCTS_READ = "/topic/pos/products/read";
var TWILIO_NUMBER = "__TWILIO_NUMBER__";
var TWILIO_ID = "__TWILIO_ID__";
var TWILIO_TOKEN = "__TWILIO_TOKEN__";

// Debug
console.log( "Setup." );

// Connect to broker
var messaging = new Stomp( BROKER_ADDRESS, 61613, null, null );

// Configure Twilio SMS
// var notification = new Twilio.RestClient( TWILIO_ID, TWILIO_TOKEN );

// Configure Parse.com data storage
Parse.initialize( PARSE_APPLICATION, PARSE_KEY );

// Parse data model
var Transaction = Parse.Object.extend( "Transaction" );
var Product = Parse.Object.extend( "Product" );

// Connected to broker
messaging.connect( function( sessionId ) {

    // Debug
    console.log( "Broker connected." );

    // Subscribe to initial connection
    messaging.subscribe( TOPIC_CONNECT, function( body, headers ) {

        // Debug
        console.log( "New client." );

        // Parse incoming model
        data = JSON.parse( body );

        var transaction = new Transaction();
        transaction.save( {
            clerk: data.clerkId,
            register: data.registerId
        }, {
            success: function( result ) {
                data.transactionId = result.id;

                // Notify with transaction ID
                messaging.publish( TOPIC_NOTIFICATION, JSON.stringify( data ) );
            },
            error: function( error ) {
                console.log( error );
            }
        } );
    } );

    // Subscribe to geolocation lookup
    messaging.subscribe( TOPIC_GEOCODE, function( body, headers ) {

        var data = null;
        var geocode = null;
        var options = null;

        // Debug
        console.log( "Geolocation lookup." );

        // Parse incoming model
        data = JSON.parse( body );

        // Request location information
        options = {
            host : "maps.googleapis.com",
            port : 443,
            path : "/maps/api/geocode/json?latlng=" + data.latitude + "," + data.longitude + "&key=" + GOOGLE_KEY,
            method : "GET"
        };

        geocode = Https.request( options, function( response ) {
            var geolocation = null;

            geolocation = new String();

            response.on( "data", function( data ) {
                geolocation = geolocation + data;
            } );

            response.on( "end", function() {
                console.log( "Location found." );

                // Send location
                messaging.publish( TOPIC_LOCATION, geolocation );
            } );
        } );

        geocode.end();
        geocode.on( "error", function( error ) {
            console.log( error );
        } );
    } );

    // Subscribe to notification delivery
    messaging.subscribe( TOPIC_NOTIFICATION, function( body, headers ) {

        var data = null;

        // Parse message
        data = JSON.parse( body );

        // Debug
        console.log( "Notify: " + data.clerkId );
        console.log( "Register: " + data.registerId );
        console.log( "Transaction: " + data.transactionId );

        // Do not send messages when debugging
        if( !DEBUG_RULES )
        {
            // Send an email
            if( data.clerkId.indexOf( "@" ) > 0 )
            {
                // Debug
                console.log( "Send email." );
            } else {
                // Debug
                console.log( "Send SMS" );

                /*
                // Send an SMS using Twilio
                notification.sms.messages.create( {
                    to: "__CUSTOMER_PHONE__",
                    from: TWILIO_NUMBER,
                    body: "Connect to your American Express certified merchant now by following this link:"
                }, function( error, message ) {
                    // Errors
                    if( !error )
                    {
                        console.log( "SMS sent" );
                    } else {
                        console.log( "Error sending SMS" );
                    }
                } );
                */
            }
        }

        // Read products
        messaging.publish( TOPIC_PRODUCTS_READ, body );
    } );

    // Subscribe to read product list
    messaging.subscribe( TOPIC_PRODUCTS_READ, function( body, headers ) {

        // Debug
        console.log( "Get product list." );

        var query = new Parse.Query( Product );
        query.find( {
            success: function( result ) {
                // Send product event
                messaging.publish( TOPIC_PRODUCTS_LIST, JSON.stringify( result ) );
            },
            error: function( object, error) {
                console.log( error );
            }
        } );
    } );
} );
