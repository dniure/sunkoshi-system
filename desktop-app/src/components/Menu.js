import React, { useState, useRef, useEffect } from 'react';
import '../css/main.css';
import '../css/menu.css';
import MenuItems from '../data/MenuItems';

const Menu = ({ onSelect }) => {
    const categoryRefs = useRef([]);
    const menuGridRef = useRef(null);
    const scrollerRef = useRef(null);

    const [scrollPosition, setScrollPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const categoryData = MenuItems.categoryData;
    const categorizedItems = MenuItems.getCategorizedItems();
    const [activeCategory, setActiveCategory] = useState(categoryData[0].name);

    const handleScroll = () => {
        const scrollableHeight = menuGridRef.current.scrollHeight - menuGridRef.current.clientHeight;
        const scrollerHeight = scrollerRef.current.clientHeight;
        const handleMaxPos = scrollerHeight - document.querySelector('.scroller-handle').clientHeight;
        setScrollPosition((menuGridRef.current.scrollTop / scrollableHeight) * handleMaxPos);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const scrollableHeight = menuGridRef.current.scrollHeight - menuGridRef.current.clientHeight;
        const scrollerHeight = scrollerRef.current.clientHeight;
        let handlePosition = Math.max(0, Math.min(e.clientY - scrollerRef.current.getBoundingClientRect().top, scrollerHeight - document.querySelector('.scroller-handle').clientHeight));
        menuGridRef.current.scrollTop = (handlePosition / (scrollerHeight - document.querySelector('.scroller-handle').clientHeight)) * scrollableHeight;
        setScrollPosition(handlePosition);
    };

    useEffect(() => {
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
        if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', () => setIsDragging(false));
        } else {
        window.removeEventListener('mousemove', handleMouseMove);
        }

        return () => {
        // Clean up listeners only if elements still exist
        if (isDragging) {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', () => setIsDragging(false));
        }
        };
    });

    useEffect(() => {
        const handleScroll = () => {
    
            const THRESHOLD = 8.8;
    
            let currentCategory = activeCategory; // Initialize current category
            for (let i = 0; i < categoryRefs.current.length; i++) {
                const categoryRef = categoryRefs.current[i];
                if (categoryRef) {
                    const { top, bottom } = categoryRef.getBoundingClientRect();
                    const categoryHeight = categoryRef.clientHeight;
                    
                    console.log("category height: ", categoryHeight)
                    // Check if the bottom of the category is above the threshold
                    if (bottom < window.innerHeight - (categoryHeight * THRESHOLD)) {
                        // Update to the current category only if it's completely scrolled out of view
                        currentCategory = categoryData[i].name; // Update to the current category
                    } else if (top >= window.innerHeight) {
                        // If the top of the category is below the viewport, exit loop
                        break;
                    }
                }
            }
            
            // Update the active category state only if it has changed
            if (currentCategory !== activeCategory) {
                setActiveCategory(currentCategory);
            }        
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
    });

    const capitalizeFirstLetter = (str) => {
        return str
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

  return (
    <div className="menu-container unselectable">
        <div className="main-heading">
            <span className="heading">{capitalizeFirstLetter(activeCategory)}</span>
            <div className="separator"></div>
        </div>
        
        <div className="categories">
            {categoryData.map((category, index) => (
            <div  key={category.name}
                    className="category-item"
                    style={{ background: category.color }}
                    onClick={() => {
                        const categoryRef = categoryRefs.current[index];
                        if (categoryRef) {
                            categoryRef.scrollIntoView({ behavior: 'auto', block: 'start' }); // Scroll to the category
                            if (index !== 0) {
                                menuGridRef.current.scrollTop += 60; // Adjust scroll position by 20 pixels
                            }
                        }
                    }}               
                >
                {category.name}
            </div>
            ))}
        </div>

        <div className="menu-grid" ref={menuGridRef}>
            {categoryData.map((category, categoryIndex) => (
                <React.Fragment key={categoryIndex}>
                    {/* SCROLLING HEADER */}
                    <div ref={el => (categoryRefs.current[categoryIndex] = el)}
                        data-category={category.name}
                        style={{ gridColumn: 'span 5' }}
                    >
                        {/* Show heading only if it's not the first category */}
                        {categoryIndex !== 0 && (
                            <>
                                <span className="scrolling heading">{capitalizeFirstLetter(category.name)}</span>
                                <div className="scrolling separator"></div>
                            </>
                        )}
                    </div>

                    {categorizedItems[category.name].map((item, index) => (
                        <div 
                            key={index} 
                            className="menu-item" 
                            onClick={(event) => onSelect(item, event)}
                        >
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


        <div className="scroller" ref={scrollerRef}>
            <div className="scroller-handle" style={{ top: `${scrollPosition}px` }} onMouseDown={() => setIsDragging(true)}></div>
        </div>
    </div>
  );
};

export default Menu;
