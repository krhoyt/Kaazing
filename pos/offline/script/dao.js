var dao = {
    clerk: [
        // objectId
        // createdAt
        // updatedAt
        // authorization
    ],
    configuration: {
        objectId: "uMSGPjvCbJ",
        vendorName: "Chad",
        createdAt: new Date(),
        updatedAt: new Date(),
        vendorPath: "img",
        vendorLogo: "kaazing.svg",
        shortCode: "chad",
        notification: false,
        animationDelay: 5,
        endpoint: "ws://localhost:8001/jms",
        connecting: "Connecting to a Kaazing certified card holder ...",
        authorization: "303-522-3131",
        splashDelay: 5000,
        topic: "/topic/pos",
        currencySymbol: "$",
        currencyPayment: "Payment: $",
        currencyCharge: "Charge: $",
        taxRate: 0.0825,
        currencyAccepted: "Accepted: $",
        currencyPending: "Pending: $",
        currencyTotal: "Total: $",
        customerPin: "1234",
        qrCode: "http://localhost:8001/pos/wallet.html",
        fakeGPS: true
    },
    handshake: {
        objectId: null,
        transactionId: null,   // String
        createdAt: null,
        updatedAt: null,
        registerId: null,      // Pointer
        configurationId: null, // Pointer
        endpoint: null,
        topic: null,
        replyTo: null
    },
    layout: [
        {
            objectId: "ILZxdyNgye",
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: "AxrERoIypb",      // Pointer
            row: 3,
            column: 0,
            configurationId: "zwtHrNld0L" // Pointer
        }, {
            objectId: "nBy09FXRwj",
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: "kXDHrZ1Rag",      // Pointer
            row: 2,
            column: 0,
            configurationId: "zwtHrNld0L" // Pointer
        }, {
            objectId: "turjIZJsSz",
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: "Y5wCqmkoTP",      // Pointer
            row: 1,
            column: 2,
            configurationId: "zwtHrNld0L" // Pointer
        }, {
            objectId: "2xLUWKRXSs",
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: "biBKRSWvYm",      // Pointer
            row: 1,
            column: 1,
            configurationId: "zwtHrNld0L" // Pointer
        }, {
            objectId: "TwD5lqNj2f",
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: "47siguLdlD",      // Pointer
            row: 1,
            column: 0,
            configurationId: "zwtHrNld0L" // Pointer
        }, {
            objectId: "rfQNyeaZRA",
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: "Mb9cESOjwz",      // Pointer
            row: 0,
            column: 2,
            configurationId: "zwtHrNld0L" // Pointer
        }, {
            objectId: "yJiN2FNITi",
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: "UlOQKvkYnw",      // Pointer
            row: 3,
            column: 1,
            configurationId: "zwtHrNld0L" // Pointer
        }, {
            objectId: "72GKySTzvX",
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: "zOJDk3F3RQ",      // Pointer
            row: 1,
            column: 3,
            configurationId: "zwtHrNld0L" // Pointer
        }, {
            objectId: "6JOAcvXtkR",
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: "LZnaLFhqNP",      // Pointer
            row: 0,
            column: 0,
            configurationId: "zwtHrNld0L" // Pointer
        }, {
            objectId: "fe1erMNhN5",
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: "R3IgyvzPtl",      // Pointer
            row: 0,
            column: 3,
            configurationId: "zwtHrNld0L" // Pointer
        }, {
            objectId: "SL69Zsafkk",
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: "uOJXqyBU0T",      // Pointer
            row: 0,
            column: 1,
            configurationId: "zwtHrNld0L" // Pointer
        }, {
            objectId: "hFuwrbYFNn",
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: "iler9JYLin",      // Pointer
            row: 2,
            column: 1,
            configurationId: "zwtHrNld0L" // Pointer
        }
    ],
    login: [
        // objectId
        // clerkId - Pointer
        // createdAt
        // updatedAt
        // registerId - Pointer
    ],
    product: [
        {
            objectId: "iler9JYLin",
            name: "Spotted Dick",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 2,
            imagePath: "img",
            image: "spotted-dick.jpg"
        }, {
            objectId: "uOJXqyBU0T",
            name: "Cheesecake",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 3.5,
            imagePath: "img",
            image: "cheesecake.jpg"
        }, {
            objectId: "UlOQKvkYnw",
            name: "Malva Pudding",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 2,
            imagePath: "img",
            image: "malva-pudding.jpg"
        }, {
            objectId: "LZnaLFhqNP",
            name: "Chocolate Crackles",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 1.5,
            imagePath: "img",
            image: "chocolate-crackles.jpg"
        }, {
            objectId: "AxrERoIypb",
            name: "Basboosa",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 2.5,
            imagePath: "img",
            image: "basboosa.jpg"
        }, {
            objectId: "R3IgyvzPtl",
            name: "Barkram",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 2,
            imagePath: "img",
            image: "barkram.jpg"
        }, {
            objectId: "im8ZUV9jg0",
            name: "Alfajores",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 1.5,
            imagePath: "img",
            image: "alfajores.jpg"
        }, {
            objectId: "47siguLdlD",
            name: "Mango Rice",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 2.5,
            imagePath: "img",
            image: "mango-rice.jpg"
        }, {
            objectId: "biBKRSWvYm",
            name: "Gulab Jamun",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 2.5,
            imagePath: "img",
            image: "gulab-jamun.jpg"
        }, {
            objectId: "Y5wCqmkoTP",
            name: "Galaktoboureko",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 3,
            imagePath: "img",
            image: "galaktoboureko.jpg"
        }, {
            objectId: "kXDHrZ1Rag",
            name: "Mochi",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 2,
            imagePath: "img",
            image: "mochi.jpg"
        }, {
            objectId: "8MEA1Bg3Iv",
            name: "Jovair",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 100,
            imagePath: "img",
            image: "jovair.jpg"
        }, {
            objectId: "Mb9cESOjwz",
            name: "Nanaimo Bars",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 3,
            imagePath: "img",
            image: "nanaimo-bars.jpg"
        }, {
            objectId: "zOJDk3F3RQ",
            name: "Dobos Torta",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 3,
            imagePath: "img",
            image: "dobos-torta.jpg"
        }, {
            objectId: "6pPWmNiOv8",
            name: "Pepparkakor",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 5,
            imagePath: "img",
            image: "pepparkakor.jpg"
        }, {
            objectId: "EFJ04e2njf",
            name: "Apple Biscuit",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 4.5,
            imagePath: "img",
            image: "apple-biscuit.jpg"
        }, {
            objectId: "AaeYx2pZxU",
            name: "Oatmeal Raisin",
            createdAt: new Date(),
            updatedAt: new Date(),
            price: 3,
            imagePath: "img",
            image: "oatmeal-raisin.jpg"
        }
    ],
    purchase: [
        // objectId
        // createdAt
        // updatedAt
        // price
        // transactionId - Pointer
        // productId - Pointer
    ],
    register: {
        objectId: null,
        createdAt: null,
        updatedAt: null,
        location: {
            latitude: null,
            longitude: null
        },
        address: null,
        postalCode: null,
        topic: null,
        configurationId: null // Pointer
    },
    transaction: {
        objectId: null,
        createdAt: null,
        updatedAt: null,
        clerkId: null,    // Pointer
        registerId: null, // Pointer
        total: null
    },
    loadConfiguration: function (shortCode, callback) {
        this.configuration.objectId = generateRandomString();
        callback.success(this.configuration);
    },
    createRegister: function (register, callback) {
        this.register.objectId = generateRandomString();
        this.register.createdAt = new Date();
        this.register.updatedAt = new Date();
        this.register.location = register.location;
        this.register.address = register.address;
        this.register.postalCode = register.postalCode;
        this.register.topic = register.topic;
        this.register.configurationId = register.configurationId;

        callback.success(this.register);
    },
    findClerk: function (authorization, callback) {
        var result = null;

        for (var c = 0; c < this.clerk.length; c++)
        {
            if(this.clerk[c].authorization == authorization)
            {
                result = this.clerk[c];
                break;
            }
        }

        callback.success(result);
    },
    createClerk: function (clerk, callback) {
        clerk.objectId = generateRandomString();
        clerk.createdAt = new Date();
        clerk.updatedAt = new Date();

        this.clerk.push(clerk);

        callback.success(clerk);
    },
    createLogin: function (login, callback) {
        login.objectId = generateRandomString();
        login.createdAt = new Date();
        login.updatedAt = new Date();

        this.login.push(login);

        callback.success(login);
    },
    findProduct: function (productId) {
        var result = null;

        for (var p = 0; p < this.product.length; p++)
        {
            if(this.product[p].objectId == productId)
            {
                result = this.product[p];
                break;
            }
        }

        return result;
    },
    findLayout: function (configurationId, callback) {
        for (var a = 0; a < this.layout.length; a++)
        {
            this.layout[a].productId = this.findProduct(this.layout[a].productId);
        }

        callback.success(this.layout);
    },
    createTransaction: function (transaction, callback) {
        this.transaction.objectId = generateRandomString();
        this.transaction.createdAt = new Date();
        this.transaction.updatedAt = new Date();
        this.transaction.clerkId = transaction.clerkId;
        this.transaction.registerId = transaction.registerId;

        callback.success(this.transaction);
    },
    createHandshake: function (handshake, callback) {
        this.handshake.objectId = generateRandomString();
        this.handshake.transactionId = handshake.transactionId;
        this.handshake.createdAt = new Date();
        this.handshake.updatedAt = new Date();
        this.handshake.registerId = handshake.registerId;
        this.handshake.configurationId = handshake.configurationId;
        this.handshake.endpoint = handshake.endpoint;
        this.handshake.topic = handshake.topic;
        this.handshake.replyTo = handshake.replyTo;

        callback.success(this.handshake);
    },
    createPurchase: function (purchase, callback) {
        for (var p = 0; p < this.product.length; p++)
        {
            if(this.product[p].objectId == purchase.productId)
            {
                purchase.productId = this.product[p];
                break;
            }
        }

        purchase.objectId = generateRandomString();
        purchase.createdAt = new Date();
        purchase.updatedAt = new Date();

        this.purchase.push(purchase);

        callback.success(purchase);
    },
    destroyPurchase: function (purchaseId, callback) {
        var result = null;

        for (var p = 0; p < this.purchase.length; p++)
        {
            if(this.purchase[p].objectId == purchaseId)
            {
                result = this.purchase.splice(p, 1);
                break;
            }
        }

        callback.success(result[0]);
    },
    findPurchaseAll: function (transaction, callback) {
        var results = null;

        results = [];

        for (var p = 0; p < this.purchase.length; p++)
        {
            if(this.purchase[p].transactionId == transaction.objectId)
            {
                results.push(this.purchase[p]);
            }
        }

        callback.success(results);
    },
    destroyPurchaseAll: function (purchases, callback) {
        this.purchase = [];

        callback.success();
    },
    transactionFind: function (transactionId, callback) {
        this.handshake.objectId = generateRandomString();
        this.handshake.createdAt = new Date();
        this.handshake.updatedAt = new Date();
        this.handshake.registerId = generateRandomString();
        this.handshake.configurationId = transactionId;
        this.handshake.endpoint = this.configuration.endpoint;
        this.handshake.transactionId = transactionId;
        this.handshake.replyTo = this.configuration.topic + "." + transactionId;
        this.handshake.topic = this.configuration.topic;

        callback.success(this.handshake);
    }
};
