import React, { useState, useEffect } from 'react';
import { useNavigate  } from 'react-router-dom';
import '../css/home.css';
import '../css/main.css';
import '../css/buttons.css';
import powerIcon from '../images/power-icon.png';
import logo from '../images/logo.png';


const Home = () => {

    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');

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

    const navigate = useNavigate();

    const goToOrderScreen = () => {
      navigate('/order');
    };

    return (
        <div className="bg-wrapper">
            <div className="bg-container"></div>
            
            <div className="content-container">
            {/* ################################################################################## */}
                <div className="sunkoshi-text">GURKHA SUNKOSHI</div>

                {/* Button Section */}
                <div className="container1">
                    <button className={`styled-button type1`} onClick={goToOrderScreen}>PLACE ORDER</button>
                    <button className={`styled-button type2`}>RESTAURANT</button>
                    <button className={`styled-button type2`}>ONLINE</button>
                    <button className={`styled-button type2`}>COLLECTIONS</button>
                    <button className={`styled-button type2`}>DELIVERIES</button>
                </div>

                <div className="container2">
                    <button className={`styled-button management`}>management</button>
                </div>

                <div className="container3">
                    <button className={`styled-button bookings`}>BOOKINGS</button>
                </div>
          
                <button className="power-button">
                    <img src={powerIcon} alt="Power Icon" />
                </button>         
            
                <img src={logo} alt="Restaurant Logo" className="restaurant-logo" />

                {/* Live Time and Date Container */}
                <div className="datetime-container">
                    <div className="live-time">{currentTime}</div>
                    <div className="live-date">{currentDate}</div>
                </div>

            {/* ################################################################################## */}
            </div>
        </div>
    );
};

export default Home;
