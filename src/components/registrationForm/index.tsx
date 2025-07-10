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
    cep: string;
    setCep: (value: string) => void;
    logradouro: string;
    setLogradouro: (value: string) => void;
    numero: string;
    setNumero: (value: string) => void;
    complemento: string;
    setComplemento: (value: string) => void;
    bairro: string;
    setBairro: (value: string) => void;
    cidade: string;
    setCidade: (value: string) => void;
    uf: string;
    setUf: (value: string) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
    nome, setNome, email, setEmail, celular, setCelular, cpf, setCpf, password, setPassword,
    cep, setCep, logradouro, setLogradouro, numero, setNumero, complemento, setComplemento,
    bairro, setBairro, cidade, setCidade, uf, setUf
}) => {
    
    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .substring(0, 14);
    };

    const formatCEP = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{5})(\d)/, '$1-$2')
            .substring(0, 9);
    };

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpf(e.target.value.replace(/\D/g, ''));
    };

    const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCep(e.target.value.replace(/\D/g, ''));
    };

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
                            <input type="text" placeholder="999.999.999-99" value={formatCPF(cpf)} onChange={handleCPFChange} className={styles.valid} maxLength={14} />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>CEP</label>
                        <div className={`${styles.inputWrapper} ${styles.valid}`}>
                            <input type="text" placeholder="99999-999" value={formatCEP(cep)} onChange={handleCEPChange} className={styles.valid} maxLength={9} />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Endereço</label>
                        <div className={`${styles.inputWrapper} ${styles.valid}`}>
                            <input type="text" placeholder="Rua, Avenida, etc." value={logradouro} onChange={e => setLogradouro(e.target.value)} className={styles.valid} />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Número</label>
                        <div className={`${styles.inputWrapper} ${styles.valid}`}>
                            <input type="text" placeholder="123" value={numero} onChange={e => setNumero(e.target.value)} className={styles.valid} />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Complemento</label>
                        <div className={`${styles.inputWrapper} ${styles.valid}`}>
                            <input type="text" placeholder="Apto, Bloco, etc." value={complemento} onChange={e => setComplemento(e.target.value)} className={styles.valid} />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Bairro</label>
                        <div className={`${styles.inputWrapper} ${styles.valid}`}>
                            <input type="text" placeholder="Seu bairro" value={bairro} onChange={e => setBairro(e.target.value)} className={styles.valid} />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Cidade</label>
                        <div className={`${styles.inputWrapper} ${styles.valid}`}>
                            <input type="text" placeholder="Sua cidade" value={cidade} onChange={e => setCidade(e.target.value)} className={styles.valid} />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>UF</label>
                        <div className={`${styles.inputWrapper} ${styles.valid}`}>
                            <input type="text" placeholder="Estado" value={uf} onChange={e => setUf(e.target.value)} className={styles.valid} />
                            <div className={styles.validIcon}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm; 