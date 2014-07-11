// Debug
var DEBUG_DOCUMENT = false;
var DEBUG_CONSOLE = true;

// Parse.com
var PARSE_APPLICATION = "BkyGNTBvPzhwd32zSiKmsxaFN719abjjQ4lPySiv";
var PARSE_KEY = "0KDnIgzlUzQryGTjgw3ObhM2yEW0Bkrh1m6Qs8ck";

// Actions
var POS_CLERK = "posClerk";
var POS_LAYOUT = "posLayout";
var POS_LOGIN = "posLogin";
var POS_TRANSACTION = "posTransaction";
var PURCHASE_ADD = "purchaseAdd";
var PURCHASE_CLEAR = "purchaseClear";
var PURCHASE_REMOVE = "purchaseRemove";
var REGISTER_LOCATION = "registerLocation";
var REGISTER_READ = "registerRead";

var TRANSACTION_ACCEPTED = "transactionAccept";
var TRANSACTION_CHARGE = "transactionCharge";
var TRANSACTION_READ = "transactionRead";
var PURCHASE_READ = "purchaseRead";
var CUSTOMER_SWIPE = "customerSwipe";
var REGISTER_SWIPE = "registerSwipe";
var CARD_CHANGE = "cardChange";

// Parse.com
var Clerk = null;
var Configuration = null;
var Layout = null;
var Login = null;
var Product = null;
var Purchase = null;
var Register = null;
var Transaction = null;

// Application
var CURRENCY_ACCEPTED = "Accepted: $";
var CURRENCY_CHARGE = "Charge: $";
var CURRENCY_PAYMENT = "Pay: $";
var CURRENCY_PENDING = "Pending: $";
var CURRENCY_SYMBOL = "$";
var DEFAULT_CONTACT = "303-522-3131";
var DEFAULT_ENDPOINT = "ws://kaazing.kevinhoyt.com:8001/jms";
var TAX_RATE = 0.0825;
var TOTAL_PAYMENT = "Total: $";

// Initialize data storage
Parse.initialize( PARSE_APPLICATION, PARSE_KEY );

// Parse.com data model
Clerk = Parse.Object.extend( "Clerk" );
Configuration = Parse.Object.extend( "Configuration" );
Layout = Parse.Object.extend( "Layout" );
Login = Parse.Object.extend( "Login" );
Product = Parse.Object.extend( "Product" );
Purchase = Parse.Object.extend( "Purchase" );
Register = Parse.Object.extend( "Register" );
Transaction = Parse.Object.extend( "Transaction" );

// Called to build an individual line item
// Typically after a purchase message
function buildLineItem( purchase, product )
{
    var bubble = null;
    var clear = null;
    var clone = null;
    var count = null;
    var ending = null;
    var found = null;
    var list = null;
    var tax = null;
    var template = null;

    // Reference elements
    template = document.querySelector( ".line.template" );
    list = document.querySelector( ".list" );
    tax = document.querySelector( ".tax" );
    clear = document.querySelector( ".clear" );

    // Handle interface differences
    // Mainly event handling
    if( clear == null )
    {
        bubble = false;
    } else {
        bubble = true;
    }

    // Account for interface differences
    // Code reused in register and wallet
    if( bubble == true )
    {
        ending = 2;
    } else {
        ending = 1;
    }

    found = false;
    count = 0;

    for( var c = 0; c < list.children.length - ending; c++ )
    {
        if( list.children[c].getAttribute( "data-id" ) == product.objectId )
        {
            found = true;
            count = parseInt( list.children[c].children[2].innerHTML );
            clone = list.children[c];
            break;
        }
    }

    if( found )
    {
        count = count + 1;
        clone.children[2].innerHTML = count;
        clone.children[2].style.visibility = "visible";
        clone.children[3].innerHTML = CURRENCY_SYMBOL + ( count * product.price ).toFixed( 2 );
    } else {
        // Build new line item
        clone = template.cloneNode( true );
        clone.setAttribute( "data-purchase", purchase.objectId );
        clone.setAttribute( "data-id", product.objectId );
        clone.setAttribute( "data-name", product.name );
        clone.setAttribute( "data-price", product.price );
        clone.setAttribute( "data-image", product.image );
        clone.setAttribute( "data-path", product.imagePath );
        clone.classList.remove( "template" );
        clone.children[0].style.backgroundImage = "url( '" + product.imagePath + "/" + product.image + "' )";
        clone.children[1].innerHTML = product.name;
        clone.children[2].innerHTML = "1";
        clone.children[2].style.visibility = "hidden";
        clone.children[3].innerHTML = CURRENCY_SYMBOL + product.price.toFixed( 2 );

        if( bubble == true )
        {
            clone.addEventListener( touch ? "touchstart" : "click", doItemClick );
        }

        // Add to line item list
        list.insertBefore( clone, tax );
    }

    // Calculate new total
    calculateTotal();
}

