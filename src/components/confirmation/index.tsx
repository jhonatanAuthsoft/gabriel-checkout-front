import React from 'react';
import styles from './styles.module.css';

const Confirmation: React.FC = () => {
    return (
        <div className={`${styles.formStep} ${styles.active}`} style={{textAlign: 'center', padding: '40px 0'}}>
            <h2>Pagamento Confirmado!</h2>
            <p>Obrigado pela sua compra.</p>
            <p>Enviamos os detalhes para o seu e-mail.</p>
        </div>
    );
};

export default Confirmation; 