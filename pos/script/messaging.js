function cardChangeArrived( card )
{
    var element = null;

    logMessage( "Card arrived." );

    element = document.querySelector( ".card" );
    element.setAttribute( "data-edge", "false" );
    element.setAttribute( "data-center", "false" );
    element.children[0].innerHTML = card.name;
    element.children[1].innerHTML = card.expires;
    element.children[2].innerHTML = card.number;
    element.children[3].src = "img/" + card.vendor + ".svg";
    element.style.width = card.width + "px";
    element.style.height = card.height + "px";
    element.style.backgroundImage = "url( 'img/" + card.background + ".png' )";
    element.style.left = Math.round( ( window.innerWidth - parseInt( card.width ) ) / 2 ) + "px";
    element.style.top = window.innerHeight + "px";
}

function clerkArrived( clerk )
{
    var login = null;
    var register = null;

    // Debug
    logMessage( "Clerk details arrived." );

    // Save clerk details to data model
    model.clerk = clerk;

    // Login data model
    register = new Register();
    register.id = model.register.objectId;

    clerk = new Clerk();
    clerk.id = model.clerk.objectId;

    login = new Login();
    login.set( "registerId", register );
    login.set( "clerkId", clerk );
    login.save( null, {
        success: function( result ) {
            var message = null;

            // Debug
            logMessage( "Login successful." );

            // Construct message
            message = {
                action: POS_LOGIN,
                login: result
            };

            // Send message of login details
            producer.send(
                session.createTextMessage( JSON.stringify( message ) ),
                doMessageSent
            );
        },
        error: function( error ) {
            // Debug
            logMessage( "Error logging into system." );
        }
    } );
}

function customerSwipeArrived( card )
{
    var element = null;

    element = document.querySelector( ".card" );
    element.style.visibility = "visible";

    TweenMax.to( element, model.register.animationDelay, {
        top: 0 - element.clientWidth - 10,
        onComplete: doSwipeComplete,
        onCompleteScope: element,
        onUpdate: doSwipeUpdate,
        onUpdateScope: element
    } );
}

function layoutArrived( layout, products )
{
    var manifest = null;

    // Debug
    logMessage( "Layout data arrived." );

    // Store in application data model
    model.layout = layout;
    model.products = products;

    // Preload media assets
    preloadAssets();

    // Populate the register layout
    buildLayout();

    generateTransaction();
}

function loginArrived( login )
{
    var query = null;
    var register = null;

    // Debug
    logMessage( "Login message arrived." );

    // Save login details to data model
    model.login = login;

    // Query criteria
    register = new Register();
    register.id = model.register.objectId;

    query = new Parse.Query( Layout );
    query.equalTo( "registerId", register );
    query.include( "productId" );
    query.find( {
        success: function( results ) {
            var message = null;

            // Debug
            logMessage( "Layout retrieved." );

            // Construct message
            message = {
                action: POS_LAYOUT,
                layout: results,
                products: new Array()
            };

            // Carry over deep nested objects
            // Deep Parse.com objects not stringified
            for( var p = 0; p < results.length; p++ )
            {
                message.products.push( {
                    objectId: results[p].get( "productId" ).id,
                    name: results[p].get( "productId" ).get( "name" ),
                    createdAt: results[p].get( "productId" ).createdAt,
                    updatedAt: results[p].get( "productId" ).updatedAt,
                    price: results[p].get( "productId" ).get( "price" ),
                    image: results[p].get( "productId" ).get( "image" ),
                    imagePath: results[p].get( "productId" ).get( "imagePath" )
                } );
            }

            // Send message of layout details
            producer.send(
                session.createTextMessage( JSON.stringify( message ) ),
                doMessageSent
            );
        },
        error: function( error ) {
            logMessage( "Error getting layout." );
        }
    } );
}

function purchaseAddArrived( purchase, product )
{
    // Debug
    logMessage( "Product purchase arrived (" + product.name + ")." );

    // Check application data model
    if( model.purchase == null )
    {
        model.purchase = new Array();
    }

    // Add purchase to application data model
    // Includes product details for purchase
    model.purchase.push( purchase );

    // Add to line item user interface
    buildLineItem( purchase, product );
}

function purchaseClearArrived()
{
    // Debug
    logMessage( "Clear purchases arrived." );

    // Remove from data model
    model.purchase = new Array();

    // Remove from user interface
    clearLineItems();
}

function purchaseReadArrived( purchase, products )
{
    // Debug
    logMessage( "Purchases arrived." );

    // Store related products in data model
    // Must come first to build product data model
    for( var p = 0; p < products.length; p++ )
    {
        // Data model may need initialization
        if( model.products == null )
        {
            model.products = new Array();
        }

        // Check for redundancy
        if( shouldAddProduct( model.products, products[p] ) == true )
        {
            // Add to data model
            model.products.push( products[p] );
        }
    }

    // Preload media assets
    preloadAssets();

    // Store purchases in application data model
    // Leave null if no data
    if( purchase.length > 0 )
    {
        model.purchase = purchase;

        for( var p = 0; p < model.purchase.length; p++ )
        {
            for( var i = 0; i < model.products.length; i++ )
            {
                if( model.purchase[p].productId.objectId == model.products[i].objectId )
                {
                    buildLineItem( model.purchase[p], model.products[i] );
                    break;
                }
            }
        }
    }
}

function purchaseRemoveArrived( purchase )
{
    // Debug
    logMessage( "Remove line item arrived (" + purchase.objectId + ")." );

    // Remove purchase from local model
    for( var p = 0; p < model.purchase.length; p++ )
    {
        if( model.purchase[p].objectId == purchase.objectId )
        {
            purchase = model.purchase.splice( p, 1 )[0];
            break;
        }
    }

    // Remove from user interface
    removeLineItem( purchase );
}

