const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const Order = require('./models/Order');
const sequelize = require('./models/Order').sequelize;

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Create a new order
app.post('/orders', async (req, res) => {
    try {
        const { items, payment_method, customer_notes, order_type } = req.body;
        const date = new Date().toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        
        // Count orders for today
        const orderCount = await Order.count({ where: { date } });
        const order_number = (orderCount + 1).toString().padStart(2, '0');
        
        // Create a new order
        const newOrder = await Order.create({
            order_number,
            date,
            items,
            payment_method,
            customer_notes,
            order_type,
        });
        
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
});

// Get orders for a specific date
app.get('/orders/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const orders = await Order.findAll({ where: { date } });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

const PORT = process.env.PORT || 3001;

sequelize.sync({ force: false })
    .then(() => {
        console.log('Database synced');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
