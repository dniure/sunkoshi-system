import React, { useState, useEffect } from 'react';

import '../css/main.css';
import '../css/orderScreen.css';
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
    const [orderedItemSelected, setOrderedItemSelected] = useState(orderedItemSelectedInput);
    const [priceSum, setPriceSum] = useState(0);
    const [finalCost, setFinalCost] = useState(0);
    const [additionalCharges] = useState(0);

    useEffect(() => setOrderedItemSelected(orderedItemSelectedInput), [orderedItemSelectedInput]);
    useEffect(() => setOrderedItems(orderedItemsInput), [orderedItemsInput]);
    useEffect(() => setOrderedItemsInput(orderedItems), [orderedItems, setOrderedItemsInput]);
    useEffect(() => setOrderedItemSelectedInput(orderedItemSelected), [orderedItemSelected, setOrderedItemSelectedInput]);

    useEffect(() => {
        const handleClickEvent = (event) => {};
        document.addEventListener('mousedown', handleClickEvent);
        return () => document.removeEventListener('mousedown', handleClickEvent);
    }, []);

    useEffect(() => {
        const total = orderedItems.reduce((sum, { price, quantity = 1 }) => sum + price * quantity, 0);
        setPriceSum(total.toFixed(2));
        setFinalCost((total + additionalCharges).toFixed(2));
    }, [orderedItems, additionalCharges]);
    
    const handleRowClick = (index) => setOrderedItemSelected(orderedItemSelected === index ? null : index);

    const modifyQuantity = (modifier) => {
        if (orderedItemSelected === null) return;
    
        setOrderedItems(prevItems => {
            const updatedItems = prevItems.map((item, i) => {
                if (i === orderedItemSelected) {
                    const newQuantity = (item.quantity || 1) + modifier;
                    return modifier === 1 ? { ...item, quantity: Math.max(1, newQuantity) } 
                        : newQuantity > 1 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter(Boolean);
    
            setOrderedItemSelected(updatedItems.length ? updatedItems.length - 1 : null);
            return updatedItems;
        });
    };
    

return (
    <div className="ordered-items-section" ref={orderedItemsRef}>
        <div className="ordered-items-content">
            <div className="vertical-line"></div>
            <div className="headers">
                <span className="quantity-label">Q</span>
                <span className="item-label">ITEM</span>
                <span className="price-label">PRICE</span>
            </div>
            {orderedItems.map((item, index) => (
                <div
                    key={index}
                    className={`ordered-item-row ${orderedItemSelected === index ? 'selected' : ''}`}
                    onClick={() => handleRowClick(index)}
                >
                    <span className="ordered-item quantity">{item.quantity || 1}</span>
                    <span className="ordered-item name">{item.name}</span>
                    <span className="ordered-item price">£{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                </div>
            ))}
        </div>
        <div className="footer">
            <div className="quantity-buttons" ref={qtyToggle}>
                <button className={`decrease-btn ${orderedItemSelected !== null ? 'active' : ''}`} onClick={() => modifyQuantity(-1)}>-</button>
                <button className={`increase-btn ${orderedItemSelected !== null ? 'active' : ''}`} onClick={() => modifyQuantity(1)}>+</button>                                  
            </div>
            <span className="total">TOTAL</span>
            <span className="price-sum">{priceSum}</span>
            <span className="final-price">{finalCost}</span>                                  
        </div>
    </div>
);
};

export default OrderedItemsSection;
