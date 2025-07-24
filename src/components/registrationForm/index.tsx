import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { FaCheck } from 'react-icons/fa';

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
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    isFormValid: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
    nome, setNome, email, setEmail, celular, setCelular, cpf, setCpf, password, setPassword,
    cep, setCep, logradouro, setLogradouro, numero, setNumero, complemento, setComplemento,
    bairro, setBairro, cidade, setCidade, uf, setUf, errors, setErrors
}) => {
    
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateField = (name: string, value: string) => {
        const newErrors = { ...errors };
    
        switch (name) {
            case 'nome':
                if (!value) newErrors.nome = 'Nome é obrigatório.';
                else delete newErrors.nome;
                break;
            case 'email':
                if (!value) newErrors.email = 'E-mail é obrigatório.';
                else if (!/\S+@\S+\.\S+/.test(value)) newErrors.email = 'E-mail inválido.';
                else delete newErrors.email;
                break;
            case 'celular':
                if (!value) newErrors.celular = 'Celular é obrigatório.';
                else if (value.replace(/\D/g, '').length < 10) newErrors.celular = 'Celular inválido.';
                else delete newErrors.celular;
                break;
            case 'cpf':
                if (!value) newErrors.cpf = 'CPF/CNPJ é obrigatório.';
                else if (value.replace(/\D/g, '').length < 11) newErrors.cpf = 'CPF/CNPJ inválido.';
                else delete newErrors.cpf;
                break;
            case 'password':
                if (!value) newErrors.password = 'Senha é obrigatória.';
                else if (value.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
                else delete newErrors.password;
                break;
            case 'cep':
                if (!value) newErrors.cep = 'CEP é obrigatório.';
                else if (value.replace(/\D/g, '').length < 8) newErrors.cep = 'CEP inválido.';
                else delete newErrors.cep;
                break;
            case 'logradouro':
                if (!value) newErrors.logradouro = 'Endereço é obrigatório.';
                else delete newErrors.logradouro;
                break;
            case 'numero':
                if (!value) newErrors.numero = 'Número é obrigatório.';
                else delete newErrors.numero;
                break;
            case 'bairro':
                if (!value) newErrors.bairro = 'Bairro é obrigatório.';
                else delete newErrors.bairro;
                break;
            case 'cidade':
                if (!value) newErrors.cidade = 'Cidade é obrigatória.';
                else delete newErrors.cidade;
                break;
            case 'uf':
                if (!value) newErrors.uf = 'UF é obrigatório.';
                else delete newErrors.uf;
                break;
            default:
                break;
        }
    
        setErrors(newErrors);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handleChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setter(value);
        if (touched[name]) {
            validateField(name, value);
        }
    };

    const formatCPF = (value: string) => {
        const onlyDigits = value.replace(/\D/g, '');
        if (onlyDigits.length <= 11) {
            return onlyDigits
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                .substring(0, 14);
        }
        return onlyDigits
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .substring(0, 18);
    };

    const formatCEP = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{5})(\d)/, '$1-$2')
            .substring(0, 9);
    };

    const formatCelular = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .substring(0, 15);
    };

    const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCelular(value.replace(/\D/g, ''));
        if (touched[name]) {
            validateField(name, value);
        }
    };
    
    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCpf(value.replace(/\D/g, ''));
        if (touched[name]) {
            validateField(name, value);
        }
    };
    
    const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCep(value.replace(/\D/g, ''));
        if (touched[name]) {
            validateField(name, value);
        }
    };

    return (
        <div id="formStep1" className={`${styles.formStep} ${styles.active}`}>
            <div className={styles.formSection}>
                <h2>Dados Cadastrais</h2>
                <div className={styles.formGroup}>
                    <label>Nome Completo</label>
                    <div className={`${styles.inputWrapper} ${!errors.nome && touched.nome ? styles.valid : ''}`}>
                        <input type="text" name="nome" placeholder="Nome Completo" value={nome} onChange={handleChange(setNome)} onBlur={handleBlur} />
                        {!errors.nome && touched.nome && <div className={styles.validIcon}><FaCheck /></div>}
                    </div>
                    {errors.nome && touched.nome && <p className={styles.errorText}>{errors.nome}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label>E-mail</label>
                    <div className={`${styles.inputWrapper} ${!errors.email && touched.email ? styles.valid : ''}`}>
                        <input type="email" name="email" placeholder="email@email.com" value={email} onChange={handleChange(setEmail)} onBlur={handleBlur} />
                        {!errors.email && touched.email && <div className={styles.validIcon}><FaCheck /></div>}
                    </div>
                    {errors.email && touched.email && <p className={styles.errorText}>{errors.email}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label>Senha</label>
                    <div className={`${styles.inputWrapper} ${!errors.password && touched.password ? styles.valid : ''}`}>
                        <input type="password" name="password" placeholder="Crie uma senha" value={password} onChange={handleChange(setPassword)} onBlur={handleBlur} />
                        {!errors.password && touched.password && <div className={styles.validIcon}><FaCheck /></div>}
                    </div>
                    {errors.password && touched.password && <p className={styles.errorText}>{errors.password}</p>}
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Celular</label>
                        <div className={`${styles.inputWrapper} ${!errors.celular && touched.celular ? styles.valid : ''}`}>
                            <input type="tel" name="celular" placeholder="(99)99999-9999" value={formatCelular(celular)} onChange={handleCelularChange} onBlur={handleBlur} maxLength={15} />
                            {!errors.celular && touched.celular && <div className={styles.validIcon}><FaCheck /></div>}
                        </div>
                        {errors.celular && touched.celular && <p className={styles.errorText}>{errors.celular}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>CPF/CNPJ</label>
                        <div className={`${styles.inputWrapper} ${!errors.cpf && touched.cpf ? styles.valid : ''}`}>
                            <input type="text" name="cpf" placeholder="999.999.999-99" value={formatCPF(cpf)} onChange={handleCPFChange} onBlur={handleBlur} maxLength={18} />
                            {!errors.cpf && touched.cpf && <div className={styles.validIcon}><FaCheck /></div>}
                        </div>
                        {errors.cpf && touched.cpf && <p className={styles.errorText}>{errors.cpf}</p>}
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>CEP</label>
                        <div className={`${styles.inputWrapper} ${!errors.cep && touched.cep ? styles.valid : ''}`}>
                            <input type="text" name="cep" placeholder="99999-999" value={formatCEP(cep)} onChange={handleCEPChange} onBlur={handleBlur} maxLength={9} />
                            {!errors.cep && touched.cep && <div className={styles.validIcon}><FaCheck /></div>}
                        </div>
                        {errors.cep && touched.cep && <p className={styles.errorText}>{errors.cep}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Endereço</label>
                        <div className={`${styles.inputWrapper} ${!errors.logradouro && touched.logradouro ? styles.valid : ''}`}>
                            <input type="text" name="logradouro" placeholder="Rua, Avenida, etc." value={logradouro} onChange={handleChange(setLogradouro)} onBlur={handleBlur} />
                            {!errors.logradouro && touched.logradouro && <div className={styles.validIcon}><FaCheck /></div>}
                        </div>
                        {errors.logradouro && touched.logradouro && <p className={styles.errorText}>{errors.logradouro}</p>}
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Número</label>
                        <div className={`${styles.inputWrapper} ${!errors.numero && touched.numero ? styles.valid : ''}`}>
                            <input type="text" name="numero" placeholder="123" value={numero} onChange={handleChange(setNumero)} onBlur={handleBlur} />
                            {!errors.numero && touched.numero && <div className={styles.validIcon}><FaCheck /></div>}
                        </div>
                        {errors.numero && touched.numero && <p className={styles.errorText}>{errors.numero}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Complemento</label>
                        <div className={`${styles.inputWrapper}`}>
                            <input type="text" name="complemento" placeholder="Apto, Bloco, etc." value={complemento} onChange={handleChange(setComplemento)} onBlur={handleBlur} />
                        </div>
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Bairro</label>
                        <div className={`${styles.inputWrapper} ${!errors.bairro && touched.bairro ? styles.valid : ''}`}>
                            <input type="text" name="bairro" placeholder="Seu bairro" value={bairro} onChange={handleChange(setBairro)} onBlur={handleBlur} />
                            {!errors.bairro && touched.bairro && <div className={styles.validIcon}><FaCheck /></div>}
                        </div>
                        {errors.bairro && touched.bairro && <p className={styles.errorText}>{errors.bairro}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Cidade</label>
                        <div className={`${styles.inputWrapper} ${!errors.cidade && touched.cidade ? styles.valid : ''}`}>
                            <input type="text" name="cidade" placeholder="Sua cidade" value={cidade} onChange={handleChange(setCidade)} onBlur={handleBlur} />
                            {!errors.cidade && touched.cidade && <div className={styles.validIcon}><FaCheck /></div>}
                        </div>
                        {errors.cidade && touched.cidade && <p className={styles.errorText}>{errors.cidade}</p>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>UF</label>
                        <div className={`${styles.inputWrapper} ${!errors.uf && touched.uf ? styles.valid : ''}`}>
                            <input type="text" name="uf" placeholder="Estado" value={uf} onChange={handleChange(setUf)} onBlur={handleBlur} maxLength={2} />
                            {!errors.uf && touched.uf && <div className={styles.validIcon}><FaCheck /></div>}
                        </div>
                        {errors.uf && touched.uf && <p className={styles.errorText}>{errors.uf}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm; 