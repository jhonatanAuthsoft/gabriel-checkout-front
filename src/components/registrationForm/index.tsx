import React from 'react';
import styles from './styles.module.css';

const RegistrationForm: React.FC = () => {
    return (
        <div id="formStep1" className={`${styles.formStep} ${styles.active}`}>
            <div className={styles.formSection}>
                <h2>Dados Cadastrais</h2>
                <div className={styles.formGroup}>
                    <label>Nome Completo</label>
                    <div className={`${styles.inputWrapper} ${styles.valid}`}>
                        <input type="text" placeholder="Nome Completo" className={styles.valid} />
                        <div className={styles.validIcon}></div>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>E-mail</label>
                    <div className={`${styles.inputWrapper} ${styles.valid}`}>
                        <input type="email" placeholder="email@email.com" />
                        <div className={styles.validIcon}></div>
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Celular</label>
                        <div className={`${styles.inputWrapper} ${styles.valid}`}>
                            <input type="tel" placeholder="(99)99999-9999" className={styles.valid} />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>CPF/CNPJ</label>
                        <div className={`${styles.inputWrapper} ${styles.valid}`}>
                            <input type="text" placeholder="999.999.999-99" className={styles.valid} />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm; 