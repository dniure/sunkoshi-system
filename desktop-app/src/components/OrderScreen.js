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

    const modifyPopupRef = useRef(null); // Reference to the modify time popup
    const modifyTimeButtonRef = useRef(null); // Reference to the modify time button
    const [isCustomerPopupVisible, setIsCustomerPopupVisible] = useState(false);
    const [orderedItems, setOrderedItems] = useState([]);
    const [orderedItemSelected, setOrderedItemSelected] = useState(null); // Track the selected row

    const [isModifyingTime, setIsModifyingTime] = useState(false);     

    const orderedItemsRef = useRef(null); // Reference to the entire ordered-items-section
    const menuGridRef = useRef(null);
    const qtyToggle = useRef(null);



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
                    return;
                } else {
                    setOrderedItemSelected(null); // Deselect the selected row
                }
            }
            
            // If clicking inside the ordered-items-section
            // Clicks on toggle qty btn
            else if (qtyToggle.current && qtyToggle.current.contains(event.target)){
                    return
                }
            // Clicks on ordered items (rows)
            else {
                const rowElements = orderedItemsRef.current.getElementsByClassName('ordered-item-row');
                for (let i = 0; i < rowElements.length; i++) {
                    if (rowElements[i].contains(event.target)) {
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

    const handleMenuItemSelect = (item) => {
        const itemWithDefaultQuantity = { ...item, quantity: 1 }; // Add quantity property set to 1
        setOrderedItems(prevItems => [...prevItems, itemWithDefaultQuantity]);
        setOrderedItemSelected(orderedItems.length); // Set the selected item to the last index of the newly added item
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

                        <OrderedItemsSection
                            orderedItemsInput={orderedItems}
                            orderedItemSelectedInput={orderedItemSelected}
                            qtyToggle={qtyToggle}
                            orderedItemsRef={orderedItemsRef}
                            setOrderedItemsInput={setOrderedItems}
                            setOrderedItemSelectedInput={setOrderedItemSelected}
                        />

                        {/* //////////////////////////////////////////////// */}
                        {/* ORDER INFO */}

                        <OrderInfoSection
                            orderType={orderType}
                            formData={formData}
                            modifyPopupRef={modifyPopupRef}
                            setIsCustomerPopupVisible={setIsCustomerPopupVisible}
                            isModifyingTime={isModifyingTime}
                            setIsModifyingTime={setIsModifyingTime}
                        />                        
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