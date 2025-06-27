import React from 'react';
import { FaBars, FaArrowRightFromBracket } from 'react-icons/fa';

interface HeaderProps {
    toggleMobileMenu: (e: React.MouseEvent) => void;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileMenu }) => {
    return (
        <header className="mainHeader">
            <div className="headerLeft">
                <button id="mobileMenuBtn" className="mobileMenuBtn" onClick={toggleMobileMenu}>
                    <FaBars />
                </button>
                <div id="logo"></div>
            </div>
            <div className="headerActions">
                <a href="#" className="exitButton"><FaArrowRightFromBracket /></a>
            </div>
        </header>
    );
};

export default Header; 