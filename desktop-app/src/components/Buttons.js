import React from 'react';
import '../styles.css'; // Import custom styles

const StyledButton = ({ label, type }) => {
    return (
        <button className={`styled-button ${type}`}>
            {label}
        </button>
    );
};

export default StyledButton;
