const express = require('express');
const cors = require('cors');
const { Customer, TempOrder, Order } = require('./models'); // Import models from index.js

const {
    createTempOrder,
    getTempOrder,
    getCustomer,
    updateTempOrder,
    updateCustomer
} = require('./databaseFunctions');

const app = express();
app.use(cors());
app.use(express.json());

// *************************************************************************
// POST

// Create a new temporary order
app.post('/tempOrders', async (req, res) => {  
    try {
        const {orderDetails, customerDetails} = req.body;

        const { order, customerID } = await createTempOrder(orderDetails, customerDetails); // Call the createTempOrder function

        // Fetch customer info after order creation
        const fetchedCustomerInfo = await getCustomer(customerID);
        
        res.status(201).json({ order, customerInfo: fetchedCustomerInfo });
    } catch (error) {
        console.error("Error details:", error);
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message); // Get all validation error messages
            return res.status(400).json({
                message: 'Validation errors occurred',
                errors,
            });
        }
        res.status(500).json({
            message: 'Error creating temporary order',
            error: error.message,
        });    
    }    
});

// *************************************************************************
// GET

// Retrieve a temporary order by orderNumber
app.get('/tempOrders/:orderNumber', async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const tempOrder = await getTempOrder(orderNumber);

        if (!tempOrder) {
            return res.status(404).json({ message: 'Temporary order not found' });
        }

        res.status(200).json(tempOrder);
    } catch (error) {
        console.error('Error fetching temporary order:', error);
        res.status(500).json({ message: 'Error fetching temporary order' });
    }
});

// Retrieve customer info by customerID
app.get('/customers/:customerID', async (req, res) => {
    try {
        const { customerID } = req.params;
        const fetchedCustomer = await getCustomer(customerID); // Use the function from databaseFunctions.js

        if (!fetchedCustomer) return res.status(404).json({ message: 'Customer not found' });
        
        res.status(200).json(fetchedCustomer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ message: 'Error fetching customer', error: error.message });
    }
});

// *************************************************************************
// PUT

// Update a temporary order by orderNumber
app.put('/tempOrders/:orderNumber', async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const inputData = req.body;
        const orderDetails = inputData.orderDetails;

        const updatedTempOrder = await updateTempOrder(orderNumber, orderDetails);

        res.status(200).json(updatedTempOrder.orderNumber);
    } catch (error) {
        console.error('Error updating temporary order:', error);
        res.status(500).json({ message: 'Error updating temporary order', error: error.message });
    }
});

// Update customer details by customerID
app.put('/customers/:customerID', async (req, res) => {
    try {
        const { customerID } = req.params;
        const newCustomerDetails = req.body;
        const updatedCustomer = await updateCustomer(customerID, newCustomerDetails);

        res.status(200).json(updatedCustomer);
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
});

// Set up server and sync models
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