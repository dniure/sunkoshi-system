import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../css/main.css';
import '../css/orderedItemsSection.css';

const OrderedItemsSection = ({
    orderedItemsInput = [],  // List of ordered items passed as input, defaults to an empty array
    orderedItemSelectedInput,  // Selected ordered item input
    qtyToggle,  // Reference for quantity buttons
    orderedItemsRef,  // Reference for ordered items container
    setOrderedItemsInput,  // Function to update ordered items
    setOrderedItemSelectedInput  // Function to update the selected ordered item
}) => {

    //////////////////////////////////////////////////    
    // State Variables

    const [orderedItems, setOrderedItems] = useState(orderedItemsInput || []);  // Holds the list of ordered items
    const [selectedOrderedItem, setSelectedOrderedItem] = useState(orderedItemSelectedInput || null);  // Selected ordered item
    const [scrollPosition, setScrollPosition] = useState(0);  // Scroll position of the list
    const [isDragging, setIsDragging] = useState(false);  // Whether the scrollbar handle is being dragged
    const [priceSum, setPriceSum] = useState(0);  // Total price sum of the ordered items
    const [finalCost, setFinalCost] = useState(0);  // Final calculated cost
    const [isScrollerVisible, setIsScrollerVisible] = useState(false);  // Visibility of the scrollbar
    const [handleHeight, setHandleHeight] = useState(50);  // Height of the scrollbar handle
    const [dragOffset, setDragOffset] = useState(0);  // Offset for dragging the scrollbar handle

    //////////////////////////////////////////////////    
    // Refs

    const contentRef = useRef(null);  // Ref for the ordered-items-content container
    const rowRef = useRef(null);  // Ref for a single ordered item row (used for calculations)
    const orderedItemsContentScroller = useRef(null);  // Ref for the scroller handle
    const previousOrderedItems = useRef(orderedItemsInput);  // Keeps track of previous ordered items for scrolling behavior

    //////////////////////////////////////////////////    
    // Effects

    // Update selected item and ordered items when inputs change
    useEffect(() => {
        setSelectedOrderedItem(orderedItemSelectedInput);
        setOrderedItems(orderedItemsInput || []);
    }, [orderedItemsInput, orderedItemSelectedInput]);

    // Update orderedItemsInput and selectedOrderedItem externally when the state changes
    useEffect(() => setOrderedItemsInput(orderedItems), [orderedItems, setOrderedItemsInput]);
    useEffect(() => setOrderedItemSelectedInput(selectedOrderedItem), [selectedOrderedItem, setOrderedItemSelectedInput]);

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

    //////////////////////////////////////////////////    
    // Click Handling

    // Handles row selection when an item is clicked
    const handleRowClick = (index) => setSelectedOrderedItem(selectedOrderedItem === index ? null : index);

    // Modify quantity of the selected ordered item
    const modifyQuantity = (modifier) => {
        if (selectedOrderedItem === null) return;

        setOrderedItems(prevItems => {
            const updatedItems = prevItems.map((item, i) => {
                if (i === selectedOrderedItem) {
                    const newQuantity = (item.quantity || 1) + modifier;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter(Boolean);

            // Adjust selected item index after modification
            const newSelectedIndex = updatedItems.length
                ? Math.min(selectedOrderedItem, updatedItems.length - 1)
                : null;

            setSelectedOrderedItem(newSelectedIndex);
            return updatedItems;
        });
    };

    //////////////////////////////////////////////////    
    // Scrollbar Logic

    // Handle mouse movement for dragging the scroller handle
    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !contentRef.current || !orderedItemsContentScroller.current) return;

        const scrollerHandle = document.querySelector('.orderedItemsScroller-handle');
        const scrollerHeight = orderedItemsContentScroller.current.clientHeight;
        const scrollableHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;

        // Calculate new position and scroll content accordingly
        const handlePosition = Math.max(0, Math.min(e.clientY - orderedItemsContentScroller.current.getBoundingClientRect().top - dragOffset, scrollerHeight - scrollerHandle.clientHeight));
        contentRef.current.scrollTop = (handlePosition / (scrollerHeight - scrollerHandle.clientHeight)) * scrollableHeight;

        setScrollPosition(handlePosition);
    }, [isDragging, dragOffset]);

    // Update scrollbar handle visibility and height when ordered items change
    useEffect(() => {
        if (rowRef.current && contentRef.current) {
            const rowHeight = rowRef.current.offsetHeight;
            const totalRowsHeight = rowHeight * orderedItems.length;
            const containerHeight = contentRef.current.offsetHeight;

            setIsScrollerVisible(totalRowsHeight >= containerHeight);
            contentRef.current.style.overflowY = totalRowsHeight >= containerHeight ? 'auto' : 'hidden';

            const calculatedHandleHeight = Math.max(20, (containerHeight - 30) * (containerHeight / totalRowsHeight));
            setHandleHeight(Math.min(calculatedHandleHeight, containerHeight));
        }
    }, [orderedItems]);

    // Update scroll position based on content scrolling
    const handleScroll = useCallback(() => {
        if (contentRef.current && orderedItemsContentScroller.current) {
            const scrollableHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;
            const scrollerHeight = orderedItemsContentScroller.current.clientHeight;
            const handleMaxPos = scrollerHeight - document.querySelector('.orderedItemsScroller-handle').clientHeight;
            setScrollPosition((contentRef.current.scrollTop / scrollableHeight) * handleMaxPos);
        }
    }, []);

    // Add scroll event listener to content on mount
    useEffect(() => {
        const orderedItemsContent = contentRef.current;
        orderedItemsContent?.addEventListener('scroll', handleScroll);
        return () => orderedItemsContent?.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Add mousemove and mouseup event listeners when dragging starts
    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove]);

    // Handles mouse down on the scroller handle for dragging
    const handleMouseDown = (e) => {
        const handleElement = document.querySelector('.orderedItemsScroller-handle');
        const offset = e.clientY - handleElement.getBoundingClientRect().top;
        setDragOffset(offset);
        setIsDragging(true);
    };

    //////////////////////////////////////////////////    
    // Main Render
    return (
        <div className="ordered-items-section" ref={orderedItemsRef}>

            {/* Headers for Quantity, Item, and Price */}
            <div className="headers">
                <span className="label quantity">Q</span>
                <span className="label item">ITEM</span>
                <span className="label price" style={{ paddingRight: isScrollerVisible ? '18px' : '5px' }}>PRICE</span>
            </div>

            {/* Ordered Items Content */}
            <div className="ordered-items-content" ref={contentRef}>
                <div className="vertical-line"></div>
                {orderedItems.map((item, index) => (
                    <div
                        key={index}
                        className={`ordered-item-row ${selectedOrderedItem === index ? 'selected' : ''}`}
                        onClick={() => handleRowClick(index)}
                        ref={index === 0 ? rowRef : null}
                    >
                        <span className="ordered-item quantity">{item.quantity || 1}</span>
                        <span className="ordered-item name">{item.name}</span>
                        <span className="ordered-item price">{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                ))}

                {/* Scrollbar */}
                {isScrollerVisible && (
                    <div className="orderedItemsScroller" ref={orderedItemsContentScroller}>
                        <div
                            className="orderedItemsScroller-handle"
                            style={{ top: `${scrollPosition}px`, height: `${handleHeight}px` }}
                            onMouseDown={handleMouseDown}
                        ></div>
                    </div>
                )}
            </div>
    
            {/* Footer for Quantity Control and Total Price */}
            <div className="footer">
                <div className="quantity-buttons" ref={qtyToggle}>
                    <button className={`decrease-btn ${selectedOrderedItem !== null ? 'active' : ''}`} onClick={() => modifyQuantity(-1)}>-</button>
                    <button className={`increase-btn ${selectedOrderedItem !== null ? 'active' : ''}`} onClick={() => modifyQuantity(1)}>+</button>
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
