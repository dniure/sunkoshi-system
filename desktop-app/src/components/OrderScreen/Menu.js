import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import MenuItems from '../../data/MenuItems';
import '../../css/main.scss';
import '../../css/OrderScreen/menu.scss';

const Menu = ({ onSelect }) => {
    // Refs
    const categoryRefs = useRef([]);
    const menuGridRef = useRef(null);
    const scrollerRef = useRef(null);
    
    // Category Handling
    const [activeCategory, setActiveCategory] = useState(MenuItems.categoryData[0].name);
    const categoryData = useMemo(() => MenuItems.categoryData, []);
    const categorizedItems = useMemo(() => MenuItems.getCategorizedItems(), []);

    // Scroll handling
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [handleDragOffset, setHandleDragOffset] = useState(0);
    
    const handleMouseDown = useCallback((e) => {
        const handleTop = document.querySelector('.scroller-handle').getBoundingClientRect().top;
        setHandleDragOffset(e.clientY - handleTop);
        setIsDragging(true);
    }, []);
    
    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;

        const scrollerHeight = scrollerRef.current.clientHeight;
        const handleHeight = document.querySelector('.scroller-handle').clientHeight;
        const handleMaxPos = scrollerHeight - handleHeight;
        const scrollableHeight = menuGridRef.current.scrollHeight - menuGridRef.current.clientHeight;

        let newHandlePos = Math.min(
        Math.max(e.clientY - scrollerRef.current.getBoundingClientRect().top - handleDragOffset, 0),
        handleMaxPos
        );

        menuGridRef.current.scrollTop = (newHandlePos / handleMaxPos) * scrollableHeight;
        setScrollPosition(newHandlePos);
    },[isDragging, handleDragOffset]);    

    const handleMenuScroll = useCallback(() => {
        const { scrollHeight, clientHeight, scrollTop } = menuGridRef.current;
        const scrollableHeight = scrollHeight - clientHeight;
        const handleMaxPos = scrollerRef.current.clientHeight - document.querySelector('.scroller-handle').clientHeight;
        setScrollPosition((scrollTop / scrollableHeight) * handleMaxPos);
    }, []);

    const handleCategoryScroll = useCallback(() => {
        const THRESHOLD = 8.8;
        let currentCategory = activeCategory;

        categoryRefs.current.forEach((categoryRef, index) => {
            if (categoryRef) {
                const { top, bottom } = categoryRef.getBoundingClientRect();
                const categoryHeight = categoryRef.clientHeight;

                if (bottom < window.innerHeight - categoryHeight * THRESHOLD) {
                    currentCategory = categoryData[index].name;
                } else if (top >= window.innerHeight) {
                    return;
                }
            }
        });

        if (currentCategory !== activeCategory) {
            setActiveCategory(currentCategory);
        }
    }, [activeCategory, categoryData]);


    // Effect to handle scrolling
    useEffect(() => {
        const menuGrid = menuGridRef.current;
        
        if (menuGrid) {
            menuGrid.addEventListener('scroll', handleMenuScroll);
            menuGrid.addEventListener('scroll', handleCategoryScroll);
        }

        return () => {
            if (menuGrid) {
            menuGrid.removeEventListener('scroll', handleMenuScroll);
            menuGrid.removeEventListener('scroll', handleCategoryScroll);
            }
        };
    }, [handleMenuScroll, handleCategoryScroll]);

    // Effect to handle dragging
    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove]);

    // Helper Functions
    const capitalizeFirstLetter = (str) =>
    str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="menuSection menu-container unselectable">
            {/* Top Header */}
            <div className="top-header">
                <span className="header">{capitalizeFirstLetter(activeCategory)}</span>
                <div className="header-separator"></div>
            </div>

            {/* Categories */}
            <div className="categories">
                {categoryData.map((category, index) => (
                <div
                    key={category.name}
                    className="category-item"
                    style={{ background: category.color }}
                    onClick={() => {
                    const categoryRef = categoryRefs.current[index];
                    if (categoryRef) {
                        categoryRef.scrollIntoView({ behavior: 'auto', block: 'start' });
                        menuGridRef.current.scrollTop += index !== 0 ? 60 : 0;
                    }
                    }}
                >
                    {category.name}
                </div>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="menu-grid" ref={menuGridRef}>
                {categoryData.map((category, categoryIndex) => (
                <React.Fragment key={categoryIndex}>
                    {/* Scrolling Header */}
                    <div ref={(el) => (categoryRefs.current[categoryIndex] = el)} data-category={category.name} style={{ gridColumn: 'span 5' }}>
                    {categoryIndex !== 0 && (
                        <>
                        <span className="scrolling header">{capitalizeFirstLetter(category.name)}</span>
                        <div className="scrolling header-separator"></div>
                        </>
                    )}
                    </div>

                    {/* Menu Items */}
                    {categorizedItems[category.name].map((item, index) => (
                    <div key={index} className="menu-item" onClick={(event) => onSelect(item, event)}>
                        <div className="item-number">{index + 1}</div>
                        <div className="nameAndPrice">
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">{item.price}</div>
                        </div>
                    </div>
                    ))}
                </React.Fragment>
                ))}
            </div>

            {/* Menu Scroller */}
            <div className="scroller" ref={scrollerRef}>
                <span className="scroller-handle" style={{ top: `${scrollPosition}px` }} onMouseDown={handleMouseDown} />
            </div>
        </div>
    );
};

export default Menu;