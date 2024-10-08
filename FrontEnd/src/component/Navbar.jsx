import React from "react";
import { Link } from "react-router-dom";
import "../component/css/Nav.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <Link to="/transactions-table">Transactions Table</Link>
        </li>
        <li>
          <Link to="/transactions-statistics">Transactions Statistics</Link>
        </li>
        <li>
          <Link to="/transactions-bar">Transactions Bar</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
