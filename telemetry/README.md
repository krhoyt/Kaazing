Telemetry
=======

Capture live sensor array data aboard a quadcopter, and report it in real-time across all connected clients.

Arduino
=======

An **Arduino Uno R3** serves as the micro-controller brains of the sensor collection platform.  

On top of that is a **GPS shield** with an **EM-406** module.  **TinyGPS+** is used to access the GPS sensor and report the data.  

On top of that is an **XBee shield**, which provides for transmitting the data sent to *Serial*.  A second XBee module mounted on an **XBee Explorer** board, and plugged into a computer via USB, receives the over-the-air data and passes it on to the serial port.  

A **prototyping shield** is on top of the XBee, and provides a surface for additional sensors.  

There are two sensors plugged into the prototyping shield - an **HIH-6130** for temperature and humidity, and an **LSM303** for compass and accelerometer.

There is also an **Adafruit NeoPixel** on the prototyping shield, which is designed to be controlled by incoming serial data.

Data is sampled about as fast as possible.  Given that the GPS unit only updates at about once per second, and getting humidity off the HIH-6130 takes a few microseconds, the actual update rate is about two-to-three times per second.

Java
=======

A Java program runs on the target computer, and listens to the serial port.  The **RxTx** library is used for native serial port access from Java.

When the Java program starts, it scans a pre-defined list of serial ports.  When it finds a match, it uses that serial port for the duration of the program life.

As data arrives, it is recorded in raw form to a local text file.  This acts as a log and a means to massage the data for playback of flights after they have ended.

A complete line of data is terminated by a newline coming across the serial port.  When that newline is detected, a text message is sent across **Kaazing Gateway**  to a message broker.  **ActiveMQ** is used as the message broker.

The Java program is also listening for incoming messages from the broker (delivered via Kaazing Gateway).  The text content of those messages is sent directly across the serial port for interpretation by the Arduino.  A specific case has been designed to turn on/off an RGB LED.

Node.js
=======

A simple Node.js client is listening to ActiveMQ for messages via **STOMP**.  Kaazing Gateway is not used here, as the assumption is that recording and playback would happen behind the firewall once data arrives.

When messages arrive at the Node.js client, the text content is parsed and stored in a **MongoDB** collection.

There are two collections.  One collection is called "sensor" and is designed to store sensor data.  The other collection is called "command" is use to store commands send from other clients to the sensor array.  All records contain a time stamp.

Web
=======

A web page is used to visualize the data telemetry in real time.  

Using Kaazing Gateway, the web page leverages **WebSocket** to connect to ActiveMQ to listen for and publish messages.  

As messages arrive, the text content is parsed into the various parts, and then passed on to components for visualization.  The components are drawn using **SVG**, and animated using **GreenSock TweenLite**.

A simple toggle switch component is also rendered using SVG.  Clicking on the toggle switch produces a command message.  The target destination of the command message is the Arduino.  The toggle controls an RGB LED.

Data Format
=======

There are a total of 23 pieces of data that arrive with each message.  Sample data dumps have been included in the repository for reference.  The format of each text message is as follows.

0. Aircraft
1. Latitude
2. Longitude
3. Altitude (meters)
4. Altitude (feet)
5. Speed (mps)
6. Speed (mph)
7. Heading (deg)
8. Month
9. Day
10. Year
11. Hour
12. Minute
13. Second
14. Centisecond
15. Compass (deg)
16. X-Axis (deg)
17. Y-Axis (deg)
18. Z-Axis (deg)
19. Farenheit
20. Celcius
21. Humidity
22. Flight # (UUID)
