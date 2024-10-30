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
        finalCost: null,
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
        const fetchTempOrderByNumber = async (orderNumberToFetch) => {
            try {
                // Use window.api for fetching order details
                const result = await window.api.fetchTempOrder(orderNumberToFetch);

                if (result) {
                    const { customerID, ...orderData } = result;
                    setOrderDetails(orderData);

                    if (customerID !== null) {
                        setCustomerID(customerID);
                        await fetchCustomerDetails(customerID); // Update this as well
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
                // Use window.api for fetching customer details
                const customerResult = await window.api.fetchCustomerInfo(customerID);

                if (customerResult) {
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

        if (existingOrderNoToEdit) {
            fetchTempOrderByNumber(existingOrderNoToEdit);
        } else {
            setOrderDetails(prev => ({
                ...prev,
                orderTimeInMinutes: 25,
            }));
        }
    }, [existingOrderNoToEdit]);


    //////////////////////////////////////////////////    
    // Click Handling

    // Section: Order Info
    const modifyTimePopupRef = useRef(null);
    const modifyTimeButtonRef = useRef(null);
    const [isModifyingTime, setIsModifyingTime] = useState(false);     

    // Section: Manage Order Details (popup, when clicking on Order Info Section)
    const [isCustomerPopupVisible, setIsCustomerPopupVisible] = useState(false);

    // Section: Ordered Items
    const [orderedItemSelected, setOrderedItemSelected] = useState(null);
    const orderedItemsSectionRef = useRef(null);
    const amendItemButtonRef = useRef(null);
    const amendItemBoxRef = useRef(null);
    const [isAmendingItem, setIsAmendingItem] = useState(false);
    const qtyToggleRef = useRef(null);
    const rightSectionOverlayRef = useRef(null);
    
    const [isLoadingAmendments, setIsLoadingAmendments] = useState(false)
    const handleAmendButtonClick = () => {
        setIsAmendingItem((prevIsAmendingItem) => {
            const newIsAmendingItem = !prevIsAmendingItem;    
            if (newIsAmendingItem) {
                setIsLoadingAmendments(true);
            } else {
                setIsLoadingAmendments(false);
            }
            return newIsAmendingItem;
        });
    };
    
    // Section: Menu Grid
    const menuGridRef = useRef(null);

    // Set Up click listener
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
        else if ((qtyToggleRef.current && qtyToggleRef.current.contains(event.target)) ||
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
        // New state is a copy of orderDetails,
        // with orderedItems being a copy all of orderedItems plus a copy of the passed item
        // with additional fields quantiy and amendments
        setOrderDetails((prev) => ({
            ...prev,
            orderedItems: [...prev.orderedItems, { ...item, quantity: 1, amendments: [] }],
        }));            
        setOrderedItemSelected(orderDetails.orderedItems.length);
    };

    const handleSaveOrder = async () => {
        try {
            if (existingOrderNoToEdit == null) {
                // Use window.api for creating a new order
                const result = await window.api.createTempOrder({ ...orderDetails, formData });
                if (result) {
                    navigate('/OrderSummaryScreen', { state: { orderNumber: result.order.orderNumber } });
                } else {
                    console.error('Error creating order');
                }
            } else {
                // Use window.api for updating an existing order
                const result = await window.api.updateTempOrder({orderDetails});
                if (result) {
                    const result = await window.api.updateCustomerInfo({customerID, formData});
                    if (result) {navigate('/OrderSummaryScreen', { state: { orderNumber: existingOrderNoToEdit } });}
                } else {
                    console.error('Error updating order');
                }
            }
        } catch (error) {
            console.error('Error saving order:', error);
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

                            orderDetails={orderDetails}
                            setOrderDetails={setOrderDetails} 

                            orderedItemSelected={orderedItemSelected}
                            setOrderedItemSelected={setOrderedItemSelected}

                            qtyToggleRef={qtyToggleRef}
                            amendItemBoxRef={amendItemBoxRef}
                            
                            isAmendingItem={isAmendingItem}
                            setIsAmendingItem={setIsAmendingItem}

                            isLoadingAmendments={isLoadingAmendments}
                            setIsLoadingAmendments={setIsLoadingAmendments}
                        />

                        {/* ORDER INFO */}
                        <OrderInfoSection
                            orderDetails={orderDetails}
                            setOrderDetails={setOrderDetails}
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
                        setIsCustomerPopupVisible={setIsCustomerPopupVisible}
                        formData={formData}
                        updateFormData={(newFormData) => setFormData(newFormData)}
                        orderDetails={orderDetails}
                        updateOrderType={(newOrderType) => setOrderDetails(prev => ({ ...prev, orderType: newOrderType}))}
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