const { Customer, TempOrder, Order } = require('./models'); // Import your models

// *************************************************************************
// CREATE TEMPORARY ORDER FUNCTION

async function createTempOrder(inputData) {
    try {
        const { 
            orderType,
            orderTimeInMinutes,
            prepareOrderFor,
            orderedItems,
            paymentMethod,
            formData 
        } = inputData;

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

        return { order: newTempOrder, customerID };

    } catch (error) {
        console.error("Error creating temporary order:", error);
        throw error; // Rethrow the error to be handled by the calling function
    }
}

// *************************************************************************
// FETCH TEMPORARY ORDER FUNCTION

async function getTempOrder(orderNumber) {
    try {
        const tempOrder = await TempOrder.findOne({ where: { orderNumber } });
        return tempOrder;
    } catch (error) {
        console.error("Error fetching temporary order:", error);
        throw error; // Rethrow the error to be handled by the calling function
    }
}

// *************************************************************************
// FETCH CUSTOMER FUNCTION

async function getCustomer(customerID) {
    try {
        const customer = await Customer.findOne({ where: { customerID } });
        return customer;
    } catch (error) {
        console.error("Error fetching customer:", error);
        throw error; // Rethrow the error to be handled by the calling function
    }
}

// *************************************************************************
// UPDATE TEMPORARY ORDER FUNCTION

async function updateTempOrder(orderNumber, orderDetails) {
    try {
        const tempOrder = await TempOrder.findOne({ where: { orderNumber } });
        if (!tempOrder) {
            throw new Error('Temporary order not found');
        }

        // Update tempOrder details
        Object.assign(tempOrder, orderDetails); // Update properties from orderDetails
        await tempOrder.save();
        
        return tempOrder;

    } catch (error) {
        console.error("Error updating temporary order:", error);
        throw error; // Rethrow the error to be handled by the calling function
    }
}

// *************************************************************************
// UPDATE CUSTOMER FUNCTION

async function updateCustomer(customerID, formData) {
    try {
        const customer = await Customer.findOne({ where: { customerID } });
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Update customer details
        Object.assign(customer, formData); // Update properties from customerDetails
        await customer.save();
        
        return customer;
    } catch (error) {
        console.error("Error updating customer:", error);
        throw error; // Rethrow the error to be handled by the calling function
    }
}

// Export functions for use in your server file
module.exports = {
    createTempOrder,
    getTempOrder,
    getCustomer,
    updateTempOrder,
    updateCustomer,
};
