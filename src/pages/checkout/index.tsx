import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [celular, setCelular] = useState('');
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegisterAndLogin = async () => {
        setError('');
        const apiUrl = import.meta.env.VITE_API_URL;
        const apiToken = import.meta.env.VITE_API_TOKEN;

        if (!apiUrl || !apiToken) {
            setError('Configuração da API está incompleta.');
            return false;
        }

        try {
            const registerResponse = await fetch(`${apiUrl}usuario/cadastrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    email,
                    nome,
                    cpf,
                    celular,
                    senha: password,
                    permissao: 'USER'
                }),
            });

            if (!registerResponse.ok) {
                const errorData = await registerResponse.json();
                setError(errorData.message || 'Falha ao registrar usuário.');
                return false;
            }

            const loginResponse = await fetch(`${apiUrl}authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify({ username: email, password: password }),
            });

            if (!loginResponse.ok) {
                setError('Falha no login após o registro.');
                return false;
            }

            const loginData = await loginResponse.json();
            localStorage.setItem('authToken', loginData.token);
            return true;

        } catch (error) {
            setError('Ocorreu um erro na comunicação com o servidor.');
            console.error(error);
            return false;
        }
    }

    const handlePixPayment = async () => {
        setError('');
        const apiUrl = import.meta.env.VITE_API_URL;
        const apiToken = import.meta.env.VITE_API_TOKEN;

        if (!apiUrl || !apiToken) {
            setError('Configuração da API está incompleta.');
            return;
        }

        try {
            const pixResponse = await fetch(`${apiUrl}inter/gera-pix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`,
                },
                body: JSON.stringify({
                    expiracao: 3600,
                    devedorNome: nome,
                    devedorCpfCnpj: cpf,
                    valorPagamento: 0.01,
                }),
            });

            if (!pixResponse.ok) {
                throw new Error('Falha ao gerar o PIX.');
            }
            
            const pixData = await pixResponse.json();
            console.log('PIX gerado:', pixData);

            const isLoggedIn = await handleRegisterAndLogin();
            if (isLoggedIn) {
                setStep(step + 1);
                navigate('/checkout/assinaturas');
            }

        } catch (err) {
            setError('Não foi possível processar o pagamento com Pix.');
            console.error(err);
        }
    };

    const handleNextStep = async () => {
        if (step === 2) {
            if (paymentMethod === 'pix') {
                await handlePixPayment();
            } else {
                // Lógica para outros métodos de pagamento
                console.log('Outro método de pagamento selecionado.');
            }
        } else if (step < 3) {
            setStep(step + 1);
        }
    };

    return (
        <div className={styles.mainContainer}>
            <Header />
            
            <div className={styles.checkoutContainer}>
                <div className={styles.checkoutForm}>
                    <CheckoutStepper step={step} />
                    
                    {step === 1 && <RegistrationForm nome={nome} setNome={setNome} email={email} setEmail={setEmail} celular={celular} setCelular={setCelular} cpf={cpf} setCpf={setCpf} password={password} setPassword={setPassword} />}
                    {step === 2 && <PaymentForm paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />}
                    {step === 3 && <Confirmation />}
                    
                    {error && <p className={styles.errorMessage}>{error}</p>}

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