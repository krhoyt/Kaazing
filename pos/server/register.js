// Modules
// http://mongoosejs.com/docs/index.html
// https://github.com/easternbloc/node-stomp-client
// https://www.twilio.com
var Mongoose = require( 'mongoose' );
var Stomp = require( "stomp-client" );
var Twilio = require( "twilio" );

// Constants
var BROKER_ADDRESS = "127.0.0.1";
var DEBUG_RULES = true;
var MONGOHQ_ADDRESS = "kahana.mongohq.com:10054/pos";
var MONGOHQ_USER = "kaazing";
var MONGOHQ_PASSWORD = "pos123";
var TOPIC_NOTIFICATION = "/topic/pos/notification";
var TOPIC_PRODUCTS_LIST = "/topic/pos/products/list";
var TOPIC_PRODUCTS_READ = "/topic/pos/products/read";
var TWILIO_NUMBER = "+18136398942";
var TWILIO_ID = "AC3432eb0a1f4cd5b071587c95aac1559d";
var TWILIO_TOKEN = "c05103c1c9455060496f907f3b878984";

// Connect to broker
var messaging = new Stomp( BROKER_ADDRESS, 61613, null, null );

// Configure Twilio SMS
var notification = new Twilio.RestClient( TWILIO_ID, TWILIO_TOKEN );

// Connect to database
Mongoose.connect( "mongodb://" + MONGOHQ_USER + ":" + MONGOHQ_PASSWORD + "@" + MONGOHQ_ADDRESS );

// Product schema
var productsSchema = Mongoose.Schema( {
    _id: String,
    name: String,
    image: String,
    price: Number,
    slot: Number
} );

var Products = Mongoose.model( "Products", productsSchema );

// Connected to broker
messaging.connect( function( sessionId ) {

    // Debug
    console.log( "Connected." );

    // Subscribe to notification delivery
    messaging.subscribe( TOPIC_NOTIFICATION, function( body, headers ) {

        // Debug
        console.log( "Notify: " + body );

        // Do not send messages when debugging
        if( !DEBUG_RULES )
        {
            // Send an email
            if( body.indexOf( "@" ) > 0 )
            {
                // Debug
                console.log( "Send email." );
            } else {
                // Debug
                console.log( "Send SMS" );

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
            }
        }

        // Read products
        messaging.publish( TOPIC_PRODUCTS_READ, body );
    } );

    console.log( "Should sent at connect." );
    messaging.publish( TOPIC_PRODUCTS_LIST, "Dude!" );

    // Subscribe to read product list
    messaging.subscribe( TOPIC_PRODUCTS_READ, function( body, headers ) {

        // Debug
        console.log( "Get product list." );

        var query = Products.find( {} );
        var promise = query.exec();

        promise.onResolve( function( error, products ) {
            if( error )
            {
                return console.error( error );
            }

            // Debug
            console.log( "Found " + products.length + " products." );

            // Send product event
            messaging.publish( TOPIC_PRODUCTS_LIST, JSON.stringify( products ) );
        } );
    } );

    messaging.subscribe( TOPIC_PRODUCTS_LIST, function( body, headers ) {

        var data = JSON.parse( body );

        // Debug
        console.log( "Got " + data.length + " products." );
    } );
} );
