import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/main.css';
import '../css/buttons.css';
import '../css/orderScreen.css';

import closeIcon from '../images/close-icon.png';

const OrderScreen = () => {
    const navigate = useNavigate();
    const popupRef = useRef(null); // Reference to the modify time popup
    const toggleButtonRef = useRef(null); // Reference to the toggle button

    const [modifyingTime, setModifyingTime] = useState(false);
    const [showCustomerPopup, setShowCustomerPopup] = useState(false);
    const [orderTime, setOrderTime] = useState(25);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [adjustedExactTime, setAdjustedExactTime] = useState(false);

    const [selectedOrderType, setSelectedOrderType] = useState("takeaway");
    const [previousOrderType, setPreviousOrderType] = useState("takeaway"); // Store the previous order type

    // State for form fields
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        postcode: '',
        address: '',
        notes: '',
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleClickOutside = (event) => {
        if (
            popupRef.current &&
            !popupRef.current.contains(event.target) &&
            toggleButtonRef.current &&
            !toggleButtonRef.current.contains(event.target)
        ) {
            setModifyingTime(false);
        }
    };

    const handleClose = () => {
        setShowCustomerPopup(false);
        setSelectedOrderType(previousOrderType); // Revert to the previous order type
    };

    const handleSave = () => {
        setPreviousOrderType(selectedOrderType); // Update previous order type with the currently selected one
        console.log("Saved data:", formData); // Implement your save logic here
        setShowCustomerPopup(false); // Close the popup
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Order Info click handler
    const handleOrderInfoClick = (event) => {
        if (!modifyingTime && !toggleButtonRef.current.contains(event.target)) {
            setShowCustomerPopup(true); // Show the customer info popup
        }
    };

    const resetOrderTimeToAsap = () => setOrderTime(25);
    const increaseOrderTime = () => setOrderTime(prev => prev + 5);
    const decreaseOrderTime = () => setOrderTime(prev => Math.max(prev - 5, 0));
    const adjustToNearestFive = minutes => (minutes % 5 === 0 ? minutes : Math.ceil(minutes / 5) * 5);

    const increaseExactTime = () => {
        const minutes = adjustedExactTime ? currentTime.getMinutes() + 5 : adjustToNearestFive(currentTime.getMinutes());
        setOrderTime(orderTime + minutes - currentTime.getMinutes());
        setAdjustedExactTime(true);
    };

    const decreaseExactTime = () => {
        setAdjustedExactTime(false);
        decreaseOrderTime();
    };

    const getFormattedTime = () => {
        const totalMinutes = orderTime + currentTime.getMinutes();
        const hours = (currentTime.getHours() + Math.floor(totalMinutes / 60)) % 24;
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-wrapper">
            <div className="bg-container"></div>
            <div className="content-container">
                <div className="main-container">

                    {/* ############# Left Section ##############*/}
                    <div className="left-section">
                        <div className="menu-items">
                            {/* Menu goes here */}
                        </div>
                    </div>

                    {/* ############# Right Section ##############*/}
                    <div className="right-section">
                        {/* Ordered Items */}
                        <div className="ordered-items">
                            <div className="vertical-line"></div>
                            <div className="labels">
                                <span className="item-label">ITEM</span>
                                <span className="price-label">PRICE</span>
                                <span className="total">TOTAL</span>
                                <span className="price-sum">£0.00</span>
                                <span className="final-price">£0.00</span>
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className="order-info" onClick={handleOrderInfoClick}>
                            {/* Dark Overlay */}
                            {modifyingTime && <div className="order-info-overlay"></div>}

                            {/* Modify Time Popup */}
                            {modifyingTime && (
                                <div className="modify-time-layer" ref={popupRef}>
                                    <div className="asap-section">
                                        <button className={`asap-button ${orderTime === 25 ? 'selected' : ''}`} onClick={resetOrderTimeToAsap}>
                                            ASAP
                                        </button>
                                    </div>
                                    <div className="section time-toggle">
                                        <button onClick={decreaseOrderTime}>-</button>
                                        <span>{orderTime} mins</span>
                                        <button onClick={increaseOrderTime}>+</button>
                                    </div>
                                    <div className="section exact-time">
                                        <button onClick={decreaseExactTime}>-</button>
                                        <span>{getFormattedTime()}</span>
                                        <button onClick={increaseExactTime}>+</button>
                                    </div>
                                </div>
                            )}

                            {/* Takeaway Text */}
                            <div className="order-text">
                                <span>{selectedOrderType}</span>
                            </div>

                            {/* Modify Time Button */}
                            <button
                                className="modify-time-button"
                                ref={toggleButtonRef}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setModifyingTime((prev) => !prev);
                                }}
                                style={{ zIndex: 2 }}
                            >
                                <span>{orderTime === 25 ? 'ASAP' : getFormattedTime()}</span>
                                <span className="arrow">▲</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ############# Customer Info Full-Screen Popup ##############*/}
                {showCustomerPopup && (
                    <div className="fullscreen-overlay" onClick={handleClose}>
                        <div className="customer-info-popup" onClick={(e) => e.stopPropagation()}>
                            {/* close button */}
                            <img className="close-icon" src={closeIcon} alt="Close Icon" onClick={handleClose} />

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

                            {/* Form Fields */}
                            <div className="form-fields">
                                {Object.keys(formData).map((key) => (
                                    <div key={key} className="form-field">
                                        <input
                                            type="text"
                                            value={formData[key]}
                                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Save and Cancel Buttons */}
                            <button className="save-button" onClick={handleSave}>Save</button>
                            <button className="cancel-button" onClick={handleClose}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* ############# Bottom Section ##############*/}
                <div className="cancel-container">
                    <button className="styled-button cancel" onClick={() => navigate('/')}>cancel</button>
                </div>
                <div className="save-container">
                    <button className="styled-button save" onClick={() => navigate('/')}>save</button>
                </div>
            </div>
        </div>
    );
};

export default OrderScreen;
