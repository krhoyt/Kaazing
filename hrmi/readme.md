Heart Rate
=======

Gather data from an off the shelf heart rate monitor and distribute it across the web in real time.

Polar T31
=======

To capture heart rate, a **Polar T31** sensor strap is worn around the chest.  The Polar strap reports heart rate over a wireless connection to a nearby radio.

HRMI Breakout
=======

A **SparkFun HRMI** breakout board connects to the Polar strap and gathers the data using proprietary Polar microcontroller.  The HRMI breakout then reports that data over I2C (serial).  Data can be raw or averaged for smoothness.  Averaging is used in this application.

Arduino Yun
=======

An **Arduino Yun** (Cloud) board is connected to the SparkFun HRMI sensor via I2C (serial).  The Arduino microcontroller on the Arduin Yun gathers that data and sends it to the Linux OS also running on the Arduin Yun.  

> Note tha the Ardiuno Yun uses digital pins 2 and 3 for SDA and SCL respectively.  This is different from other Arduno boards.

PHP
=======

**PHP** is running on the Linux OS on the Arduino Yun.  A PHP script is called via the bridge mechanism on the Arduino Yun.  The heart rate data is passed as an argument to the PHP script.  

The PHP script leverages a **STOMP** library to connect over wireless (a/b/g/n) to an **ActiveMQ** message broker running on **Amazon EC2**.  **Kaazing Gateway** is also installed on the Amazon EC2 instance.  Gateway provides real-time connectivity to other clients subscribed to the topic.

Web
=======

The browser of your choice (desktop and tablet tested) can be used to load a page from the Amazon EC2 instance for viewing of the heart rate data.  **JavaScript** is used to open a persistent **Web Socket** connection to Kaazing Gateway.  With the connection open, data flows freely to the browser (client).

**SVG** is used to chart the data as it arrives.  **GreenSock TweenMax** is used to animated the chart across the screen.  The user interface displays the current reading, and tracks readings since connecting to provide high, low, and average readings.  **Google Web Fonts** are used for clean rendering of the text.
