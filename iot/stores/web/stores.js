// Constants  
var ACTION_SHOW = 'show';
var TOPIC = 'stores_topic';
var KAAZING_ID = 'd71dfe3a-818e-4f9c-8af6-fb81649d9a6d';
  
// Application
var cart = null;
var kaazing = null;  
 
// Called to build line item
// Uses last element in cart
function line() {
  var item = null;
  var list = null;
  var template = null;
  
  // Clone
  template = document.querySelector( '.template' );
  item = template.cloneNode( true );
  
  // Track for removal
  item.setAttribute( 'data-upc', cart[cart.length - 1].upc );  
  
  // Style
  item.classList.remove( 'template' );
  item.classList.add( 'line' );

  // Populate
  item.children[0].style.backgroundImage = 'url( ' + cart[cart.length - 1].image + ' )';
  item.children[1].innerHTML = cart[cart.length - 1].title;
  item.children[3].innerHTML = cart[cart.length - 1].price.toLocaleString();
  
  // Allow for remove
  item.children[4].addEventListener( 'click', doRemoveClick );
  
  // Put in list
  list = document.querySelector( '.list' );
  list.appendChild( item );
}
 
// Called to update totals
// Includes item count
function total() {
  var amount = null;
  var count = null;
  var total = null;
  
  // Increment item count
  count = document.querySelector( '.count' );
  count.innerHTML = cart.length;
  
  // Seed total
  total = 0;
  
  // Calculate total
  for( var i = 0; i < cart.length; i++ )
  {
    total = total + cart[i].price;  
  }
  
  // Display total
  amount = document.querySelector( '.amount' );
  amount.innerHTML = total.toLocaleString();
}
  
// Called when connected to Gateway
// Subscribe to topic
function doGatewayConnect()
{
  console.log( 'Client connected.' );
  
  // Subscribe
  kaazing.on( Gateway.EVENT_MESSAGE, doGatewayMessage );
  kaazing.subscribe( TOPIC );    
}
  
// Called when message arrives
function doGatewayMessage( message )
{
  var data = null;
  
  // Parse JSON
  data = JSON.parse( message );
  
  // Decision tree for incoming action
  // Display actual scanner values
  if( data.action == ACTION_SHOW )
  {
    // Add to cart
    cart.push( data );
    
    // Update user interface
    line();
    total();
    
    // Debug
    console.log( data.upc );
    console.log( data.title );
    console.log( data.price );    
    console.log( data.image );
  }
}

function doRemoveClick() 
{
  var list = null;
  var upc = null;
  
  // Get identifier
  upc = this.parentElement.getAttribute( 'data-upc' );  
  
  // Match in data model
  for( var i = 0; i < cart.length; i++ )
  {
    if( cart[i].upc == upc ) 
    {
      index = i;
      break;
    }
  }
  
  // Remove from cart
  cart.splice( index, 1 );
  
  // Remove from display
  list = document.querySelector( '.list' );
  list.removeChild( this.parentElement );
  
  // Tally
  total();
}
  
// Called when document is loaded
// Connect to Gateway
function doWindowLoad()
{
  var button = null;
  
  button = document.querySelector( 'button' );
  button.addEventListener( 'click', function() {
    cart.push( {
      upc: Date.now(),
      title: "Nikon D5100 18-55 VR 16.2MP 3",
      price: 1299
    } );
    line();
    total();
  } );
  
  cart = [];
  
  // Connect to Gateway
  kaazing = Gateway.connect( KAAZING_ID, doGatewayConnect ); 
}
  
// Listen for document to load
window.addEventListener( 'load', doWindowLoad );
