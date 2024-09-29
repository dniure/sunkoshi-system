import React, { useRef, useState } from 'react';
import '../css/main.css';
import '../css/buttons.css';

const CustomerPopup = ({
    showCustomerPopup,
    handleClose,
    selectedOrderType,
    setSelectedOrderType,
    formData,
    setFormData,
    errors,
    setErrors
}) => {
    const popupRef = useRef(null);

    const handleSave = () => {
        const newErrors = {};

        // Conditionally check required fields based on the selected order type
        if (selectedOrderType === 'collection' || selectedOrderType === 'delivery') {
            if (!formData.name) newErrors.name = 'Name is required';
            if (!formData.phone) newErrors.phone = 'Phone number is required';
        }

        if (selectedOrderType === 'delivery') {
            if (!formData.postcode) newErrors.postcode = 'Postcode is required';
            if (!formData.address) newErrors.address = 'Address is required';
        }

        // Check if there are any errors
        if (Object.keys(newErrors).length === 0) {
            console.log("Saved data:", formData); // Implement your save logic here
            setErrors({}); // Reset any previous errors
            handleClose(); // Close the popup
        } else {
            // If errors, display them
            setErrors(newErrors);
        }
    };

    const getPlaceholder = (field) => {
        const requiredIndicator = ' **';
        switch (selectedOrderType) {
            case 'collection':
                if (field === 'name' || field === 'phone') return `${field.charAt(0).toUpperCase() + field.slice(1)}${requiredIndicator}`;
                break;
            case 'delivery':
                if (field === 'name' || field === 'phone' || field === 'postcode' || field === 'address')
                    return `${field.charAt(0).toUpperCase() + field.slice(1)}${requiredIndicator}`;
                break;
            default:
                return `${field.charAt(0).toUpperCase() + field.slice(1)}`; // Takeaway has no required fields
        }
        return `${field.charAt(0).toUpperCase() + field.slice(1)}`; // Default placeholder
    };

    return (
        showCustomerPopup && (
            <div className="fullscreen-overlay" onClick={handleClose}>
                <div className="customer-info-popup" onClick={(e) => e.stopPropagation()}>
                    <div className="orderTypeContainer" ref={popupRef}>
                        <div
                            className={`orderType takeaway ${selectedOrderType === 'takeaway' ? 'selected' : ''}`}
                            onClick={() => setSelectedOrderType('takeaway')}
                        >
                            <span>T/A</span>
                        </div>

                        <div
                            className={`orderType collection ${selectedOrderType === 'collection' ? 'selected' : ''}`}
                            onClick={() => setSelectedOrderType('collection')}
                        >
                            <span>Collect</span>
                        </div>

                        <div
                            className={`orderType delivery ${selectedOrderType === 'delivery' ? 'selected' : ''}`}
                            onClick={() => setSelectedOrderType('delivery')}
                        >
                            <span>Delivery</span>
                        </div>
                    </div>

                    {/* Error Message at the top of the form */}
                    {Object.keys(errors).length > 0 && (
                        <div className="error-message">
                            Please fill in the required fields.
                        </div>
                    )}

                    {/* Form Field Inputs */}
                    <div className="form-fields">
                        <div className={`form-field name-field ${errors.name ? 'error' : ''}`}>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={getPlaceholder('name')}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>
                        <div className={`form-field phone-field ${errors.phone ? 'error' : ''}`}>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder={getPlaceholder('phone')}
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                        <div className={`form-field postcode-field ${errors.postcode ? 'error' : ''}`}>
                            <input
                                type="text"
                                value={formData.postcode}
                                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                                placeholder={getPlaceholder('postcode')}
                            />
                            {errors.postcode && <span className="error-text">{errors.postcode}</span>}
                        </div>
                        <div className={`form-field address-field ${errors.address ? 'error' : ''}`}>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder={getPlaceholder('address')}
                            />
                            {errors.address && <span className="error-text">{errors.address}</span>}
                        </div>

                        {/* Notes Field */}
                        <div className="form-field notes-field">
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
        )
    );
};

export default CustomerPopup;