function registerLocationArrived( location )
{
    var globe = null;

    // Debug
    logMessage( "Location details arrived." );

    // Save location details to data model
    model.location = location;

    // Show indicator
    globe = document.querySelector( ".globe" );

    TweenMax.to( globe, 1, {
        opacity: 0.80
    } );
}

function registerReadArrived( register )
{
    var input = null;

    // Debug
    logMessage( "Register details read." );

    // Save register details to data model
    if( model.register == null )
    {
        model.register = register;
    }

    // Clean default phone number
    input = document.querySelector( ".dialog input" );

    if( model.register.notification == true )
    {
        input.value = "";
    } else {
        input.value = DEFAULT_CONTACT;
    }
}

function registerSwipeArrived()
{
    var card = null;
    var height = null;
    var status = null;

    status = document.querySelector( ".status" );
    status.innerHTML = "PAYMENT COMPLETE";

    card = document.querySelector( ".card" );
    card.style.top = window.innerHeight + ( card.clientHeight / 2 ) + "px";

    TweenMax.to( card, 1, {
        top: Math.round( ( ( window.innerHeight - card.clientHeight ) / 2 ) - 15 ),
        onComplete: doPaymentComplete,
        onCompleteScope: card
    } );
}

function transactionAcceptArrived( total )
{
    var amount = null;
    var charge = null;
    var index = null;

    charge = document.querySelector( ".charge" );
    charge.classList.remove( "waiting" );
    charge.classList.add( "accepted" );

    index = charge.innerHTML.indexOf( CURRENCY_SYMBOL ) + 1;
    amount = parseFloat( charge.innerHTML.substr( index ) );

    charge.innerHTML = CURRENCY_ACCEPTED + amount.toFixed( 2 );
}

function transactionArrived( transaction )
{
    var footer = null;
    var pin = null;
    var now = null;
    var qr = null;

    // Debug
    logMessage( "Transaction arrived." );

    // Store transaction details in data model
    model.transaction = transaction;

    // Easy PIN for URL access
    pin = model.transaction.objectId.substr( model.transaction.objectId.length - 4 );

    // Handle transaction shortcuts
    footer = document.querySelector( ".footer" );
    footer.innerHTML = "Transaction #" + pin;

    // Send notification
    if( demoNotify == false )
    {
        Parse.Cloud.run( "notification", {
            clerk: model.clerk.authorization,
            transaction: pin,
            send: model.register.notification
        }, {
            success: function( result ) {
                logMessage( result );
            },
            error: function( error ) {
                logMessage( error );
            }
        } );

        demoNotify = true;
    }

    // Load QR code
    qr = document.querySelector( ".qr" );
    qr.style.backgroundImage = "url( 'http://zxing.org/w/chart?cht=qr&chs=230x230&chld=M&choe=UTF-8&chl=http%3A%2F%2Fwww.kevinhoyt.com%2Fprojects%2Fpos%2Fwallet.html%3Fid%3D" + pin + "' )";

    if( model.purchase == null )
    {
        // Determine connection duration
        now = new Date();

        if( ( now.getTime() - start.getTime() ) < CONNECTING_DELAY )
        {
            interval = setInterval( doShowRegister, CONNECTING_DELAY - ( now.getTime() - start.getTime() ) );
        } else {
            doShowRegister();
        }
    } else {
        model.purchase = null;
    }
}

function transactionChargeArrived()
{
    var amount = null;
    var charge = null;
    var index = null;

    // Reference to charge button
    charge = document.querySelector( ".receipt .charge" );

    // Parse payment total
    index = charge.innerHTML.indexOf( CURRENCY_SYMBOL ) + 1;
    amount = charge.innerHTML.substr( index );

    // Update interface for clicking to accept
    charge.innerHTML = CURRENCY_PAYMENT + amount;
    charge.classList.add( "ready" );
    charge.classList.remove( "pending" );
    charge.addEventListener( touch ? "touchstart" : "click", doPayClick );
}

function transactionReadArrived( transaction, register )
{
    var card = null;
    var query = null;

    // Debug
    logMessage( "Transaction read arrived." );

    // Store in application data model
    model.transaction = transaction;
    model.register = register;

    // Populate vendor specific content
    // card = document.querySelector( ".card" );
    // card.children[3].src = model.register.vendorPath + "/" + model.register.vendorLogo;

    // Find purchases in transaction
    transaction = new Transaction();
    transaction.id = model.transaction.objectId;

    query = new Parse.Query( Purchase );
    query.equalTo( "transactionId", transaction );
    query.include( "productId" );
    query.find( {
        success: function( results ) {
            var item = null;
            var message = null;

            // Debug
            logMessage( "Transaction purchases read." );

            // Construct message
            message = {
                action: PURCHASE_READ,
                purchase: results,
                products: new Array()
            };

            // Add product data
            for( var r = 0; r < results.length; r++ )
            {
                message.products.push( {
                    objectId: results[r].get( "productId" ).id,
                    name: results[r].get( "productId" ).get( "name" ),
                    createdAt: results[r].get( "productId" ).createdAt,
                    updatedAt: results[r].get( "productId" ).updatedAt,
                    price: results[r].get( "productId" ).get( "price" ),
                    image: results[r].get( "productId" ).get( "image" ),
                    imagePath: results[r].get( "productId" ).get( "imagePath" )
                } );
            }

            // Send message of transaction details
            producer.send(
                session.createTextMessage( JSON.stringify( message ) ),
                doMessageSent
            );
        },
        error: function( error ) {
            // Debug
            logMessage( "Problem loading transactions." );
        }
    } );
}
