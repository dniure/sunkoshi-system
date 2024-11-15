import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import '../css/main.scss';
import '../css/orderSummaryScreen.scss';
import '../css/OrderScreen/orderedItemsSection.scss';

import logo from '../images/logo.png';
const OrderSummaryScreen = () => {
    const location = useLocation();
    const { orderNumber } = location.state || {};

    const [orderDetails, setOrderDetails] = useState({
        orderType: "takeaway",
        prepareOrderFor: 'Unknown',
        orderTimeInMinutes: null,
        orderedItems: [],
        discounts:[],
        fees: [],
        totalPrice: null,
        finalCost: null,
        paymentMethod: 'notPaid'
    });     

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        postcode: '',
        address: '',
        notes: '',
    });

    let customerDisplayName;
    const [orderCreatedDate, setOrderCreatedDate] = useState(null);
    const [orderCreatedAtTime, setOrderCreatedAtTime] = useState('');
    const [minutesSinceOrder, setMinutesSinceOrder] = useState('')

    // Fetching Orders and Customer Details
    useEffect(() => {
        const fetchTempOrderByNumber = async (orderNumberToFetch) => {
            try {
                const result = await window.api.fetchTempOrder(orderNumberToFetch);
                const { customerID, ...orderData } = result;
                
                setOrderDetails(orderData);
    
                const orderCreatedDate = new Date(orderData.createdAt);
                setOrderCreatedDate(orderCreatedDate);
                const hours = String(orderCreatedDate.getHours()).padStart(2, '0');
                const minutes = String(orderCreatedDate.getMinutes()).padStart(2, '0');
                setOrderCreatedAtTime(`${hours}:${minutes}`);
    
                if (customerID) {
                    await fetchCustomerDetails(customerID); // Ensure this is awaited
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            }
        };
    
        const fetchCustomerDetails = async (customerID) => {
            try {
                const customerResult = await window.api.fetchCustomerInfo(customerID);
    
                setFormData({
                    name: customerResult.name || '',
                    phone: customerResult.phone || '',
                    postcode: customerResult.postcode || '',
                    address: customerResult.address || '',
                    notes: customerResult.notes || '',
                });
            } catch (error) {
                console.error('Error fetching customer details:', error);
            }
        };    
        fetchTempOrderByNumber(orderNumber);
    }, [orderNumber]); // Ensure orderNumber is a dependency if it changes    
        
    const handleEditOrderClick = () => {
        navigate('/OrderScreen', { state: { existingOrderNoToEdit: orderNumber} });
    }
    
    customerDisplayName = formData.name || orderDetails.orderType

    // Function to cycle through payment methods
    const handlePaymentMethodClick = () => {
        const paymentMethods = ['notPaid', 'Cash', 'Card'];
        const currentIndex = paymentMethods.indexOf(orderDetails.paymentMethod);
        const nextIndex = (currentIndex + 1) % paymentMethods.length;
        setOrderDetails(prevDetails => ({
            ...prevDetails,
            paymentMethod: paymentMethods[nextIndex],
        }));
    };

    const handleDiscountClick = () => {
        const discountValues = [null, '10%', '20%', '30%'];
        const currentDiscountIndex = discountValues.indexOf(orderDetails.discount);
        const nextDiscountIndex = (currentDiscountIndex + 1) % discountValues.length;
        setOrderDetails(prevDetails => ({
            ...prevDetails,
            discount: discountValues[nextDiscountIndex],
        }));
    };
    
    
    // ***********************************************************************

    const itemsContainerRef = useRef(null);
    const rowRefs = useRef([]);
    const orderedItemsScrollerRef = useRef(null);  // Ref for the scroller handle

    // Main Scroller
    const [scrollPosition, setScrollPosition] = useState(0);  // Scroll position of the list
    const [isDragging, setIsDragging] = useState(false);  // Whether the scrollbar handle is being dragged
    const [isOrderedItemsScrollerVisible, setisOrderedItemsScrollerVisible] = useState(false);  // Visibility of the scrollbar
    const [handleHeight, setHandleHeight] = useState(50);  // Height of the scrollbar handle
    const [dragOffset, setDragOffset] = useState(0);  // Offset for dragging the scrollbar handle
    
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

    // Handle mouse movement for dragging the scroller handle
    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !itemsContainerRef.current || !orderedItemsScrollerRef.current) return;

        const scrollerHandle = document.querySelector('.orderedItemsScroller-handle');
        const scrollerHeight = orderedItemsScrollerRef.current.clientHeight;
        const scrollableHeight = itemsContainerRef.current.scrollHeight - itemsContainerRef.current.clientHeight;

        // Calculate new position and scroll content accordingly
        const handlePosition = Math.max(0, Math.min(e.clientY - orderedItemsScrollerRef.current.getBoundingClientRect().top - dragOffset, scrollerHeight - scrollerHandle.clientHeight));
        itemsContainerRef.current.scrollTop = (handlePosition / (scrollerHeight - scrollerHandle.clientHeight)) * scrollableHeight;

        setScrollPosition(handlePosition);
    }, [isDragging, dragOffset]);


    // ***********************************************************************
    // Update scrollbar handle visibility and height when ordered items change
    useEffect(() => {
        if (itemsContainerRef.current) {
            // Calculate total height of all rows
            const totalOccupiedHeight = orderDetails.orderedItems.reduce((acc, item, index) => {
                const row = rowRefs.current[index]; // Get each row reference
                if (row) {
                    // console.log("row detected: ", row);
                    // Base height is the row's offsetHeight (height of the ordered item row)
                    let rowHeight = row.offsetHeight;
                    
                    // Add amendment height if there are amendments for this item
                    if (Array.isArray(item.amendments) && item.amendments.length > 0) {
                        // console.log("there's ", item.amendments.length, "amendments");
                        const amendmentRowHeight = 16; // Assuming each amendment takes 16px of height
                        const totalAmendmentsHeight = item.amendments.length * amendmentRowHeight;
                        rowHeight += totalAmendmentsHeight;
                    }

                    // Accumulate the total height
                    return acc + rowHeight;
                }
                return acc;
            }, 0);            

            const containerHeight = itemsContainerRef.current.offsetHeight + 8;
            // console.log("containerHeight: ", containerHeight);
            // console.log("totalOccupiedHeight: ", totalOccupiedHeight);

            setisOrderedItemsScrollerVisible(totalOccupiedHeight >= containerHeight);
            itemsContainerRef.current.style.overflowY = totalOccupiedHeight >= containerHeight ? 'auto' : 'hidden';

            const calculatedHandleHeight = Math.max(20, (containerHeight - 40) * (containerHeight / totalOccupiedHeight));

            setHandleHeight(Math.min(calculatedHandleHeight, containerHeight));
        }
    }, [orderDetails.orderedItems]);

    // ***************************************************  
    // Update ordered items scroller on mouse scroll
    const handleOrderedItemsScroll = useCallback(() => {
        if (itemsContainerRef.current && orderedItemsScrollerRef.current) {
            const scrollableHeight = itemsContainerRef.current.scrollHeight - itemsContainerRef.current.clientHeight;
            const scrollerHeight = orderedItemsScrollerRef.current.clientHeight;
            const handleMaxPos = scrollerHeight - document.querySelector('.orderedItemsScroller-handle').clientHeight;
            setScrollPosition((itemsContainerRef.current.scrollTop / scrollableHeight) * handleMaxPos);
        }
    }, []);

    useEffect(() => {
        const orderedItemsContent = itemsContainerRef.current;
        
        if (orderedItemsContent) {
            orderedItemsContent.addEventListener('scroll', handleOrderedItemsScroll);
        }
    
        // Cleanup listener on component unmount
        return () => {
            if (orderedItemsContent) {
                orderedItemsContent.removeEventListener('scroll', handleOrderedItemsScroll);
            }
        };
    }, [handleOrderedItemsScroll]);
    
    
    // Handles mouse down on the scroller handle for dragging
    const handleMouseDown = (e) => {
        const handleElement = document.querySelector('.orderedItemsScroller-handle');
        const offset = e.clientY - handleElement.getBoundingClientRect().top;
        setDragOffset(offset);
        setIsDragging(true);
    };  
    
    // Add mousemove and mouseup event listeners when dragging starts
    useEffect(() => {
        const handleMouseMoveWrapper = (e) => {
            if (isDragging) {
                handleMouseMove(e);
            }
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMoveWrapper);
            
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMoveWrapper);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove]);  
    

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

            if (orderCreatedDate) {
                setMinutesSinceOrder(Math.floor((now - orderCreatedDate) / 60000));
            }
            
        }
        updateTime(); // Initial call to set time immediately
        const intervalId = setInterval(updateTime, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [orderCreatedDate]);

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
                    <span className="time">
                    {minutesSinceOrder} {minutesSinceOrder === 1 ? "minute" : "minutes"}
                    </span>
                    <span className="text"> since order</span>
                </div>

                {/* *************************************************** */}
                {/* MID SECTION */}
                <div className="mid-section">
                    <div className="header">
                        <span className="orderType">{orderDetails.orderType}</span>
                        <span className="preparationTime">{orderDetails.prepareOrderFor}</span>
                    </div>

                    <div className="body">
                        <div className="orderNo">No. {orderDetails.orderNumber}</div>
                        <span className="separator"/>
                        <div className="customerName">{customerDisplayName}</div>
                        <div className="orderedTime"
                             style={{textTransform: 'none'}}
                             >Ordered At: {orderCreatedAtTime}
                        </div>
                        <div className="payment-section">
                            <div className="amountToPay">£{orderDetails.finalCost}</div>
                            <div className={`paymentMethod ${
                                (orderDetails.paymentMethod?.toLowerCase() === 'notpaid') ? 'notPaid' : 'paid'
                                }`}
                                onClick={handlePaymentMethodClick}
                            >
                                {orderDetails.paymentMethod?.toLowerCase() === 'notpaid'
                                ? 'Not Paid'
                                : `Paid: ${orderDetails.paymentMethod}`}
                            </div>                            

                            <div className="discountToggle">
                                <span className="discountLabel">Discount:</span>
                                <span className={`discountValue ${
                                    orderDetails.discount ? 'discounted': ''}
                                }`} onClick={handleDiscountClick}>{orderDetails.discount || 'None'}</span>
                            </div>
                        </div>
                        <div className="notesSection">
                            <div className="notes">Notes {formData.notes}</div>
                        </div>

                    </div>
                </div>
                
                {/* *************************************************** */}
                {/* RIGHT SECTION */}
                <div className="right-section">
                    <div className="ordered-items">
                        {/* Headers for Quantity, Item, and Price */}
                        <div className="headers">
                            <span className="label quantity">Q</span>
                            <span className="label item">ITEM</span>
                            <span className="label price" style={{paddingRight:'11px'}}>PRICE</span>
                        </div>

                        {/* Ordered Items Content */}
                        <div className="content" ref={itemsContainerRef}>
                            <div className="vertical-line" />

                            {orderDetails.orderedItems.map((item, index) => (
                                <div key={index}>
                                    <div className="ordered-item-row" ref={(el) => (rowRefs.current[index] = el)}>
                                        <span className="ordered-item quantity">{item.quantity || 1}</span>
                                        <span className="ordered-item name">{item.name}</span>
                                        <span className="ordered-item price">{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                    </div>
                                    
                                    {/* Display amendments using the new component */}
                                    <OrderedItemAmendmentsDisplay amendments={item.amendments} />
                                </div>
                            ))}
                        </div>

                        {/* Scrollbar */}
                        {isOrderedItemsScrollerVisible && (
                            <div className="orderedItemsScroller" ref={orderedItemsScrollerRef}>
                                <div
                                    className="orderedItemsScroller-handle"
                                    style={{ top: `${scrollPosition}px`, height: `${handleHeight}px` }}
                                    onMouseDown={handleMouseDown}
                                ></div>
                            </div>
                        )}                         
                
                        {/* Footer for Quantity Control and Total Price */}
                        <div className="footer">                            
                            {/* Total Price Display */}                
                            <span className="total">TOTAL</span>
                            <span className="price-sum">£{orderDetails.totalPrice}</span>
                            <span className="final-price">£{orderDetails.finalCost}</span>
                        </div>
                    </div>
                    <div className="editOrderClass">
                        <button className="editOrderBtn" onClick={handleEditOrderClick}>edit order</button>
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