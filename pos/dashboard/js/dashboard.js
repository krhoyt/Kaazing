$(document).ready(function() {

	//Constructing WebSocket URL dynamically, based on the URL of the HTML page
	// var DEFAULT_ENDPOINT =
	// "ws://" + window.location.hostname
	// + (window.location.port == "" ? ":80" : ":"
	// + window.location.port)
	// + "/jms";

	var WS_PROTOCOL = "ws"
	var WS_SERVER_HOST = "kaazing.kevinhoyt.com";
	var WS_PORT = "8001";
	var SERVER_PATH = "/projects/pos/";
	var SERVER_HOST = "kevinhoyt.com";
	var WEBSOCKET_URL = WS_PROTOCOL + "://" + WS_SERVER_HOST + ":" + WS_PORT + "/jms";
	var TOPIC_NAME = "/topic/pos";
	var IN_DEBUG_MODE = true;

	//Keys to access data from Parse
	var PARSE_APPLICATION = "BkyGNTBvPzhwd32zSiKmsxaFN719abjjQ4lPySiv";
	var PARSE_KEY = "0KDnIgzlUzQryGTjgw3ObhM2yEW0Bkrh1m6Qs8ck";

	// Parse data structure
	Clerk = Parse.Object.extend( "Clerk" );
	Layout = Parse.Object.extend( "Layout" );
	Login = Parse.Object.extend( "Login" );
	Product = Parse.Object.extend( "Product" );
	Purchase = Parse.Object.extend( "Purchase" );
	Register = Parse.Object.extend( "Register" );
	Transaction = Parse.Object.extend( "Transaction" );

	// Message actions
	var REGISTER_LOCATION = "registerLocation";
	var TRANSACTION_READ = "transactionRead";
	var POS_TRANSACTION = "customerSwipe";
	var REGISTER_READ = "registerRead";
	var DASHBOARD = "dashboard";
	var POS_LOGIN = "posLogin";
	var DASHBOARD_RANDOM_TRANSACTION = "dashboardRandomTransaction";
	var TRANSACTION_ACCEPT = "transactionAccept";

	var CLIENT_RECORDS = [POS_TRANSACTION];
	var VENDOR_RECORDS = [REGISTER_LOCATION, POS_LOGIN, POS_TRANSACTION, TRANSACTION_ACCEPT];
	var SYSTEM_RECORDS = [REGISTER_LOCATION, TRANSACTION_READ, POS_LOGIN, POS_TRANSACTION, TRANSACTION_ACCEPT, DASHBOARD_RANDOM_TRANSACTION];

	var DEFAULT_RECORDS = SYSTEM_RECORDS;

	var dbParam = URLParser( window.location.href ).getParam( "db" );
	var dashboardRecords;

	var history = null;
	var amountSettled;

	switch (dbParam) {
	case 'client':
		dashboardRecords = CLIENT_RECORDS;
		$("#innerContainer").addClass("clientContainer");
		$("body").addClass("clientBody");
		break;
	case 'vendor':
		dashboardRecords = VENDOR_RECORDS;
		$("#innerContainer").addClass("vendorContainer");
		$("body").addClass("vendorBody");
		break;
	case 'system':
		dashboardRecords = SYSTEM_RECORDS;
		$("#innerContainer").addClass("systemContainer");
		$("body").addClass("systemBody");
		break;
	default:
		dashboardRecords = DEFAULT_RECORDS;
		$("#innerContainer").addClass("systemContainer");
		$("body").addClass("systemBody");
	}

	var vendor = "Kaazing";
	var client = {name : "John Doe"};

	var doConnect = function() {
		// Connect to JMS, create a session and start it.
		var jmsConnectionFactory = new JmsConnectionFactory(WEBSOCKET_URL);
		try {
			//Creating connection
			var connectionFuture = jmsConnectionFactory.createConnection(function() {
				if (!connectionFuture.exception) {
					try {
						connection = connectionFuture.getValue();
						connection.setExceptionListener(handleException);

						consoleLog("Connected to " + WEBSOCKET_URL);
						session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);

						connection.start(function() {
							// Callback logic comes here.
							//
							consoleLog("JMS session created");
							var myTopic = session.createTopic(TOPIC_NAME);
							consoleLog("Topic created: " + TOPIC_NAME);
							topicConsumer = session.createConsumer(myTopic);
							consoleLog("Topic consumer created...");

							topicConsumer.setMessageListener(handleTopicMessage);
						});
					} catch (e) {
						handleException(e);
					}
				} else {
					handleException(connectionFuture.exception);
				}
			});
		} catch (e) {
			handleException(e);
		}
	};

	//Function invoked when a new message arrives
	var handleTopicMessage = function(message) {
		consoleLog("Message received: " + message.getText());

		//Constructing a readable date/time format
		var currentdate = new Date();
		var datetime = (currentdate.getMonth()+1) + "/"
		+  currentdate.getDate() + "/"
		+ currentdate.getFullYear() + " - "
		+ currentdate.getHours() + ":"
		+ (currentdate.getMinutes() < 10 ? "0" : "")
		+ currentdate.getMinutes() + ":"
		+ (currentdate.getSeconds() < 10 ? "0" : "")
		+ currentdate.getSeconds();

		var msg = JSON.parse(message.getText());
		var lineItem = dashboardItem(msg);
		if (lineItem) {
			//Adding a new row using the newly arrived message
			t.row.add( [
				'',
				datetime,
				msg.desc,
				msg.details,
				msg.html1,
				msg.html2,
				msg.html3
				] ).draw();
			}
		};

		var dashboardItem = function(msg) {
			if (msg.action == REGISTER_READ && dashboardRecords.indexOf(REGISTER_READ) > -1) {
				vendor = msg.register.vendorName;
			}
			if (msg.action == REGISTER_LOCATION && dashboardRecords.indexOf(REGISTER_LOCATION) > -1) {
				msg.desc = vendor + " certified register online";
				msg.details = '<a href="https://www.google.com/maps/place/' + msg.location.address + '">' + msg.location.address + '</a>';
				msg.html1 = '<iframe width="600" height="225" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/search?key=AIzaSyDl3lD2JxRC-Bl7RXj8LipdXqfd2ZeL8Qg&q=' + msg.location.address + '"></iframe>'
				msg.html2 = '';
				msg.html3 = '';
			}
			else if (msg.action == TRANSACTION_READ && dashboardRecords.indexOf(TRANSACTION_READ) > -1) {
				msg.desc = msg.register.vendorName + " certified register and customer wallet connected";
				msg.details = "Vendor: " + msg.register.vendorName;
				msg.html1 = '<b>' + msg.register.vendorName + '</br>';
				msg.html2 = '<img height=40 src=http://' + SERVER_HOST + SERVER_PATH + msg.register.vendorPath + '/' + msg.register.vendorLogo + '>';
				msg.html3 = '';
			}
			else if (msg.action == POS_LOGIN && dashboardRecords.indexOf(POS_LOGIN) > -1) {
				msg.desc = "Clerk successfully signed in to POS";
				msg.details = "Authentication successful";
				msg.html1 = "Clerk ID: " + msg.login.clerkId.objectId;
				msg.html2 = "POS ID: " + msg.login.registerId.objectId;
				msg.html3 = '';
			}
			else if (msg.action == POS_TRANSACTION && dashboardRecords.indexOf(POS_TRANSACTION) > -1) {
				msg.desc = "Payment transaction settled: $" + amountSettled;
				msg.details = "Customer name: " + msg.card.name;
				msg.html1 = 'Customer name: ' + msg.card.name;
				msg.html2 = 'Card number: xxxx xxxx xxxx ' + msg.card.number.substr(msg.card.number.length-4);
				msg.html3 = 'Expiration date: ' + msg.card.expires;
			}
			else if (msg.action == TRANSACTION_ACCEPT && dashboardRecords.indexOf(TRANSACTION_ACCEPT) > -1) {
				amountSettled = msg.total;
				return false;
			}
			else if (msg.action == DASHBOARD_RANDOM_TRANSACTION && dashboardRecords.indexOf(DASHBOARD_RANDOM_TRANSACTION) > -1) {
				msg.desc = "Random transaction";
				msg.details = "";
				msg.html1 = '';
				msg.html2 = '';
				msg.html3 = '';
			}
			else {
				return false;
			}
			return true;
		};

		//If logging is on, writing the log message to the browser console
		var consoleLog = function(text) {
			if (IN_DEBUG_MODE) {
				console.log(text);
			}
		};

		// When there's an exception, it should be logged
		// (depending on the logging settings)
		var handleException = function (e) {
			consoleLog("EXCEPTION: " + e);
		};

		var t = $('#dashboard').DataTable({
			"columns": [
			{
				"class":          'details-control',
				"orderable":      false,
				"data":           null,
				"defaultContent": ''
			},
			{  },
			{  },
			{  }
			],
			"order" : [[0, 'desc']]
		});

		var format = function(d) {
			// `d` is the original data object for the row
			consoleLog (d);
			return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
			'<tr>' + '<td>' + d[4] + '</td>' + '</tr>' +
			'<tr>' + '<td>' + d[5] + '</td>' + '</tr>' +
			'<tr>' + '<td>' + d[6] + '</td>' + '</tr>' +
			'</table>';
		};

		// Add event listener for opening and closing details
		$('#dashboard tbody').on('click', 'td.details-control', function () {
			var tr = $(this).closest('tr');
			var row = t.row( tr );

			if ( row.child.isShown() ) {
				// This row is already open - close it
				row.child.hide();
				tr.removeClass('shown');
			}
			else {
				// Open this row
				row.child( format(row.data()) ).show();
				tr.addClass('shown');
			}
		} );

		var loadHistory = function() {
			Parse.initialize( PARSE_APPLICATION, PARSE_KEY );
			var query = null;

			query = new Parse.Query( Transaction );
			query.include( "clerkId" );
			query.include( "registerId" );
			query.find( {
				success: function( results ) {
					consoleLog( "Transactions:" );
					consoleLog( results );
					history = results;
					for (var record in results) {
						consoleLog (results[record].id);
						loadTransaction (results[record].id);
					}
					// loadTransaction("DsOJ164k7m");

				},
				error: function( error ) {
					consoleLog( "Error getting history." );
					consoleLog( error );
				}
			} );
		};

		var loadTransaction = function (id) {

			// var index = null;
			var query = null;
			var random = null;

			// index = Math.floor( Math.random() * history.length );

			random = new Transaction();
			// Bunch of junk data from testing
			// Many transactions have no purchase items
			// random.id = history[index].id;
			// random.id = "DsOJ164k7m";
			random.id = id;

			query = new Parse.Query( Purchase );
			query.include( "productId" );
			query.equalTo( "transactionId", random );
			query.find( {
				success: function( results ) {
					var purchases = null;
					var message = null;

					console.log( "Transaction details:" );
					console.log( results );

					// Parse.com objects do not survive serialization well
					// Force into a more simple structure before sending
					purchases = new Array();

					for( var p = 0; p < results.length; p++ )
						{
							purchases.push( {
								objectId: results[p].get( "productId").id,
								imageLarge: results[p].get( "productId").get( "imageLarge" ),
								imageSmall: results[p].get( "productId").get( "imageSmall" ),
								imagePath: results[p].get( "productId").get( "imagePath" ),
								name: results[p].get( "productId").get( "name" ),
								price: results[p].get( "productId").get( "price" )
							} );
						}

						console.log ('Purchases: ' + JSON.stringify(purchases));

						// message = {
						// 	action: "dashboardRandomTransaction",
						// 	transaction: history[index],
						// 	purchases: purchases
						// };
						//
						// producer.send(
						// 	session.createTextMessage( JSON.stringify( message ) ),
						// 	doMessageSent
						// );
					},
					error: function( error ) {
						console.log( "Error getting random transaction." );
						console.log( error );
					}
				} );
			};

			//Populating table with historic data
			// loadHistory();

			//Invoking the code that establishes the connection to KAAZING
			doConnect();

		});
