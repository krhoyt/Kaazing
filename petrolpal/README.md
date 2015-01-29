PetrolPal
=======

This is a variation on the POS example.  The scenario is that of a person looking to fill up the gas tank in their car.  The first goal is to find the nearest gas/petrol station with the best pricing.  Once the driver has arrived at the station, they use their smartphone to communication details of the transaction with the pump itself.  As a physical pump is difficult to transport, a pump user interface is presented for tablet or desktop browser users.

Digital Wallet
=======

Unlike the POS example, which starts with the store, the PetrolPal example starts with the consumer.  Designed to look and behave like a native application, but presented in a mobile web browser, the PetrolPal application is launched by the consumer.  After a brief moment for geolocation, a map is shown with graphics indicating the nearest stations.  A list is also shown to indicate the prices at each station.  The consumer can then figure out which location they would like to use.

Upon arriving at the station, the consumer pulls up to an available pump.  Opening the PetrolPal application once more, they can then choose the desired station from the aforementioned list.  With a location selected, the next step is to identify the pump at which the car/auto is located.  As each pump has a numeric indicator on it, the user enters the pump number and a handshake occurs between the smartphone and the pump itelf.

Pump
=======

When the pump and smartphone have negotiated communication, the pump shows a message that the two are linked.  Unlike a store where physical items are purchased, and then paid for once tallied, the payment method for fuel is negotiated before the pumping can proceed.  While the pump shows a message that it is linked with the smartphone, the device shows a screen allowing the selection of a payment method.

The payment method screen happens in a similar fashion to the POS demo.  For the purposes of visual continuity, graphic representations of credit cards are presented.  The customer can select from the available payment options, and then swipe the selected card off the top of the screen.  As the card leaves the smartphone screen, it appears on the pump screen, and then returns back to the device.  At this point, the means of payment has been negotiated between the pump and the smartphone.

The pump now shows a screen instructing the user to select a fuel grade, and to begin fueling.  While the fueling process is happening, the amount of fuel and total price are displayed in real-time on both the pump and the smartphone.  The smartphone will also display an upsell special.

A completed fueling process is indicated by returning the handle to the pump.  At this time, the pump screen returns to the first state, waiting for the next customer.  It is assumed that the customer can pay using this streamlined real-time method, or traditional means.  The PetrolPal application return the user to the map screen.

Usage Notes
=======

* Before the demonstration begins, the pump screen should be loaded and a specific station selected from the presented list.  This should be the same station selected from the smartphone application.

* When using the pump, press and hold the space bar to indicate the traditional fueling process.  This can start and stop as often as needed.  Press the Enter key to indicate returning the handle to the pump.  This will effectively end the transaction.

* This example is not as robust as the POS demonstration, and does not include infrastructure, or security hooks required by the payment industry.  These could be added, but were left out for timely production.
