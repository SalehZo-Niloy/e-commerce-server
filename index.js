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

// app.use(cors());
app.use(
    cors({
        origin: 'https://e-commerce-niloy.netlify.app', // Replace with your Netlify app's domain
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify the HTTP methods you want to allow
        credentials: true, // Include cookies when sending the request (if applicable)
    })
);
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

app.post('/addProduct', async (req, res) => {
    const product = req.body;
    console.log(product);

    try {
        const addProduct = new Product(product);
        const result = await addProduct.save();
        console.log(result);
        return res.status(200).send(result);
    } catch (error) {
        console.error(error);
    }
})

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

app.post('/confirmOrder', async (req, res) => {
    const { userEmail, username, userPhone, receiverPhone, receiverAddress, transactionId, orderList, totalPrice } = req.body;

    try {
        const order = await Order.create({
            userEmail, username, userPhone, receiverPhone, receiverAddress, transactionId, orderList, totalPrice
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

app.listen(port, () => {
    console.log(`listening on port: ${port}`)
});