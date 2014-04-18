/** 
 * Utility to create the connection URL based on the current page's location.
 * This assumes the page is being served by the Kaazing web gateway.
 * @param service the service to connect to (e.g. "jms")
 * @param protocol a string designating the protocol such as "http", "ws", etc. (optional, defaults to http or https based on window.location)
 * @return a web sockets URL: &lt;protocol&gt;://&lt;server&gt;:&lt;port&gt;/&lt;service&gt;
 */
function makeURL(service, protocol) {
    if (location.hash.substr(0,10) === "#ws.scheme") {
        protocol = location.hash.substr(11,location.hash.length);
    }
	if (location.hash === "#cleartext") {
	    protocol = "ws";
	}
	protocol = protocol || location.authority;
	// detect explicit host:port authority
	var authority = location.host;
	// if (location.search) {
		// authority = location.search.slice(1) + '.' + authority;
	// } else {
		// var hostPort = authority.split(':');
		// var ports = {
			// http : '80',
			// https : '443'
		// };
		// console.log(location.protocol);
		// authority = hostPort[0] + ':'
				// + ports[location.protocol.substr(0, location.protocol.length - 1)];
	// }
	return protocol + '://' + authority + '/' + service;
}