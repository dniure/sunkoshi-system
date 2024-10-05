import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageOrderDetails from './ManageOrderDetails';
import Menu from './Menu';
import OrderedItemsSection from './OrderedItemsSection';
import OrderInfoSection from './OrderInfoSection';

import '../css/main.css';
import '../css/orderScreen.css';

const OrderScreen = () => {

    // Navigation
    const navigate = useNavigate();
    
    //////////////////////////////////////////////////    
    // Click Handling

    // Section: Order Info
    const modifyTimePopupRef = useRef(null);
    const modifyTimeButtonRef = useRef(null);
    const [isModifyingTime, setIsModifyingTime] = useState(false);     

    // Section: Manage Order Details (popup, when clicking on Order Info Section)
    const [isCustomerPopupVisible, setIsCustomerPopupVisible] = useState(false);
    const [orderType, setOrderType] = useState("takeaway");
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        postcode: '',
        address: '',
        notes: '',
    });
    
    const updateOrderDetails = (formDataChanges, orderTypeChanges) => {
        setFormData(formDataChanges);
        setOrderType(orderTypeChanges);
    };

    // Section: Ordered Items
    const [orderedItems, setOrderedItems] = useState([]);
    const [orderedItemSelected, setOrderedItemSelected] = useState(null);
    const orderedItemsRef = useRef(null);
    const qtyToggle = useRef(null);

    // Section: Menu Grid
    const menuGridRef = useRef(null);


    // Click Handling
    useEffect(() => {    
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, []);

    const handleClick = (event) => {
        const clickedOutside = (ref) => ref.current && !ref.current.contains(event.target);

        // Close modify time popup if clicked outside the modify popup or button
        if (clickedOutside(modifyTimePopupRef) && clickedOutside(modifyTimeButtonRef)) {
            setIsModifyingTime(false);
        }

        // Deselect row if clicked outside ordered-items-section but not on menu grid
        if (clickedOutside(orderedItemsRef)) {
            if (menuGridRef.current && menuGridRef.current.contains(event.target)) {
                return; // Clicked on a menu item in menu grid, do nothing
            } else {
                setOrderedItemSelected(null); // Deselect any selected row
            }
        }

        // Handle clicks inside ordered-items-section
        else if (qtyToggle.current && qtyToggle.current.contains(event.target)) {
            return; // Clicked on quantity toggle button, do nothing
        } else {
            // Get all ordered item rows
            const rowElements = orderedItemsRef.current?.getElementsByClassName('ordered-item-row') || [];

            // Check if any row was clicked
            for (let row of rowElements) {
                if (row.contains(event.target)) {
                    console.log("Row was clicked");
                    return;
                }
            }

            // If no row was clicked, deselect the selected row
            setOrderedItemSelected(null);
        }
    };

    const handleMenuItemSelect = (item) => {
        // Add new item to the list
        setOrderedItems(prevItems => [...prevItems, { ...item, quantity: 1 }]);
        // Select the new item
        setOrderedItemSelected(orderedItems.length);
    };    
    
    // ////////////////////////////////////////////////
    // MAIN HTML
    return (
        <div>
            <span className="gradient-bg" />
            <div className="content-container unselectable">
                <div className="main-container">
                    
                    {/* MAIN SCREEN */}
                    <div className="left-section" ref={menuGridRef}>
                        <Menu onSelect={(item) => handleMenuItemSelect(item)} />
                    </div>

                    <div className="right-section">      

                        {/* ORDERED ITEMS */}
                        <OrderedItemsSection
                            orderedItemsInput={orderedItems}
                            orderedItemSelectedInput={orderedItemSelected}
                            qtyToggle={qtyToggle}
                            orderedItemsRef={orderedItemsRef}
                            setOrderedItemsInput={setOrderedItems}
                            setOrderedItemSelectedInput={setOrderedItemSelected}
                        />

                        {/* ORDER INFO */}
                        <OrderInfoSection
                            orderType={orderType}
                            formData={formData}
                            modifyTimePopupRef={modifyTimePopupRef}
                            setIsCustomerPopupVisible={setIsCustomerPopupVisible}
                            isModifyingTime={isModifyingTime}
                            setIsModifyingTime={setIsModifyingTime}
                            modifyTimeButtonRef={modifyTimeButtonRef}
                        />                        
                    </div>
                </div>

                {/* MANAGE ORDER DETAILS */}
                {isCustomerPopupVisible && (
                    <ManageOrderDetails 
                        formDataInput={formData}
                        orderTypeInput={orderType}
                        updateOrderDetails={updateOrderDetails}
                        onClose={() => setIsCustomerPopupVisible(false)}
                    />
                )}

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