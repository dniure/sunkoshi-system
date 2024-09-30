import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageOrderDetails from './ManageOrderDetails';

import '../css/main.css';
import '../css/buttons.css';
import '../css/orderScreen.css';

const OrderScreen = () => {

    // Navigation
    const navigate = useNavigate();
    
    //////////////////////////////////////////////////    
    // Click Handling

    const modifyPopupRef = useRef(null); // Reference to the modify time popup
    const modifyTimeButtonRef = useRef(null); // Reference to the modify time button
    const [isCustomerPopupVisible, setIsCustomerPopupVisible] = useState(false);

    // Initialsie event listener for mouse clicks (mousedown event)
    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    // Clicks outside the modify time popup
    const handleOutsideClick = (event) => {
        if (
            // If modifyPopupRef exists and clicked element is outside it
            modifyPopupRef.current && !modifyPopupRef.current.contains(event.target) &&

            // If modifyTimeButtonRef exists and clicked element is outside it
            modifyTimeButtonRef.current && !modifyTimeButtonRef.current.contains(event.target)
        ) {
            setIsModifyingTime(false);
        }
    };

    // Clicks inside Order Info
    const handleOrderInfoClick = (event) => {
        if (
            // If not currently modifying time and clicked element is outside the modifyTimeButtonRef
            !isModifyingTime && !modifyTimeButtonRef.current.contains(event.target)
        ) {
            setIsCustomerPopupVisible(true);
        }
    };

    // ////////////////////////////////////////////////
    // Order Details
    const [orderType, setOrderType] = useState("takeaway");

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        postcode: '',
        address: '',
        notes: '',
    });

    const handleChanges = (formDataChanges, orderTypeChanges) => {
        setFormData(formDataChanges);
        setOrderType(orderTypeChanges)
    };    

    // ////////////////////////////////////////////////
    // Adjusting Order Time

    const [currentTime, setCurrentTime] = useState(new Date());
    const [isModifyingTime, setIsModifyingTime] = useState(false);     
    const [orderTimeInMinutes, setOrderTimeInMinutes] = useState(25);
    const [isExactTimeAdjusted, setIsExactTimeAdjusted] = useState(false);

    // Sets up a timer to update currentTime every second (for accurate ordering)
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Methods for adjusting time
    const resetOrderTimeToAsap = () => setOrderTimeInMinutes(25);
    const increaseOrderTime = () => setOrderTimeInMinutes(prev => prev + 5);
    const decreaseOrderTime = () => setOrderTimeInMinutes(prev => Math.max(prev - 5, 0));

    // Adjust to the next nearest multiple of 5, unless already a multiple of 5
    const adjustToNearestFive = minutes => (
        minutes % 5 === 0 ? minutes : Math.ceil(minutes / 5) * 5
    );

    const increaseExactTime = () => {
        const minutes = isExactTimeAdjusted
            ? currentTime.getMinutes() + 5 // Already adjusted: just add 5 minutes
            : (
                currentTime.getMinutes() % 5 === 0 // At a 5-minute mark?
                ? currentTime.getMinutes() + 5      // Add 5 minutes directly
                : adjustToNearestFive(currentTime.getMinutes()) // Adjust to next 5-minute mark
            );
        
        setOrderTimeInMinutes(orderTimeInMinutes + (minutes - currentTime.getMinutes())); // Update order time
        setIsExactTimeAdjusted(true); // Mark as adjusted
    };

    const decreaseExactTime = () => {
        setIsExactTimeAdjusted(false);
        decreaseOrderTime();
    };

    // Returns formatted time in HH:MM
    const getFormattedTime = () => {
        const totalMinutes = orderTimeInMinutes + currentTime.getMinutes();
        const hours = (currentTime.getHours() + Math.floor(totalMinutes / 60)) % 24;
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
    
    // ////////////////////////////////////////////////
    // MAIN HTML
    return (
        <div className="bg-wrapper">
            <div className="bg-container"></div>
            <div className="content-container">
                <div className="main-container">

                    {/* //////////////////////////////////////////////// */}
                    {/* LEFT SECTION */}

                    <div className="left-section">
                        <div className="menu-items">
                            {/* Menu goes here */}
                        </div>
                    </div>

                    {/* //////////////////////////////////////////////// */}
                    {/* RIGHT SECTION */}

                    <div className="right-section">
                        
                        {/* //////////////////////////////////////////////// */}
                        {/* ORDERED ITEMS */}

                        <div className="ordered-items">
                            <div className="vertical-line"></div>
                            
                            <div className="headers">
                                <span className="item-label">ITEM</span>
                                <span className="price-label">PRICE</span>
                            </div>

                            <div className="footers">
                                <span className="total">TOTAL</span>
                                <span className="price-sum">£0.00</span>
                                <span className="final-price">£0.00</span>
                            </div>
                        </div>

                        {/* //////////////////////////////////////////////// */}
                        {/* ORDER INFO */}

                        <div className="order-info" onClick={handleOrderInfoClick}>

                            {/* Heading */}
                            <div className="heading-text">
                                <span>{orderType}</span>
                            </div>

                            <div className="info-text">
                                {formData.name ? (
                                    <span>{formData.name}</span>
                                ) : null}
                                {formData.phone ? (
                                    <span>{formData.phone}</span>
                                ) : null}                                
                            </div>

                            {/* Modify Time Button */}
                            <button
                                className="modify-time-button"
                                ref={modifyTimeButtonRef}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsModifyingTime((prev) => !prev);
                                }}
                                style={{ zIndex: 2 }}
                            >
                                <span>{orderTimeInMinutes === 25 ? 'ASAP' : getFormattedTime()}</span>
                                <span className="arrow">▲</span>
                            </button>

                            {/* Dark Overlay */}
                            {isModifyingTime && <div className="order-info-overlay"></div>} 

                            {/* Modify Time Popup */}
                            {isModifyingTime && (
                                <div className="modify-time-layer" ref={modifyPopupRef}>
                                    <div className="asap-section">
                                        <button className={`asap-button ${orderTimeInMinutes === 25 ? 'selected' : ''}`} onClick={resetOrderTimeToAsap}>
                                            ASAP
                                        </button>
                                    </div>
                                    <div className="section time-toggle">
                                        <button onClick={decreaseOrderTime}>-</button>
                                        <span>{orderTimeInMinutes} mins</span>
                                        <button onClick={increaseOrderTime}>+</button>
                                    </div>
                                    <div className="section exact-time">
                                        <button onClick={decreaseExactTime}>-</button>
                                        <span>{getFormattedTime()}</span>
                                        <button onClick={increaseExactTime}>+</button>
                                    </div>
                                </div>
                            )}

                           

                        </div>
                    </div>
                </div>

                {/* //////////////////////////////////////////////// */}
                {/* MANAGE ORDER DETAILS */}
                {isCustomerPopupVisible && (
                    <ManageOrderDetails 
                        formDataInput={formData}
                        orderTypeInput={orderType}
                        handleChanges={handleChanges}
                        onClose={() => setIsCustomerPopupVisible(false)}
                    />
                )}


                {/* //////////////////////////////////////////////// */}
                {/* BOTTOM SECTION */}

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
