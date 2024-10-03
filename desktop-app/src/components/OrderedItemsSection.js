import React, { useState, useEffect } from 'react';

import '../css/main.css';
import '../css/orderScreen.css';

const OrderedItemsSection = ({
    orderedItemsInput, 
    orderedItemSelectedInput, 
    qtyToggle, 
    orderedItemsRef, 
    setOrderedItemsInput,
    setOrderedItemSelectedInput
}) => {
    
    const [orderedItemSelected, setOrderedItemSelected] = useState(orderedItemSelectedInput);
    const [orderedItems, setOrderedItems] = useState(orderedItemsInput);

    // Sync local states with the parent inputs when they change
    useEffect(() => {
        setOrderedItemSelected(orderedItemSelectedInput);
    }, [orderedItemSelectedInput]);

    useEffect(() => {
        setOrderedItems(orderedItemsInput);
    }, [orderedItemsInput]);

    // Update the parent state whenever the local orderedItems change
    useEffect(() => {
        setOrderedItemsInput(orderedItems); // Call parent's callback
    }, [orderedItems, setOrderedItemsInput]);

    // Update the parent state whenever the local orderedItemSelected changes
    useEffect(() => {
        setOrderedItemSelectedInput(orderedItemSelected); // Call parent's callback
    }, [orderedItemSelected, setOrderedItemSelectedInput]);

    const handleRowClick = (index) => {
        // If clicking the same row again, unselect it
        if (orderedItemSelected === index) {
        setOrderedItemSelected(null);
        } else {
        setOrderedItemSelected(index);
        }
    };

    const increaseQuantity = () => {
        if (orderedItemSelected !== null) {
            setOrderedItems(prevItems =>
                prevItems.map((item, index) =>
                    index === orderedItemSelected
                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                        : item
                )
            );
        }
    };

    const decreaseQuantity = () => {
        if (orderedItemSelected !== null) {
            setOrderedItems(prevItems => {
                const updatedItems = prevItems
                    .map((item, index) => {
                        // If the selected item is the one being modified
                        if (index === orderedItemSelected) {
                            // If the quantity is greater than 1, decrease it
                            if (item.quantity > 1) {
                                return { ...item, quantity: item.quantity - 1 }; // Decrease quantity
                            } else {
                                // If the quantity is 1, return null to remove it
                                return null; // Indicate this item should be removed
                            }
                        }
                        return item; // Return unchanged item for other items
                    })
                    .filter(item => item !== null); // Remove any null items (those that should be deleted)

                // Select the last item if there are still items remaining
                if (updatedItems.length > 0) {
                    setOrderedItemSelected(updatedItems.length - 1); // Select the last item
                } else {
                    setOrderedItemSelected(null); // Deselect if no items are left
                }

                return updatedItems; // Return the updated items
            });
        }
    };

    return (
        <div className="ordered-items-section" ref={orderedItemsRef}>
            {/* Setup */}
            <div className="ordered-items-content">
                <div className="vertical-line"></div>

                {/* Combined headers and ordered items */}
                <div className="headers">
                    <span className="quantity-label">Q</span>
                    <span className="item-label">ITEM</span>
                    <span className="price-label">PRICE</span>
                </div>

                {/* Render selected items */}
                {orderedItems.map((item, index) => (
                    <div
                        key={index}
                        className={`ordered-item-row ${orderedItemSelected === index ? 'selected' : ''}`}
                        onClick={() => handleRowClick(index)} // Handle row click
                    >
                        <span className="ordered-item quantity">{item.quantity || 1}</span>
                        <span className="ordered-item name">{item.name}</span>
                        <span className="ordered-item price">{item.price}</span>
                    </div>
                ))}
            </div>

            <div className="footer">
                <div className="quantity-buttons" ref={qtyToggle}>
                    <button
                        className={`decrease-btn ${orderedItemSelected !== null ? 'active' : ''}`}
                        onClick={decreaseQuantity}
                    >
                        -
                    </button>
                    <button
                        className={`increase-btn ${orderedItemSelected !== null ? 'active' : ''}`}
                        onClick={increaseQuantity}
                    >
                        +
                    </button>                                  
                </div>

                <span className="total">TOTAL</span>
                <span className="price-sum">£{orderedItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0).toFixed(2)}</span>
                <span className="final-price">£0.00</span>                                  
            </div>
        </div>
    );
};

export default OrderedItemsSection;
