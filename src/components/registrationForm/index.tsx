import React from 'react';
import styles from './styles.module.css';

interface RegistrationFormProps {
    nome: string;
    setNome: (value: string) => void;
    email: string;
    setEmail: (value: string) => void;
    celular: string;
    setCelular: (value: string) => void;
    cpf: string;
    setCpf: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
    nome, setNome, email, setEmail, celular, setCelular, cpf, setCpf, password, setPassword
}) => {
    return (
        <div id="formStep1" className={`${styles.formStep} ${styles.active}`}>
            <div className={styles.formSection}>
                <h2>Dados Cadastrais</h2>
                <div className={styles.formGroup}>
                    <label>Nome Completo</label>
                    <div className={`${styles.inputWrapper} ${styles.valid}`}>
                        <input type="text" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} className={styles.valid} />
                        <div className={styles.validIcon}></div>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>E-mail</label>
                    <div className={`${styles.inputWrapper} ${styles.valid}`}>
                        <input type="email" placeholder="email@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                        <div className={styles.validIcon}></div>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>Senha</label>
                    <div className={`${styles.inputWrapper} ${styles.valid}`}>
                        <input type="password" placeholder="Crie uma senha" value={password} onChange={e => setPassword(e.target.value)} />
                        <div className={styles.validIcon}></div>
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Celular</label>
                        <div className={`${styles.inputWrapper} ${styles.valid}`}>
                            <input type="tel" placeholder="(99)99999-9999" value={celular} onChange={e => setCelular(e.target.value)} className={styles.valid} />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>CPF/CNPJ</label>
                        <div className={`${styles.inputWrapper} ${styles.valid}`}>
                            <input type="text" placeholder="999.999.999-99" value={cpf} onChange={e => setCpf(e.target.value)} className={styles.valid} />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm; 