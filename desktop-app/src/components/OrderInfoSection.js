import React, { useState, useEffect, useRef } from 'react';
import '../css/main.css';
import '../css/orderScreen.css';
import '../css/orderInfoSection.css';


const OrderInfoSection = ({ orderType, formData, modifyPopupRef, setIsCustomerPopupVisible, isModifyingTime, setIsModifyingTime}) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [orderTimeInMinutes, setOrderTimeInMinutes] = useState(25);
    const [isExactTimeAdjusted, setIsExactTimeAdjusted] = useState(false);

    const modifyTimeButtonRef = useRef(null);

    // Sets up a timer to update currentTime every second (for accurate ordering)
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Methods for adjusting time
    const resetOrderTimeToAsap = () => setOrderTimeInMinutes(25);
    const increaseOrderTime = () => setOrderTimeInMinutes(prev => prev + 5);
    const decreaseOrderTime = () => setOrderTimeInMinutes(prev => Math.max(prev - 5, 0));

    const adjustToNearestFive = (type, minutes) => {
        if (type === "increase") {
            return minutes % 5 === 0 ? minutes : Math.ceil(minutes / 5) * 5;
        } else if (type === "decrease") {
            return minutes % 5 === 0 ? minutes : Math.floor(minutes / 5) * 5; // Use floor for decrease
        }
        return minutes; // Default return if neither type matches
    };
    
    const increaseExactTime = () => {
        const minutes = isExactTimeAdjusted
            ? currentTime.getMinutes() + 5 // Already adjusted: just add 5 minutes
            : (
                currentTime.getMinutes() % 5 === 0 // At a 5-minute mark?
                ? currentTime.getMinutes() + 5      // Add 5 minutes directly
                : adjustToNearestFive("increase", currentTime.getMinutes()) // Adjust to next 5-minute mark
            );
        
        setOrderTimeInMinutes(orderTimeInMinutes + (minutes - currentTime.getMinutes())); // Update order time
        setIsExactTimeAdjusted(true); // Mark as adjusted
    };
    
    const decreaseExactTime = () => {
        const minutes = isExactTimeAdjusted
            ? currentTime.getMinutes() - 5 // Already adjusted: just subtract 5 minutes
            : (
                currentTime.getMinutes() % 5 === 0 // At a 5-minute mark?
                ? currentTime.getMinutes() - 5      // Subtract 5 minutes directly
                : adjustToNearestFive("decrease", currentTime.getMinutes()) // Adjust to previous 5-minute mark
            );
    
        // Update the order time in minutes
        setOrderTimeInMinutes(orderTimeInMinutes + (minutes - currentTime.getMinutes())); // Update order time
        setIsExactTimeAdjusted(true); // Mark as adjusted
    };

    // Returns formatted time in HH:MM
    const getFormattedTime = () => {
        const totalMinutes = orderTimeInMinutes + currentTime.getMinutes();
        const hours = (currentTime.getHours() + Math.floor(totalMinutes / 60)) % 24;
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Toggle time modification popup
    const toggleModifyTime = (e) => {
        e.stopPropagation();
        setIsModifyingTime(prev => !prev);

        // If opening the popup, set focus on the popup for accessibility
        if (!isModifyingTime) {
            // Check if modifyPopupRef is defined
            if (modifyPopupRef.current) {
                modifyPopupRef.current.focus(); // Set focus on the popup
            }
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

    return (
        <div className="order-info" onClick={handleOrderInfoClick}>

            {/* Heading */}
            <div className="heading-text">
                <span>{orderType}</span>
            </div>

            {/* Shows Customer Info */}
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
                    e.stopPropagation();
                    setIsModifyingTime((prev) => !prev);
                }} 
                style={{ zIndex: 2 }}
            >
                <span>{orderTimeInMinutes === 25 ? 'ASAP' : getFormattedTime()}</span>
                <span className="arrow"> ▲</span>
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
    );
};

export default OrderInfoSection;