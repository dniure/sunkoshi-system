import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageOrderDetails from './ManageOrderDetails';
import Menu from './Menu';

import '../css/main.css';
import '../css/orderScreen.css';

const OrderScreen = () => {

    // Navigation
    const navigate = useNavigate();
    
    //////////////////////////////////////////////////    
    // Click Handling

    const modifyPopupRef = useRef(null); // Reference to the modify time popup
    const modifyTimeButtonRef = useRef(null); // Reference to the modify time button
    const [isCustomerPopupVisible, setIsCustomerPopupVisible] = useState(false);
    const [orderedItemSelected, setOrderedItemSelected] = useState(null); // Track the selected row

    const orderedItemsRef = useRef(null); // Reference to the entire ordered-items-section
    const menuGridRef = useRef(null);
    const qtyToggle = useRef(null);

    const increaseQuantity = () => {
        if (orderedItemSelected !== null) {
            setSelectedItems(prevItems =>
                prevItems.map((item, index) =>
                    index === orderedItemSelected
                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                        : item
                )
            );
        }
    };
    
    const decreaseQuantity = () => {
        if (orderedItemSelected !== null) {
            setSelectedItems(prevItems => {
                const updatedItems = prevItems
                    .map((item, index) => {
                        // If the selected item is the one being modified
                        if (index === orderedItemSelected) {
                            // If the quantity is greater than 1, decrease it
                            if (item.quantity > 1) {
                                return { ...item, quantity: item.quantity - 1 }; // Decrease quantity
                            } else {
                                // If the quantity is 1, return null to remove it
                                return null; // Indicate this item should be removed
                            }
                        }
                        return item; // Return unchanged item for other items
                    })
                    .filter(item => item !== null); // Remove any null items (those that should be deleted)
    
                // Select the last item if there are still items remaining
                if (updatedItems.length > 0) {
                    setOrderedItemSelected(updatedItems.length - 1); // Select the last item
                } else {
                    setOrderedItemSelected(null); // Deselect if no items are left
                }
    
                return updatedItems; // Return the updated items
            });
        }
    };   

    const handleRowClick = (index) => {
        // If clicking the same row again, unselect it
        if (orderedItemSelected === index) {
        setOrderedItemSelected(null);
        } else {
        setOrderedItemSelected(index);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // If clicking outside the modify time popup and modify button
            if (
                modifyPopupRef.current && 
                !modifyPopupRef.current.contains(event.target) &&
                modifyTimeButtonRef.current && 
                !modifyTimeButtonRef.current.contains(event.target)
            ) {
                setIsModifyingTime(false); // Close modify time popup
            }


            // If clicking outside the ordered-items-section
            if (orderedItemsRef.current && !orderedItemsRef.current.contains(event.target)) {
                // if the click was on a menu item in menu grid
                if (menuGridRef.current && menuGridRef.current.contains(event.target)) {
                    return; // Do nothing, as we're clicking on a menu item
                } else {
                    console.log("outside menu grid item")
                    setOrderedItemSelected(null); // Deselect the selected row
                }
            } else {
                // If clicking inside the ordered-items-section, check if a row was clicked
                const rowElements = orderedItemsRef.current.getElementsByClassName('ordered-item-row');
                for (let i = 0; i < rowElements.length; i++) {
                    if (rowElements[i].contains(event.target) ||
                        (qtyToggle.current && qtyToggle.current.contains(event.target))) {
                        return;
                    }
                }
                // Deselect if clicked outside of any row
                setOrderedItemSelected(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);      

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

    const [selectedItems, setSelectedItems] = useState([]);
    
    const handleMenuItemSelect = (item) => {
        setSelectedItems(prevItems => [...prevItems, item]);
        setOrderedItemSelected(selectedItems.length); // Set the selected item to the last index of the newly added item
    };    
    
    // ////////////////////////////////////////////////
    // MAIN HTML
    return (
        <div>
            <div className="gradient-bg"></div>
            <div className="content-container unselectable">
                <div className="main-container">

                    {/* //////////////////////////////////////////////// */}
                    {/* LEFT SECTION */}

                    <div className="left-section" ref={menuGridRef}>
                        <Menu 
                            onSelect={(item) => handleMenuItemSelect(item)}
                        />
                    </div>

                    {/* //////////////////////////////////////////////// */}
                    {/* RIGHT SECTION */}

                    <div className="right-section">
                        
                        {/* //////////////////////////////////////////////// */}
                        {/* ORDERED ITEMS */}

                        <div className="ordered-items-section" ref={orderedItemsRef}>
                            {/* Setup */}
                            <div className="ordered-items-content">
                                <div className="vertical-line"></div>

                                {/* Combined headers and ordered items */}
                                <div className="headers">
                                    <span className="quantity-label">Q</span>
                                    <span className="item-label">ITEM</span>
                                    <span className="price-label">PRICE</span>
                                </div>

                                {/* Render selected items */}
                                {selectedItems.map((item, index) => (
                                <div
                                    key={index}
                                    className={`ordered-item-row ${orderedItemSelected === index ? 'selected' : ''}`}
                                    onClick={() => handleRowClick(index)} // Handle row click
                                >
                                    <span className="ordered-item quantity">{item.quantity || 1}</span>
                                    <span className="ordered-item name">{item.name}</span>
                                    <span className="ordered-item price">{item.price}</span>
                                </div>
                                ))}
                            </div>

                            <div className="footer">
                                <div className="quantity-buttons" ref={qtyToggle}>
                                    <button
                                        className={`decrease-btn ${orderedItemSelected !== null ? 'active' : ''}`}
                                        onClick={decreaseQuantity}
                                    >
                                        -
                                    </button>
                                    <button
                                        className={`increase-btn ${orderedItemSelected !== null ? 'active' : ''}`}
                                        onClick={increaseQuantity}
                                    >
                                        +
                                    </button>                                  
                                </div>

                                <span className="total">TOTAL</span>
                                <span className="price-sum">£{selectedItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0).toFixed(2)}</span>
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
                <div>
                    <button className="bottom-btn orderScreen cancel" onClick={() => navigate('/')}>cancel</button>
                    <button className="bottom-btn orderScreen save" onClick={() => navigate('/')}>save</button>
                </div>

            </div>
        </div>
    );
};

export default OrderScreen;
