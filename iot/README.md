Internet of Things
=======

While there are a number of IoT demonstrations in this repository, they are all examples built to demonstrate the connectivity, rather than the possibility.  These IoT demonstrations focus more on IoT as a solution in various markets.  Three markets are presented: smart building, transportation/logistics, and retail.  Each solution uses a different underlying set of hardware.  A "skeleton" example is also included which shows access USB serial data from an Arduino, and getting the content onto the message bus via Kaazing Gateway.

Smart Buildings
=======

Can real-time IoT bring value to industrial equipment that was deployed prior to widespread wireless access?

The setting for this demonstration is the modernization of already deployed commercial HVAC equipment.  There are countless of these systems in place today across the globe.  If you are reading this in an office, then there is a good chance that building has commercial HVAC system.  If the building is more than a decade old, then that equipment was manufactured and installed, before such equipment was connected to the Internet.  Leveraging SoC (System on a Chip) systems such as Intel Edison, these older machines could be modernized, and efficiencies gained for the owner.

Transportation/Logistics
=======

Fleet management is widely implemented fo carriers that can afford high-end commercial systems.  What about the rest?

Companies such as Qualcomm make commercial fleet tracking solutions for large companies.  These companies represent the tip of the iceberg of commercial fleets.  The vast amount of transportation/logistics happens at a much small scale.  This might be the pizza delivery guy, flower store, or other LTL (Less Than Truckload) carriers, that get packages from clearing houses to the customer (store).  With the commoditization of IoT, this demonstration explores off-the-shelf components to provide real-time fleet tracking at a fraction of the cost.

Skeleton
=======

The "skeleton" is a boilerplate for developing real-time IoT solutions.  It includes a command-line Java application which accesses a USB serial port, and reads data from an Arduino.  The data retrieved from the Arduino is passed to a message broker via Kaazing Gateway.  A web page is included which acts as a client to the message broker.  When messages from the broker arrive, they are displayed on the web page.  This ability to connect an AMQP message broker such as RabbitMQ to the Web is a key feature of Kaazing Gateway.

Retail
=======

Digital payment cometh using the customer device. How does that integrate with existing POS (Point of Sale) systems?

The POS is the last barrier to the customer having an efficient shopping experience.  This demo explores two aspects to the point of sale.  The first is extending existing systems, securely, to the public Internet infrastructure.  Focused around the sales terminal itself, the real power of the demonstration would be the in the enterprise, centered around real-time supply chain management.  The second demonstration follows this by surfacing an Android application for the customer to check out on their own - but still integrating with the point of sale through real-time communication with Kaazing Gateway.
