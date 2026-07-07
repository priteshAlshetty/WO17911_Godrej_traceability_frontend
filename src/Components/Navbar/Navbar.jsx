
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import Godrej_multiLogo from '../../assets/goderej_and_multiquadrant_logo.jpeg';

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(!isMobileMenuOpen);
  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);

  return (
    <div className="nav">
      <img src={Godrej_multiLogo} alt="Godrej Logo" className="logo" />

      <div className={`navlinks ${isMobileMenuOpen ? 'open' : ''}`}>
        <li>
          <NavLink to="/api/" end className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>Home</NavLink>
        </li>

        <li className="dropdown">
          <span className="dropdown-toggle">Traceability ▾</span>
          <ul className="dropdown-menu">
            <li>
              <NavLink to="/api/traceability/id" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>ID Wise</NavLink>
            </li>
            <li>
              <NavLink to="/api/traceability/batch" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>Batch Wise</NavLink>
            </li>
            <li>
              <NavLink to="/api/traceability/date" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>Date Wise</NavLink>
            </li>
          </ul>
        </li>


        {/* <li>
          <NavLink to="/api/upload" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>Upload</NavLink>
        </li>
        <li>
          <NavLink to="/api/download" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>Download</NavLink>
        </li> */}
        <li>
          <NavLink to="/api/graphs" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>Graphs</NavLink>
        </li>
        <li>
          <NavLink to="/api/machine-wise" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>Machine Data</NavLink>
        </li>
        {/* <li>
          <NavLink to="/api/ems-individual" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>Energy</NavLink>
        </li> */}

         <li className="dropdown">
          <span className="dropdown-toggle">Energy ▾</span>
          <ul className="dropdown-menu">
           
            <li>
              <NavLink to="/api/ems-individual" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>EMS Live</NavLink>
            </li>
            <li>
              <NavLink to="/api/energy-graph" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>KWh </NavLink>
            </li>
            <li>
              <NavLink to="/api/all-machines-data" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>Machinewise Graph</NavLink>
            </li>
          </ul>
        </li>
                  <NavLink to="/api/connectivity-status" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>Connectivity Status</NavLink>



        
        {/* <li>
          <NavLink to="/api/about" className={({ isActive }) => isActive ? 'active_link' : 'inactive_link'}>About</NavLink>
        </li> */}
      </div>

      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
    </div>
  );
};

export default Navbar;
