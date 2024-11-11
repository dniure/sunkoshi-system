import React, { useState, useEffect } from 'react';
import '../../css/main.scss';
import '../../css/OrderScreen/orderInfoSection.scss';

const OrderInfoSection = ({
    orderDetails,
    setOrderDetails,
    customerDetails,
    modifyTimePopupRef,
    setIsCustomerPopupVisible,
    isModifyingTime,
    setIsModifyingTime,
    modifyTimeButtonRef,        
}) => {

    //////////////////////////////////////////////////
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer); // Clears the interval when the component unmounts
    }, []);

    useEffect(() => {
        setOrderDetails(prev => ({
            ...prev,
            prepareOrderFor: (orderDetails.orderTimeInMinutes === 45 && orderDetails.orderType === 'delivery') || 
                (orderDetails.orderTimeInMinutes === 25 && (orderDetails.orderType === 'takeaway' || orderDetails.orderType === 'collection')) 
                ? 'ASAP' 
                : getTimeInHHMM(orderDetails.orderTimeInMinutes)
        }));        
        
    }, [orderDetails.orderTimeInMinutes]);
    
    //////////////////////////////////////////////////
    // Time Adjustment Logic

    const setOrderTimeInMinutes = (newVal) => {
        setOrderDetails(prev => ({
            ...prev,
            orderTimeInMinutes: newVal,
        }));  
    };
    
    // Function to adjust the order time based on user actions
    const adjustOrderTime = (adjustType, modifyOn) => {
        // Reset the order time to the default value
        if (adjustType === "reset") {
            if (orderDetails.orderType == 'takeaway' || orderDetails.orderType == 'collection'){
                setOrderTimeInMinutes(25);
            }
            else if (orderDetails.orderType == 'delivery') {
                setOrderTimeInMinutes(45);
            }
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
            
            if ((currentTime.getMinutes() + orderDetails.orderTimeInMinutes) % 5 === 0) {
                setOrderTimeInMinutes(Math.max(prev + (modifier * 5), 0));
            } else {
                for (let i = 1; i < 5; i++) {
                    if ((currentTime.getMinutes() + orderDetails.orderTimeInMinutes + (modifier * i)) % 5 === 0) {
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
        const totalMinutes = orderDetails.orderTimeInMinutes + currentTime.getMinutes();
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
                <span>{orderDetails.orderType}</span>
            </div>

            {/* Customer Info Display */}
            {(customerDetails.name || customerDetails.phone || customerDetails.postcode || customerDetails.address) ? (
                <div className="info-text">
                    {customerDetails.name && <span>{customerDetails.name}</span>}
                    {customerDetails.phone && <span>{customerDetails.phone}</span>}
                    {customerDetails.address && <span>{customerDetails.address}</span>}
                    {customerDetails.postcode && <span>{customerDetails.postcode}</span>}
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
                <span>{orderDetails.prepareOrderFor}</span>
                <span className="arrow"> ▲</span>
            </button>

            {/* Dark Overlay (Shown when modifying time) */}
            {isModifyingTime && <div className="order-info-overlay"/>}

            {/* Modify Time Popup (Visible when the user is modifying time) */}
            {isModifyingTime && (
                <div className="modify-time-layer" ref={modifyTimePopupRef}>
                    <div className="asap-section">
                        {/* ASAP Button */}
                        <button
                            className={`asap-button ${
                                (orderDetails.orderType === 'delivery' && orderDetails.orderTimeInMinutes === 45) ||
                                ((orderDetails.orderType === 'takeaway' || orderDetails.orderType === 'collection') && orderDetails.orderTimeInMinutes === 25)
                                ? 'selected' : ''
                            }`}
                            onClick={() => adjustOrderTime("reset")}
                        >
                            ASAP
                        </button>
                    </div>

                    {/* Time Adjustment Buttons (Increment by minutes) */}
                    <div className="section time-toggle">
                        <button onClick={() => adjustOrderTime("decrease", "timeFromNow")}>-</button>
                        <span>{orderDetails.orderTimeInMinutes} mins</span>
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