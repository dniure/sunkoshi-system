const express = require('express');
const cors = require('cors');
const { Customer, TempOrder, Order } = require('./models'); // Import models from index.js

const app = express();
app.use(cors());
app.use(express.json());

// *************************************************************************
// POST

// Create a new temporary order
app.post('/tempOrders', async (req, res) => {
    try {
        const { 
            orderType,
            orderTimeInMinutes,
            prepareOrderFor,
            orderedItems,
            paymentMethod,
            formData 
        } = req.body;

        // Format date as YYYY-MM-DD
        const orderDate = new Date().toISOString().split('T')[0];
        
        // Generate a unique tempOrderNumber
        let tempOrderNumber;
        let orderExists = true;
        let attemptCount = 0;

        while (orderExists) {
            const tempOrderCount = await TempOrder.count({ where: { orderDate } });
            tempOrderNumber = (tempOrderCount + 1 + attemptCount).toString().padStart(2, '0');

            // Check if the generated order number already exists
            const existingOrder = await TempOrder.findOne({ where: { orderNumber: tempOrderNumber } });
            orderExists = !!existingOrder; // If it exists, loop again
            
            attemptCount++; // Increment attempt count to find a new unique number
        }

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
        
        // Create the new temporary order with a unique orderNumber
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

        res.status(201).json({ order: newTempOrder, customerInfo });

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

// *************************************************************************
// PUT

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
            orderNotes,
            formData
        } = req.body;

        // Find the temporary order
        const tempOrder = await TempOrder.findOne({ where: { orderNumber } });
        if (!tempOrder) {
            return res.status(404).json({ message: 'Temporary order not found' });
        }
        
        console.log("\n****************************: ID BEFORE: ", tempOrder.customerID);

        // Check if customerID is 0, and create a new customer if so
        if (tempOrder.customerID === 0 && ((formData.name || formData.phone || formData.postcode || formData.address) !== '')) {
            const newCustomer = await Customer.create({
                name: formData.name || null,
                phone: formData.phone || null,
                postcode: formData.postcode || null,
                address: formData.address || null,
                notes: formData.notes || null,
            });
            tempOrder.customerID = newCustomer.customerID; // Update tempOrder with new customerID
        }
        else if (tempOrder.customerID !== 0 &&
                tempOrder.orderType === 'takeaway' &&
                ((formData.name || formData.phone || formData.postcode || formData.address) === '')
        ) {
            tempOrder.customerID = 0;
        }
        console.log("\n****************************: ID AFTER: ", tempOrder.customerID);
        // Update tempOrder details
        tempOrder.orderType = orderType;
        tempOrder.prepareOrderFor = prepareOrderFor;
        tempOrder.orderTimeInMinutes = orderTimeInMinutes;
        tempOrder.orderedItems = orderedItems;
        tempOrder.paymentMethod = paymentMethod;
        tempOrder.orderNotes = orderNotes;

        // Save the updated order
        await tempOrder.save();

        res.status(200).json({ 
            message: 'Temporary order updated successfully', 
            tempOrder, 
            newCustomerID: tempOrder.customerID
        });        
    } catch (error) {
        console.error('Error updating temporary order:', error);
        res.status(500).json({ message: 'Error updating temporary order', error: error.message });
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
        customer.name = name !== null ? name : customer.name;
        customer.phone = phone !== null ? phone : customer.phone;
        customer.postcode = postcode !== null ? postcode : customer.postcode;
        customer.address = address !== null ? address : customer.address;
        customer.notes = notes !== null ? notes : customer.notes;

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