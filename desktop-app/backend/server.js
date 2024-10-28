const express = require('express');
const cors = require('cors');
const { Customer, TempOrder, Order } = require('./models'); // Import models from index.js

const app = express();
app.use(cors());
app.use(express.json());

// Create a new temporary order
app.post('/tempOrders', async (req, res) => {
    try {
        const { orderType,
                orderTimeInMinutes,
                prepareOrderFor,
                orderedItems,
                paymentMethod,
                formData
            } = req.body;

        // Format date as YYYY-MM-DD
        const orderDate = new Date().toISOString().split('T')[0];
        const tempOrderCount = await TempOrder.count({ where: { orderDate } });
        const tempOrderNumber = (tempOrderCount + 1).toString().padStart(2, '0');

        let customerID;

        // If the order is a takeaway with all fields empty
        if (orderType === 'takeaway' && (!formData.name && !formData.phone && !formData.postcode && !formData.address)) {
            customerID = 0;

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
            customerID = customer.customerID;
        }
        // Retrieve the info of the newly created customer
        const customerInfo = await Customer.findOne({ where: { customerID } });

        console.log("customerInfo: ", customerInfo);
        // Inside your POST endpoint for creating a temporary order
        const newTempOrder = await TempOrder.create({
            orderDate,
            orderNumber: tempOrderNumber,
            
            orderType,
            prepareOrderFor,
            orderTimeInMinutes,         
            orderedItems,
            paymentMethod,

            customerID,
            orderNotes: formData.notes || null,
        });

        res.status(201).json({order: newTempOrder, customerInfo});

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

// Update a temporary order by orderNumber
app.put('/tempOrders/:orderNumber', async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const {
            orderType,
            prepareOrderFor,
            orderTimeInMinutes,
            orderedItems,
            paymentMethod,
            orderNotes
        } = req.body;

        // Find the temporary order
        const tempOrder = await TempOrder.findOne({ where: { orderNumber } });
        if (!tempOrder) {
            return res.status(404).json({ message: 'Temporary order not found' });
        }

        tempOrder.orderType = orderType;
        tempOrder.prepareOrderFor = prepareOrderFor;
        tempOrder.orderTimeInMinutes = orderTimeInMinutes;
        tempOrder.orderedItems = orderedItems;
        tempOrder.paymentMethod = paymentMethod;
        tempOrder.orderNotes = orderNotes;

        // Save the updated order
        await tempOrder.save();

        res.status(200).json({ message: 'Temporary order updated successfully', tempOrder });
    } catch (error) {
        console.error('Error updating temporary order:', error);
        res.status(500).json({ message: 'Error updating temporary order', error: error.message });
    }
});

// Finalize a temporary order and move it to the Orders table
app.post('/finalizeOrder/:tempOrderNumber', async (req, res) => {
    try {
        const { tempOrderNumber } = req.params;
        const orderDate = new Date().toISOString().split('T')[0];
        
        // Count existing orders for today to create a unique order number
        const orderCount = await Order.count({ where: { orderDate } });
        const orderNumber = (orderCount + 1).toString().padStart(4, '0');

        // Retrieve the temporary order by orderNumber
        const tempOrder = await TempOrder.findOne({ where: { orderNumber: tempOrderNumber } }); // Updated to use orderNumber
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
        await TempOrder.destroy({ where: { orderNumber: tempOrderNumber } }); // Updated to use orderNumber

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

// Retrieve a temporary order by orderNumber
app.get('/tempOrders/:orderNumber', async (req, res) => {
    try {
        const { orderNumber } = req.params;
        console.log('Incoming request for order number:', orderNumber);

        const tempOrder = await TempOrder.findOne({ where: { orderNumber } });
        console.log('Fetched tempOrder from database:', tempOrder);

        if (!tempOrder) {
            return res.status(404).json({ message: 'Temporary order not found' });
        }

        res.status(200).json(tempOrder);
    } catch (error) {
        console.error('Error fetching temporary order:', error);
        res.status(500).json({ message: 'Error fetching temporary order' });
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

app.get('/customers/:customerID', async (req, res) => {
    try {
        const { customerID } = req.params;
        console.log('Fetching customer with ID:', customerID); // Log the incoming customerID

        const customer = await Customer.findOne({ where: { customerID } });
        
        // Log the fetched customer details or null if not found
        console.log('Fetched customer:', customer ? customer : 'No customer found');

        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        
        res.status(200).json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ message: 'Error fetching customer', error: error.message });
    }
});

// Update customer details by customerID
app.put('/customers/:customerID', async (req, res) => {
    try {
        const { customerID } = req.params;
        const { name, phone, postcode, address, notes } = req.body;

        // Find the customer by ID
        const customer = await Customer.findOne({ where: { customerID } });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Update customer details
        customer.name = name !== undefined ? name : customer.name;
        customer.phone = phone !== undefined ? phone : customer.phone;
        customer.postcode = postcode !== undefined ? postcode : customer.postcode;
        customer.address = address !== undefined ? address : customer.address;
        customer.notes = notes !== undefined ? notes : customer.notes;

        // Save the updated customer
        await customer.save();

        res.status(200).json({ message: 'Customer updated successfully', customer });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ message: 'Error updating customer', error: error.message });
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