const express = require('express');
const cors = require('cors');
const { Customer, TempOrder, Order } = require('./models'); // Import models from index.js

const app = express();
app.use(cors());
app.use(express.json());

// Create a new temporary order
app.post('/tempOrders', async (req, res) => {
    try {
        const { orderType, formData, orderedItems } = req.body;
        console.log('Incoming temporary order data:', req.body);

        // Format date as YYYY-MM-DD
        const orderDate = new Date().toISOString().split('T')[0];
        // Count existing temp orders for today
        const tempOrderCount = await TempOrder.count({ where: { orderDate } });
        // Create a unique temp order number
        const tempOrderNumber = (tempOrderCount + 1).toString().padStart(4, '0');

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

        // Create the new temporary order with the appropriate customerID
        const newTempOrder = await TempOrder.create({
            orderDate,
            orderNumber: tempOrderNumber,
            orderedItems,
            paymentMethod: formData.paymentMethod || null,
            orderNotes: formData.notes || null,
            orderType,
            customerID, // Use the determined customerID
        });

        res.status(201).json({ message: 'Temporary order created successfully', order: newTempOrder });
    } catch (error) {
        console.error('Error creating temporary order:', error);
        res.status(500).json({ message: 'Error creating temporary order', error: error.message });
    }
});

// Finalize a temporary order and move it to the Orders table
app.post('/finalizeOrder/:tempOrderId', async (req, res) => {
    try {
        const { tempOrderId } = req.params;
        const orderDate = new Date().toISOString().split('T')[0];
        
        // Count existing orders for today to create a unique order number
        const orderCount = await Order.count({ where: { orderDate } });
        const orderNumber = (orderCount + 1).toString().padStart(4, '0');

        // Retrieve the temporary order
        const tempOrder = await TempOrder.findByPk(tempOrderId);
        if (!tempOrder) {
            return res.status(404).json({ message: 'Temporary order not found' });
        }

        // Create the new order from the temporary order
        const newOrder = await Order.create({
            orderDate: tempOrder.orderDate,
            orderNumber: orderNumber, // Unique order number based on existing orders
            orderedItems: tempOrder.orderedItems,
            paymentMethod: tempOrder.paymentMethod,
            orderNotes: tempOrder.orderNotes,
            orderType: tempOrder.orderType,
            customerID: tempOrder.customerID, // Link to the customerID from temp order
        });

        // Delete the temporary order after finalization
        await TempOrder.destroy({ where: { id: tempOrderId } });

        res.status(201).json({ message: 'Order finalized successfully', order: newOrder });
    } catch (error) {
        console.error('Error finalizing order:', error);
        res.status(500).json({ message: 'Error finalizing order', error: error.message });
    }
});

// Retrieve all temporary orders
app.get('/tempOrders', async (req, res) => {
    try {
        const tempOrders = await TempOrder.findAll();
        res.status(200).json(tempOrders);
    } catch (error) {
        console.error('Error fetching temporary orders:', error);
        res.status(500).json({ message: 'Error fetching temporary orders' });
    }
});

// Retrieve all finalized orders
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
        await TempOrder.sync({ alter: true }); // Ensure TempOrder is synced
        console.log('Database synchronized');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error('Error syncing database:', err);
    }
};

syncModels();