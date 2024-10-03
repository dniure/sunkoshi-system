// OrderItemsSection.js
import React, { useRef } from 'react';

const OrderItemsSection = ({
    selectedItems,
    orderedItemSelected,
    setOrderedItemSelected,
    increaseQuantity,
    decreaseQuantity,
    handleRowClick,
    qtyToggle
}) => {
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
                {selectedItems.map((item, index) => (
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
                <span className="price-sum">£{selectedItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0).toFixed(2)}</span>
                <span className="final-price">£0.00</span>
            </div>
        </div>
    );
};

export default OrderItemsSection;
