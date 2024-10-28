import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../css/main.scss';
import '../../css/OrderScreen/orderedItemAmendment.scss';
import plusIcon from '../../images/plus-icon.png';

const OrderedItemAmendment = ({
    amendItemBoxRef,
    getRowPosition,
    isAmendingItem,
    amendmentsInPopup,
    setAmendmentsInPopup,
    applyAmendment,
    originalAmendments,
    orderedItemSelected,
}) => {

    const amendItemsScrollerRef = useRef(null);
    const [isAmendItemScrollerVisible, setIsAmendItemScrollerVisible] = useState(true);
    const [amendScrollPosition, setAmendScrollPosition] = useState(0);
    const [isAmendDragging, setIsAmendDragging] = useState(false);
    const [amendHandleHeight, setAmendHandleHeight] = useState(50);
    const [amendDragOffset, setAmendDragOffset] = useState(0);
    
    const [amendments] = useState([
        'madras hot', 'med hot', 'mild', '0 spicy', 'gluten allergy', 
        'extra cheese', 'extra gravy', 'nut allergy', 'other1', 
        'other2', 'other3', 'other4'
    ]);

    const handleSelectOption = (amendmentOption) => {
        if (amendmentsInPopup.includes(amendmentOption)) {
            setAmendmentsInPopup(amendmentsInPopup.filter(selectedOption => selectedOption !== amendmentOption));
        } else {
            setAmendmentsInPopup([...amendmentsInPopup, amendmentOption]);
        }
    };

    const handleAmendMouseMove = useCallback((e) => {
        if (!isAmendDragging || !amendItemsScrollerRef.current) return;

        const amendHandle = document.querySelector('.amendItems-customScroller-handle');
        const amendScrollerHeight = amendItemsScrollerRef.current.clientHeight;
        const amendmentContent = document.querySelector('.amendment-content');
        const amendScrollableHeight = amendmentContent.scrollHeight - amendmentContent.clientHeight;

        const handlePosition = Math.max(0, Math.min(e.clientY - amendItemsScrollerRef.current.getBoundingClientRect().top - amendDragOffset, amendScrollerHeight - amendHandle.clientHeight));
        amendmentContent.scrollTop = (handlePosition / (amendScrollerHeight - amendHandle.clientHeight)) * amendScrollableHeight;

        setAmendScrollPosition(handlePosition);
    }, [isAmendDragging, amendDragOffset]);

    const handleAmendScroll = useCallback(() => {
        const amendmentContent = amendItemBoxRef.current?.querySelector('.amendment-content');
        if (amendmentContent && amendItemsScrollerRef.current) {
            const scrollableHeight = amendmentContent.scrollHeight - amendmentContent.clientHeight;
            const scrollerHeight = amendItemsScrollerRef.current.clientHeight;
            const handleMaxPos = scrollerHeight - document.querySelector('.amendItems-customScroller-handle').clientHeight;

            setAmendScrollPosition((amendmentContent.scrollTop / scrollableHeight) * handleMaxPos);
        }
    }, [amendItemBoxRef]);

    // Adding a scroller listener
    useEffect(() => {
        const amendmentContent = amendItemBoxRef.current?.querySelector('.amendment-content');

        if (amendmentContent && isAmendingItem) {
            amendmentContent.addEventListener('scroll', handleAmendScroll);
            return () => {
                amendmentContent.removeEventListener('scroll', handleAmendScroll);
            };
        }
    }, [isAmendingItem, handleAmendScroll, amendItemBoxRef]);


    // Scroller Function
    useEffect(() => {
        const amendmentContent = document.querySelector('.amendment-content');
        if (amendItemsScrollerRef.current && amendmentContent) {
            const totalAmendHeight = amendmentContent.scrollHeight;
            const containerHeight = amendmentContent.offsetHeight;

            setIsAmendItemScrollerVisible(totalAmendHeight >= containerHeight);
            amendmentContent.style.overflowY = totalAmendHeight >= containerHeight ? 'auto' : 'hidden';

            const calculatedAmendHandleHeight = Math.max(20, (containerHeight - 30) * (containerHeight / totalAmendHeight));
            setAmendHandleHeight(Math.min(calculatedAmendHandleHeight, containerHeight));
        }
    }, [isAmendingItem]);

    const handleAmendMouseDown = (e) => {
        const handleElement = document.querySelector('.amendItems-customScroller-handle');
        setAmendDragOffset(e.clientY - handleElement.getBoundingClientRect().top);
        setIsAmendDragging(true);
    };

    // Scroller Dragging
    useEffect(() => {
        const handleMouseMoveWrapper = (e) => {
            if (isAmendDragging) {
                handleAmendMouseMove(e);
            }
        };

        if (isAmendDragging) {
            window.addEventListener('mousemove', handleMouseMoveWrapper);
            const handleMouseUp = () => setIsAmendDragging(false);
            window.addEventListener('mouseup', handleMouseUp);

            return () => {
                window.removeEventListener('mousemove', handleMouseMoveWrapper);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isAmendDragging, handleAmendMouseMove]);

    return (
        <div className="orderedItemAmendment" ref={amendItemBoxRef}>
            <div
            className="popup"
            style={{
                top: `${
                getRowPosition(orderedItemSelected)?.top > 257
                    ? getRowPosition(orderedItemSelected)?.top - 230
                    : getRowPosition(orderedItemSelected)?.top
                }px`,
            }}
            >
                {/* Amendment Content */}
                <div className="amendment-content">
                    {amendments.map((amendmentOption, index) => (
                        <div 
                            key={index}
                            className={`amendmentOption ${amendmentsInPopup.includes(amendmentOption) ? 'selected' : ''}`}
                            onClick={() => handleSelectOption(amendmentOption)}
                        >
                            {amendmentOption}
                        </div>
                    ))}
                </div>

                {/* Scrolling */}
                {isAmendItemScrollerVisible && (
                    <div className="amendItems-customScroller" ref={amendItemsScrollerRef}>
                        <div
                            className="amendItems-customScroller-handle"
                            style={{ top: `${amendScrollPosition}px`, height: `${amendHandleHeight}px` }}
                            onMouseDown={handleAmendMouseDown}
                        />
                    </div>
                )}

                {/* Admendment Content Addition */}
                <button className="plusIconBtn">
                    <img src={plusIcon} alt="Plus Icon" />
                </button>

                {/* Footer */}
                <div className="amend-item-footer">
                    <span className="amend-item-separator" />
                    <button className="cancel-button" onClick={() => applyAmendment(originalAmendments)}>Cancel</button>
                    <button className="save-button" onClick={() => applyAmendment(amendmentsInPopup)}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default OrderedItemAmendment;