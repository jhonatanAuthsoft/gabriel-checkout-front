import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        const apiUrl = import.meta.env.VITE_API_URL;
        const apiToken = import.meta.env.VITE_API_TOKEN;

        if (!apiUrl) {
            console.error('URL da API não configurada. Verifique o arquivo .env e reinicie o servidor.');
            setError('Ocorreu um erro de configuração. Tente novamente mais tarde.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    username: email,
                    password: password,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                navigate('/vendas');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Ocorreu um erro ao tentar fazer login.' }));
                setError(errorData.message || 'Email ou senha inválidos.');
            }
        } catch (error) {
            setError('Ocorreu um erro ao tentar fazer login.');
            console.error('Error during authentication:', error);
        }
    };

    useEffect(() => {
        const inputs = document.querySelectorAll('input');
        const handleFocus = (event: FocusEvent) => {
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    (event.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        };

        inputs.forEach(input => {
            input.addEventListener('focus', handleFocus);
        });

        return () => {
            inputs.forEach(input => {
                input.removeEventListener('focus', handleFocus);
            });
        };
    }, []);

    return (
        <div className="container">
            <div id="logoSide">
                <div id="logoContainer">
                    <img id="logo" src="/src/assets/img/df.png" alt="logo" />
                </div>
            </div>
            <div id="checkoutSide">
                <div className="logoContainerPhone">
                    <img src="/src/assets/img/df.png" alt="logo" className="logoPhone" />
                </div>
                <div className="loginContainer">
                    <h2 className="loginTitle">Prossiga para a sua conta</h2>
                    <form onSubmit={handleLogin}>
                        <div className="inputGroup">
                            <div className="input-container">
                                <span className="input-label">EMAIL</span>
                                <input type="email" id="email" placeholder="email@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                        </div>
                        <div className="inputGroup">
                            <div className="input-container">
                                <span className="input-label">SENHA</span>
                                <div className="passwordWrapper">
                                    <input
                                        ref={passwordRef}
                                        type={passwordVisible ? 'text' : 'password'}
                                        id="password"
                                        placeholder="••••••••••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <i onClick={togglePasswordVisibility}>
                                        {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                                    </i>
                                </div>
                            </div>
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit">ENTRAR</button>
                        <a href="#" className="forgotPass">Esqueci Minha Senha</a>
                        <a href="/register" className="forgotPass" style={{marginTop: "10px"}}>Não tem uma conta? Cadastre-se</a>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 