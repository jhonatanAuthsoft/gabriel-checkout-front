import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import styles from './styles.module.css';

const Faq: React.FC = () => {
    return (
        <div className={styles.downSection}>
            <div className={styles.guaranteeSection}>
                <div className={styles.guaranteeBadge}></div>
                <div className={styles.guaranteeInfo}>
                    <div className={styles.guaranteeQuestion}>
                        <span>Como você recebe o produto?</span>
                        <i className={`fa fa-chevron-down ${styles.arrow}`}></i>
                    </div>
                    <div className={styles.guaranteeQuestion}>
                        <span>E se eu não souber como acessar?</span>
                        <i className={`fa fa-chevron-down ${styles.arrow}`}></i>
                    </div>
                    <div className={styles.guaranteeQuestion}>
                        <span>E se eu não gostar?</span>
                        <FaChevronDown className={styles.arrow} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Faq; 