// Modules
// http://mongoosejs.com/docs/index.html
// https://github.com/easternbloc/node-stomp-client
// https://www.twilio.com
var Https = require( "https" );
var Mongoose = require( "mongoose" );
var Stomp = require( "stomp-client" );
var Twilio = require( "twilio" );

// Constants
var BROKER_ADDRESS = "127.0.0.1";
var DEBUG_RULES = true;
var GOOGLE_KEY = "__GOOGLE_SERVER_KEY__"
var MONGOHQ_ADDRESS = "kahana.mongohq.com:10054/pos";
var MONGOHQ_USER = "kaazing";
var MONGOHQ_PASSWORD = "pos123";
var TOPIC_CONNECT = "/topic/pos/connect";
var TOPIC_GEOCODE = "/topic/pos/geocode"
var TOPIC_LOCATION = "/topic/pos/location"
var TOPIC_NOTIFICATION = "/topic/pos/notification";
var TOPIC_PRODUCTS_LIST = "/topic/pos/products/list";
var TOPIC_PRODUCTS_READ = "/topic/pos/products/read";
var TWILIO_NUMBER = "__TWILIO_NUMBER__";
var TWILIO_ID = "__TWILIO_ID__";
var TWILIO_TOKEN = "__TWILIO_TOKEN__";

// Connect to broker
var messaging = new Stomp( BROKER_ADDRESS, 61613, null, null );

// Configure Twilio SMS
// var notification = new Twilio.RestClient( TWILIO_ID, TWILIO_TOKEN );

// Connect to database
var db = Mongoose.createConnection( "mongodb://" + MONGOHQ_USER + ":" + MONGOHQ_PASSWORD + "@" + MONGOHQ_ADDRESS );

// Model
var productsSchema = null;
var Products = null;
var transactionSchema = null;
var Transaction = null;

// Establish schemas
db.once( "open", function() {
    // Product
    productsSchema = new Mongoose.Schema( {
        _id: String,
        name: String,
        image: String,
        price: Number,
        slot: String
    } );

    Products = db.model( "products", productsSchema );

    // Transaction
    transactionSchema = new Mongoose.Schema( {
        _id: String,
        clerkId: String,
        registerId: String,
        products: Array
    } );

    Transaction = db.model( "transaction", transactionSchema );
} );

// Connected to broker
messaging.connect( function( sessionId ) {

    // Debug
    console.log( "Connected." );

    // Subscribe to initial connection
    messaging.subscribe( TOPIC_CONNECT, function( body, headers ) {

        // Parse incoming model
        data = JSON.parse( body );

        // Store new transaction
        var transaction = new Transaction( {
            _id: Mongoose.Types.ObjectId(),
            clerkId: data.clerkId,
            registerId: data.registerId
        } );

        transaction.save( function( error, transaction ) {
            if( error )
            {
                console.log( error );
            }

            data.transactionId = transaction._id;

            // Notify with transaction ID
            messaging.publish( TOPIC_NOTIFICATION, JSON.stringify( data ) );
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
                    to: "+13035223131",
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

        Products.find( function( error, products ) {
            if( error )
            {
                console.log( error );
            }

            // Send product event
            messaging.publish( TOPIC_PRODUCTS_LIST, JSON.stringify( products ) );
        } );
    } );
} );
