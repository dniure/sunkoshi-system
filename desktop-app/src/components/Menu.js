import React, { useState, useRef, useEffect } from 'react';
import '../css/main.css';
import '../css/menu.css';
import MenuItems from '../data/MenuItems';

const Menu = () => {

    const categoryRefs = useRef([]);
    const menuGridRef = useRef(null); // Reference for the menu-grid
    const scrollerRef = useRef(null);

    const [scrollPosition, setScrollPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false); // Track dragging state

    // Define categories and categorized items
    const category_data = [
        { name: 'most ordered', color: '#6F3392' },
        { name: 'veg. starters', color: '#20C518' },
        { name: 'non-veg. starters', color: '#B21B1B' },
        { name: 'veg. mains', color: '#20C518' },
        { name: 'non-veg. mains', color: '#B21B1B' },
        { name: 'sides & extras', color: '#B2B63B' },
        { name: 'rice & naans', color: 'linear-gradient(to right, #A06A12 85%, #F20000)' },
        { name: 'drinks', color: 'linear-gradient(to right, #C3C823 , #C29D22)' },
        { name: 'desserts', color: 'linear-gradient(to right, #DA2D2D, #B4A932 100%)' },
    ];

    // Handle mouse movement for dragging
    const handleMouseMove = (e) => {
        if (isDragging) {
            const scrollableHeight = menuGridRef.current.scrollHeight - menuGridRef.current.clientHeight;
    
            const scrollerHeight = e.currentTarget.clientHeight;
            let handlePosition = e.clientY - e.currentTarget.getBoundingClientRect().top;
    
            // Ensure the handle position is within the scroller's boundaries
            handlePosition = Math.max(0, Math.min(handlePosition, scrollerHeight - document.querySelector('.scroller-handle').clientHeight));
            
            // Calculate the new scroll position in the menu grid based on the scroller handle's full range
            const handleMaxPos = scrollerHeight - document.querySelector('.scroller-handle').clientHeight;
            const newScrollPos = (handlePosition / handleMaxPos) * scrollableHeight;
    
            if (newScrollPos >= 0 && newScrollPos <= scrollableHeight) {
                menuGridRef.current.scrollTop = newScrollPos;
                setScrollPosition(handlePosition); // Update the handle's position visually
            }
        }
    };    
  
    // Event handler to start dragging
    const handleMouseDown = () => {
        setIsDragging(true);
    };

    // Event handler to stop dragging
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollableHeight = menuGridRef.current.scrollHeight - menuGridRef.current.clientHeight;
            const scrollerHeight = scrollerRef.current.clientHeight;
            const handleMaxPos = scrollerHeight - document.querySelector('.scroller-handle').clientHeight;
    
            // Calculate the handle's position based on the menu scroll
            const newHandlePosition = (menuGridRef.current.scrollTop / scrollableHeight) * handleMaxPos;
            
            setScrollPosition(newHandlePosition);
        };
    
        const menuGrid = menuGridRef.current;
        if (menuGrid) {
            menuGrid.addEventListener('scroll', handleScroll);
        }
    
        return () => {
            if (menuGrid) {
                menuGrid.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);
    
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsDragging(false);
        };
    
        // Add event listener to the entire window to listen for mouseup
        window.addEventListener('mouseup', handleGlobalMouseUp);
    
        // Cleanup the event listener when the component is unmounted
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, []);
    
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const scrollableHeight = menuGridRef.current.scrollHeight - menuGridRef.current.clientHeight;
                const scrollerHeight = scrollerRef.current.clientHeight;
                let handlePosition = e.clientY - scrollerRef.current.getBoundingClientRect().top;
    
                // Ensure the handle position is within the scroller's boundaries
                handlePosition = Math.max(0, Math.min(handlePosition, scrollerHeight - document.querySelector('.scroller-handle').clientHeight));
                
                // Calculate the new scroll position in the menu grid based on the scroller handle's position
                const handleMaxPos = scrollerHeight - document.querySelector('.scroller-handle').clientHeight;
                const newScrollPos = (handlePosition / handleMaxPos) * scrollableHeight;
    
                if (newScrollPos >= 0 && newScrollPos <= scrollableHeight) {
                    menuGridRef.current.scrollTop = newScrollPos;
                    setScrollPosition(handlePosition); // Update the handle's position visually
                }
            }
        };
    
        const handleMouseUp = () => {
            setIsDragging(false);
        };
    
        // Add global mousemove and mouseup listeners when dragging starts
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            // Remove listeners when dragging stops
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    
        return () => {
            // Clean up in case the component unmounts while dragging
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    
    ///////////////////////////////////////
    // CATEGORY & HEADING
    const categorizedItems = {
        'most ordered': MenuItems.mostOrdered,
        'veg. starters': MenuItems.starters.veg,
        'non-veg. starters': MenuItems.starters.nonVeg,
        'veg. mains': MenuItems.mains.veg,
        'non-veg. mains': MenuItems.mains.nonVeg,
        'sides & extras': [
            ...MenuItems.sidesAndExtras.vegSides || [],
            ...MenuItems.sidesAndExtras.kidsItems || [],
            ...MenuItems.sidesAndExtras.chutneysAndRaita || [],
        ],
        'rice & naans': [
            ...MenuItems.riceAndNaans.rice || [],
            ...MenuItems.riceAndNaans.naans || [],
        ],
        'drinks': [
            ...MenuItems.drinks.softDrinks || [],
            ...MenuItems.drinks.beers || [],
            ...MenuItems.drinks.wines || [],
            ...MenuItems.drinks.spirits || [],
        ],
        'desserts': MenuItems.desserts,
    };

    const jumpToCategory = (index) => {
        const categoryRef = categoryRefs.current[index];
        if (categoryRef) {
            categoryRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const capitalizeFirstLetter = (str) => {
        return str
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };


    return (
        <div className="menu-container unselectable">
   
            {/* Category List */}
            <div className="categories">
                {category_data.map((category, index) => (
                    <div
                        key={category.name}
                        className="category-item"
                        style={{ background: category.color }}
                        onClick={() => jumpToCategory(index)}
                    >
                        {category.name}
                    </div>
                ))}
            </div>
    
            {/* Menu Grid with Category Sections */}
            <div className="menu-grid" ref={menuGridRef}>
                {category_data.map((category, categoryIndex) => {
                    const items = categorizedItems[category.name];

                    return (
                        <React.Fragment key={categoryIndex}>
                            {/* Conditionally render the Scroller Header */}
                            {categoryIndex >= 0 && ( // Check if it's not the first category
                                <div
                                    ref={el => (categoryRefs.current[categoryIndex] = el)} // Set ref on the separator element
                                    data-category={category.name}
                                    style={{ gridColumn: 'span 5' }}
                                >
                                    <span className="heading scroller">{capitalizeFirstLetter(category.name)}</span>
                                    <div className="separator scroller"></div> {/* Ref is here */}
                                </div>
                            )}

                            {items.map((item, index) => (
                                <div key={index} className="menu-item">
                                    <div className="item-number">{index + 1}</div>
                                    <div className="nameAndPrice">
                                        <div className="item-name">{item.name}</div>
                                        <div className="item-price">{item.price}</div>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Custom Scroller */}
            <div 
                className="custom-scroller"
                ref={scrollerRef}  // Add this line
                onMouseMove={handleMouseMove} 
            >
                <div 
                    className="scroller-handle" 
                    style={{ top: `${scrollPosition}px` }} 
                    onMouseDown={handleMouseDown}
                ></div>
            </div>

        </div>
    )};

export default Menu;
