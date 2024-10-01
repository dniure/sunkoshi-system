import React, { useState, useEffect } from 'react';
import { useNavigate  } from 'react-router-dom';
import '../css/home.css';
import '../css/main.css';
import '../css/buttons.css';
import powerIcon from '../images/power-icon.png';
import logo from '../images/logo.png';


const Home = () => {
    //////////////////////////////////////////////////
    // Navigation
    const navigate = useNavigate();

    const goToOrderScreen = () => {
    //   navigate('/OrderScreen');
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
            });            const formattedDate = now.toLocaleDateString('en-US', {
                weekday: 'short', // "Sun"
                day: 'numeric', // "15"
                month: 'short', // "Sep"
                year: 'numeric', // "2024"
            });
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
        <div className="bg-wrapper unselectable">
            <div className="bg-container"></div>
            <div className="content-container">
                
                {/* //////////////////////////////////////////////// */}
                {/* BackGround */}

                {/* Title */}
                <div className="sunkoshi-text">GURKHA SUNKOSHI</div>
                
                {/* Logo */}
                <img src={logo} alt="Restaurant Logo" className="restaurant-logo" />

                {/* Date & Time */}
                <div className="datetime-container">
                    <div className="live-time">{currentTime}</div>
                    <div className="live-date">{currentDate}</div>
                </div>                

                {/* //////////////////////////////////////////////// */}
                {/* Buttons */}
                
                {/* Main Buttons */}
                <div className="container1">
                    <button className={`styled-button type1`} onClick={goToOrderScreen}>PLACE ORDER</button>
                    <button className={`styled-button type2`}>RESTAURANT</button>
                    <button className={`styled-button type2`}>ONLINE</button>
                    <button className={`styled-button type2`}>COLLECTIONS</button>
                    <button className={`styled-button type2`}>DELIVERIES</button>
                </div>

                {/* Button: Management */}
                <div className="container2">
                    <button className={`styled-button management`}>management</button>
                </div>

                {/* Button: Bookings */}
                <div className="container3">
                    <button className={`styled-button bookings`}>BOOKINGS</button>
                </div>          
          
                {/* Button: Power Icon */}
                <button className="power-button">
                    <img src={powerIcon} alt="Power Icon" />
                </button>         
            </div>
        </div>
    );
};

export default Home;
