import React, { useState, useRef, useEffect } from 'react';
import '../css/menu.css';
import MenuItems from '../data/MenuItems';

const Menu = () => {
    const [selectedCategory, setSelectedCategory] = useState('most ordered');
    const categoryRefs = useRef([]);

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

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Update category when its separator is out of view (scrolled past)
                    if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
                        const category = entry.target.getAttribute('data-category');
                        setSelectedCategory(category);
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0, // Trigger when the separator is completely out of view
            }
        );
    
        categoryRefs.current.forEach((ref) => {
            if (ref) {
                observer.observe(ref); // Observe the separator for each category
            }
        });
    
        return () => {
            categoryRefs.current.forEach((ref) => {
                if (ref) {
                    observer.unobserve(ref);
                }
            });
        };
    }, [category_data]);  

    const scrollToCategory = (index) => {
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
        <div className="menu-container">
            {/* Main Heading */}
            <div className="heading">
                <span>{capitalizeFirstLetter(selectedCategory)}</span>
                <div className="separator top"></div>
            </div>

            {/* Category List */}
            <div className="categories">
                {category_data.map((category, index) => (
                    <div
                        key={category.name}
                        className="category-item"
                        style={{ background: category.color }}
                        onClick={() => scrollToCategory(index)}
                    >
                        {category.name}
                    </div>
                ))}
            </div>

            {/* Menu Grid with Category Sections */}
            <div className="menu-grid">
                {category_data.map((category, categoryIndex) => {
                    const items = categorizedItems[category.name];

                    return (
                        <React.Fragment key={categoryIndex}>
                            {/* Scroller Header */}
                            <div
                                ref={el => (categoryRefs.current[categoryIndex] = el)} // Set ref on the separator element
                                data-category={category.name}
                                style={{ gridColumn: 'span 5' }}
                            >
                                <span className="heading scroller">{capitalizeFirstLetter(category.name)}</span>
                                <div className="separator scroller"></div> {/* Ref is here */}
                            </div>

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

        </div>
    );
};

export default Menu;
