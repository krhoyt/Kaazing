$(document).ready(function() {

	//Constructing WebSocket URL dynamically, based on the URL of the HTML page
	var WEBSOCKET_URL =
	"ws://" + window.location.hostname
	+ (window.location.port == "" ? ":80" : ":"
	+ window.location.port)
    // + "8001")
	+ "/jms";

	// var WS_PROTOCOL = "ws"
	// var WS_SERVER_HOST = "wallet.kaazing.com";
	// var WS_PORT = "80";
	var SERVER_PATH = "/projects/pos/";
	var SERVER_HOST = "wallet.kaazing.com";
	// var WEBSOCKET_URL = WS_PROTOCOL + "://" + WS_SERVER_HOST + ":" + WS_PORT + "/jms";
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
	var REGISTER_LOCATION = "registerCreate";
	var TRANSACTION_READ = "transactionRead";
	var POS_TRANSACTION = "customerSwipe";
	var REGISTER_READ = "registerRead";
	var DASHBOARD = "dashboard";
	var POS_LOGIN = "posLogin";
	var DASHBOARD_RANDOM_TRANSACTION = "dashboardRandomTransaction";
	var TRANSACTION_ACCEPT = "transactionAccept";
	var NOTIFICATION_CREATE = "notificationCreate";
	var CARD_SWIPE = "cardSwipe";
  var CARD_CHARGED = "cardCharged";

	var SYSTEM_RECORDS = [CARD_SWIPE, CARD_CHARGED, POS_LOGIN, POS_TRANSACTION, TRANSACTION_ACCEPT, DASHBOARD_RANDOM_TRANSACTION];
	var CLIENT_RECORDS = [CARD_SWIPE, CARD_CHARGED, TRANSACTION_READ, POS_LOGIN, POS_TRANSACTION, TRANSACTION_ACCEPT, DASHBOARD_RANDOM_TRANSACTION];
	var VENDOR_RECORDS = [REGISTER_LOCATION, NOTIFICATION_CREATE, CARD_SWIPE, CARD_CHARGED, TRANSACTION_READ, POS_LOGIN, POS_TRANSACTION, TRANSACTION_ACCEPT, DASHBOARD_RANDOM_TRANSACTION];

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
		$("#dashboardTitle").html('<h1>Cardholder\'s Transactions</h1><center><a href="index.html">Card Issuer</a> | <a href="index.html?db=vendor">Merchant</a> | <b>Credit Card Owner<b></center>');
		break;
	case 'vendor':
		dashboardRecords = VENDOR_RECORDS;
		$("#innerContainer").addClass("vendorContainer");
		$("body").addClass("vendorBody");
		$("#dashboardTitle").html('<h1>Merchant\'s Dashboard</h1><center><a href="index.html">Card Issuer</a> | <b>Merchant</b> | <a href="index.html?db=client">Credit Card Owner</a></center><p align="right">Merchant #: <b>8430928712</b>&nbsp;&nbsp;&nbsp;');
		break;
	default:
		dashboardRecords = SYSTEM_RECORDS;
		$("#innerContainer").addClass("systemContainer");
		$("body").addClass("systemBody");
		$("#dashboardTitle").html('<h1>Dashboard - Card Issuer\'s View</h1><center><b>Card Issuer</b> | <a href="index.html?db=vendor">Merchant</a> | <a href="index.html?db=client">Credit Card Owner</a></center>');
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
			if (msg.client.action == REGISTER_READ && dashboardRecords.indexOf(REGISTER_READ) > -1) {
				vendor = msg.register.vendorName;
			}
			if (msg.client.action == REGISTER_LOCATION && dashboardRecords.indexOf(REGISTER_LOCATION) > -1) {
				// msg.desc = vendor + " certified register online";
				msg.desc = "Certified register online.";
				msg.details = '<a href="https://www.google.com/maps/place/' + msg.content.address + '">' + msg.content.address + '</a>';
				msg.html1 = '<iframe width="600" height="225" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/search?key=AIzaSyDl3lD2JxRC-Bl7RXj8LipdXqfd2ZeL8Qg&q=' + msg.content.address + '"></iframe>'
				msg.html2 = '';
				msg.html3 = '';
			}
			else if (msg.client.action == NOTIFICATION_CREATE && dashboardRecords.indexOf(NOTIFICATION_CREATE) > -1) {
				msg.desc = "POS transaction started.";
				msg.details = "Transaction secure.";
				msg.html1 = '';
				msg.html2 = 'Transaction ID: <b>' + msg.content.transaction + '</br>';
				msg.html3 = '';
			}
			else if (msg.client.action == TRANSACTION_READ && dashboardRecords.indexOf(TRANSACTION_READ) > -1) {
				msg.desc = "Connection established between certified cash register and customer wallet.";
				msg.details = "Transaction ID: " + msg.content.transactionId;
				msg.html1 = "Cash register successfully connected to customer wallet.";
				msg.html2 = 'Transaction ID: ' + msg.content.transactionId;
				msg.html3 = '';
			}
			else if (msg.client.action == CARD_SWIPE && dashboardRecords.indexOf(CARD_SWIPE) > -1 && msg.client.reply != '/topic/pos.ed') {
			// 	if (dbParam == 'client') {
			//
			// 	}
			// else {
			//
			// }
				msg.desc = "Customer credit card charged.";
				msg.details = "Customer name: " + msg.content.name;
				if (dbParam == 'client') {
					msg.html1 = 'Merchant: Bosporus Mediterranean Fine Dining - Karthago, IL';
					msg.html2 = '';
				}
				else if (dbParam == vendor){
					msg.html1 = 'Customer name: ' + msg.content.name;
					msg.html2 = 'Card expiration date: ' + msg.content.expires;
				}
				else {
					msg.html1 = 'Merchant #: 84729272 | Card Transaction #: 61238713'
					msg.html2 = 'Merchant name: Bosporus Mediterranean Fine Dining';
					msg.html3 = 'Customer name: ' + msg.content.name + " - Card expiration date: " + msg.content.expires;
				}
				if (dbParam == 'vendor') {
					var element = document.createElement ('div');
					element.innerHTML = msg.content.number;
					if (element.firstChild.childNodes.length > 0) {
						msg.html3 = 'Customer credit card number: xxxx xxxx xxxx ' + element.firstChild.innerHTML.substr(element.firstChild.innerHTML.length-4)
					}
					else {
						msg.html3 = 'Customer credit card number: xxxx xxxx xxxx ' + msg.content.number.substr(msg.content.number.length - 4);
					}

				}
				else {
					msg.html3 = 'Customer credit card number: ' + msg.content.number;
				}

			}
			else if (msg.client.action == CARD_CHARGED && dashboardRecords.indexOf(CARD_CHARGED) > -1 && msg.client.reply != '/topic/pos.ed') {
				msg.desc = "Credit card payment settled.";
				msg.details = "Transaction complete.";
				msg.html1 = '';
				msg.html2 = '';
				msg.html3 = '';
			}
			else if (msg.client.action == DASHBOARD_RANDOM_TRANSACTION && dashboardRecords.indexOf(DASHBOARD_RANDOM_TRANSACTION) > -1) {
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

			//Invoking the code that establishes the connection to KAAZING
			doConnect();

		});
