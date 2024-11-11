import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../css/main.scss';
import '../../css/OrderScreen/orderedItemsSection.scss';
import OrderedItemAmendment from './OrderedItemAmendment';

const OrderedItemsSection = ({   
    orderedItemsSectionRef,
    orderDetails,
    setOrderDetails,
    orderedItemSelected,
    setOrderedItemSelected,
    qtyToggleRef,
    amendItemBoxRef,
    isAmendingItem,
    setIsAmendingItem,
    isLoadingAmendments,
    setIsLoadingAmendments,    
}) => {
    const [tempOrderedItems, setTempOrderedItems] = useState(orderDetails.orderedItems);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isScrollerVisible, setScrollerVisible] = useState(false);
    const [handleHeight, setHandleHeight] = useState(50);
    const [dragOffset, setDragOffset] = useState(0);
    const [amendmentsInPopup, setAmendmentsInPopup] = useState([]);
    const [originalAmendments, setOriginalAmendments] = useState([]);

    const contentRef = useRef(null);
    const rowRefs = useRef([]);
    const orderedItemsScroller = useRef(null);
    const previousOrderedItems = useRef(orderDetails.orderedItems); 

    // Calculate total price and manage scrolling
    useEffect(() => {
        setTempOrderedItems(orderDetails.orderedItems);
        const total = orderDetails.orderedItems.reduce((sum, { price, quantity = 1 }) => sum + price * quantity, 0);
        setOrderDetails(prev => ({ ...prev, totalPrice: total.toFixed(2), finalCost: total.toFixed(2) }));

        if (contentRef.current && previousOrderedItems.current.length < orderDetails.orderedItems.length) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
        previousOrderedItems.current = orderDetails.orderedItems;
    }, [orderDetails.orderedItems]);

    // Load amendments if item selected
    useEffect(() => {
        if (orderedItemSelected !== null && isLoadingAmendments) {
            const selectedRow = orderDetails.orderedItems[orderedItemSelected];
            if (selectedRow?.amendments) {
                setOriginalAmendments(selectedRow.amendments);
                setAmendmentsInPopup(selectedRow.amendments);
            } else {
                setAmendmentsInPopup([]);
            }
            setIsLoadingAmendments(false);
        }
    }, [isLoadingAmendments, orderedItemSelected, orderDetails.orderedItems]);

    // Apply selected amendments
    const applyAmendment = (amendmentsToApply) => {
        setOrderDetails(prev => ({
            ...prev,
            orderedItems: prev.orderedItems.map((item, index) => 
                index === orderedItemSelected ? { ...item, amendments: amendmentsToApply } : item
            ),
        }));
        setAmendmentsInPopup([]);
        setIsAmendingItem(false);
    };

    // Handle row selection
    const handleRowClick = (index) => {
        if (isAmendingItem) setIsAmendingItem(false);
        else setOrderedItemSelected(orderedItemSelected === index ? null : index);
    };

    // Modify quantity of selected item
    const modifyQuantity = (modifier) => {
        if (orderedItemSelected === null) return;

        setOrderDetails(prev => {
            const updatedItems = prev.orderedItems.map((item, i) => {
                if (i === orderedItemSelected) {
                    const newQuantity = (item.quantity || 1) + modifier;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter(Boolean);

            setOrderedItemSelected(updatedItems.length ? Math.min(orderedItemSelected, updatedItems.length - 1) : null);
            return { ...prev, orderedItems: updatedItems };
        });
    };

    // Handle dragging for scrollbar
    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !contentRef.current || !orderedItemsScroller.current) return;

        const scrollerHandle = document.querySelector('.orderedItemsScroller-handle');
        const scrollerHeight = orderedItemsScroller.current.clientHeight;
        const scrollableHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;
        const handlePosition = Math.max(0, Math.min(e.clientY - orderedItemsScroller.current.getBoundingClientRect().top - dragOffset, scrollerHeight - scrollerHandle.clientHeight));

        contentRef.current.scrollTop = (handlePosition / (scrollerHeight - scrollerHandle.clientHeight)) * scrollableHeight;
        setScrollPosition(handlePosition);
    }, [isDragging, dragOffset]);

    // Update scrollbar visibility and height
    useEffect(() => {
        if (contentRef.current) {
            const totalOccupiedHeight = tempOrderedItems.reduce((acc, item, index) => {
                const row = rowRefs.current[index];
                if (row) {
                    const amendmentRowHeight = 16;
                    let rowHeight = row.offsetHeight + (item.amendments ? item.amendments.length * amendmentRowHeight : 0);
                    return acc + rowHeight;
                }
                return acc;
            }, 0);

            const containerHeight = contentRef.current.offsetHeight;
            const containerHeightWithOfset = containerHeight + 20;
            setScrollerVisible(totalOccupiedHeight >= containerHeightWithOfset);
            contentRef.current.style.overflowY = totalOccupiedHeight >= containerHeightWithOfset ? 'auto' : 'hidden';
            
            setHandleHeight(Math.min(Math.max(20, (containerHeight - 30) * (containerHeightWithOfset / totalOccupiedHeight)), containerHeightWithOfset));
        }
    }, [orderDetails.orderedItems, tempOrderedItems]);

    // Update scroller position on scroll
    const handleOrderedItemsScroll = useCallback(() => {
        if (contentRef.current && orderedItemsScroller.current) {
            const scrollableHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;
            const scrollerHeight = orderedItemsScroller.current.clientHeight;
            setScrollPosition((contentRef.current.scrollTop / scrollableHeight) * (scrollerHeight - document.querySelector('.orderedItemsScroller-handle').clientHeight));
        }
    }, []);

    useEffect(() => {
        const orderedItemsContent = contentRef.current;
        orderedItemsContent?.addEventListener('scroll', handleOrderedItemsScroll);
        return () => {
            orderedItemsContent?.removeEventListener('scroll', handleOrderedItemsScroll);
        };
    }, [handleOrderedItemsScroll]);

    // Handle mouse down for dragging
    const handleMouseDown = (e) => {
        const handleElement = document.querySelector('.orderedItemsScroller-handle');
        setDragOffset(e.clientY - handleElement.getBoundingClientRect().top);
        setIsDragging(true);
    };  

    useEffect(() => {
        const handleMouseMoveWrapper = (e) => {
            if (isDragging) handleMouseMove(e);
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

    const getRowPosition = (index) => {
        if (rowRefs.current[index]) {
            const rect = rowRefs.current[index].getBoundingClientRect();
            return { top: Math.round(rect.top + window.scrollY - 9) };
        }
        return null;
    };

    return (
        <div className="ordered-items-section" ref={orderedItemsSectionRef}>
            <div className="headers">
                <span className="label quantity">Q</span>
                <span className="label item">ITEM</span>
                <span className="label price" style={{ paddingRight: isScrollerVisible ? '18px' : '5px' }}>PRICE</span>
            </div>
            <div className="ordered-items-content" ref={contentRef}>
                <div className="vertical-line" />
                {tempOrderedItems.map((item, index) => (
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
                        {item.amendments?.map((amendment, aIndex) => (
                            <div key={aIndex} className="ordered-item-amendment">
                                <span>&gt; {amendment}</span>
                            </div>
                        ))}
                    </div>
                ))}
                {isScrollerVisible && (
                    <div className="orderedItemsScroller" ref={orderedItemsScroller}>
                        <div
                            className="orderedItemsScroller-handle"
                            style={{
                                height: `${handleHeight}px`,
                                top: `${scrollPosition}px`,
                                cursor: 'pointer'
                            }}
                            onMouseDown={handleMouseDown}
                        />
                    </div>
                )}
            </div>
            {isAmendingItem && (
                <OrderedItemAmendment
                    amendItemBoxRef={amendItemBoxRef}
                    getRowPosition={getRowPosition}
                    isAmendingItem={isAmendingItem}

                    amendmentsInPopup={amendmentsInPopup}
                    setAmendmentsInPopup={setAmendmentsInPopup}
                    
                    applyAmendment={applyAmendment}
                    originalAmendments={originalAmendments}
                    orderedItemSelected={orderedItemSelected}
                />
            )}

            {/* Footer for Quantity Control and Total Price */}
            <div className="footer">
                <div className="quantity-buttons" ref={qtyToggleRef}>
                    <button className={`decrease-btn ${orderedItemSelected !== null ? 'active' : ''}`} onClick={() => modifyQuantity(-1)}>-</button>
                    <button className={`increase-btn ${orderedItemSelected !== null ? 'active' : ''}`} onClick={() => modifyQuantity(1)}>+</button>
                </div>
                
                {/* Total Price Display */}                
                <span className="total">TOTAL</span>
                <span className="price-sum">£{orderDetails.totalPrice}</span>
                <span className="final-price">£{orderDetails.finalCost}</span>
            </div>

        </div>
    );
};

export default OrderedItemsSection;
