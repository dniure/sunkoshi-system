import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/home.css';
import '../css/main.css';
import powerIcon from '../images/power-icon.png';
import logo from '../images/logo.png';

const Home = () => {
    //////////////////////////////////////////////////
    // Navigation
    const navigate = useNavigate();

    const goToOrderScreen = () => {
        navigate('/OrderScreen');
    };

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
                    `${now.toLocaleDateString('en-US', { weekday: 'short' })},
                     ${now.getDate()} ${now.toLocaleDateString('en-US', { month: 'short' })}
                     ${now.getFullYear()}`;

            setCurrentTime(formattedTime);
            setCurrentDate(formattedDate);
        };

        updateTime(); // Initial call to set time immediately
        const intervalId = setInterval(updateTime, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    //////////////////////////////////////////////////
    // MAIN HTML
    return (
        <div>
            <div className="gradient-bg"></div>
            
            <div className="content-container unselectable">
                {/* Title, Logo, Date & Time */}
                <div className="sunkoshi-text">GURKHA SUNKOSHI</div>
                <img src={logo} alt="Restaurant Logo" className="restaurant-logo" />
                <div className="datetime-container">
                    <div className="live-time">{currentTime}</div>
                    <div className="live-date">{currentDate}</div>
                </div>

                {/* Buttons */}
                <div className="main-btn-group">
                    <button className="btn place-order" onClick={goToOrderScreen}>PLACE ORDER</button>
                    <button className="btn">RESTAURANT</button>
                    <button className="btn">ONLINE</button>
                    <button className="btn">COLLECTIONS</button>
                    <button className="btn">DELIVERIES</button>
                </div>

                <button className="btn management">management</button>
                <button className="btn bookings">BOOKINGS</button>

                {/* Power Icon */}
                <button className="power-btn">
                    <img src={powerIcon} alt="Power Icon" />
                </button>
            </div>
        </div>
    );
};

export default Home;
