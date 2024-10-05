import React, { useState, useEffect } from 'react';
import '../css/main.css';
import '../css/manageOrderDetails.css';

const ManageOrderDetails = ({ formDataInput, orderTypeInput, updateOrderDetails, onClose }) => {         
    
    //////////////////////////////////////////////////    
    // Form Management
    const [formData, setFormData] = useState({ ...formDataInput });

    const [orderType, setOrderType] = useState(orderTypeInput);
    const [errors, setErrors] = useState({});

    const getPlaceholder = (field) => {
        const requiredIndicator = ' **';
        if (orderType === 'collection' && (field === 'name' || field === 'phone') ||
            orderType === 'delivery' && (field === 'name' || field === 'phone' || field === 'postcode' || field === 'address')) 
            return `${field.charAt(0).toUpperCase() + field.slice(1)}${requiredIndicator}`;
        return `${field.charAt(0).toUpperCase() + field.slice(1)}`;
    };        

    //////////////////////////////////////////////////    
    // Click Handling

    const handleSave = () => {
        const newErrors = {};

        if (['collection', 'delivery'].includes(orderType)) {
            if (!formData.name) newErrors.name = true;
            if (!formData.phone) newErrors.phone = true;
        }
        if (orderType === 'delivery') {
            if (!formData.postcode) newErrors.postcode = true;
            if (!formData.address) newErrors.address = true;
        }
        
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
        } else {
            // Save form data and order type
            updateOrderDetails(formData, orderType); // Pass the updated formData to parent

            setErrors({});
            onClose();
        }
    };

    // ##########################################
    const [distance, setDistance] = useState(0); // State to store the distance

    // Function to calculate distance (replace with actual API or calculation logic)
    const calculateDistance = (postcode) => {
        // Placeholder logic for distance calculation, replace this with real API call or formula
        return postcode ? Math.floor(Math.random(0.0, 5.0)) + 1 + ' miles' : null;
    };

    useEffect(() => {
        if (orderType === 'delivery' && formData.postcode) {
            const calculatedDistance = calculateDistance(formData.postcode);
            setDistance(calculatedDistance);
        } else {
            setDistance(0); // Clear the distance if not delivery or postcode is empty
        }
    }, [formData.postcode, orderType]);
        
    // ////////////////////////////////////////////////
    // MAIN HTML
    return (
    <div className="fullscreen-overlay unselectable" >
        
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

                {/* Fields: Name, Phone, Postcode, Address */}
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

                {/* Field: Notes */}
                <div className="form-field notes-field">
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, 'notes': e.target.value })}
                        placeholder={getPlaceholder('notes')}
                        className="notes-input"
                    />
                </div>

                {orderType === 'delivery' && (
                    <div className="distance-text">
                        <span>{`Distance: ${distance}`}</span>
                    </div>
                )}                
            </div>


            {/* Save and Cancel Buttons */}
            <div>
                <button className="bottom-btn orderDetails cancel" onClick={onClose}>Cancel</button>
                <button className="bottom-btn orderDetails save" onClick={handleSave}>Save</button>
            </div>

        </div>
    </div>
    );
};

export default ManageOrderDetails;
