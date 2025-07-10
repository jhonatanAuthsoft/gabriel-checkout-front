import React from 'react';
import { FaCreditCard, FaBarcode, FaCopy, FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa';
import { FaPix } from 'react-icons/fa6';
import styles from './styles.module.css';

interface PaymentFormProps {
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
    idVenda: string | null;
    email: string;
    pixData: { qrCode: string, copiaECola: string } | null;
    setPixData: React.Dispatch<React.SetStateAction<{ qrCode: string, copiaECola: string } | null>>;
    boletoData: string | null;
    setBoletoData: React.Dispatch<React.SetStateAction<string | null>>;
    numeroCartao: string;
    setNumeroCartao: (value: string) => void;
    nomeImpresso: string;
    setNomeImpresso: (value: string) => void;
    dataVencimento: string;
    setDataVencimento: (value: string) => void;
    codigoSeguranca: string;
    setCodigoSeguranca: (value: string) => void;
    bandeiraCartao: string;
    setBandeiraCartao: (value: string) => void;
    parcelas: number;
    setParcelas: (value: number) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
    paymentMethod, 
    setPaymentMethod,
    pixData,
    boletoData,
    numeroCartao, setNumeroCartao,
    nomeImpresso, setNomeImpresso,
    dataVencimento, setDataVencimento,
    codigoSeguranca, setCodigoSeguranca,
    bandeiraCartao, setBandeiraCartao,
    parcelas, setParcelas
}) => {

    const getCardType = (number: string) => {
        if (/^4/.test(number)) return 'Visa';
        if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(number)) return 'Master';
        if (/^3[47]/.test(number)) return 'American Express';
        if (/^(6011|65|64[4-9])/.test(number)) return 'Discover';
        if (/^35(2[89]|[3-8])/.test(number)) return 'JCB';
        if (/^3(0[0-5]|[689])/.test(number)) return 'Diners Club';
        return '';
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 16) {
            setNumeroCartao(value);
            const brand = getCardType(value);
            setBandeiraCartao(brand);
        }
    };

    const formatCardNumber = (number: string) => {
        return number.replace(/(\d{4})/g, '$1 ').trim();
    };
    
    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 6);
        }
        setDataVencimento(value);
    };

    const renderCardIcon = () => {
        switch (bandeiraCartao) {
            case 'Visa': return <FaCcVisa />;
            case 'Master': return <FaCcMastercard />;
            case 'American Express': return <FaCcAmex />;
            default: return <FaCreditCard />;
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Código copiado para a área de transferência!');
    };

    const viewBoleto = () => {
        if (boletoData) {
            const pdfWindow = window.open("");
            pdfWindow?.document.write(`<iframe width='100%' height='100%' src='data:application/pdf;base64,${boletoData}'></iframe>`);
        }
    };

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
                
                {paymentMethod !== 'creditCard' && !pixData && !boletoData &&
                    <p className={styles.paymentNote}>Clique em "Finalizar Pagamento" para gerar o código.</p>
                }

                <div id="creditCardForm" className={`${styles.paymentForm} ${paymentMethod === 'creditCard' ? styles.active : ''}`}>
                     <div className={styles.formGroup}>
                        <label>Número do Cartão</label>
                        <div className={styles.inputWrapper}>
                            <input type="text" value={formatCardNumber(numeroCartao)} onChange={handleCardNumberChange} placeholder="0000 0000 0000 0000" maxLength={19} />
                            <div className={styles.cardIcon}>{renderCardIcon()}</div>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Nome Impresso no Cartão</label>
                        <div className={styles.inputWrapper}>
                            <input type="text" value={nomeImpresso} onChange={(e) => setNomeImpresso(e.target.value)} placeholder="Informe o nome exatamente como está no cartão" />
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Validade (MM/AAAA)</label>
                            <input type="text" value={dataVencimento} onChange={handleExpiryDateChange} placeholder="MM/AAAA" maxLength={7} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Código de Segurança</label>
                             <input type="text" value={codigoSeguranca} onChange={(e) => setCodigoSeguranca(e.target.value.replace(/\D/g, ''))} placeholder="CVV" maxLength={4} />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Número de Parcelas</label>
                        <input type="number" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} min="1" className={styles.inputParcelas}/>
                    </div>
                </div>

                <div id="pixForm" className={`${styles.paymentForm} ${styles.pixBoletoContent} ${paymentMethod === 'pix' ? styles.active : ''}`}>
                    {pixData ? (
                        <div className={styles.pixContainer}>
                            <p>Escaneie o QR Code para pagar:</p>
                            <p>Ou copie o código:</p>
                            <div className={styles.copyContainer}>
                                <input type="text" value={pixData.copiaECola} readOnly />
                                <button onClick={() => handleCopy(pixData.copiaECola)}><FaCopy /></button>
                            </div>
                        </div>
                    ) : (
                        <p>Aguardando a geração do Pix...</p>
                    )}
                </div>

                <div id="boletoForm" className={`${styles.paymentForm} ${styles.pixBoletoContent} ${paymentMethod === 'boleto' ? styles.active : ''}`}>
                     {boletoData ? (
                        <div className={styles.boletoContainer}>
                            <p>Seu boleto foi gerado com sucesso.</p>
                            <button onClick={viewBoleto} className={styles.boletoButton}>Visualizar Boleto</button>
                        </div>
                    ) : (
                         <p>Aguardando a geração do Boleto...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentForm; 