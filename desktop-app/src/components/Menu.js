import React from 'react';
import '../css/orderScreen.css';

const Menu = ({ onSelect }) => {
    const menuItems = [
        { id: 1, name: 'Pizza' },
        { id: 2, name: 'Burger' },
        { id: 3, name: 'Pasta' },
        // Add more items as needed
    ];

    return (
        <div className="menu-container">
            <h2>Menu</h2>
            <ul>
                {menuItems.map(item => (
                    <li key={item.id} onClick={() => onSelect(item)}>
                        {item.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Menu;
