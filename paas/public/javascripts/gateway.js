var Gateway = ((() => {
  
  /*
   * Private properties
   */
  
  // Event constants
  var EVENT_CONNECT = "connect";
  var EVENT_DISCONNECT = "disconnect";
  var EVENT_MESSAGE = "message";
  var EVENT_SUBSCRIBE = "subscribe";
  var EVENT_UNSUBSCRIBE = "unsubscribe";
  
  // Messaging constants
  var AMQP_CONSUMER_TAG = "start_tag";
  var AMQP_EXCHANGE_PREFIX = "exchange_";
  var AMQP_PASSWORD = "guest";
  var AMQP_QUEUE_PREFIX = "queue_";
  var AMQP_QUEUE_SUFFIX = "_";
  var AMQP_TYPE = "direct";
  var AMQP_USERNAME = "guest";
  var AMQP_URL = "wss://sandbox.kaazing.net/amqp091";
  var AMQP_VIRTUAL_HOST = "/";
  
  // Chat constants
  var CHAT_ENTER = 13;
  var CHAT_PLACEHOLDER_CLASS = "placeholder";
  var CHAT_TOPIC = "chat_topic";
  var CHAT_USER_PREFIX = "user_";
  
  // Application constants
  var SANDBOX_ID = "cXRsp2lwLZ";
  var SANDBOX_EMAIL = "kevin.hoyt@kaazing.com";
  var SANDBOX_TOKEN = "d71dfe3a-818e-4f9c-8af6-fb81649d9a6d";
  
  // Messaging
  var amqp_client = null;
  var amqp_consume = null;
  var amqp_consume_routes = null;
  var amqp_factory = null;
  var amqp_publish = null;
  var amqp_queue = null;
  
  // Chat
  var chat_color = null;
  var chat_connection = null;
  var chat_history = null;
  var chat_message = null;
  var chat_placeholder = null;
  var chat_user = null;
  
  // Application constants
  var PARSE_APP_ID = "ZBzdcXEpxqTcaig69vOIHhjw5OQ36SLzsWpOHhK8";
  var PARSE_JS_KEY = "Xt3X8AETCP7thbIjPk6SJKAcC8hPx0CPQZi7eIPw";
  
  // Parse.com
  var Account = null;
  var Usage = null;
  
  // Events
  var event_listeners = null;
  
  // Application
  var account_information = null;
  var debug_messages = null;
  var routing_key = null;
  
  /*
   * Dependencies
   * Run as soon as the script is loaded
   */
  
  var script_dependencies = [
    "http://cache.kaazing.net/bower/kaazing-amqp-0-9-1-client-javascript/5.0.0-6/Amqp-0-9-1.js",
    "http://cache.kaazing.net/bower/kaazing-websocket-client-javascript/5.0.0-50/WebSocket.js",
    "http://www.parsecdn.com/js/parse-1.3.3.min.js"
  ];
  var script_element = null;
  var scripts_loaded = null;
  var scripts_ready = null;
  
  scripts_ready = false;
  
  for( var s = 0; s < script_dependencies.length; s++ )
  {
    script_element = document.createElement( "script" );
    script_element.addEventListener( "load", doLibraryLoad );
    script_element.src = script_dependencies[s];

    document.head.appendChild( script_element );        
  }

  /*
   * Private methods
   */

  function arrayBufferToString( buffer )
  {
    return String.fromCharCode.apply( null, new Uint8Array( buffer ) );
  }  
    
  function dispatchEvent( event, data )
  {
    for( var e = 0; e < event_listeners.length; e++ )
    {
      if( event_listeners[e].event == event )
      {
        if( data != undefined )
        {
          event_listeners[e].callback( data );
        } else {
          event_listeners[e].callback();          
        }
      }
    }
  }
  
  function error( message )
  {
    if( verbose() )
    {
      console.error( message );  
    }
  }  
  
  function log( message )
  {
    if( verbose() )
    {
      console.log( message );  
    }
  }
  
  function routeAdd( route )
  {
    if( amqp_consume_routes == null )
    {
      amqp_consume_routes = [];  
    }
    
    amqp_consume_routes.push( route );  
    
    return amqp_consume_routes.length - 1;
  }
  
  function routeExists( route )
  {
    var found = null;
    
    if( amqp_consume_routes == null )
    {
      found = false;  
    } else {
      found = false;

      for( var r = 0; r < amqp_consume_routes.length; r++ )
      {
        if( amqp_consume_routes[r] == route )
        {
          found = true;
          break;
        }
      }          
    }
    
    return found;
  }
  
  function routeFind( route )
  {
    var index = null;
    
    index = -1;
    
    for( var r = 0; r < amqp_consume_routes.length; r++ ) 
    {
      if( amqp_consume_routes[r] == route )
      {
        index = r;
        break;
      }
    }
    
    return index;
  }
  
  function routeRemove( route )
  {
    for( var r = 0; r < amqp_consume_routes.length; r++ )
    {
      if( amqp_consume_routes[r] == route )
      {
        break;  
      }
    }
    
    return amqp_consume_routes.splice( r, 1 )[0];
  }
  
  // Convert String to ArrayBuffer
  // Effectively text to binary
  function stringToArrayBuffer( value )
  {
    var buffer = null;
    var view = null;

    buffer = new ArrayBuffer( value.length );
    view = new Uint8Array( buffer );

    for( var i = 0; i < value.length; i++ )
    {
      view[i] = value.charCodeAt( i );
    }

    return buffer;
  }  
  
  function doAccountError( error )
  {
    error( error.message );
  }
  
  function doAccountSuccess( result )
  {
    var account = null;
    var usage = null;
    
    if( result != undefined )
    {
      log( "Account found." );      
      
      account_information = {
        id: result.id,
        created_at: result.createdAt,
        updated_at: result.updatedAt,
        email: result.get( "email" ),
        token: result.get( "token" )
      };      
    } else {
      log( "No account." );
      
      account_information = {
        id: SANDBOX_ID,
        created_at: new Date(),
        updated_at: new Date(),
        email: SANDBOX_EMAIL,
        token: SANDBOX_TOKEN
      };      
    }
    
    account = new Account();
    account.id = account_information.id;

    usage = new Usage();
    usage.set( "account", account );
    usage.save( null, {
      success: doUsageSuccess, 
      error: doUsageError
    } );
  }
  
  function doClientClose()
  {
    log( "Disconnected." );
    
    amqp_consume_routes = null;
    amqp_factory = null;
    amqp_client = null;
    
    account_information = null;
    routing_key = null;
    
    dispatchEvent( EVENT_DISCONNECT );
  }
  
  function doClientOpen()
  {
    log( "Connected." );

    amqp_queue = AMQP_QUEUE_PREFIX + account_information + AMQP_QUEUE_SUFFIX + Date.now();    
    
    amqp_publish = amqp_client.openChannel( doPublishOpen );  
  }
  
  function doConsumeBind()
  {
    log( "Queue bound." );
    
    // Tell server we want to consume messages
    amqp_consume.consumeBasic( {
      queue: amqp_queue,
      consumerTag: AMQP_CONSUMER_TAG,
      noAck: false
    } );    
  }
  
  function doConsumeCancel()
  {
    log( "Consume cancelled." );
    
    amqp_consume.unbindQueue( {
      queue: amqp_queue,
      exchange: AMQP_EXCHANGE_PREFIX + account_information.id,
      routingKey: routing_key
    } );                      
  }
  
  function doConsumeClose()
  {
    log( "Consume closed." );  

    amqp_queue = null;
    amqp_consume = null;
  }
  
  function doConsumeDeclare()
  {
    log( "Queue declared." );
    
    dispatchEvent( EVENT_CONNECT );
  }
  
  function doConsumeFlow() 
  {
    log( "Data flowing." );
  }
  
  function doConsumeMessage( message )
  {
    var body = null;
    var config = null;
    
    log( "Message." );
    
    body = arrayBufferToString( message.getBodyAsArrayBuffer() );
    
    dispatchEvent( EVENT_MESSAGE, body );    
    
    // Acknowledge the message has arrived
    config = {
      deliveryTag: message.args.deliveryTag, 
      multiple: true
    };
    
    // Acknowledge is synchronous
    // Schedule idependently
    setTimeout( () => {
      amqp_consume.ackBasic( config );
    }, 0 );        
  }
  
  function doConsumeOpen()
  {
    log( "Consume open." );
    
    // Event listeners
    amqp_consume.addEventListener( "declarequeue", doConsumeDeclare );
    amqp_consume.addEventListener( "bindqueue", doConsumeBind );
    amqp_consume.addEventListener( "unbindqueue", doConsumeUnbind );    
    amqp_consume.addEventListener( "consume", doConsumeReady );
    amqp_consume.addEventListener( "cancel", doConsumeCancel );    
    amqp_consume.addEventListener( "flow", doConsumeFlow );
    amqp_consume.addEventListener( "close", doConsumeClose );
    amqp_consume.addEventListener( "message", doConsumeMessage );

    // Declare the queue
    amqp_consume.declareQueue( {
        queue: amqp_queue
    } );    
  }
  
  function doConsumeReady()
  {
    log( "Consume ready." );
    
    dispatchEvent( EVENT_SUBSCRIBE );
  }
  
  function doConsumeUnbind()
  {
    log( "Consume unbound." ); 
    
    routeRemove( routing_key );
    routing_key = null;
    
    dispatchEvent( EVENT_UNSUBSCRIBE );
  }
  
  function doLibraryLoad()
  {
    if( scripts_loaded == null )
    {
      scripts_loaded = 0;  
    }
    
    scripts_loaded = scripts_loaded + 1;
    
    if( scripts_loaded == script_dependencies.length )
    {
      Parse.initialize( PARSE_APP_ID, PARSE_JS_KEY );
  
      Account = Parse.Object.extend( "Account" );
      Usage = Parse.Object.extend( "Usage" );            
      
      scripts_ready = true;
      
      script_element = null;
      scripts_loaded = null;
    }
  }
  
  function doPublishClose()
  {
    log( "Publish closed." );
    
    amqp_publish = null;
  }
  
  function doPublishDeclare()
  {
    log( "Exchange declared." );
    
    amqp_consume = amqp_client.openChannel( doConsumeOpen );                      
  }  
  
  function doPublishOpen()
  {
    log( "Publish open." );  
    
    // Declare publisher
    amqp_publish.declareExchange( {
        exchange: AMQP_EXCHANGE_PREFIX + account_information.id,
        type: AMQP_TYPE
    } );

    // Listen for when the declaration is complete
    amqp_publish.addEventListener( "declareexchange", doPublishDeclare );    
    amqp_publish.addEventListener( "close", doPublishClose );        
  }
    
  function doUsageError( error )
  {
    error( error.message );
  }
  
  function doUsageSuccess( result )
  {
    log( "Usage saved." );
    
    log( "Connecting ..." );

    amqp_factory = new AmqpClientFactory();
    
    amqp_client = amqp_factory.createAmqpClient();
    amqp_client.addEventListener( "close", doClientClose );
    
    amqp_client.connect( {
      url: AMQP_URL,
      virtualHost: AMQP_VIRTUAL_HOST,
      credentials: {
        username: AMQP_USERNAME,
        password: AMQP_PASSWORD
      }
    }, doClientOpen );    
  }
  
  /*
   * Chat methods
   */
  
  function doChatBlur()
  {
    chat_message.classList.add( CHAT_PLACEHOLDER_CLASS );
    
    if( chat_message.innerHTML.trim().length == 0 )
    {
      chat_message.innerHTML = chat_placeholder;  
    }
  }
  
  function doChatFocus()
  {
    chat_message.classList.remove( CHAT_PLACEHOLDER_CLASS );
    
    if( chat_message.innerHTML == chat_placeholder )
    {
      chat_message.innerHTML = "";  
    }
  }
  
  function doChatMessage( data )
  {
    var content = null;
    var message = null;
    
    log( "Chat arrived." );
    
    content = JSON.parse( data );
    
    message = document.createElement( "div" );
    message.style.color = content.color;
    message.innerHTML = content.message;

    chat_history.appendChild( message );
  }
  
  function doChatReady()
  {
    log( "Chat connected." );
    
    chat_connection.on( EVENT_MESSAGE, doChatMessage );
    chat_connection.on( EVENT_SUBSCRIBE, doChatSubscribe );
    chat_connection.subscribe( CHAT_TOPIC );
  }
  
  function doChatSend( event )
  {
    var json = null;
    
    if( event.keyCode == CHAT_ENTER && chat_message.innerHTML.trim().length > 0 )
    {      
      json = JSON.stringify( {
        color: chat_color,
        message: chat_message.innerHTML.trim(),
        user: chat_user
      } );
      
      chat_connection.publish( CHAT_TOPIC, json );
      
      chat_message.innerHTML = "";
      
      log( "Chat sent." );      
    }
  }
  
  function doChatSubscribe()
  {
    log( "Chat ready." );      
    
    chat_message.contentEditable = true;
  }
  
  /*
   * Public methods
   */
  
  function chat( client_id, message, history )
  {
    var blue = null;
    var green = null;
    var red = null;
    
    red = Math.round( Math.random() * 255 );
    green = Math.round( Math.random() * 255 );
    blue = Math.round( Math.random() * 255 );    
    
    chat_color = "rgb( " + red + ", " + green + ", " + blue + " )";
    chat_user = CHAT_USER_PREFIX + Date.now();
    
    chat_message = message;
    chat_message.classList.add( CHAT_PLACEHOLDER_CLASS );
    chat_message.contentEditable = false;
    chat_message.addEventListener( "focus", doChatFocus );
    chat_message.addEventListener( "blur", doChatBlur );        
    chat_message.addEventListener( "keypress", doChatSend );
    
    chat_placeholder = chat_message.innerHTML;
    
    chat_history = history;
    
    chat_connection = connect( client_id, doChatReady );
    
    return chat_connection;
  }
  
  function close()
  {
    log( "Close connection." );  
    
    amqp_client.disconnect();
  }
  
  function connect( client_id, callback )
  {
    var query = null;
    
    if( scripts_ready == false )
    {
      console.error( "Dependencies not loaded." );
      return;
    }
    
    log( "Initialize." );        
    
    if( callback != undefined )
    {
      on( EVENT_CONNECT, callback );
    }
    
    query = new Parse.Query( Account );
    query.equalTo( "token", client_id );
    query.first( {
      success: doAccountSuccess,
      error: doAccountError
    } );
        
    return {
      clientId: client_id,
      close,
      connect,
      on,
      publish,
      subscribe,
      unsubscribe
    };
  }
  
  function on( event, callback )
  {
    var found = null;
    
    if( event_listeners == null )
    {
      event_listeners = [];
    } else {
      found = false;
      
      for( var e = 0; e < event_listeners.length; e++ )
      {
        if( event_listeners[e].event == event && event_listeners[e].callback == callback )
        {
          found = true;
          break;
        }
      }
    }
    
    if( !found )
    {
      event_listeners.push( {
        event,
        callback
      } );          
    }
  }
  
  function publish( topic, message, callback )
  {
    var body = null;
    
    log( "Publish." );
    
    body = stringToArrayBuffer( message.toString() );

    amqp_publish.publishBasic( {
      body,
      properties: null,
      exchange: AMQP_EXCHANGE_PREFIX + account_information.id,
      routingKey: topic
    } );
    
    if( callback != undefined )
    {
      callback();      
    }
  }  
  
  function subscribe( topic, callback )
  {
    var exists = null;
    var index = null;
    
    if( callback != undefined )
    {
      on( EVENT_SUBSCRIBE, callback );
    }

    exists = routeExists( topic );
    
    if( !exists )
    {
      index = routeAdd( topic );
      
      // Bind to queue
      amqp_consume.bindQueue( {
        queue: amqp_queue,
        exchange: AMQP_EXCHANGE_PREFIX + account_information.id,
        routingKey: amqp_consume_routes[index]
      } );       
    }
  }
  
  function unsubscribe( topic, callback )
  {
    var exists = null;
    
    if( callback != undefined )
    {
      on( EVENT_UNSUBSCRIBE, callback );
    }

    exists = routeExists( topic );
    
    if( exists )
    {
      routing_key = topic;

      amqp_consume.cancelBasic( {
        consumerTag: AMQP_CONSUMER_TAG
      } );              
    }
  }
  
  function verbose(...args) {
    if( debug_messages == null )
    {
      debug_messages = false;
    }
    
    if( args.length == 0 )
    {
        return debug_messages;
    }
    
    debug_messages = args[0];
  }
  
  return {
    EVENT_CONNECT,
    EVENT_ERROR: "error",
    EVENT_DISCONNECT,
    EVENT_MESSAGE,
    EVENT_SUBSCRIBE,
    EVENT_UNSUBSCRIBE,
    chat,
    connect,
    verbose
  };
})());
