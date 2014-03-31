// http://www.mongodb.org/
// https://github.com/LearnBoost/monk
var mongo = require( "mongodb" );
var monk = require( "monk" );

// Constants
var MONGO_DB = "localhost:27017/telemetry";
var MONGO_COLLECTION = "usercollection";

// Connect to database
var db = monk( MONGO_DB );
var collection = db.get( MONGO_COLLECTION );

// Insert a plain record
collection.insert( {
    aircraft: null,
    stamp: new Date(),
    latitude: 0,
    longitude: 0,
    meters: 0,
    feet: 0,
    mps: 0,
    mph: 0,
    heading: 0,
    compass: 0,
    xaxis: 0,
    yaxis: 0,
    zaxis: 0,
    farenheit: 0,
    celcius: 0,
    humidity: 0
}, function( err, doc ) {
    if( err )
    {
        console.log( "Error adding record." );
    } else {
        // Display resulting ID
        console.log( "Added: " + doc._id );
    }

    // One hit wonder then done
    process.exit();
} );
