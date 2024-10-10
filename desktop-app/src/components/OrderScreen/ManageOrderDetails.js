import React, { useState, useEffect } from 'react';
import '../../css/main.scss';
import '../../css/OrderScreen/manageOrderDetails.scss';

const ManageOrderDetails = ({ formDataInput, orderTypeInput, updateOrderDetails, onClose }) => {         
    
    //////////////////////////////////////////////////    
    // State Management

    const [formData, setFormData] = useState({ ...formDataInput });  // Stores customer form data
    const [orderType, setOrderType] = useState(orderTypeInput);      // Stores the order type (takeaway, collection, delivery)
    const [errors, setErrors] = useState({});                        // Tracks errors in form validation

    //////////////////////////////////////////////////
    // Placeholder Logic for Form Fields

    // Function to dynamically generate placeholders with required indicators
    const getPlaceholder = (field) => {
        const requiredIndicator = ' **';
        
        if (
            (orderType === 'collection' && (field === 'name' || field === 'phone'))
            ||
            (orderType === 'delivery' && (field === 'name' || field === 'phone' || field === 'postcode' || field === 'address'))
        )
            return `${field.charAt(0).toUpperCase() + field.slice(1)}${requiredIndicator}`;
        
        return `${field.charAt(0).toUpperCase() + field.slice(1)}`;
    };        

    //////////////////////////////////////////////////    
    // Handle Save Button Click

    // Validates the form fields and saves data if validation passes
    const handleSave = () => {
        const newErrors = {};

        // Validate required fields for collection and delivery
        if (['collection', 'delivery'].includes(orderType)) {
            if (!formData.name) newErrors.name = true;
            if (!formData.phone) newErrors.phone = true;
        }

        // Additional validation for delivery type
        if (orderType === 'delivery') {
            if (!formData.postcode) newErrors.postcode = true;
            if (!formData.address) newErrors.address = true;
        }

        // If there are validation errors, display them, otherwise save the form data
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);  // Set error state
        } else {
            updateOrderDetails(formData, orderType);  // Pass updated data to parent component
            setErrors({});  // Clear errors
            onClose();  // Close the form
        }
    };

    //////////////////////////////////////////////////
    // Distance Calculation (for delivery orders)

    const [distance, setDistance] = useState(0);  // State to store the calculated distance

    // Function to calculate distance (Placeholder for actual logic or API call)
    const calculateDistance = (postcode) => {
        // Placeholder logic, replace with real API or formula
        return postcode ? Math.floor(Math.random(0.0, 5.0)) + 1 + ' miles' : null;
    };

    // Effect to calculate distance when postcode or orderType changes
    useEffect(() => {
        if (orderType === 'delivery' && formData.postcode) {
            const calculatedDistance = calculateDistance(formData.postcode);
            setDistance(calculatedDistance);  // Update distance based on postcode
        } else {
            setDistance(0);  // Reset distance if not delivery or no postcode
        }
    }, [formData.postcode, orderType]);

    //////////////////////////////////////////////////
    // Main Render

    return (
        <div className="manageOrderDetails fullscreen-overlay unselectable">
            
            <div className="customer-info-popup" onClick={(e) => e.stopPropagation()}>
                
                {/* Right Section: Select Order Type */}
                <div className="orderTypeContainer">
                    {['takeaway', 'collection', 'delivery'].map(type => (
                        <div key={type}
                             className={`orderType ${type} ${orderType === type ? 'selected' : ''}`}
                             onClick={() => setOrderType(type)}
                        >
                            <span>{type === 'takeaway' ? 'T/A' : type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        </div>
                    ))}
                </div>

                {/* Left Section: Form Fields */}

                {/* Error Message at the top of the form */}
                {Object.keys(errors).length > 0 && (
                    <div className="error-message">Please fill in the required fields.</div>
                )}

                <div className="form-fields">

                    {/* Form Fields: Name, Phone, Postcode, Address */}
                    {['name', 'phone', 'postcode', 'address'].map(field => (
                        <div key={field} className={`form-field ${field}-field ${errors[field] ? 'error' : ''}`}>
                            <input
                                type="text"
                                value={formData[field]}
                                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                placeholder={getPlaceholder(field)}
                            />
                        </div>
                    ))}

                    {/* Notes Field */}
                    <div className="form-field notes-field">
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, 'notes': e.target.value })}
                            placeholder={getPlaceholder('notes')}
                            className="notes-input"
                        />
                    </div>

                    {/* Display Distance (for delivery orders) */}
                    {orderType === 'delivery' && (
                        <div className="distance-text">
                            <span>{`Distance: ${distance}`}</span>
                        </div>
                    )}                
                </div>

                {/* Save and Cancel Buttons */}
                <div>
                    <button className="bottom-btn cancel" onClick={onClose}>Cancel</button>
                    <button className="bottom-btn save" onClick={handleSave}>Save</button>
                </div>                

            </div>
        </div>
    );
};

export default ManageOrderDetails;