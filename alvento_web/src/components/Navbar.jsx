import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/work">WORKS</NavLink>
      <a href="#">ARTISTS</a>
      <div className="logo-placeholder">
        <NavLink to="/">Ш</NavLink>
      </div>
      <NavLink to="/about">ABOUT</NavLink>
      <a href="#">LEGAL</a>
    </nav>
  );
}

export default Navbar;
