import React, { useState } from 'react';
import '../css/main.css';
import '../css/buttons.css';
import '../css/manageOrderDetails.css';

const ManageOrderDetails = ({ formValues, SelectedOrderType, handleSaveFormData, handleOrderTypeChange, handleChangeFormData, onClose }) => {         
    
    //////////////////////////////////////////////////    
    // Form Management
    const [formData] = useState(formValues);
    const [orderType, setOrderType] = useState(SelectedOrderType);
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
            // Update previous order type with the currently selected one
            console.log("Saved data:", formData);
            setErrors({});

            // Handle Form data change
            // handle order type change
                        
            onClose();
        }
    };

    const handleClose = () => {
        onClose(); // Call the close handler passed from OrderScreen
    };

    // ////////////////////////////////////////////////
    // MAIN HTML
    return (
    <div className="fullscreen-overlay" onClick={handleClose}>
        
        <div className="customer-info-popup" onClick={(e) => e.stopPropagation()}>
            
            Right Section: Select Order Type
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
                            onChange={(e) => handleSaveFormData(field, e.target.value )}
                            placeholder={getPlaceholder(field)}
                        />
                    </div>
                ))}

                {/* Field: Notes */}
                <div className="form-field notes-field">
                    <textarea
                        value={formData.notes}
                        onChange={(e) => handleSaveFormData('notes', e.target.value )}
                        placeholder={getPlaceholder('notes')}
                        className="notes-input"
                    />
                </div>
            </div>


            {/* Save and Cancel Buttons */}
            <button className="save-button" onClick={handleSave}>Save</button>
            <button className="cancel-button" onClick={handleClose}>Cancel</button>
        </div>
    </div>
    );
};

export default ManageOrderDetails;
