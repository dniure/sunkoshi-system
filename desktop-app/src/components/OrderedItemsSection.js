import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../css/main.css';
import '../css/orderedItemsSection.css';
import OrderedItemAmendment from './OrderedItemAmendment';


const OrderedItemsSection = ({
    orderedItemsInput = [], 
    orderedItemSelectedInput,
    qtyToggle,
    orderedItemsSectionRef,
    setOrderedItemsInput,
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
    const [priceSum, setPriceSum] = useState(0);  // Total price sum of the ordered items
    const [finalCost, setFinalCost] = useState(0);  // Final calculated cost


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
    useEffect(() => setOrderedItemsInput(orderedItems), [orderedItems, setOrderedItemsInput]);
    useEffect(() => setOrderedItemSelectedInput(orderedItemSelected), [orderedItemSelected, setOrderedItemSelectedInput]);

    // Calculate the total price and handle scroll-to-bottom behavior
    useEffect(() => {
        const total = (orderedItems || []).reduce((sum, { price, quantity = 1 }) => sum + price * quantity, 0);
        setPriceSum(total.toFixed(2));
        setFinalCost(total.toFixed(2));

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
            updatedItems[index].amendments.push(...amendmentsToApply);
            return updatedItems;
        });
        
    };    

    //////////////////////////////////////////////////
    // Click Handling

    // Handles row selection when an item is clicked
    const handleRowClick = (index) => setOrderedItemSelected(orderedItemSelected === index ? null : index);

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

    // Update scrollbar handle visibility and height when ordered items change
    useEffect(() => {
        if (contentRef.current) {
            // Calculate total height of all rows
            const totalRowsHeight = orderedItems.reduce((acc, _, index) => {
                const row = rowRefs.current[index]; // Get each row reference
                return acc + (row ? row.offsetHeight : 0); // Accumulate height if the row exists
            }, 0);
            const containerHeight = contentRef.current.offsetHeight;

            setisOrderedItemsScrollerVisible(totalRowsHeight >= containerHeight);
            contentRef.current.style.overflowY = totalRowsHeight >= containerHeight ? 'auto' : 'hidden';

            const calculatedHandleHeight = Math.max(20, (containerHeight - 30) * (containerHeight / totalRowsHeight));
            setHandleHeight(Math.min(calculatedHandleHeight, containerHeight));
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
    
    // Add scroll event listener to content on mount
    useEffect(() => {
        const orderedItemsContent = contentRef.current;
        orderedItemsContent?.addEventListener('scroll', handleOrderedItemsScroll);
        return () => orderedItemsContent?.removeEventListener('scroll', handleOrderedItemsScroll);
    }, [handleOrderedItemsScroll]);

    // Add mousemove and mouseup event listeners when dragging starts
    useEffect(() => {
        const handleMouseMoveWrapper = (e) => {
            if (isDragging) {
                handleMouseMove(e);
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMoveWrapper);
            window.addEventListener('mouseup', setIsDragging(false));
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMoveWrapper);
            window.removeEventListener('mouseup', setIsDragging(false));
        };
    }, [isDragging, handleMouseMove]);
    
    
    // Handles mouse down on the scroller handle for dragging
    const handleMouseDown = (e) => {
        const handleElement = document.querySelector('.orderedItemsScroller-handle');
        const offset = e.clientY - handleElement.getBoundingClientRect().top;
        setDragOffset(offset);
        setIsDragging(true);
    };   

    // Function to get the position of the selected row
    const calculateAmendmentTopPosition = () => {
        const definedMargin = 23;
        const normalRowHeight = 19; // Default height
        const selectedRowHeight = normalRowHeight + 10; // Adjusted height for selected row
        
        const newPosition = (definedMargin + (normalRowHeight * orderedItemSelected) + selectedRowHeight);
        return newPosition
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
                <div className="vertical-line"></div>
                {orderedItems.map((item, index) => (
                    <div
                        key={index}
                        ref={(el) => (rowRefs.current[index] = el)}
                        className={`ordered-item-row ${orderedItemSelected === index ? 'selected' : ''} ${isAmendingItem ? 'amending' : ''}`}
                        onClick={() => handleRowClick(index)}
                    >
                        <span className="ordered-item quantity">{item.quantity || 1}</span>
                        <span className="ordered-item name">{item.name}</span>
                        <span className="ordered-item price">{(item.price * (item.quantity || 1)).toFixed(2)}</span>                 
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
                calculateAmendmentTopPosition={calculateAmendmentTopPosition}
                isAmendingItem={isAmendingItem}
                setIsAmendingItem={setIsAmendingItem}
                amendmentsInPopup={amendmentsInPopup}
                setAmendmentsInPopup={setAmendmentsInPopup}
                applyAmendmentToSelectedItem={applyAmendmentToSelectedItem}
                originalAmendments={originalAmendments}
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
                <span className="price-sum">£{priceSum}</span>
                <span className="final-price">£{finalCost}</span>
            </div>
        </div>
    );
};

export default OrderedItemsSection;
