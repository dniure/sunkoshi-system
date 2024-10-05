import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../css/main.css';
import '../css/orderedItemsSection.css';

const OrderedItemsSection = ({
    orderedItemsInput, 
    orderedItemSelectedInput, 
    qtyToggle, 
    orderedItemsRef, 
    setOrderedItemsInput,
    setOrderedItemSelectedInput
}) => {    
    const [orderedItems, setOrderedItems] = useState(orderedItemsInput);
    const [selectedOrderedItem, setSelectedOrderedItem] = useState(orderedItemSelectedInput);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [priceSum, setPriceSum] = useState(0);
    const [finalCost, setFinalCost] = useState(0);
    const [isScrollerVisible, setIsScrollerVisible] = useState(false);
    const [handleHeight, setHandleHeight] = useState(50); // Default height for the handle
    
    const contentRef = useRef(null); // Ref for ordered-items-content
    const rowRef = useRef(null); // Ref for a single ordered-item-row
    const orderedItemsContentScroller = useRef(null);
    const previousOrderedItems = useRef(orderedItemsInput); // Ref to store the previous ordered items

    // Sync orderedItems and selectedOrderedItem with input values
    useEffect(() => {
        setSelectedOrderedItem(orderedItemSelectedInput);
        setOrderedItems(orderedItemsInput);
    }, [orderedItemsInput, orderedItemSelectedInput]);
    
    useEffect(() => setOrderedItemsInput(orderedItems), [orderedItems, setOrderedItemsInput]);
    useEffect(() => setOrderedItemSelectedInput(selectedOrderedItem), [selectedOrderedItem, setOrderedItemSelectedInput]);

    // Calculate total price and final cost
    useEffect(() => {
        const total = orderedItems.reduce((sum, { price, quantity = 1 }) => sum + price * quantity, 0);
        setPriceSum(total.toFixed(2));
        setFinalCost((total).toFixed(2));

        // Scroll to the bottom only when an item is added
        if (contentRef.current && previousOrderedItems.current.length < orderedItems.length) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }

        // Update the previous ordered items reference
        previousOrderedItems.current = orderedItems;     
    }, [orderedItems]);
    
    const handleRowClick = (index) => setSelectedOrderedItem(selectedOrderedItem === index ? null : index);
    
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
    
            const newSelectedIndex = updatedItems.length
                ? Math.min(selectedOrderedItem, updatedItems.length - 1)
                : null;
            
            setSelectedOrderedItem(newSelectedIndex);
            return updatedItems;
        });
    };

    // Handle scroll via dragging scroller handle
    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !contentRef.current || !orderedItemsContentScroller.current) return;
    
        const scrollerHandle = document.querySelector('.orderedItemsScroller-handle');
        const scrollableHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;
        const scrollerHeight = orderedItemsContentScroller.current.clientHeight;
        const handlePosition = Math.max(0, Math.min(e.clientY - orderedItemsContentScroller.current.getBoundingClientRect().top, scrollerHeight - scrollerHandle.clientHeight));
    
        contentRef.current.scrollTop = (handlePosition / (scrollerHeight - scrollerHandle.clientHeight)) * scrollableHeight;
        setScrollPosition(handlePosition);
    }, [isDragging]);

    // Update visibility of scroller and calculate handle height
    useEffect(() => {
        if (rowRef.current && contentRef.current) {
            const rowHeight = rowRef.current.offsetHeight;
            const totalRowsHeight = rowHeight * orderedItems.length;
            const containerHeight = contentRef.current.offsetHeight;
    
            setIsScrollerVisible(totalRowsHeight - rowHeight > containerHeight);
            contentRef.current.style.overflowY = totalRowsHeight > containerHeight ? 'auto' : 'hidden';
    
            const calculatedHandleHeight = Math.max(20, (containerHeight - 15) * (containerHeight / totalRowsHeight));
            setHandleHeight(Math.min(calculatedHandleHeight, containerHeight));
        }
    }, [orderedItems]);
    
    // Scroll event handler
    const handleScroll = useCallback(() => {
        if (contentRef.current && orderedItemsContentScroller.current) {
            const scrollableHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;
            const scrollerHeight = orderedItemsContentScroller.current.clientHeight;
            const handleMaxPos = scrollerHeight - document.querySelector('.orderedItemsScroller-handle').clientHeight;
            setScrollPosition((contentRef.current.scrollTop / scrollableHeight) * handleMaxPos);
        }
    }, []);

    // Attach scroll and mousemove/mouseup event listeners
    useEffect(() => {
        const orderedItemsContent = contentRef.current;
        orderedItemsContent?.addEventListener('scroll', handleScroll);
    
        return () => orderedItemsContent?.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

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
    
    return (
        <div className="ordered-items-section" ref={orderedItemsRef}>
            <div className="headers">
                <span className="label quantity">Q</span>
                <span className="label item">ITEM</span>
                <span className="label price" style={{ paddingRight: isScrollerVisible ? '18px' : '5px' }}>PRICE</span>
            </div>

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

                {isScrollerVisible && (
                    <div className="orderedItemsScroller" ref={orderedItemsContentScroller}>
                        <div 
                            className="orderedItemsScroller-handle" 
                            style={{ top: `${scrollPosition}px`, height: `${handleHeight}px` }} 
                            onMouseDown={() => setIsDragging(true)}
                        ></div>
                    </div>
                )}                   
            </div>
            
            <div className="footer">
                <div className="quantity-buttons" ref={qtyToggle}>
                    <button className={`decrease-btn ${selectedOrderedItem !== null ? 'active' : ''}`} onClick={() => modifyQuantity(-1)}>-</button>
                    <button className={`increase-btn ${selectedOrderedItem !== null ? 'active' : ''}`} onClick={() => modifyQuantity(1)}>+</button>                                  
                </div>
                <span className="total">TOTAL</span>
                <span className="price-sum">£{priceSum}</span>
                <span className="final-price">£{finalCost}</span>                                  
            </div>
        </div>
    );
};

export default OrderedItemsSection;
