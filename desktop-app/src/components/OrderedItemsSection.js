import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../css/main.css';
import '../css/orderedItemsSection.css';

import plusIcon from '../images/plus-icon.png';

const OrderedItemsSection = ({
    orderedItemsInput = [],  // List of ordered items passed as input, defaults to an empty array
    orderedItemSelectedInput,  // Selected ordered item input
    qtyToggle,  // Reference for quantity buttons
    orderedItemsSectionRef,  // Reference for ordered items container
    setOrderedItemsInput,  // Function to update ordered items
    setOrderedItemSelectedInput,  // Function to update the selected ordered item
    isAmendingItem,
    setIsAmendingItem,
    amendItemBoxRef,
}) => {

    //////////////////////////////////////////////////    
    // State Variables

    // General
    const [orderedItems, setOrderedItems] = useState(orderedItemsInput || []);  // Holds the list of ordered items
    const [selectedOrderedItem, setSelectedOrderedItem] = useState(orderedItemSelectedInput || null);  // Selected ordered item
    const [priceSum, setPriceSum] = useState(0);  // Total price sum of the ordered items
    const [finalCost, setFinalCost] = useState(0);  // Final calculated cost
    const [amendments, setAmendments] = useState([
        'madras hot', 'med hot', 'mild', '0 spicy', 'gluten allergy', 'extra cheese',
        'extra gravy', 'nut allergy', 'other1', 'other2', 'other3', 'other4'
    ]);

    // Main Scroller
    const [scrollPosition, setScrollPosition] = useState(0);  // Scroll position of the list
    const [isDragging, setIsDragging] = useState(false);  // Whether the scrollbar handle is being dragged
    const [isOrderedItemsScrollerVisible, setisOrderedItemsScrollerVisible] = useState(false);  // Visibility of the scrollbar
    const [handleHeight, setHandleHeight] = useState(50);  // Height of the scrollbar handle
    const [dragOffset, setDragOffset] = useState(0);  // Offset for dragging the scrollbar handle

    // Amend Scroller
    const [amendScrollPosition, setAmendScrollPosition] = useState(0); // Add new state for amend scroll position
    const [isAmendDragging, setIsAmendDragging] = useState(false); // Track dragging for amend scroller
    const [isAmendItemScrollerVisible, setIsAmendItemScrollerVisible] = useState(true);
    const [amendHandleHeight, setAmendHandleHeight] = useState(50); // Handle height for amend scroller
    const [amendDragOffset, setAmendDragOffset] = useState(0); // Drag offset for amend scroller


    //////////////////////////////////////////////////    
    // Refs

    const contentRef = useRef(null);  // Ref for the ordered-items-content container
    const rowRefs = useRef([])
    const orderedItemsScroller = useRef(null);  // Ref for the scroller handle
    const amendItemsScrollerRef = useRef(null);
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
        if (!isDragging || !contentRef.current || !orderedItemsScroller.current) return;

        const scrollerHandle = document.querySelector('.orderedItemsScroller-handle');
        const scrollerHeight = orderedItemsScroller.current.clientHeight;
        const scrollableHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;

        // Calculate new position and scroll content accordingly
        const handlePosition = Math.max(0, Math.min(e.clientY - orderedItemsScroller.current.getBoundingClientRect().top - dragOffset, scrollerHeight - scrollerHandle.clientHeight));
        contentRef.current.scrollTop = (handlePosition / (scrollerHeight - scrollerHandle.clientHeight)) * scrollableHeight;

        setScrollPosition(handlePosition);
    }, [isDragging, dragOffset]);

    // New logic for amend scroller
    const handleAmendMouseMove = useCallback((e) => {
        if (!isAmendDragging || !amendItemsScrollerRef.current) return;

        const amendHandle = document.querySelector('.amendItems-customScroller-handle');
        const amendScrollerHeight = amendItemsScrollerRef.current.clientHeight;
        const amendScrollableHeight = document.querySelector('.amendment-content').scrollHeight - document.querySelector('.amendment-content').clientHeight;

        const handlePosition = Math.max(0, Math.min(e.clientY - amendItemsScrollerRef.current.getBoundingClientRect().top - amendDragOffset, amendScrollerHeight - amendHandle.clientHeight));
        document.querySelector('.amendment-content').scrollTop = (handlePosition / (amendScrollerHeight - amendHandle.clientHeight)) * amendScrollableHeight;

        setAmendScrollPosition(handlePosition);
    }, [isAmendDragging, amendDragOffset]);
        
    const handleMouseUp = () => {
        setIsDragging(false);
        setIsAmendDragging(false); // Stop dragging for amend scroller
    };

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

    // ***************************************************888    
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

    // ***************************************************888
    // Amendment Scroll Logic
    const handleAmendScroll = useCallback(() => {
        console.log("AMENDING IS SCROLLING");
        const amendmentContent = amendItemBoxRef.current?.querySelector('.amendment-content');
        
        if (amendmentContent && amendItemsScrollerRef.current) {
            const scrollableHeight = amendmentContent.scrollHeight - amendmentContent.clientHeight;
            const scrollerHeight = amendItemsScrollerRef.current.clientHeight;
            const handleMaxPos = scrollerHeight - document.querySelector('.amendItems-customScroller-handle').clientHeight;
            
            // Set the scroll position of the handle relative to the scrollable content
            setAmendScrollPosition((amendmentContent.scrollTop / scrollableHeight) * handleMaxPos);
        }
    }, []); 

    useEffect(() => {
        const amendmentContent = amendItemBoxRef.current?.querySelector('.amendment-content');
        
        // Add scroll event listener if amendmentContent exists
        if (amendmentContent) {
            amendmentContent.addEventListener('scroll', handleAmendScroll);
        }
        
        // Cleanup function to remove scroll event listener
        return () => {
            if (amendmentContent) {
                amendmentContent.removeEventListener('scroll', handleAmendScroll);
            }
        };
    }, [handleAmendScroll, amendItemBoxRef.current]);  // Adding the ref as a dependency
    

    // Add mousemove and mouseup event listeners when dragging starts
    useEffect(() => {
        const handleMouseMoveWrapper = (e) => {
            if (isDragging) {
                handleMouseMove(e);
            } else if (isAmendDragging) {
                handleAmendMouseMove(e);
            }
        };

        if (isDragging || isAmendDragging) {
            window.addEventListener('mousemove', handleMouseMoveWrapper);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMoveWrapper);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isAmendDragging, handleMouseMove, handleAmendMouseMove]);
    
    
    // Handles mouse down on the scroller handle for dragging
    const handleMouseDown = (e) => {
        const handleElement = document.querySelector('.orderedItemsScroller-handle');
        const offset = e.clientY - handleElement.getBoundingClientRect().top;
        setDragOffset(offset);
        setIsDragging(true);
    };

    // Handles mouse down on the amend scroller handle for dragging
    const handleAmendMouseDown = (e) => {
        const handleElement = document.querySelector('.amendItems-customScroller-handle');
        const offset = e.clientY - handleElement.getBoundingClientRect().top;
        setAmendDragOffset(offset);
        setIsAmendDragging(true);
    };

    // Update amend scroller handle height based on amendments
    useEffect(() => {
        if (amendItemsScrollerRef.current) {
            const totalAmendHeight = document.querySelector('.amendment-content').scrollHeight;
            const containerHeight = document.querySelector('.amendment-content').offsetHeight;

            setIsAmendItemScrollerVisible(totalAmendHeight >= containerHeight);
            document.querySelector('.amendment-content').style.overflowY = totalAmendHeight >= containerHeight ? 'auto' : 'hidden';

            const calculatedAmendHandleHeight = Math.max(20, (containerHeight - 30) * (containerHeight / totalAmendHeight));
            setAmendHandleHeight(Math.min(calculatedAmendHandleHeight, containerHeight));
        }
    }, [isAmendingItem]); // Recalculate when the amend item state changes    
    // New addition
    
    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleSelectOption = (option) => {
        // Logic to handle selecting an option
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter(selectedOption => selectedOption !== option));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };       

    // Function to get the position of the selected row
    const getSelectedRowPosition = (index) => {
        const normalRowHeight = rowRefs.current[0] ? rowRefs.current[0].offsetHeight : 0;
        const selectedRowHeight = rowRefs.current[index] ? rowRefs.current[index].offsetHeight : 0;
        const rowPosition =
            54 + // Container top padding
            normalRowHeight * (index-1) + // Unselected rows' height
            selectedRowHeight ; // Selected rows' height

        return rowPosition;
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
                        className={`ordered-item-row ${selectedOrderedItem === index ? 'selected' : ''} ${isAmendingItem ? 'amending' : ''}`}
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
            {isAmendingItem && selectedOrderedItem !== null && (
                <div ref={amendItemBoxRef}>
                    {/* Dynamically positioned Amend Item Popup */}
                    <div className="amend-item-popup" style={{ top: `${getSelectedRowPosition(selectedOrderedItem)}px` }}
                    >
                        {/* Amendments List */}
                        <div className="amendment-content">
                            {['madras hot', 'med hot', 'mild', '0 spicy', 'gluten allergy','extra cheese',
                              'extra gravy', 'nut allergy', 'other1', 'other2', 'other3', 'other4'].map((option, index) =>
                                (<div key={index}
                                     className={`amendment-option ${selectedOptions.includes(option) ? 'selected' : ''}`}
                                     onClick={() => handleSelectOption(option)}>
                                    
                                    {option}
                                </div>)
                            )}
                        </div>

                        {isAmendItemScrollerVisible && (
                            <div className="amendItems-customScroller" ref={amendItemsScrollerRef}>
                                <div
                                    className="amendItems-customScroller-handle"
                                    style={{ top: `${amendScrollPosition}px`, height: `${amendHandleHeight}px` }}
                                    onMouseDown={handleAmendMouseDown}
                                ></div>
                            </div>
                        )}

                        <button className="plusIconBtn">
                            <img src={plusIcon} alt="Plus Icon" />
                        </button>

                        {/* Action Buttons in Footer */}
                        <div className="amend-item-footer">
                            <span className="amend-item-separator" />
                            <button className="cancel-button" onClick={() => setIsAmendingItem(false)}>cancel</button>
                            <button className="save-button" onClick={() => setIsAmendingItem(false)}>save</button>
                        </div>
                    </div>
                </div>
            )}
    
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
