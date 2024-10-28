import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../css/main.scss';
import '../../css/OrderScreen/orderedItemsSection.scss';
import OrderedItemAmendment from './OrderedItemAmendment';


const OrderedItemsSection = ({
    orderedItemsInput = [], 
    orderedItemSelectedInput,
    qtyToggle,
    orderedItemsSectionRef,
    orderDetails,
    setOrderDetails,
    setOrderedItemSelectedInput,
    isAmendingItem,
    setIsAmendingItem,
    amendItemBoxRef,
    
    loadAmendments,
    setLoadAmendments,
}) => {  
    //////////////////////////////////////////////////    
    // State Variables

    // General
    const [orderedItems, setOrderedItems] = useState(orderedItemsInput || []);  // Holds the list of ordered items
    const [orderedItemSelected, setOrderedItemSelected] = useState(orderedItemSelectedInput || null);  // Selected ordered item

    // Main Scroller
    const [scrollPosition, setScrollPosition] = useState(0);  // Scroll position of the list
    const [isDragging, setIsDragging] = useState(false);  // Whether the scrollbar handle is being dragged
    const [isOrderedItemsScrollerVisible, setisOrderedItemsScrollerVisible] = useState(false);  // Visibility of the scrollbar
    const [handleHeight, setHandleHeight] = useState(50);  // Height of the scrollbar handle
    const [dragOffset, setDragOffset] = useState(0);  // Offset for dragging the scrollbar handle

    // Amendments
    const [amendmentsInPopup, setAmendmentsInPopup] = useState([]);
    const [originalAmendments, setOriginaAmendments] = useState([]);

    //////////////////////////////////////////////////    
    // Refs
    const contentRef = useRef(null);  // Ref for the ordered-items-content container
    const rowRefs = useRef([])
    const orderedItemsScroller = useRef(null);  // Ref for the scroller handle
    const previousOrderedItems = useRef(orderedItemsInput);  // Keeps track of previous ordered items for scrolling behavior


    //////////////////////////////////////////////////    
    // Effects

    // Update selected item and ordered items when inputs change
    useEffect(() => {
        setOrderedItemSelected(orderedItemSelectedInput);
        setOrderedItems(orderedItemsInput || []);
    }, [orderedItemsInput, orderedItemSelectedInput]);

    // Update orderedItemsInput and orderedItemSelected externally when the state changes
    useEffect(() => {
        setOrderDetails((prev) => ({
            ...prev,
            orderedItems: orderedItems,
        }));
    }, [orderedItems, setOrderDetails]);
    useEffect(() => setOrderedItemSelectedInput(orderedItemSelected), [orderedItemSelected, setOrderedItemSelectedInput]);

    // Calculate the total price and handle scroll-to-bottom behavior
    useEffect(() => {
        const total = (orderedItems || []).reduce((sum, { price, quantity = 1 }) => sum + price * quantity, 0);
        
        setOrderDetails({
            priceSum: total.toFixed(2),
            finalCost: total.toFixed(2)
        });

        // Scroll to the bottom if new items are added
        if (contentRef.current && previousOrderedItems.current.length < orderedItems.length) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }

        previousOrderedItems.current = orderedItems;
    }, [orderedItems]);

    // Effects to load amendments
    useEffect(() => {
        // If an item is selected and load amendments is true
        if (orderedItemSelected !== null && loadAmendments) {
            // If the selected item exists and it as an 'amendments' array
            if (orderedItems[orderedItemSelected] &&
                Array.isArray(orderedItems[orderedItemSelected].amendments))
            {
                // load stored amendments in the popup
                setOriginaAmendments([...orderedItems[orderedItemSelected].amendments])
                setAmendmentsInPopup([...orderedItems[orderedItemSelected].amendments]);
            } else {
                // load popup with nothing selected
                setAmendmentsInPopup([]);
            }
            setLoadAmendments(false);
        }
    }, [loadAmendments, orderedItemSelected, orderedItems, setLoadAmendments]);       

    // Function to apply selected amendments
    const applyAmendmentToSelectedItem = (amendmentsToApply) => {
        setOrderedItems(prevItems => {
            const updatedItems = [...prevItems];
            const index = orderedItemSelected;

            // Initialize amendments as an array if not already present
            if (!Array.isArray(updatedItems[index].amendments)) {
                updatedItems[index].amendments = [];
            }

            // Apply the new amendments
            updatedItems[index].amendments = [...amendmentsToApply];
            return updatedItems;
        });
        setAmendmentsInPopup([]);
        setIsAmendingItem(false); // Close the amendment modal or component
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
    
    //////////////////////////////////////////////////
    // Click Handling

    // Handles row selection when an item is clicked
    const handleRowClick = (index) => {
        if (!isAmendingItem){
            setOrderedItemSelected(orderedItemSelected === index ? null : index);
            return;
        }
        setIsAmendingItem(false);
    }

    // Modify quantity of the selected ordered item
    const modifyQuantity = (modifier) => {
        if (orderedItemSelected === null) return;

        setOrderedItems(prevItems => {
            const updatedItems = prevItems.map((item, i) => {
                if (i === orderedItemSelected) {
                    const newQuantity = (item.quantity || 1) + modifier;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter(Boolean);

            // Adjust selected item index after modification
            const newSelectedIndex = updatedItems.length
                ? Math.min(orderedItemSelected, updatedItems.length - 1)
                : null;

            setOrderedItemSelected(newSelectedIndex);
            return updatedItems;
        });
    };

    //////////////////////////////////////////////////    
    // Scrollbar Logic

    // Handle mouse movement for dragging the scroller handle
    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !contentRef.current || !orderedItemsScroller.current) return;

        const scrollerHandle = document.querySelector('.orderedItemsScroller-handle');
        const scrollerHeight = orderedItemsScroller.current.clientHeight;
        const scrollableHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;

        // Calculate new position and scroll content accordingly
        const handlePosition = Math.max(0, Math.min(e.clientY - orderedItemsScroller.current.getBoundingClientRect().top - dragOffset, scrollerHeight - scrollerHandle.clientHeight));
        contentRef.current.scrollTop = (handlePosition / (scrollerHeight - scrollerHandle.clientHeight)) * scrollableHeight;

        setScrollPosition(handlePosition);
    }, [isDragging, dragOffset]);

    // ***********************************************************************
    // Update scrollbar handle visibility and height when ordered items change
    useEffect(() => {
        if (contentRef.current) {
            // Calculate total height of all rows
            const totalOccupiedHeight = orderedItems.reduce((acc, item, index) => {
                const row = rowRefs.current[index]; // Get each row reference
                if (row) {
                    // Base height is the row's offsetHeight (height of the ordered item row)
                    let rowHeight = row.offsetHeight;
                    
                    // Add amendment height if there are amendments for this item
                    if (Array.isArray(item.amendments) && item.amendments.length > 0) {
                        const amendmentRowHeight = 16; // Assuming each amendment takes 20px of height
                        const totalAmendmentsHeight = item.amendments.length * amendmentRowHeight;
                        rowHeight += totalAmendmentsHeight;
                    }
            
                    // Accumulate the total height
                    return acc + rowHeight;
                }
                return acc;
            }, 0);            

            const containerHeight = contentRef.current.offsetHeight;
            const containerHeightWithOfset = containerHeight + 20;
            setisOrderedItemsScrollerVisible(totalOccupiedHeight >= containerHeightWithOfset);
            contentRef.current.style.overflowY = totalOccupiedHeight >= containerHeightWithOfset ? 'auto' : 'hidden';

            const calculatedHandleHeight = Math.max(20, (containerHeight - 30) * (containerHeightWithOfset / totalOccupiedHeight));
            setHandleHeight(Math.min(calculatedHandleHeight, containerHeightWithOfset));
        }
    }, [orderedItems]);

    // ***************************************************  
    // Update ordered items scroller on mouse scroll
    const handleOrderedItemsScroll = useCallback(() => {
        if (contentRef.current && orderedItemsScroller.current) {
            const scrollableHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;
            const scrollerHeight = orderedItemsScroller.current.clientHeight;
            const handleMaxPos = scrollerHeight - document.querySelector('.orderedItemsScroller-handle').clientHeight;
            setScrollPosition((contentRef.current.scrollTop / scrollableHeight) * handleMaxPos);
        }
    }, []);

    useEffect(() => {
        const orderedItemsContent = contentRef.current;
        
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

    // Function to get the absolute position of a specific row
    const getRowPosition = (index) => {
        if (rowRefs.current[index]) {
            const rect = rowRefs.current[index].getBoundingClientRect();
            const top = Math.round(rect.top + window.scrollY - 9); // Adjust for scroll position;
            return { top };
        }
        return null; // If row does not exist
    };
            
    //////////////////////////////////////////////////    
    // Main Render
    return (
        <div className="ordered-items-section" ref={orderedItemsSectionRef}>

            {/* Headers for Quantity, Item, and Price */}
            <div className="headers">
                <span className="label quantity">Q</span>
                <span className="label item">ITEM</span>
                <span className="label price" style={{ paddingRight: isOrderedItemsScrollerVisible ? '18px' : '5px' }}>PRICE</span>
            </div>

            {/* Ordered Items Content */}
            <div className="ordered-items-content" ref={contentRef}>
                <div className="vertical-line" />

                {orderedItems.map((item, index) => (
                    <div key={index}>
                        <div
                            ref={(el) => (rowRefs.current[index] = el)}
                            className={`ordered-item-row ${orderedItemSelected === index ? 'selected' : ''} ${isAmendingItem ? 'amending' : ''}`}
                            onClick={() => handleRowClick(index)}
                        >
                            <span className="ordered-item quantity">{item.quantity || 1}</span>
                            <span className="ordered-item name">{item.name}</span>
                            <span className="ordered-item price">{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                        
                        {/* Display amendments using the new component */}
                        <OrderedItemAmendmentsDisplay amendments={item.amendments} />
                    </div>
                ))}

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
            </div>     

            {/* Amend Item Popup */}
            {isAmendingItem && (
                <OrderedItemAmendment
                amendItemBoxRef={amendItemBoxRef}
                getRowPosition={getRowPosition}
                isAmendingItem={isAmendingItem}
                amendmentsInPopup={amendmentsInPopup}
                setAmendmentsInPopup={setAmendmentsInPopup}
                applyAmendmentToSelectedItem={applyAmendmentToSelectedItem}
                originalAmendments={originalAmendments}
                orderedItemSelected={orderedItemSelected}
                />
            )}
    
            {/* Footer for Quantity Control and Total Price */}
            <div className="footer">
                <div className="quantity-buttons" ref={qtyToggle}>
                    <button className={`decrease-btn ${orderedItemSelected !== null ? 'active' : ''}`} onClick={() => modifyQuantity(-1)}>-</button>
                    <button className={`increase-btn ${orderedItemSelected !== null ? 'active' : ''}`} onClick={() => modifyQuantity(1)}>+</button>
                </div>
                
                {/* Total Price Display */}                
                <span className="total">TOTAL</span>
                <span className="price-sum">£{orderDetails.priceSum}</span>
                <span className="final-price">£{orderDetails.finalCost}</span>
            </div>
        </div>
    );
};

export default OrderedItemsSection;