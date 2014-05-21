Kaazing
=======

Collection of work from Kaazing.

HRMI
=======

What does your heart rate look like when you are on stage presenting?

Having presented at hundreds of events over the years, I always wondered how my body reacts to being on the stage.  I purchased an HRMI breakout some time ago, but never really put it to use.  With the growing interest in the Internet of Things (IoT), and wearable computing, I finally got around to putting the system together.  A heart rate sensor is worn, and the data is reported wireless in real time.  A browser client is provided to view the data from the audience perspective.  A flaw of wearables is that they capture the data in real time, but report it in batch.  In order to be truly useful, you need that data as it happens, and need to be alerted of critical changes.

Telemetry
=======

Would it be possible to record data telemetry from an aircraft in real time?  

This project establishes a baseline sensor array to provide the common "six pack" of instrumentation necessary to fly an aircraft.  Also included is an an RF radio to broadcast the data over distance while in flight.  The sensor array is attached to a Phantom DJI quadcopter as an example aircraft (expensing an actual commercial aircraft was out of the question).  Data is reported wirelessly, and is recorded in multiple formats for playback at a later date.  The data is also passed along in real time to Kaazing Gateway where it is made available for interested clients (web or native).

Tic Tac Toe
=======

Will a physical Internet of Things (IoT) light encourage real-time audience participation?

Presentations are always better when you can show real world, working examples.  This means the construction of a portable physical device that connects to cloud services and is accessible over the Internet.  Cloud services for this project showcase Kaazing Gateway deployed from AWS Marketplace onto Amazone EC2.  Run your own real-time cloud in minutes!  Hardware leveraged to build this IoT device include everyting from foam core board and glue, to an Arduino Yun communicating to the cloud via the STOMP protocol.  Audience participation is accomplished through a web-based user interface.
