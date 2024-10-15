import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import '../css/main.scss';
import '../css/orderSummaryScreen.scss';
import logo from '../images/logo.png';
const OrderSummaryScreen = () => {

    const [orderedItems, setOrderedItems] = useState([
        {
            name: 'Paneer Butter Masala',
            quantity: 1,
            price: 8.99,
            amendments: ['Less spicy']
        },
        {
            name: 'Garlic Naan',
            quantity: 3,
            price: 1.99,
            amendments: ['Less spicy']
        },
        {
            name: 'Masala Dosa',
            quantity: 2,
            price: 4.99,
            amendments: ['Less spicy']
        },
        {
            name: 'Mango Lassi',
            quantity: 2,
            price: 3.50,
            amendments: ['less sweet', 'thicker']
        }
    ]);

    // Displaying Amendments
    const OrderedItemAmendmentsDisplay = ({ amendments }) => {
        return (
            <>
                {amendments && amendments.length > 0 && amendments.map((amendment, aIndex) => (
                    <div key={aIndex} className="ordered-item-amendment">
                        <span>&gt; {amendment}</span>
                    </div>
                ))}
            </>
        );
    }; 
    // *****************************************************
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
            <div className="orderSummaryScreen content-container unselectable">
                
                {/* Title, Logo, Date & Time */}
                <img src={logo} alt="Restaurant Logo" className="restaurant-logo" />
                <div className="datetime-container">
                    <div className="live-time">{currentTime}</div>
                    <div className="live-date">{currentDate}</div>
                </div>

                <div className="timeSinceOrder">
                    <span className="time"> 24 minutes</span>
                    <span className="text"> since order</span>
                </div>
                <div className="mid-section">
                    <div className="header">
                        <span className="orderType">TAKEAWAY</span>
                        <span className="preparationTime">ASAP</span>
                    </div>

                    <div className="body">
                        <div className="orderNo">No. 13</div>
                        <span className="separator"/>
                        <div className="customerName">JAMES</div>
                        <div className="orderedTime">18:55</div>
                        <div className="payment-section">
                            <div className="amountToPay">£34.35</div>
                            <div className="paymentMethod">PAID CASH</div> 
                            <div className="discountToggle">Discount</div> 
                        </div>
                        <div className="notesSection">
                            <div className="notes">Notes</div>
                        </div>

                    </div>
                </div>

                <div className="right-section">
                    <div className="ordered-items">
                        {/* Headers for Quantity, Item, and Price */}
                        <div className="headers">
                            <span className="label quantity">Q</span>
                            <span className="label item">ITEM</span>
                            <span className="label price" style={{paddingRight:'11px'}}>PRICE</span>
                        </div>

                        {/* Ordered Items Content */}
                        <div className="ordered-items-content">
                            <div className="vertical-line"></div>

                            {orderedItems.map((item, index) => (
                                <div key={index}>
                                    <div className="ordered-item-row">
                                        <span className="ordered-item quantity">{item.quantity || 1}</span>
                                        <span className="ordered-item name">{item.name}</span>
                                        <span className="ordered-item price">{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                    </div>
                                    
                                    {/* Display amendments using the new component */}
                                    <OrderedItemAmendmentsDisplay amendments={item.amendments} />
                                </div>
                            ))}
                        </div>     
                
                        {/* Footer for Quantity Control and Total Price */}
                        <div className="footer">                            
                            {/* Total Price Display */}                
                            <span className="total">TOTAL</span>
                            <span className="price-sum">£34.40</span>
                            <span className="final-price">£34.40</span>
                        </div>
                    </div>
                    <div className="editOrderClass">
                        <button class="editOrderBtn">edit order</button>
                    </div>
                </div>                                   

                {/* BOTTOM SECTION */}                
                <div className="buttons">
                    <button className="cancel" onClick={() => navigate('/')}>exit</button>
                    <button className="printReceipt" onClick={() => navigate('/')}>print receipt</button>
                    <button className="save" onClick={() => navigate('/')}>save</button>
                </div>                
            </div>
        </div>
    );
};

export default OrderSummaryScreen;