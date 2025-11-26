import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; 

const Navbar = () => {
  // ⭐ 1. Add state to track if the menu is open
  const [isOpen, setIsOpen] = useState(false);

  // ⭐ 2. Function to toggle the menu visibility
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar-container"> 
      
      <div className="navbar-left">
        {/* TerraTalk Logo/Title goes here */}
      </div>

      {/* ⭐ 3. Add a button/icon to click */}
      <button className="menu-toggle" onClick={toggleMenu}>
        {/* Using a simple text icon for quick implementation. You can use an SVG icon. */}
        {isOpen ? 'X' : '☰'} 
      </button>

      {/* ⭐ 4. Add the 'open' class dynamically based on state */}
      <div className={`navbar-right ${isOpen ? 'open' : ''}`}>
        <Link to="/">Home</Link>
        <Link to="/features">Features</Link>
        <Link to="/about">About</Link>
      </div>
    </nav>
  );
};

export default Navbar;
