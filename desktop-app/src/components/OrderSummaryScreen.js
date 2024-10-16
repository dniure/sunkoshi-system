import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import '../css/main.scss';
import '../css/orderSummaryScreen.scss';
import logo from '../images/logo.png';
const OrderSummaryScreen = () => {

    const itemsContainerRef = useRef(null);
    const rowRefs = useRef([]);
    const [orderedItems, setOrderedItems] = useState([]);
    const orderedItemsScroller = useRef(null);  // Ref for the scroller handle

    // Main Scroller
    const [scrollPosition, setScrollPosition] = useState(0);  // Scroll position of the list
    const [isDragging, setIsDragging] = useState(false);  // Whether the scrollbar handle is being dragged
    const [isOrderedItemsScrollerVisible, setisOrderedItemsScrollerVisible] = useState(false);  // Visibility of the scrollbar
    const [handleHeight, setHandleHeight] = useState(50);  // Height of the scrollbar handle
    const [dragOffset, setDragOffset] = useState(0);  // Offset for dragging the scrollbar handle
    
    
    const addItemFunction = () => {
        setOrderedItems(prevItems => [
            ...prevItems,
            {
                name: "ITEM",
                quantity: 1,
                price: 4.99,
                amendments: []
            }
        ]);
    };

    const addAmendmentFunction = () => {
        if (orderedItems[0]){
            setOrderedItems(prevItems => {
                const updatedItems = [...prevItems];
                
                const lastItem = updatedItems[updatedItems.length - 1];
                const updatedLastItem = {
                    ...lastItem,
                    amendments: [...lastItem.amendments, 'amendment'] // Add new amendment
                };
                updatedItems[updatedItems.length - 1] = updatedLastItem;

                return updatedItems;
            });
        }
    };

    const removeLastItem = () => {
        setOrderedItems(prevItems => {
            if (prevItems.length === 0) {
                return prevItems;
            }
            
            return prevItems.slice(0, -1);
        });
    };

    const clearOrederdItems = () => {
        setOrderedItems([]); // Set orderedItems to an empty array
    };
    

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
        if (!isDragging || !itemsContainerRef.current || !orderedItemsScroller.current) return;

        const scrollerHandle = document.querySelector('.orderedItemsScroller-handle');
        const scrollerHeight = orderedItemsScroller.current.clientHeight;
        const scrollableHeight = itemsContainerRef.current.scrollHeight - itemsContainerRef.current.clientHeight;

        // Calculate new position and scroll content accordingly
        const handlePosition = Math.max(0, Math.min(e.clientY - orderedItemsScroller.current.getBoundingClientRect().top - dragOffset, scrollerHeight - scrollerHandle.clientHeight));
        itemsContainerRef.current.scrollTop = (handlePosition / (scrollerHeight - scrollerHandle.clientHeight)) * scrollableHeight;

        setScrollPosition(handlePosition);
    }, [isDragging, dragOffset]);


    // ***********************************************************************
    // Update scrollbar handle visibility and height when ordered items change
    useEffect(() => {
        console.log("\n-------------------");
        if (itemsContainerRef.current) {
            // Calculate total height of all rows
            const totalOccupiedHeight = orderedItems.reduce((acc, item, index) => {
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

            const containerHeight = itemsContainerRef.current.offsetHeight;
            // console.log("containerHeight: ", containerHeight);
            // console.log("totalOccupiedHeight: ", totalOccupiedHeight);

            setisOrderedItemsScrollerVisible(totalOccupiedHeight >= containerHeight);
            itemsContainerRef.current.style.overflowY = totalOccupiedHeight >= containerHeight ? 'auto' : 'hidden';

            const calculatedHandleHeight = Math.max(20, (containerHeight - 30) * (containerHeight / totalOccupiedHeight));

            setHandleHeight(Math.min(calculatedHandleHeight, containerHeight));
        }
    }, [orderedItems]);

    // ***************************************************  
    // Update ordered items scroller on mouse scroll
    const handleOrderedItemsScroll = useCallback(() => {
        if (itemsContainerRef.current && orderedItemsScroller.current) {
            const scrollableHeight = itemsContainerRef.current.scrollHeight - itemsContainerRef.current.clientHeight;
            const scrollerHeight = orderedItemsScroller.current.clientHeight;
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
                        <div className="content" ref={itemsContainerRef}>
                            <div className="vertical-line" />

                            {orderedItems.map((item, index) => (
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
                            <div className="orderedItemsScroller" ref={orderedItemsScroller}>
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
                            <span className="price-sum">£34.40</span>
                            <span className="final-price">£34.40</span>
                        </div>
                    </div>
                    <div className="editOrderClass">
                        <button className="editOrderBtn">edit order</button>
                    </div>
                </div>                                   

                {/* BOTTOM SECTION */}                
                <div className="buttons">
                    <button className="cancel" onClick={() => navigate('/')}>exit</button>
                    <button className="printReceipt" onClick={() => navigate('/')}>print receipt</button>
                    <button className="save" onClick={() => navigate('/')}>save</button>
                    <button className="addItemTest" onClick={addItemFunction}>ADD ITEM</button>
                    <button className="removeLastItem" onClick={removeLastItem}>REMOVE</button>
                    <button className="addAmendmentTest" onClick={addAmendmentFunction}>ADD AMENDMENT</button>
                    <button className="clearContentTest" onClick={clearOrederdItems}>CLEAR CONTENT</button>
                </div>                
            </div>
        </div>
    );
};

export default OrderSummaryScreen;