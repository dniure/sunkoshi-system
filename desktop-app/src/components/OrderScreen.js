import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/main.css';
import '../css/buttons.css';
import '../css/orderScreen.css';

const OrderScreen = () => {
    const navigate = useNavigate();
    const popupRef = useRef(null); // Reference to the popup layer
    const toggleButtonRef = useRef(null); // Reference to the toggle button
    const [modifyingTime, setModifyingTime] = useState(false);
    const [orderTime, setOrderTime] = useState(25);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [adjustedExactTime, setAdjustedExactTime] = useState(false);
    const [showOrderInfoPopup, setShowOrderInfoPopup] = useState(false); // New state for the order-info popup

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
            setShowOrderInfoPopup(false); // Close order-info popup when clicking outside
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOrderInfoClick = (event) => {
        if (!toggleButtonRef.current.contains(event.target)) {
            setShowOrderInfoPopup(true);
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
                            {(modifyingTime || showOrderInfoPopup) && <div className="overlay"></div>}

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

                            {/* Order Info Popup */}
                            {showOrderInfoPopup && !modifyingTime && (
                                <div className="order-info-popup">
                                    <div className="popup-content">
                                        {/* Content for the order info popup goes here */}
                                        <p>Order Information</p>
                                    </div>
                                </div>
                            )}

                            {/* Takeaway Text */}
                            <div className="order-text">
                                <span>TAKEAWAY</span>
                            </div>

                            {/* Toggle Time Change Button */}
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
