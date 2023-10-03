const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./src/config/mongoDbConnect');
const port = 4000 || process.env.PORT;
const dotenv = require("dotenv").config();
const bcrypt = require("bcryptjs");
const Product = require("./src/models/productModel");
const User = require("./src/models/userModel");
const Order = require("./src/models/orderModel");
const Invoice = require("./src/models/invoiceModel");
const { default: mongoose } = require('mongoose');

app.use(cors());
// app.use(
//     cors({
//         origin: 'https://e-commerce-niloy.netlify.app', // Replace with your Netlify app's domain
//         methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify the HTTP methods you want to allow
//         credentials: true, // Include cookies when sending the request (if applicable)
//     })
// );
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
    res.send('e-commerce server running');
});

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();

        if (products) {
            // console.log(products);
            return res.status(200).send(products);
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
})

app.get('/product/:id', async (req, res) => {

    const _id = req?.params?.id;

    try {
        const product = await Product.findOne({ _id });

        if (product) {
            // console.log(product);
            return res.status(200).send(product);
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
})

app.put('/inStock', async (req, res) => {
    const productId = req.query.id;

    const filter = { _id: productId }; // Update this with your product's ID or any other criteria
    const update = {
        $set: {
            inStock: true, // Update or set the title
        }
    };

    // Options to findOneAndUpdate
    const options = {
        upsert: true, // Create a new document if it doesn't exist
        new: true
    };

    try {
        const result = await Product.findOneAndUpdate(filter, update, options);
        if (result) {
            return res.status(200).send(result?.inStock);
        } else {
            return res.status(400).send("Something went wrong");
        }

    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});
app.put('/outOfStock', async (req, res) => {
    const productId = req.query.id;

    const filter = { _id: productId }; // Update this with your product's ID or any other criteria
    const update = {
        $set: {
            inStock: false, // Update or set the title
        }
    };

    // Options to findOneAndUpdate
    const options = {
        upsert: true, // Create a new document if it doesn't exist
        new: true
    };

    try {
        const result = await Product.findOneAndUpdate(filter, update, options);
        if (result) {
            return res.status(200).send(result?.inStock);
        } else {
            return res.status(400).send("Something went wrong");
        }

    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});
app.post('/addProduct', async (req, res) => {
    const product = req.body;
    // console.log(product);

    try {
        const addProduct = new Product(product);
        const result = await addProduct.save();
        console.log(result);
        return res.status(200).send(result);
    } catch (error) {
        console.error(error);
    }
});

app.delete('/deleteProduct/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const result = await Product.findByIdAndDelete(productId);

        if (result) {
            // Product successfully deleted
            return res.status(200).send({ message: 'Product deleted' });
        } else {
            // Product with the given ID was not found
            return res.status(404).send({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
});

app.post('/register', async (req, res) => {
    const { username, phone, password } = req.body;
    const email = req.body.email.toLowerCase();

    const userExists = await User.findOne({ email });

    if (userExists) {
        try {
            return res.status(400).send("User already exists. Please log in");
        } catch (error) {
            return res.status(400).send(error);
        }
    } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            phone,
            password: hashedPassword,
        });

        if (user) {
            const userResponse = {
                email: user.email,
                username: user.username,
                phone: user.phone
            }
            return res.status(200).send(userResponse);
        } else return res.status(400).send("something went wrong")
    }
});

app.post('/login', async (req, res) => {
    const { password } = req.body;
    const email = req.body.email.toLowerCase();

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const userResponse = {
                email: user.email,
                username: user.username,
                phone: user.phone
            }
            return res.status(200).send(userResponse);
        } else {
            return res.status(400).send("Invalid credentials");
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

app.post('/adminCheck', async (req, res) => {
    const email = req.body?.email?.toLowerCase();

    try {
        const user = await User.findOne({ email });
        if (user) {
            const userResponse = {
                email: user?.email,
                role: user?.role
            }
            console.log(userResponse);
            return res.status(200).send(userResponse);
        } else {
            return res.status(400).send("Invalid credentials");
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

app.post('/confirmOrder', async (req, res) => {
    const { userEmail, username, userPhone, receiverPhone, receiverAddress, transactionId, orderList, totalPrice, paymentMethod } = req.body;

    try {
        const order = await Order.create({
            userEmail, username, userPhone, receiverPhone, receiverAddress, paymentMethod, transactionId, orderList, totalPrice, orderCompleted: false
        });

        if (order) {
            return res.status(200).send(order);
        } else {
            return res.status(400).send("Invalid credentials");
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

app.put('/completeOrder', async (req, res) => {
    const productId = req.query.id;

    console.log(productId);
    const filter = { _id: productId }; // Update this with your product's ID or any other criteria
    const update = {
        $set: {
            orderCompleted: true, // Update or set the title
        }
    };

    // Options to findOneAndUpdate
    const options = {
        upsert: true, // Create a new document if it doesn't exist
        new: true
    };

    try {
        const result = await Order.findOneAndUpdate(filter, update, options);
        if (result) {
            return res.status(200).send(result);
        } else {
            return res.status(400).send("Something went wrong");
        }

    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
});

app.get('/allOrders', async (req, res) => {
    try {
        const allOrders = await Order.find();

        if (allOrders) {
            return res.status(200).send(allOrders);
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send("Something went wrong");
    }
})

app.get('/search', async (req, res) => {
    try {
        const { query } = req.query;

        // console.log(query);

        // Use a regular expression to perform a case-insensitive search by name
        const products = await Product.find({
            title: { $regex: new RegExp(query, 'i') },
        });

        return res.status(200).json(products);
    } catch (error) {
        console.error(error);
        return res.status(400).json(error);
    }
});

app.get('/filter', async (req, res) => {
    try {
        const minPrice = parseFloat(req.query.minPrice); // Convert query parameter to a number
        const maxPrice = parseFloat(req.query.maxPrice);

        console.log(minPrice, typeof (minPrice));
        console.log(maxPrice, typeof (maxPrice));
        // Construct a query to filter products based on price range
        const filteredProducts = await Product.find({
            price: { $gte: minPrice, $lte: maxPrice },
        }).sort({ price: 1 });

        return res.status(200).json(filteredProducts);
    } catch (error) {
        console.error(error);
        return res.status(400).json(error);
    }
});

app.post('/addInvoice', async (req, res) => {
    const invoice = req.body;

    try {
        const invoiceResult = await Invoice.create(invoice);

        if (invoiceResult) {
            return res.status(200).send('Invoice created successfully');
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});

app.get('/invoice', async (req, res) => {
    try {
        const invoice = await Invoice.find();

        if (invoice) {
            return res.status(200).json(invoice);
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
})

app.get('/invoice/:id', async (req, res) => {
    const invoiceId = req?.params?.id;

    try {
        const invoice = await Invoice.findOne({ _id: invoiceId });

        if (invoice) {
            return res.status(200).json(invoice);
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
})

app.listen(port, () => {
    console.log(`listening on port: ${port}`)
});