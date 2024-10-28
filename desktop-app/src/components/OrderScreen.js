import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ManageOrderDetails from './OrderScreen/ManageOrderDetails';
import Menu from './OrderScreen/Menu';
import OrderedItemsSection from './OrderScreen/OrderedItemsSection';
import OrderInfoSection from './OrderScreen/OrderInfoSection';

import '../css/main.scss';
import '../css/orderScreen.scss';

const OrderScreen = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { existingOrderNoToEdit } = location.state || {};

    const [customerID, setCustomerID] = useState(null);
    const [orderDetails, setOrderDetails] = useState({
        orderType: "takeaway",
        prepareOrderFor: 'Unknown',
        orderTimeInMinutes: null,
        orderedItems: [],
        priceSum: null,
        discounts:[],
        fees: [],
        finalSum: null,
        paymentMethod: 'Unknown'
    });    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        postcode: '',
        address: '',
        notes: '',
    });

    // Fetches full order info if an order number is passed
    useEffect(() => {
        // Fetch Existing Order Info
        const fetchTempOrderByNumber = async (orderNumberToFetch) => {
            try {
                const response = await fetch(`http://localhost:3001/tempOrders/${orderNumberToFetch}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const result = await response.json();
    
                if (response.ok) {
                    const { customerID, ...orderData } = result;
                    setOrderDetails(orderData);
                    if (customerID) {
                        setCustomerID(customerID);
                        await fetchCustomerDetails(customerID);
                    }
                } else {
                    console.error('Temporary order not found');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            }
        };
        
        // Fetch Existing Customer Info
        const fetchCustomerDetails = async (customerID) => {
            try {
                const customerResponse = await fetch(`http://localhost:3001/customers/${customerID}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const customerResult = await customerResponse.json();
    
                if (customerResponse.ok) {
                    setFormData({
                        name: customerResult.name || '',
                        phone: customerResult.phone || '',
                        postcode: customerResult.postcode || '',
                        address: customerResult.address || '',
                        notes: customerResult.notes || '',
                    });
                } else {
                    console.error('Customer not found');
                }
            } catch (error) {
                console.error('Error fetching customer details:', error);
            }
        };
        
        // If an existing order number is passed, fetch it
        if (existingOrderNoToEdit){
            fetchTempOrderByNumber(existingOrderNoToEdit);   
        }
        // else set the orderTimeInMinutes to 25
        else {
            setOrderDetails((prev) => ({
                ...prev,
                orderTimeInMinutes: 25,
            }));        }
    }, [existingOrderNoToEdit]);  

    //////////////////////////////////////////////////    
    // Click Handling

    // Section: Order Info
    const modifyTimePopupRef = useRef(null);
    const modifyTimeButtonRef = useRef(null);
    const [isModifyingTime, setIsModifyingTime] = useState(false);     

    // Section: Manage Order Details (popup, when clicking on Order Info Section)
    const [isCustomerPopupVisible, setIsCustomerPopupVisible] = useState(false);
    
    const setOrderInfo = (formDataChanges, orderTypeChanges) => {
        setFormData(formDataChanges);
        setOrderDetails(({
            orderType: orderTypeChanges,
        }));
    };

    // Section: Ordered Items
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
        setOrderDetails((prev) => ({
            ...prev,
            orderedItems: prevItems => [...prevItems, { ...item, quantity: 1, amendments: []}],
        }));
        setOrderedItemSelected(orderDetails.orderedItems.length);
    };

    const handleSaveOrder = async () => {
        if (!existingOrderNoToEdit){            
            // Data to input to server            
            const newOrderData = {
                orderType: orderDetails.orderType,
                orderTimeInMinutes: orderDetails.orderTimeInMinutes,
                prepareOrderFor: orderDetails.prepareOrderFor,
                orderedItems: orderDetails.orderedItems,
                paymentMethod: orderDetails.paymentMethod,
                formData,
            };
    
            try {
                // Server creates a record for this order
                const response = await fetch('http://localhost:3001/tempOrders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Input to server
                    body: JSON.stringify(newOrderData),
                });
    
                // Server returns the record (everything about the order)
                const result = await response.json();
    
                if (response.ok) {
                    navigate('/OrderSummaryScreen', { state: { orderNumber: result.order.orderNumber} });
                } else {
                    console.error('Error creating order:', result);
                }
            } catch (error) {
                console.error('Error saving temporary order:', error);
            }
        } else {
            // Data to update the existing order
            const updatedOrderData = {
                orderType: orderDetails.orderType,
                prepareOrderFor: orderDetails.prepareOrderFor,
                orderTimeInMinutes: orderDetails.orderTimeInMinutes,
                orderedItems: orderDetails.orderedItems,
                paymentMethod: orderDetails.paymentMethod,
            };
    
            try {
                // Server updates the existing order
                const response = await fetch(`http://localhost:3001/tempOrders/${existingOrderNoToEdit}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedOrderData),
                });
    
                // Server returns the updated record
                const result = await response.json();
        
                if (response.ok) {
                    const customerResponse = await fetch(`http://localhost:3001/customers/${customerID}`, {
                        method: 'PUT', // or 'PATCH' depending on your server setup
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData),
                    });

                    const customerResult = await customerResponse.json();
                    
                    if (!customerResponse.ok) {
                        console.error('Error updating customer:', customerResult);
                    }

                    navigate('/OrderSummaryScreen', { state: { orderNumber: existingOrderNoToEdit } });
                } else {
                    console.error('Error updating order:', result);
                }
            } catch (error) {
                console.error('Error updating existing order:', error);
            }
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

                            orderedItemsInput={orderDetails.orderedItems}
                            orderDetails={orderDetails}
                            setOrderDetails={setOrderDetails} 

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
                            orderType={orderDetails.orderType}
                            prepareOrderFor={orderDetails.prepareOrderFor}
                            orderDetails={orderDetails}
                            setOrderDetails={setOrderDetails}
                            formData={formData}
                            modifyTimePopupRef={modifyTimePopupRef}
                            setIsCustomerPopupVisible={setIsCustomerPopupVisible}
                            isModifyingTime={isModifyingTime}
                            setIsModifyingTime={setIsModifyingTime}
                            modifyTimeButtonRef={modifyTimeButtonRef}
                            orderTimeInMinutes={orderDetails.orderTimeInMinutes}
                        />                        
                    </div>
                </div>

                {/* MANAGE ORDER DETAILS */}
                {isCustomerPopupVisible && (
                    <ManageOrderDetails 
                        formDataInput={formData}
                        orderTypeInput={orderDetails.orderType}
                        setOrderInfo={setOrderInfo}
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