// NOTES
// -
// STOMP client content-length header must be commented out
// ActiveMQ uses the header as a JMS flag
// Header can be found in frame.js
// -
// Using Forever to run as daemon on Linux
// https://github.com/nodejitsu/forever
// -
// END

// Modules
// http://www.parse.com
// https://github.com/easternbloc/node-stomp-client
// https://www.twilio.com
var Https = require( "https" );
var Parse = require( "parse" ).Parse;
var Stomp = require( "stomp-client" );
var Twilio = require( "twilio" );

// Constants
var BROKER_ADDRESS = "kaazing.kevinhoyt.com";
var DEBUG_RULES = true;
var GOOGLE_KEY = "AIzaSyCubinL0ntapQ1jTngYipHtTALGmai-O8s";
var PARSE_APPLICATION = "BkyGNTBvPzhwd32zSiKmsxaFN719abjjQ4lPySiv";
var PARSE_KEY = "0KDnIgzlUzQryGTjgw3ObhM2yEW0Bkrh1m6Qs8ck";
var TOPIC_NAME = "/topic/pos";
var TWILIO_NUMBER = "+18136398942";
var TWILIO_ID = "__TWILIO_ID__";
var TWILIO_TOKEN = "__TWILIO_TOKEN__";

// Actions
var CLERK_CREATE = "clerkCreate";
var CLERK_READ = "clerkRead";
var GEOCODE = "geocode";
var LAYOUT_READ = "layoutRead";
var LOGIN_CREATE = "loginCreate";
var REGISTER_CREATE = "registerCreate";
var TRANSACTION_CREATE = "transactionCreate";

// Configure Parse.com data storage
var Clerk = Parse.Object.extend( "Clerk" );
var Configuration = Parse.Object.extend( "Configuration" );
var Layout = Parse.Object.extend( "Layout" );
var Login = Parse.Object.extend( "Login" );
var Transaction = Parse.Object.extend( "Transaction" );
var Product = Parse.Object.extend( "Product" );
var Purchase = Parse.Object.extend( "Purchase" );
var Register = Parse.Object.extend( "Register" );

Parse.initialize( PARSE_APPLICATION, PARSE_KEY );

// Configure messaging
var messaging = new Stomp( BROKER_ADDRESS, 61613, null, null );

// Connected to broker
messaging.connect( function( sessionId )
{
    // Debug
    console.log( "Broker connected." );

    // Subscribe to inbound topic
    messaging.subscribe( TOPIC_NAME, function( body, headers )
    {
        var data = null;

        // Parse incoming model
        data = JSON.parse( body );

        // Decision tree
        if( data.client.action == GEOCODE )
        {
            console.log( "Geocode request." );
            doGeocodeRequest( data );
        } else if( data.client.action == REGISTER_CREATE ) {
            console.log( "Create register." );
            doRegisterCreate( data );
        } else if( data.client.action == CLERK_READ ) {
            console.log( "Read clerk." );
            doClerkRead( data );
        } else if( data.client.action == CLERK_CREATE ) {
            console.log( "Create clerk." );
            doClerkCreate( data );
        } else if( data.client.action == LOGIN_CREATE ) {
            console.log( "Create login." );
            doLoginCreate( data );
        } else if( data.client.action == LAYOUT_READ ) {
            console.log( "Read layout." );
            doLayoutRead( data );
        } else if( data.client.action == TRANSACTION_CREATE ) {
            console.log( "Create transaction." );
            doTransactionCreate( data );
        }
    } );
} );

function doClerkCreate( data )
{
    var clerk = null;

    clerk = new Clerk();
    clerk.set( "authorization", data.content.authorization );
    clerk.save( null, {
        success: function( result ) {
            // Create response message
            message = {
                server: {
                    action: data.client.action,
                    reply: data.client.reply
                },
                content: {
                    objectId: result.id,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt,
                    authorization: result.get( "authorization" )
                }
            };

            // Send clerk data
            messaging.publish( data.client.reply, JSON.stringify( message ) );
        },
        error: function( result, error ) {
            console.log( "Error creating clerk." );
        }
    } );
}

function doClerkRead( data )
{
    var query = null;

    query = new Parse.Query( Clerk );
    query.equalTo( "authorization", data.content.authorization );
    query.first( {
        success: function( result ) {
            var message = null;

            if( result == undefined )
            {
                // Debug
                console.log( "Clerk does not exist." );

                // Change action
                data.client.action = CLERK_CREATE;

                // Send message
                // Will be picked up by server
                messaging.publish( TOPIC_NAME, JSON.stringify( data ) );
            } else {
                // Create response message
                message = {
                    server: {
                        action: data.client.action,
                        reply: data.client.reply
                    },
                    content: {
                        objectId: result.id,
                        createdAt: result.createdAt,
                        updatedAt: result.updatedAt,
                        authorization: result.get( "authorization" )
                    }
                };

                // Send clerk data
                messaging.publish( data.client.reply, JSON.stringify( message ) );
            }
        },
        error: function( error ) {
            console.log( "Failed reading clerk." );
        }
    } );
}

