import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const passwordRef = useRef<HTMLInputElement>(null);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
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
                    <form>
                        <div className="inputGroup">
                            <div className="input-container">
                                <span className="input-label">EMAIL</span>
                                <input type="email" id="email" placeholder="email@email.com" />
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
                                    />
                                    <i onClick={togglePasswordVisibility}>
                                        {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                                    </i>
                                </div>
                            </div>
                        </div>
                        <button type="submit">ENTRAR</button>
                        <a href="#" className="forgotPass">Esqueci Minha Senha</a>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 