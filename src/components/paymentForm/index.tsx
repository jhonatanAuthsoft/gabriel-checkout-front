import React from 'react';
import { FaCreditCard, FaBarcode } from 'react-icons/fa';
import { FaPix } from 'react-icons/fa6';
import styles from './styles.module.css';

interface PaymentFormProps {
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ paymentMethod, setPaymentMethod }) => {
    return (
        <div id="formStep2" className={`${styles.formStep} ${styles.active}`}>
            <div className={styles.formSection}>
                <h2>Selecione o Método de Pagamento</h2>
                
                <div className={styles.paymentMethodSelector}>
                    <button className={`${styles.paymentMethod} ${paymentMethod === 'creditCard' ? styles.active : ''}`} onClick={() => setPaymentMethod('creditCard')}>
                        <FaCreditCard /> Crédito
                    </button>
                    <button className={`${styles.paymentMethod} ${paymentMethod === 'pix' ? styles.active : ''}`} onClick={() => setPaymentMethod('pix')}>
                        <FaPix /> Pix
                    </button>
                    <button className={`${styles.paymentMethod} ${paymentMethod === 'boleto' ? styles.active : ''}`} onClick={() => setPaymentMethod('boleto')}>
                        <FaBarcode /> Boleto
                    </button>
                </div>
                
                <p className={styles.paymentNote}>Conclua sua compra para gerar o código para pagamento.</p>

                <div id="creditCardForm" className={`${styles.paymentForm} ${paymentMethod === 'creditCard' ? styles.active : ''}`}>
                     <div className={styles.formGroup}>
                        <label>Número do Cartão</label>
                        <div className={styles.inputWrapper}>
                            <input type="number" min="0" placeholder="Somente Números" />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Nome Impresso no Cartão</label>
                        <div className={styles.inputWrapper}>
                            <input type="text" placeholder="Informe o nome exatamente como está no cartão" />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Validade</label>
                            <div className={styles.formRow} style={{gap: '10px'}}>
                                 <select>
                                    <option disabled selected>MM</option>
                                 </select>
                                <select>
                                    <option disabled selected>AA</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Código de Segurança</label>
                            <div className={styles.inputWrapper}>
                                <input type="number" min="0" placeholder="CVV" />
                                <div className={styles.validIcon}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="pixForm" className={`${styles.paymentForm} ${paymentMethod === 'pix' ? styles.active : ''}`}>
                    <p style={{textAlign: 'center', padding: '20px'}}>Informações para pagamento com Pix serão exibidas aqui.</p>
                </div>

                <div id="boletoForm" className={`${styles.paymentForm} ${paymentMethod === 'boleto' ? styles.active : ''}`}>
                    <p style={{textAlign: 'center', padding: '20px'}}>O boleto será gerado após a confirmação.</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentForm; 