// Called to update the total on the purchase list
// Iterates through the items
// Sums up according to count and price
// Populates charge button accordingly
function calculateTotal()
{
    var charge = null;
    var clear = null;
    var ending = null;
    var list = null;
    var tax = null;
    var taxes = null;
    var total = null;

    // References
    list = document.querySelector( ".list" );
    charge = document.querySelector( ".charge" );
    tax = document.querySelector( ".tax" );
    clear = document.querySelector( ".clear" );

    // Account for different interfaces
    // No clear button on wallet
    if( clear == null )
    {
        ending = 1;
    } else {
        ending = 2;
    }

    // Nothing yet
    total = 0;

    // Iterate through children
    // Do not include tax and clear buttons in iteration
    for( var c = 0; c < list.children.length - ending; c++ )
    {
        total = total + ( parseInt( list.children[c].children[2].innerHTML ) * parseFloat( list.children[c].getAttribute( "data-price" ) ) );
    }

    // Manage interface visibility
    // Charge button
    // Taxes
    // Clear list button
    if( total == 0 )
    {
        // Change button appearance
        charge.classList.add( "pending" );
        charge.classList.remove( "ready" );
        charge.classList.remove( "waiting" );
        charge.classList.remove( "accepted" );

        // Disable charge button click
        if( clear != null )
        {
            charge.removeEventListener( touch ? "touchstart" : "click", doChargeClick );
        }

        // Hide list controls
        tax.style.visibility = "hidden";

        // May or may not have a clear button
        if( clear != null )
        {
            clear.style.visibility = "hidden";
        }
    } else {
        // Enable charge button
        // Different rules for different interfaces
        if( clear != null )
        {
            charge.classList.add( "ready" );
            charge.classList.remove( "pending" );
            charge.classList.remove( "waiting" );
            charge.classList.remove( "accepted" );
            charge.addEventListener( touch ? "touchstart" : "click", doChargeClick );
        }

        // Show list controls
        tax.style.visibility = "visible";

        // May or may not have a clear button
        if( clear != null )
        {
            clear.style.visibility = "visible";
        }
    }

    // Calculate taxes
    taxes = total * TAX_RATE;
    total = total + taxes;

    // Display taxes and update total
    tax.children[3].innerHTML = CURRENCY_SYMBOL + taxes.toFixed( 2 );

    if( clear != null )
    {
        charge.innerHTML = CURRENCY_CHARGE + total.toFixed( 2 );
    } else {
        charge.innerHTML = TOTAL_PAYMENT + total.toFixed( 2 );
    }
}

// Called to remove line items from the user interface
function clearLineItems()
{
    var clear = null;
    var ending = null;
    var list = null;

    // Debug
    logMessage( "Clear items from list." );

    // References
    list = document.querySelector( ".list" );
    clear = document.querySelector( ".clear" );

    // Account for interface difference
    // Between register and wallet
    if( clear == null )
    {
        ending = 1;
    } else {
        ending = 2;
    }

    // Remove all product children
    // Always from zero element
    // Number of children will vary
    while( list.children.length > ending )
    {
        list.removeChild( list.children[0] );
    }

    // Update running total
    calculateTotal();
}

