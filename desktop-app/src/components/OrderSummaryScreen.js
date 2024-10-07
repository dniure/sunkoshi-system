import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import '../css/main.css';
import '../css/orderSummaryScreen.css';
import logo from '../images/logo.png';

const OrderSummaryScreen = () => {
    const navigate = useNavigate();

    //////////////////////////////////////////////////
    // Date & Time    
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');

    // Automatic Updating of date & time
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formattedTime = now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });

            const formattedDate = 
                `${String(now.getDate()).padStart(2, '0')}/` + // Day with leading zero if needed
                `${String(now.getMonth() + 1).padStart(2, '0')}/` + // Month with leading zero if needed (add 1 to get correct month)
                `${now.getFullYear()}`; // Year            

            setCurrentTime(formattedTime);
            setCurrentDate(formattedDate);
        };

        updateTime(); // Initial call to set time immediately
        const intervalId = setInterval(updateTime, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);
            
    // ////////////////////////////////////////////////
    // MAIN HTML
    return (
        <div>
            <span className="gradient-bg" />
            <div className="content-container unselectable">
                
                {/* Title, Logo, Date & Time */}
                <img src={logo} alt="Restaurant Logo" className="restaurant-logo" />
                <div className="datetime-container">
                    <div className="live-time">{currentTime}</div>
                    <div className="live-date">{currentDate}</div>
                </div> 

                <div className="main-container">

                    <div className="summary-mid-section">
                    </div>

                    <div className="summary-right-section">
                    </div>                                   

                </div>

                {/* BOTTOM SECTION */}
                <div>
                    {/* Save and Cancel */}
                    <button className="bottom-btn orderSummaryScreen-cancel" onClick={() => navigate('/')}>exit</button>
                    <button className="bottom-btn orderSummaryScreen-printReceipt" onClick={() => navigate('/')}>print receipt</button>
                    <button className="bottom-btn orderSummaryScreen-save" onClick={() => navigate('/')}>save</button>
                </div>
            </div>
        </div>
    );
};

export default OrderSummaryScreen;