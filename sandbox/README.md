Sandbox
=======

The main JavaScript file is "kaazing-ce.js" which encapsulates all the AMQP functionality.  It loads the Gateway AMQP library, and even [Parse](http://parse.com) for usage tracking.  Various permutations of the library in use can be seen in the provided files.

* publish.html - An atomic example of publishing messages using the library
* subscribe.html - An atomic example of subscribing to messages using the library
* index.html - Integrates publishing and subscribing into a single example
* start.html - A finger-tracking example as feature on the open source web site
* chat.html - Real-time chat example using library functionality

Start
=======

The Kaazing Gateway open source [site](http://kaazing.org) features a quick start tutorial.  The tutorial tracks mouse and touch points across all connected clients.  It has been tested on desktop, tablet, and smartphone form factors.  Some devices will not register touch changes at less than 100 - 300 milliseconds.  As such, extra code exists to remove artifact touch point indicators that happened too fast to be handled by the device.

Chat
=======

In real-time systems, a chat application is the "Hello World" example.  This can certainly be achieved using the wrapper library with only a handful of lines of code.  However, as the example is so common, extra steps have been taken to encapsulate the functionality into the library.  This makes establishing a complete chat application a matter of a single line of JavaScript code.
