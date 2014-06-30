$(document).ready(function() {

	//Constructing WebSocket URL dynamically, based on the URL of the HTML page
	// var WEBSOCKET_URL =
	// "ws://" + window.location.hostname
	// + (window.location.port == "" ? ":80" : ":"
	// + window.location.port)
	// + "/jms";
	var WEBSOCKET_URL = "ws://kaazing.kevinhoyt.com:8001/jms";
	var TOPIC_NAME = "/topic/pos";
	var IN_DEBUG_MODE = true;
	var DEBUG_TO_SCREEN = false;

	var POS_CLERK = "posClerk";
	var POS_LAYOUT = "posLayout";
	var POS_LOGIN = "posLogin";
	var POS_TRANSACTION = "posTransaction";
	var PURCHASE_ADD = "purchaseAdd";
	var PURCHASE_CLEAR = "purchaseClear";
	var PURCHASE_REMOVE = "purchaseRemove";
	var REGISTER_LOCATION = "registerLocation";
	var REGISTER_READ = "registerRead";

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
		+ currentdate.getSeconds() + "."
		+ (currentdate.getMilliseconds() < 100 ? "0" : "")
		+ currentdate.getMilliseconds();

		var msg = JSON.parse(message.getText());
		var lineItem = dashboardItem(msg);
		if (lineItem) {
			//Adding a new row using the newly arrived message
			t.row.add( [
				'',
				datetime,
				msg.desc,
				msg.details,
				msg.map
				] ).draw();
			}
		};

		var dashboardItem = function(msg) {
			if (msg.action == REGISTER_LOCATION) {
				msg.desc = "American Express certified register connected";
				msg.details = '<a href="https://www.google.com/maps/place/' + msg.location.address + '">' + msg.location.address + '</a>';
				msg.map = '<iframe width="600" height="225" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/search?key=AIzaSyDl3lD2JxRC-Bl7RXj8LipdXqfd2ZeL8Qg&q=' + msg.location.address + '"></iframe>'
				console.log (msg.details);
				return true;
			}
			else {
				return false;
			}
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
				console.log (d);
				return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
				'<tr>'+
				'<td>Location:</td>'+
				'<td>' + d[4] + '</td>' +
				// '<td><img src="http://bwalles.com/wp-content/uploads/2013/05/cute_small_cat_wallpaper.jpg" width="256"></td>'+
				'</tr>'+
				'<tr>'+
				'<td>More details:</td>'+
				'<td>coming here...</td>'+
				'</tr>'+
				'<tr>'+
				'<td>Extra info:</td>'+
				'<td>And any further details here (images etc)...</td>'+
				'</tr>'+
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
