Tic Tac Toe
=======

Allows multiple users to control a physical lighting display through the browser in real-time.

Enclosure
=======

The physical enclosure is constructed from foam core board in this initial version.  Can be easily updated for laser cutting in the future.  The foam core board is held together using **Elmer's Glue** (like you would use in grade school).  All cuts were made using a **Walnut Hollow** heated hot knife (**Xacto**).

The layers are as follows (from front to back):

 - Front panel with nine (9) windows
 - Sheet of vellum to diffuse color
 - Cross-sections that block light spillover
 - Array of nine (9) spaced **Adafruit NeoPixels**
 - Standoff provide gap between layers
 - **Arduino Yun** mounted to inside of layer

The NeoPixel, standoff, and Arduino Yun layers are mounted as a single piece.  They slide inside a series of walls that form the box of the enclosure itself.  A hole is cut in one wall to allow for a micro USB cable which provides power to the unit.

The NeoPixels are breadboard friendly and soldered with the necessary standard male headers.  A vector representation of the NeoPixels was extracted using a stripped **Eagle** file (available from Adafruit) and placed using **Adobe Illustrator**.  Holes to fit the male headers were cut into the foam core board.

The NeoPixels are glued in place, and are chained together using 30 AWG wire.  The wire was placed initially using a wire-wrapping tool, then soldered in place after initial testing.  

The Arduino Yun is mounted with three (3) screws (unknown sizing).  There is also a small standoff (unknown sizing) for each screw that keeps the Arduino Yun from resting directly on the foam core board.

A power and ground wires are soldered to standard male headers and placed into the Arduino Yun on one end.  The other end is wire-wrapped to the first NeoPixel unit and soldered in place.  A similar configuration is used for the signal pin (D8).

Adafruit NeoPixel
=======

The Adafruit NeoPixel is an RGB LED that provides for daisy chaining and addressable control.  The NeoPixel requires only three (3) wires for control.  One wire for power.  One wire for ground.  And one wire for signal.  Additional NeoPixel unites can be chained from three (3) outbound wires (power, ground, and signal out).  This can be accomplished for up to sixty (60) units.  Adafruit provides a library to adress and control the units.

Arduino Yun
=======

The Arduino Yun is leveraged for this project due to its wireless capability.  The Arduino Yun additionally includes a Linux system on a chip (SoC).  Outside of implicit *Bridge* functionality, the Linux side of the Arduino Yun was not used for this project.

The sketch that powers this project uses the *YunClient* class to establish a socket connection to an **ActiveMQ** instance residing on **Amazon EC2** leveraging **Kaazing Gateway** from the **AWS Marketplace**.  Once the connection is established, a rough implementation of the **STOMP** protocol is leveraged to subscribe to messages coming from the broker.

> The STOMP implementation used in this project is far from complete.  It handles basic connection negotiation, subscription to a specific topic, and incoming messages from the broker.  If there is interest, I would like to roll this into a more official implementation.

Messages arriving from the broker are expected to be in the format of LED index, red, green, blue (e.g. 1,255,0,0).

Web
=======

A web page provides the user interface for this project.  The user interface presents the front of the enclosure with the nine (9) light windows.  Clicking on a window presents a **JavScript** powered color picker.  Clicing on a color from the picker sets the color of that window to the selected color in the user interface.  

Once a color has been selected, and the user interface updated to match, the selected window index and color pairing are sent via Kaazing Gateway to the ActiveMQ broker.  Kaazing Gateway provides a real-time communication for this **Internet of Things** (IoT) project.  The messages arrive to the physical enclosure from the broker, and the appropriate NeoPixel is set to the matching color.

The selected window and color pairing are also communicated to any other connected clients (browsers).  In this fashion, all clients stay in sync with each other and the physical enclosure itself.  Welcome to the real-time Internet of Things powered by Kaazing!