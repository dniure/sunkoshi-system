import React, { useState, useEffect } from 'react';
import '../../css/main.scss';
import '../../css/OrderScreen/orderInfoSection.scss';

const OrderInfoSection = ({
    orderType,                 // The type of order (e.g., Delivery, Pickup)
    prepareOrderFor,
    orderDetails,
    setOrderDetails,
    formData,                  // Customer details passed as input
    modifyTimePopupRef,        // Reference for the time modification popup
    setIsCustomerPopupVisible, // Function to show/hide customer info popup
    isModifyingTime,           // Boolean indicating if the time is being modified
    setIsModifyingTime,        // Function to toggle time modification mode
    modifyTimeButtonRef,        // Reference to the modify time button
    orderTimeInMinutes,
}) => {

    //////////////////////////////////////////////////
    const [currentTime, setCurrentTime] = useState(new Date());         // Tracks the current time
    
    // Sets up a timer to update the current time every second for accurate order creation
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer); // Clears the interval when the component unmounts
    }, []);

    useEffect(() => {
        setOrderDetails(prevDetails => ({
            ...prevDetails,
            prepareOrderFor: (orderTimeInMinutes === 25 ? 'ASAP' : getTimeInHHMM())
        }));        
        
    }, [orderTimeInMinutes]);
    
    //////////////////////////////////////////////////
    // Time Adjustment Logic

    const setOrderTimeInMinutes = (newVal) => {
        setOrderDetails(prevDetails => ({
            ...prevDetails,
            orderTimeInMinutes: newVal,
        }));
    };
    
    // Function to adjust the order time based on user actions
    const adjustOrderTime = (adjustType, modifyOn) => {
        // Reset the order time to the default value
        if (adjustType === "reset") {
            setOrderTimeInMinutes(25);
            return;
        }

        // Adjust the time from now (increase or decrease by 5 minutes)
        if (modifyOn === "timeFromNow") {
            const prev = orderDetails.orderTimeInMinutes;
            if (adjustType === "increase") {
                setOrderTimeInMinutes(prev + 5);
            } else if (adjustType === "decrease") {
                setOrderTimeInMinutes(Math.max(prev - 5, 0));
            }
        }

        // Adjust the exact time (in increments aligned with 5-minute intervals)
        else if (modifyOn === "exactTime") {
            const modifier = (adjustType === "increase") ? 1 : -1;

            const prev = orderDetails.orderTimeInMinutes;
            
            if ((currentTime.getMinutes() + orderTimeInMinutes) % 5 === 0) {
                setOrderTimeInMinutes(Math.max(prev + (modifier * 5), 0));
            } else {
                for (let i = 1; i < 5; i++) {
                    if ((currentTime.getMinutes() + orderTimeInMinutes + (modifier * i)) % 5 === 0) {
                        setOrderTimeInMinutes(Math.max(prev + (modifier * i), 0));
                        return;
                    }
                }
            }
        }
    };

    //////////////////////////////////////////////////
    // Time Formatting Logic

    // Returns the formatted order time in HH:MM format
    const getTimeInHHMM = () => {
        const totalMinutes = orderTimeInMinutes + currentTime.getMinutes();
        const hours = (currentTime.getHours() + Math.floor(totalMinutes / 60)) % 24;
        const minutes = totalMinutes % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    //////////////////////////////////////////////////
    // Event Handlers

    // Handles clicks within the order info section
    const handleOrderInfoClick = (event) => {
        // If the user is not modifying time and clicks outside the modify time button
        if (!isModifyingTime && !modifyTimeButtonRef.current.contains(event.target)) {
            setIsCustomerPopupVisible(true); // Show customer info popup
        }

        // If the user is modifying time and clicks outside the time popup
        if (isModifyingTime && !modifyTimePopupRef.current.contains(event.target)) {
            setIsModifyingTime(false); // Hide time modification popup
        }
    };

    //////////////////////////////////////////////////
    // Main Render

    return (
        <div className="order-info" onClick={handleOrderInfoClick}>

            {/* Order Type Heading */}
            <div className="heading-text">
                <span>{orderType}</span>
            </div>

            {/* Customer Info Display */}
            {(formData.name || formData.phone || formData.postcode || formData.address) ? (
                <div className="info-text">
                    {formData.name && <span>{formData.name}</span>}
                    {formData.phone && <span>{formData.phone}</span>}
                    {formData.postcode && <span>{formData.postcode}</span>}
                    {formData.address && <span>{formData.address}</span>}
                </div>
            ) : null}

            {/* Modify Time Button */}
            <button
                className="modify-time-button"
                ref={modifyTimeButtonRef}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent event propagation to parent elements
                    setIsModifyingTime(prev => !prev); // Toggle time modification state
                }}
                style={{ zIndex: 2 }} // Ensure the button appears above other elements
            >
                {/* Display ASAP or the formatted order time */}
                <span>{prepareOrderFor}</span>
                <span className="arrow"> ▲</span>
            </button>

            {/* Dark Overlay (Shown when modifying time) */}
            {isModifyingTime && <div className="order-info-overlay"></div>}

            {/* Modify Time Popup (Visible when the user is modifying time) */}
            {isModifyingTime && (
                <div className="modify-time-layer" ref={modifyTimePopupRef}>
                    <div className="asap-section">
                        {/* ASAP Button */}
                        <button
                            className={`asap-button ${orderTimeInMinutes === 25 ? 'selected' : ''}`}
                            onClick={() => adjustOrderTime("reset")}
                        >
                            ASAP
                        </button>
                    </div>

                    {/* Time Adjustment Buttons (Increment by minutes) */}
                    <div className="section time-toggle">
                        <button onClick={() => adjustOrderTime("decrease", "timeFromNow")}>-</button>
                        <span>{orderTimeInMinutes} mins</span>
                        <button onClick={() => adjustOrderTime("increase", "timeFromNow")}>+</button>
                    </div>

                    {/* Exact Time Adjustment Buttons */}
                    <div className="section exact-time">
                        <button onClick={() => adjustOrderTime("decrease", "exactTime")}>-</button>
                        <span>{getTimeInHHMM()}</span>
                        <button onClick={() => adjustOrderTime("increase", "exactTime")}>+</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderInfoSection;