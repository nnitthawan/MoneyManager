import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaListUl } from "react-icons/fa"; // ไอคอนน่ารักจาก react-icons
import "./NavBar.css"; // อย่าลืมเชื่อมกับ CSS ด้านบน

function Navbar() {
  return (
    <nav className="cute-navbar">
      <div className="navbar-inner">
        <div className="logo">🐾 บันทึกเงิน</div>
        <div className="nav-links">
          <NavLink to="/" className="nav-link" end>
            <FaHome className="icon" />
            หน้าแรก
          </NavLink>
          <NavLink to="/records" className="nav-link">
            <FaListUl className="icon" />
            รายการ
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
