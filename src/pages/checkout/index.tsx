import React, { useState } from 'react';
import styles from './styles.module.css';
import Header from '../../components/header';
import OrderSummary from '../../components/orderSummary';
import Faq from '../../components/faq';
import CheckoutStepper from '../../components/checkoutStepper';
import RegistrationForm from '../../components/registrationForm';
import PaymentForm from '../../components/paymentForm';
import Confirmation from '../../components/confirmation';

const Checkout: React.FC = () => {
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('creditCard');

    const handleNextStep = () => {
        if (step < 3) {
            setStep(step + 1);
        }
    };

    return (
        <div className={styles.mainContainer}>
            <Header />
            
            <div className={styles.checkoutContainer}>
                <div className={styles.checkoutForm}>
                    <CheckoutStepper step={step} />
                    
                    {step === 1 && <RegistrationForm />}
                    {step === 2 && <PaymentForm paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />}
                    {step === 3 && <Confirmation />}
                    
                    {step < 3 && (
                         <div className={styles.formFooter}>
                            <button onClick={handleNextStep} className={styles.btnPrimary}>
                                {step === 1 ? 'Próximo' : 'Finalizar Pagamento'}
                            </button>
                        </div>
                    )}
                </div>
                
                <OrderSummary />
                
                <Faq />
            </div>
        </div>
    );
};

export default Checkout; 