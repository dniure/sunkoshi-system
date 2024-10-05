import React, { useState, useEffect } from 'react';
import '../css/main.css';
import '../css/orderInfoSection.css';


const OrderInfoSection = ({
    orderType,
    formData,
    modifyTimePopupRef,
    setIsCustomerPopupVisible,
    isModifyingTime,
    setIsModifyingTime,
    modifyTimeButtonRef
    }) => {

    const [currentTime, setCurrentTime] = useState(new Date());
    const [orderTimeInMinutes, setOrderTimeInMinutes] = useState(25);

    // Sets up a timer to update currentTime every second (for accurate ordering)
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
   
    const adjustOrderTime = (adjustType, modifyOn) => {
        if (adjustType === "reset") {
            setOrderTimeInMinutes(25);
            return;
        }
        
        if (modifyOn === "timeFromNow") {
            if (adjustType === "increase") {
                setOrderTimeInMinutes(prev => prev + 5);
            } else if (adjustType === "decrease") {
                setOrderTimeInMinutes(prev => Math.max(prev - 5, 0));
            }
        } else if (modifyOn === "exactTime") {
            const modifier = adjustType === "increase" ? 1 : -1;
    
            if ((currentTime.getMinutes() + orderTimeInMinutes) % 5 === 0) {
                setOrderTimeInMinutes(prev => Math.max(prev + (modifier * 5), 0));
            } else {
                for (let i = 1; i < 5; i++) {
                    if ((currentTime.getMinutes() + orderTimeInMinutes + (modifier * i)) % 5 === 0) {
                        setOrderTimeInMinutes(prev => Math.max(prev + (modifier * i), 0));
                        return;
                    }
                }
            }
        }
    };    

    // Returns formatted time in HH:MM
    const getFormattedTime = () => {
        const totalMinutes = orderTimeInMinutes + currentTime.getMinutes();
        const hours = (currentTime.getHours() + Math.floor(totalMinutes / 60)) % 24;
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Clicks inside Order Info
    const handleOrderInfoClick = (event) => {
        // If not currently modifying time and clicked element is outside the modifyTimeButtonRef        
        if (!isModifyingTime && !modifyTimeButtonRef.current.contains(event.target)){            
            setIsCustomerPopupVisible(true);
        }

        // If modifying time and clicking 
        if (isModifyingTime && !modifyTimePopupRef.current.contains(event.target)){            
            setIsModifyingTime(false);
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
                <div className="modify-time-layer" ref={modifyTimePopupRef}>
                    <div className="asap-section">
                        <button className={`asap-button ${orderTimeInMinutes === 25 ? 'selected' : ''}`} onClick={() => adjustOrderTime("reset")}>
                            ASAP
                        </button>
                    </div>
                    <div className="section time-toggle">
                        <button onClick={() => adjustOrderTime("decrease", "timeFromNow")}>-</button>
                        <span>{orderTimeInMinutes} mins</span>
                        <button onClick={() => adjustOrderTime("increase", "timeFromNow")}>+</button>
                    </div>
                    <div className="section exact-time">
                        <button onClick={() => adjustOrderTime("decrease", "exactTime")}>-</button>
                        <span>{getFormattedTime()}</span>
                        <button onClick={() => adjustOrderTime("increase", "exactTime")}>+</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderInfoSection;