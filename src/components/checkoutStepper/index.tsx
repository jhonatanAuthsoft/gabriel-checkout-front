import React from 'react';
import { FaCheck } from 'react-icons/fa';
import styles from './styles.module.css';

interface CheckoutStepperProps {
    step: number;
}

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ step }) => {
    return (
        <div className={styles.checkoutSteps}>
            <div id="stepper1" className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
                <div className={styles.stepNumber}><FaCheck /></div>
                <span>Cadastro</span>
            </div>
            <div className={`${styles.stepConnector} ${step > 1 ? styles.active : ''}`}></div>
            <div id="stepper2" className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                <div className={styles.stepNumber}><FaCheck /></div>
                <span>Pagamento</span>
            </div>
            <div className={`${styles.stepConnector} ${step > 2 ? styles.active : ''}`}></div>
            <div id="stepper3" className={`${styles.step} ${step === 3 ? styles.active : ''}`}>
                <div className={styles.stepNumber}><FaCheck /></div>
                <span>Confirmação</span>
            </div>
        </div>
    );
};

export default CheckoutStepper; 