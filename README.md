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

Point of Sale
=======

Does a cashless POS have to mean vendor lock-in, or can the real-time Web help?

Point of Sale (POS) systems are, for the most part, pretty dated.  You can visit just about any grocery store to see that.  Aside from the hardware, the software is well documented to be a security risk, with many systems running years-old operating systems.  Modern solutions to go cashless tend to be proprietary, and require additional hardware.  This example explores what a POS transaction might look like using only the Web.  Kaazing Gateway provides real-time data exchange built on advanced wire security.

PetrolPal
=======

Drive up and swipe your credit card? Go inside to pay? Or just fuel up with the real-time Web?

An extension of the POS concept, this demonstration applies Kaazing Gateway and the real-time Web to solve pay-at-the-pump systems.  Part of this solution involves a (mobile Web-based) smartphone application that allows you to find the nearest gas station.  Once you arrive at a pump, a handshake negotiates the communication channel for transaction information.  Pump away and see the amount tick by not only on the pump, but on your smartphone too.  When done, payment is just a button tap away.  Then find out the specials going on inside the store.  Secure, fast and friendly payment solutions with Kaazing Gateway and the real-time Web.

Sandbox
=======

Kaazing Gateway went open source in December 2014!  This is a wrapper for the AMQP client.

Kaazing Gateway offers numerous means for publish/subscribe.  For the purposes of open source, AMQP 0.91 was selected.  AMQP is a robust messaging protocol, which is great for enterprise application, but not so great to get started with event driven development.  To address this learning curve, I wrote a JavaScript wrapper that exposes only the most minimalistic publish/subscribe API.  The client library uses a free "sandbox" of Gateway.  This allows developers to get started with this exciting architecture with no need to install, register, or pay for anything.