function generateKey()
{
    var key = null;

    key = String.fromCharCode( 65 + Math.floor( ( Math.random() * 25 ) ) ) +
        String.fromCharCode( 48 + Math.floor( ( Math.random() * 10 ) ) ) +
        String.fromCharCode( 97 + Math.floor( ( Math.random() * 25 ) ) ) +
        String.fromCharCode( 48 + Math.floor( ( Math.random() * 10 ) ) );

    alert( key );
}

// Called to log a message
// Will place in the DOM or console
// Output controlled by constants
function logMessage( message )
{
    var element = null;

    // Debug to DOM
    if( DEBUG_DOCUMENT == true )
    {
        element = document.createElement( "div" );
        element.innerHTML = message;
        document.body.appendChild( element );
    }

    // Debug to console
    if( DEBUG_CONSOLE == true )
    {
        console.log( message );
    }
}

function preloadAssets()
{
    var manifest = null;

    // Build preload manifest
    manifest = new Array();

    // Products
    if( model.products != null )
    {
        for( var p = 0; p < model.products.length; p++ )
        {
            manifest.push( {
                id: model.products[p].objectId,
                src: model.products[p].imagePath + "/" +  model.products[p].image
            } );
        }
    }

    // Assets
    manifest.push( {
        id: "am-ex",
        src: "img/american-express.svg"
    } );

    manifest.push( {
        id: "blue-card",
        src: "img/blue-card.png"
    } );

    manifest.push( {
        id: "company-logo",
        src: "img/company-logo.png"
    } );

    manifest.push( {
        id: "taxes",
        src: "img/death-and.png"
    } );

    manifest.push( {
        id: "gold-card",
        src: "img/gold-card.png"
    } );

    manifest.push( {
        id: "kaazing",
        src: "img/kaazing.svg"
    } );

    manifest.push( {
        id: "padlock",
        src: "img/padlock.svg"
    } );

    manifest.push( {
        id: "red-card",
        src: "img/red-card.png"
    } );

    manifest.push( {
        id: "visa",
        src: "img/visa.svg"
    } );

    // Load manifest
    queue = new createjs.LoadQueue();
    queue.addEventListener( "error", doQueueError );
    queue.addEventListener( "progress", doQueueProgress );
    queue.addEventListener( "complete", doQueueComplete );
    queue.loadManifest( manifest );
}

// Called to remove a purchase line item
// Alternatively decrement existing count
function removeLineItem( purchase )
{
    var clear = null;
    var count = null;
    var ending = null;
    var item = null;
    var list = null;

    // Debug
    logMessage( "Remove purchase from list." );

    // References
    list = document.querySelector( ".list" );
    clear = document.querySelector( ".clear" );

    if( clear == null )
    {
        ending = 1;
    } else {
        ending = 2;
    }

    // Iterate through line items
    for( var c = 0; c < list.children.length - ending; c++ )
    {
        // Look for matching line item
        if( list.children[c].getAttribute( "data-id" ) == purchase.productId.objectId )
        {
            // Determine current quantity
            count = parseInt( list.children[c].children[2].innerHTML );

            // If only one
            if( count == 1 )
            {
                // Outright remove line item
                list.removeChild( list.children[c] );
            } else {
                // Decrement quantity for all others
                list.children[c].children[2].innerHTML = count - 1;
                list.children[c].children[3].innerHTML = CURRENCY_SYMBOL + ( ( count - 1 ) * parseFloat( list.children[c].getAttribute( "data-price" ) ) ).toFixed( 2 );

                // Hide quantity for single item
                if( count == 2 )
                {
                    list.children[c].children[2].style.visibility = "hidden";
                }
            }

            break;
        }
    }

    // Update interface totals
    calculateTotal();
}

function doQueueComplete()
{
    logMessage( "Asset queue loaded." );
}

function doQueueError( event )
{
    logMessage( event.error )
}

function doQueueProgress( event )
{
    logMessage( event.progress * 100 )
}
