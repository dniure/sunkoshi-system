// server.js
const express = require('express');
const cors = require('cors');
const { Customer, Order } = require('./models'); // Import models from index.js

const app = express();
app.use(cors());
app.use(express.json());

// Create a new order
app.post('/orders', async (req, res) => {
    try {
        const { orderType, formData, orderedItems } = req.body;
        console.log('Incoming order data:', req.body);
        
        // Format date as YYYY-MM-DD
        const orderDate = new Date().toISOString().split('T')[0]; 
        const orderCount = await Order.count({ where: { orderDate } });
        const orderNumber = (orderCount + 1).toString().padStart(4, '0');

        let customerID;

        // Check if the order is a takeaway with all fields empty
        if (orderType === 'takeaway' && (!formData.name && !formData.phone && !formData.postcode && !formData.address)) {
            customerID = 0; // Use customer ID 0 for takeaways

            // Check if customer with ID 0 exists, if not create it
            const existingCustomer = await Customer.findOne({ where: { customerID: 0 } });
            if (!existingCustomer) {
                await Customer.create({
                    customerID: 0,
                    name: '',
                    phone: '',
                    postcode: '',
                    address: '',
                    notes: ''
                });
            }
        } else {
            // Create a new customer with provided formData
            const customer = await Customer.create({
                name: formData.name || null,
                phone: formData.phone || null,
                postcode: formData.postcode || null,
                address: formData.address || null,
                notes: formData.notes || null,
            });
            customerID = customer.customerID; // Get the newly created customer's ID
        }

        // Create the new order with the appropriate customerID
        const newOrder = await Order.create({
            orderDate,
            orderNumber,
            orderedItems,
            paymentMethod: formData.paymentMethod || null,
            orderNotes: formData.notes || null,
            orderType,
            customerID, // Use the determined customerID
        });
        
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// Retrieve all orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

const PORT = process.env.PORT || 3001;

const syncModels = async () => {
    try {
        await Customer.sync({ alter: true });
        await Order.sync({ alter: true });
        console.log('Database synchronized');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error('Error syncing database:', err);
    }
};

syncModels();
