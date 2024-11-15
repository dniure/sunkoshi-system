import React, { useState, useEffect } from 'react';
import '../../css/main.scss';
import '../../css/OrderScreen/manageOrderDetails.scss';

const ManageOrderDetails = ({ setIsCustomerPopupVisible, customerDetails, updateCustomerDetails, orderDetails, setOrderDetails}) => {         

    const [prevOrderType, setPrevOrderType] = useState(orderDetails.orderType);
    const [tempOrderType, setTempOrderType] = useState(orderDetails.orderType);
    const [tempOrderTimeInMinutes, setTempOrderTimeInMinutes] = useState(orderDetails.orderTimeInMinutes);
    const [tempFormData, setTempFormData] = useState({
        name: customerDetails.name,
        phone: customerDetails.phone,
        postcode: customerDetails.postcode,
        address: customerDetails.address,
        notes: customerDetails.notes,
    });   

    const [errors, setErrors] = useState({});
    //////////////////////////////////////////////////
    // Placeholder Logic for Form Fields

    // Display required form fields depending on order type
    const getPlaceholder = (field) => {      
        if ((tempOrderType === 'collection' && (field === 'name' || field === 'phone')) ||
            (tempOrderType === 'delivery'   && (field === 'name' || field === 'phone' || field === 'postcode' || field === 'address')))
            return `${field.charAt(0).toUpperCase() + field.slice(1)}${' **'}`;
        
        return `${field.charAt(0).toUpperCase() + field.slice(1)}`;
    };        


    useEffect(() => {
        // Check if the previous order type was takeaway/collection and has changed to delivery

        if ((prevOrderType === 'takeaway' || prevOrderType === 'collection') &&
            (tempOrderType === 'delivery' && tempOrderTimeInMinutes === 25)) {
            setPrevOrderType('delivery')
            setTempOrderTimeInMinutes(45);
        }
        else if((prevOrderType === 'delivery') && 
            (tempOrderType === 'takeaway' || tempOrderType === 'collection')) {
            setPrevOrderType('takeaway')
            setTempOrderTimeInMinutes(25);
        }
    }, [tempOrderType])
    //////////////////////////////////////////////////    
    // Handle Save Button Click

    // Validates the form fields and saves data if validation passes
    const handleSave = () => {
        const newErrors = {};
    
        // Validate required fields for collection and delivery
        if (['collection', 'delivery'].includes(tempOrderType)) {
            if (!tempFormData.name) newErrors.name = true;
            if (!tempFormData.phone) newErrors.phone = true;
        }
    
        // Additional validation for delivery type
        if (tempOrderType === 'delivery') {
            if (!tempFormData.postcode) newErrors.postcode = true;
            if (!tempFormData.address) newErrors.address = true;
        }
    
        // If there are validation errors, display them, otherwise save the form data
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);  // Set error state
        } else {
            // Call update functions after validation
            updateCustomerDetails(tempFormData);
            setOrderDetails(prev => ({
                ...prev,
                orderType: tempOrderType,
                orderTimeInMinutes: tempOrderTimeInMinutes
            }))
            setErrors({});
            setIsCustomerPopupVisible(false); // Exit the popup
        }
    };

    // TO DO: CALCULATE POSTCODE DISTANCE FROM RESTAURANT

    //////////////////////////////////////////////////
    // Main Render

    return (
        <div className="manageOrderDetails fullscreen-overlay unselectable">
            
            <div className="customer-info-popup" onClick={(e) => e.stopPropagation()}>
                
                {/* Right Section: Select Order Type */}
                <div className="orderTypeContainer">
                    {['takeaway', 'collection', 'delivery'].map(type => (
                        <div key={type}
                             className={`orderType ${type} ${tempOrderType === type ? 'selected' : ''}`}
                             onClick={() => setTempOrderType(type)}
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
                                value={tempFormData[field]}
                                onChange={(e) => setTempFormData({ ...tempFormData, [field]: e.target.value })}
                                placeholder={getPlaceholder(field)}
                            />
                        </div>
                    ))}

                    {/* Notes Field */}
                    <div className="form-field notes-field">
                        <textarea
                            value={tempFormData.notes}
                            onChange={(e) => setTempFormData({ ...tempFormData, 'notes': e.target.value })}
                            placeholder={getPlaceholder('notes')}
                            className="notes-input"
                        />
                    </div>

                    {/* Display Distance (for delivery orders) */}
                    {tempOrderType === 'delivery' && (
                        <div className="distance-text">
                            <span>{`Distance: TO DO`}</span>
                        </div>
                    )}                
                </div>

                {/* Save and Cancel Buttons */}
                <div>
                    <button className="bottom-btn cancel" onClick={() => setIsCustomerPopupVisible(false)}>Cancel</button>
                    <button className="bottom-btn save" onClick={handleSave}>Save</button>
                </div>                

            </div>
        </div>
    );
};

export default ManageOrderDetails;