import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './styles.css';
import logo from '../../assets/img/df.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const EsqueciSenha = () => {
    const [step, setStep] = useState('request');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
    const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

    const handleRequestCode = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Por favor, insira seu e--mail.');
            return;
        }

        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL;
        const apiToken = import.meta.env.VITE_API_TOKEN;

        try {
            const response = await fetch(`${apiUrl}usuario/esqueceu-senha`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setSuccess('Se o e-mail estiver correto, você receberá um código de redefinição.');
                setStep('reset');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'E-mail não encontrado ou erro no servidor.' }));
                setError(errorData.message || 'E-mail não encontrado ou erro no servidor.');
            }
        } catch (error) {
            console.error('Erro ao solicitar código:', error);
            setError('Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!code || !password || !confirmPassword) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL;
        const apiToken = import.meta.env.VITE_API_TOKEN;

        try {
            const response = await fetch(`${apiUrl}usuario/validar-troca-senha`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    email: email,
                    codigo: code,
                    senhaNova: password
                }),
            });

            if (response.ok) {
                setSuccess('Senha redefinida com sucesso! Você será redirecionado para o login.');
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Código inválido ou expirado.' }));
                setError(errorData.message || 'Código inválido ou expirado.');
            }
        } catch (err) {
            console.error('Erro ao redefinir a senha:', err);
            setError('Ocorreu um erro ao redefinir a senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div id="logoSide">
                <div id="logoContainer">
                    <img id="logo" src={logo} alt="logo" />
                </div>
            </div>
            <div id="checkoutSide">
                <div className="logoContainerPhone">
                    <img src={logo} alt="logo" className="logoPhone" />
                </div>

                {step === 'request' ? (
                    <div className="loginContainer">
                        <h2 className="loginTitle">Esqueceu sua senha?</h2>
                        <p className="subtitle">Insira seu e-mail para receber um código de redefinição.</p>
                        <form onSubmit={handleRequestCode}>
                            <div className="inputGroup">
                                <div className="input-container">
                                    <span className="input-label">EMAIL</span>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="email@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            {success && <p className="success-message">{success}</p>}
                            <button type="submit" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar Código'}
                            </button>
                            <Link to="/" className="forgotPass">Voltar para o Login</Link>
                        </form>
                    </div>
                ) : (
                    <div className="loginContainer">
                        <h2 className="loginTitle">Redefinir Senha</h2>
                        <p className="subtitle">Crie uma nova senha para sua conta.</p>
                        <form onSubmit={handleResetPassword}>
                            <div className="inputGroup">
                                <div className="input-container">
                                    <span className="input-label">CÓDIGO</span>
                                    <input type="text" placeholder="Código recebido" value={code} onChange={e => setCode(e.target.value)} disabled={loading} />
                                </div>
                            </div>
                            <div className="inputGroup">
                                <div className="input-container">
                                    <span className="input-label">NOVA SENHA</span>
                                    <div className="passwordWrapper">
                                        <input
                                            type={passwordVisible ? 'text' : 'password'}
                                            placeholder="••••••••••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                        <i onClick={togglePasswordVisibility}>
                                            {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                                        </i>
                                    </div>
                                </div>
                            </div>
                            <div className="inputGroup">
                                <div className="input-container">
                                    <span className="input-label">CONFIRMAR NOVA SENHA</span>
                                    <div className="passwordWrapper">
                                        <input
                                            type={confirmPasswordVisible ? 'text' : 'password'}
                                            placeholder="••••••••••••••••"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                        <i onClick={toggleConfirmPasswordVisibility}>
                                            {confirmPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                                        </i>
                                    </div>
                                </div>
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            {success && <p className="success-message">{success}</p>}
                            <button type="submit" disabled={loading}>
                                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EsqueciSenha; 