function doGeocodeRequest( data )
{
    var geocode = null;
    var options = null;

    // Request location information
    options = {
        host: "maps.googleapis.com",
        port: 443,
        path: "/maps/api/geocode/json?latlng=" + data.content.latitude + "," + data.content.longitude + "&key=" + GOOGLE_KEY,
        method: "GET"
    };

    geocode = Https.request( options, function( response ) {
        var stream = null;

        stream = new String();

        response.on( "data", function( incoming ) {
            stream = stream + incoming;
        } );

        response.on( "end", function() {
            var location = null;
            var message = null;

            console.log( "Location found." );

            // Parse geocoding data
            location = JSON.parse( stream );

            // Create response message
            message = {
                server: {
                    action: data.client.action,
                    reply: data.client.reply
                },
                content: {
                    address: location.results[0].formatted_address,
                    postalCode: location.results[0].address_components[location.results[0].address_components.length - 1].long_name,
                    latitude: location.results[0].geometry.location.lat,
                    longitude: location.results[0].geometry.location.lng
                }
            };

            // Send location
            messaging.publish( data.client.reply, JSON.stringify( message ) );
        } );
    } );

    geocode.end();
    geocode.on( "error", function( error ) {
        console.log( error );
    } );
}

function doLayoutRead( data )
{
    var configuration = null;
    var query = null;

    // Configuration entity
    configuration = new Configuration();
    configuration.id = data.content.configurationId;

    query = new Parse.Query( Layout );
    query.equalTo( "configurationId", configuration );
    query.include( "productId" );
    query.find( {
        success: function( results ) {
            var found = null;
            var message = null;

            // Create response message
            message = {
                server: {
                    action: data.client.action,
                    reply: data.client.reply
                },
                content: {
                    layout: new Array(),
                    products: new Array()
                }
            };

            // Populate layout
            for( var r = 0; r < results.length; r++ )
            {
                message.content.layout.push( {
                    objectId: results[r].id,
                    createdAt: results[r].createdAt,
                    updatedAt: results[r].updatedAt,
                    productId: results[r].get( "productId" ).id,
                    row: results[r].get( "row" ),
                    column: results[r].get( "column" ),
                    configurationId: results[r].get( "configurationId" ).id
                } );

                // Build product list
                found = false;

                for( var p = 0; p < message.content.products.length; p++ )
                {
                    if( message.content.products[p].objectId == results[r].get( "productId" ).id )
                    {
                        found = true;
                        break;
                    }
                }

                // Not found
                // Add to list
                message.content.products.push( {
                    objectId: results[r].get( "productId" ).id,
                    name: results[r].get( "productId" ).get( "name" ),
                    createdAt: results[r].get( "productId" ).createdAt,
                    updatedAt: results[r].get( "productId" ).updatedAt,
                    price: results[r].get( "productId" ).get( "price" ),
                    imagePath: results[r].get( "productId" ).get( "imagePath" ),
                    image: results[r].get( "productId" ).get( "image" )
                } );
            }

            // Send location
            messaging.publish( data.client.reply, JSON.stringify( message ) );
        },
        error: function( error ) {
            console.log( "Error reading layout." );
        }
    } );
}

function doLoginCreate( data )
{
    var clerk = null;
    var login = null;
    var register = null;

    // Clerk pointer
    clerk = new Clerk();
    clerk.id = data.content.clerkId;

    // Register pointer
    register = new Register();
    register.id = data.content.registerId;

    // Login entity
    login = new Login();
    login.set( "clerkId", clerk );
    login.set( "registerId", register );
    login.save( null, {
        success: function( result ) {
            var message = null;

            // Create response message
            message = {
                server: {
                    action: data.client.action,
                    reply: data.client.reply
                },
                content: {
                    objectId: result.id,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt,
                    clerkId: result.get( "clerkId").id,
                    registerId: result.get( "registerId").id
                }
            };

            // Send location
            messaging.publish( data.client.reply, JSON.stringify( message ) );
        },
        error: function( result, error ) {
            console.log( "Error creating login." );
        }
    } );
}

function doRegisterCreate( data )
{
    var point = null;
    var register = null;

    // Date store
    point = new Parse.GeoPoint( {
        latitude: data.content.latitude,
        longitude: data.content.longitude
    } );

    register = new Register();
    register.set( "address", data.content.address );
    register.set( "postalCode", data.content.postalCode );
    register.set( "topic", data.client.reply );
    register.set( "location", point );
    register.save( null, {
        success: function( result ) {
            var message = null;

            // Debug
            console.log( "Register \"" + result.id + "\" created." );

            // Assemble response
            message = {
                server: {
                    action: data.client.action,
                    reply: data.client.reply
                },
                content: {
                    objectId: result.id,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt,
                    location: {
                        latitude: result.get( "location" ).latitude,
                        longitude: result.get( "location" ).longitude
                    },
                    address: result.get( "address" ),
                    postalCode: result.get( "postalCode" ),
                    topic: result.get( "reply" )
                }
            };

            // Send register details
            messaging.publish( data.client.reply, JSON.stringify( message ) );
        },
        error: function( error ) {
            console.log( "Failed creating register." );
        }
    } );
}

function doTransactionCreate( data )
{
    var clerk = null;
    var register = null;
    var transaction = null;

    // Clerk entity
    clerk = new Clerk();
    clerk.id = data.content.clerkId;

    // Register entity
    register = new Register();
    register.id = data.content.registerId;

    // Transaction
    transaction = new Transaction();
    transaction.set( "clerkId", clerk );
    transaction.set( "registerId", register );
    transaction.save( null, {
        success: function( result ) {
            var message = null;

            // Assemble response
            message = {
                server: {
                    action: data.client.action,
                    reply: data.client.reply
                },
                content: {
                    objectId: result.id,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt,
                    clerkId: result.get( "clerkId" ).id,
                    registerId: result.get( "registerId" ).id
                }
            };

            // Send transaction details
            messaging.publish( data.client.reply, JSON.stringify( message ) );
        },
        error: function( result, error ) {
            console.log( "Error creating transaction." );
        }
    } );
}