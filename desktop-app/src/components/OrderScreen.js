import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ManageOrderDetails from './OrderScreen/ManageOrderDetails';
import Menu from './OrderScreen/Menu';
import OrderedItemsSection from './OrderScreen/OrderedItemsSection';
import OrderInfoSection from './OrderScreen/OrderInfoSection';

import '../css/main.scss';
import '../css/orderScreen.scss';

const OrderScreen = () => {
    // User
    const navigate = useNavigate();
    const location = useLocation(); // Import useLocation to access navigation state
    const { orderData } = location.state || {};
    const [newOrder, setNewOrder] = useState(true);

    //////////////////////////////////////////////////    
    // Click Handling

    // Section: Order Info
    const modifyTimePopupRef = useRef(null);
    const modifyTimeButtonRef = useRef(null);
    const [isModifyingTime, setIsModifyingTime] = useState(false);     

    // Section: Manage Order Details (popup, when clicking on Order Info Section)
    const [isCustomerPopupVisible, setIsCustomerPopupVisible] = useState(false);
    const [orderType, setOrderType] = useState("takeaway");
    const [prepareOrderFor, setPrepareOrderFor] = useState('Unknown');
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
    const orderedItemsSectionRef = useRef(null);
    const amendItemButtonRef = useRef(null);
    const amendItemBoxRef = useRef(null);
    const qtyToggle = useRef(null);
    const rightSectionOverlayRef = useRef(null);
    const [isAmendingItem, setIsAmendingItem] = useState(false);
    
    const [loadAmendments, setLoadAmendments] = useState(false)
    const handleAmendButtonClick = () => {
        setIsAmendingItem((prevIsAmendingItem) => {
            const newIsAmendingItem = !prevIsAmendingItem;    
            if (newIsAmendingItem) {
                setLoadAmendments(true);
            } else {
                setLoadAmendments(false);
            }
            return newIsAmendingItem;
        });
    };
    
    // Section: Menu Grid
    const menuGridRef = useRef(null);

    // Check for order data from navigation state
    useEffect(() => {
        if (orderData) {
            console.log("\n\nEDITING ORDER*****************");
            setNewOrder(false);

            setOrderType(orderData.order.orderType || "UNKNOWN");
            setOrderedItems(orderData.order.orderedItems || [])
            setPrepareOrderFor(orderData.order.prepareOrderFor)

            setFormData({
                name: orderData.customerInfo.name,
                phone: orderData.customerInfo.phone,
                postcode: orderData.customerInfo.postcode,
                address: orderData.customerInfo.address,
                notes: orderData.customerInfo.notes,
            })
        }
    }, [location.state]);

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

        // Deselect row if clicked outside ordered-items-section but not on menu grid, amend item button, or amending item box
        if (clickedOutside(orderedItemsSectionRef)) {
            if (menuGridRef.current && menuGridRef.current.contains(event.target)){
                setIsAmendingItem(false);
            }
            else if (amendItemButtonRef.current && amendItemButtonRef.current.contains(event.target)) {
                return; // Do nothing
            }
            else if (rightSectionOverlayRef.current && rightSectionOverlayRef.current.contains(event.target)){
                console.log("clicking here");
                setIsAmendingItem(false);
            } else {
                setOrderedItemSelected(null);
                setIsAmendingItem(false);
            }
        }

        // Handle clicks inside ordered-items-section

        // If clicked in qty toggle or amendItemBox do nothing
        else if ((qtyToggle.current && qtyToggle.current.contains(event.target)) ||
            (amendItemBoxRef.current && amendItemBoxRef.current.contains(event.target))) {
            return;
        } else {
            // Get all ordered item rows
            const rowElements = orderedItemsSectionRef.current?.getElementsByClassName('ordered-item-row') || [];

            // Check if any row was clicked
            for (let row of rowElements) {            
                if (row.contains(event.target)) {
                    return;
                }
            }

            // If no row was clicked, deselect the selected row
            setIsAmendingItem(false);
            setOrderedItemSelected(null);
        }
    };

    const handleMenuItemSelect = (item) => {
        setOrderedItems(prevItems => [...prevItems, { ...item, quantity: 1, amendments: []}]);
        setOrderedItemSelected(orderedItems.length);
    };

    const handleSaveOrder = async () => {
        if (newOrder){
            // Data to input to server
            const orderData = {
                orderType,
                prepareOrderFor,
                formData,
                orderedItems,
                paymentMethod: 'SELECT',
            };

            try {
                const response = await fetch('http://localhost:3001/tempOrders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Input to server
                    body: JSON.stringify(orderData),
                });

                // Output from server
                const result = await response.json();

                console.log("result: ", result);

                if (response.ok) {
                    navigate('/OrderSummaryScreen', { state: { orderData: result} });
                } else {
                    console.error('Error creating order:', result);
                }
            } catch (error) {
                console.error('Error saving temporary order:', error);
            }
        } else{
            console.log("orderData: ", orderData);
            navigate('/OrderSummaryScreen', { state: { orderData: orderData} });
        }
    };
            
    // ////////////////////////////////////////////////
    // MAIN HTML
    return (
        <div>
            <div className="gradient-bg" />
            <div className="orderScreen content-container unselectable">
                <div className="main-container">
                    
                    {/* MAIN SCREEN */}
                    <div className="left-section">
                        <Menu
                            onSelect={(item) => handleMenuItemSelect(item)}
                            menuGridRef={menuGridRef}
                        />
                    </div>

                    <div className="right-section">      
                        {isAmendingItem && (
                            <div className="right-section-overlay" ref={rightSectionOverlayRef} />
                        )}

                        {/* ORDERED ITEMS */}
                        <OrderedItemsSection
                            orderedItemsSectionRef={orderedItemsSectionRef}

                            orderedItemsInput={orderedItems}
                            setOrderedItemsInput={setOrderedItems} 

                            orderedItemSelectedInput={orderedItemSelected}
                            setOrderedItemSelectedInput={setOrderedItemSelected}

                            qtyToggle={qtyToggle}

                            amendItemBoxRef={amendItemBoxRef}
                            isAmendingItem={isAmendingItem}
                            setIsAmendingItem={setIsAmendingItem}

                            loadAmendments={loadAmendments}
                            setLoadAmendments={setLoadAmendments}
                        />

                        {/* ORDER INFO */}
                        <OrderInfoSection
                            orderType={orderType}
                            prepareOrderFor={prepareOrderFor}
                            setPrepareOrderFor={setPrepareOrderFor}
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
                    <button
                        className="bottom-btn orderScreen-amendItem-btn"
                        onClick={() => handleAmendButtonClick()}
                        ref={amendItemButtonRef}
                        disabled={orderedItemSelected === null} // Disable the button if no item is selected
                    >
                        amend item
                    </button>

                    {/* Save and Cancel */}
                    <button className="bottom-btn orderScreen-cancel" onClick={() => navigate('/')}>cancel</button>
                    <button className="bottom-btn orderScreen-save" onClick={handleSaveOrder}>save</button>
                    <button className="bottom-btn orderScreen-next" onClick={handleSaveOrder}>next</button>
                </div>
            </div>
        </div>
    );
};

export default OrderScreen;