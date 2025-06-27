import React from 'react';
import styles from './styles.module.css';
import logo from '../../assets/img/df.png';

interface HeaderProps {
    logoSrc: string;
}

const Header: React.FC = () => {
    return (
        <header className={styles.mainHeader}>
            <div className={styles.headerLeft}>
                <div id="logo" className={styles.logo} style={{ backgroundImage: `url(${logo})` }}></div>
            </div>
        </header>
    );
};

export default Header; 