Point of Sale
=======

Proof of concept as to what a point of sale (POS) system might look like using the real-time Web.  The scenario provided takes place in a typical coffee shop environment where a variety of deserts might also be ordered.  There are two main screens - the register and the digital wallet.

Register
=======

The register screen is what would be presented to a cashier at the counter.  It is designed to fit a tablet form-factor.  The clerk logs in with their employee identification number, and then is presented a screen with the products available for sale.

At this point it is assumed that a customer approaches the counter, and desires to purchase some deserts from the menu.  The clerk can tap on items to add them to a cart, with tax and total being displayed.  Also displayed is a QR code.  The customer can scan the QR code to joint the transaction on their smartphone at any time.

Digital Wallet
=======

When the customer joins the transaction, they are presented with the items, tax, and total of their purchase thus far.  A last value cache handles late joining.  As more items are added at the register, more items appear on the customer's device.  When the customer is done with their order, the clerk presses a button on the register to start the payment process.

Payment
=======

When the clerk has signaled that the order is complete, the digital wallet presents a button for the customer to accept the charges.  When they accept the charges, the customer is advanced to a screen with their various payment methods.  These take the visual form of credit cards.  Swiping a card up and off the smartphone screen will in turn show it going across the register screen.  The register screen will the zero out and initiate a new transaction while the credit card slides back onto the digital wallet screen.

Upsell
=======

With the entire transaction now complete, the customer is presented with special offers at the store.  Programmatically, one of the items purchased during the demo is randomly selected, and then a random amount of discount is offered.  Two buttons are available in the digital wallet.  The first button chooses to pass on the discount, and returns the user to a home screen.  The second button accepts the discount, which is then added to their device calendar as a reminder.

Web
=======

The entire user interface is handled using Web standards.  No additional hardware or native integration is required.  This makes this scenario broadly applicable in commercial markets.  The only hardware upgrade required on premisis would be the replacement of outdated POS systems with a wirelessly connected tablet with a modern browser.

Kaazing Gateway
=======

Many point of sale (POS) systems today use dedicated communication lines for transactions.  This is in addition to the wireless service provided by the store to the customers.  It is generally considered insecure to use the public Internet for transaction purposes.  Kaazing Gateway solves this problem by securing the Internet such that it works like a VPN, but without the tokens and specialized software.

Parse
=======

The infrastructure behind this proof of concept is designed to be as close to a real POS as possible.  As such, [Parse](http://parse.com) is used for data storage.  There are entities for clerks, stores, items available for purchase, transaction history, network endpoints, and even localization.  Communication with Parse happens from the client for ease of portability of the POC, but could be equally placed on server infrastructure, or replaced outright with a NoSQL or relational system.

Offline
=======

An offline version is included, but is very crippled.  The offline version is designed to support specific field sales scenarios where no network connectivity is present or available - such as is the case inside the offices of payment processing vendors.  Many defaults are hard-coded into the system, or loaded from a local JSON file via XHR.
