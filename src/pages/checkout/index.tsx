import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './styles.module.css';
import Header from '../../components/header';
import OrderSummary from '../../components/orderSummary';
import CheckoutStepper from '../../components/checkoutStepper';
import RegistrationForm from '../../components/registrationForm';
import PaymentForm from '../../components/paymentForm';
import Confirmation from '../../components/confirmation';

interface Plan {
    id: number;
    nome: string;
    preco: number;
}

interface Cupom {
    codigoCupom: string;
    tipoDesconto: 'PERCENTUAL' | 'VALOR';
    valor: number;
}

interface Product {
    id: string;
    nome: string;
    planos: Plan[];
    cupom?: Cupom[];
    urlObrigado?: string;
}

const Checkout: React.FC = () => {
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('creditCard');

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [celular, setCelular] = useState('');
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');

    const [numeroCartao, setNumeroCartao] = useState('');
    const [nomeImpresso, setNomeImpresso] = useState('');
    const [dataVencimento, setDataVencimento] = useState('');
    const [codigoSeguranca, setCodigoSeguranca] = useState('');
    const [bandeiraCartao, setBandeiraCartao] = useState('');
    const [parcelas, setParcelas] = useState(1);

    const [product, setProduct] = useState<Product | null>(null);
    const [selectedPlanoId, setSelectedPlanoId] = useState<number | null>(null);

    const [totalPrice, setTotalPrice] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);

    const [idVenda, setIdVenda] = useState<string | null>(null);
    const [pixData, setPixData] = useState<{ qrCode: string, copiaECola: string } | null>(null);
    const [boletoData, setBoletoData] = useState<string | null>(null);
    const [urlObrigado, setUrlObrigado] = useState<string | null>(null);

    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { idProduto, idPlano } = useParams();

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!idProduto || !idPlano) return;
            setError('');
            const apiUrl = import.meta.env.VITE_API_URL;
            try {
                const response = await fetch(`${apiUrl}produto/listar-por-id/${idProduto}`);
                if (!response.ok) {
                    throw new Error('Falha ao buscar detalhes do produto.');
                }
                const data = await response.json();
                const productData = data.dados;
                setProduct(productData);
                setUrlObrigado(productData.checkoutProduto.urlObrigado || null);
                
                if (productData.planos && productData.planos.length > 0) {
                    const planIdFromUrl = parseInt(idPlano, 10);
                    const selectedPlan = productData.planos.find((p: Plan) => p.id === planIdFromUrl);

                    if (selectedPlan) {
                        setSelectedPlanoId(selectedPlan.id);
                        const initialPrice = selectedPlan.preco || 0;
                        setTotalPrice(initialPrice);
                        setFinalPrice(initialPrice);
                    } else {
                        setError('Plano selecionado não encontrado para este produto.');
                    }
                } else {
                    setError('Produto não possui planos disponíveis.');
                }
            } catch (err: any) {
                setError(err.message);
                console.error(err);
            }
        };

        fetchProductDetails();
    }, [idProduto, idPlano]);

    useEffect(() => {
        if (product && selectedPlanoId) {
            const selectedPlan = product.planos.find(p => p.id === selectedPlanoId);
            if (selectedPlan) {
                const newPrice = selectedPlan.preco || 0;
                setTotalPrice(newPrice);
                const newFinalPrice = newPrice - discount;
                setFinalPrice(newFinalPrice > 0 ? newFinalPrice : 0);
            }
        }
    }, [selectedPlanoId, product, discount]);

    const handleApplyCoupon = () => {
        if (!product || !product.cupom || couponCode.trim() === '') {
            setError('Cupom inválido ou não aplicável a este produto.');
            return;
        }

        const coupon = product.cupom.find(c => c.codigoCupom === couponCode);

        if (coupon) {
            let discountValue = 0;
            if (coupon.tipoDesconto === 'PERCENTUAL') {
                discountValue = (totalPrice * coupon.valor) / 100;
            } else {
                discountValue = coupon.valor;
            }
            
            setDiscount(discountValue);
            const newFinalPrice = totalPrice - discountValue;
            setFinalPrice(newFinalPrice > 0 ? newFinalPrice : 0);
            setError('');
        } else {
            setError('Cupom inválido.');
            setDiscount(0);
            setFinalPrice(totalPrice);
        }
    };

    const handleNextStep = async () => {
        if (step === 1) {
        setError('');
        const apiUrl = import.meta.env.VITE_API_URL;
        const systemToken = '47da971a7eb43c6921de9714a545906667d2b97bb8d7cb4bdfc0501067df53e6708ddc1d9890670533ea85d734efa1fe6c16a42fd9d37748e902475211ecd583';

        if (!apiUrl || !product || !selectedPlanoId) {
            setError('Dados do produto ou plano incompletos.');
            return;
        }

            try {
                const userResponse = await fetch(`${apiUrl}usuario/cadastrar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token-sistema': systemToken
                    },
                    body: JSON.stringify({
                        email,
                        nome,
                        cpf,
                        celular,
                        senha: password,
                        endereco: {
                            endereco: logradouro,
                            numeroResidencia: numero,
                            complementoEndereco: complemento,
                            bairro,
                            cidade,
                            uf,
                            cep
                        }
                    }),
                });

                if (!userResponse.ok) {
                    const errorData = await userResponse.json();
                    throw new Error(errorData.message || 'Falha ao cadastrar usuário.');
                }

                const userData = await userResponse.json();
                const idCliente = userData.id;

                if (!idCliente) {
                    throw new Error('ID do cliente não retornado após o cadastro.');
                }

                const vendaPayload: { idProduto: string; idPlano: number; idCliente: any; codigoCupom?: string } = {
                    idProduto: product.id,
                    idPlano: selectedPlanoId,
                    idCliente: idCliente,
                };
    
                if (couponCode) {
                    vendaPayload.codigoCupom = couponCode;
                }

            const vendaResponse = await fetch(`${apiUrl}venda/criar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token-sistema': systemToken
                },
                body: JSON.stringify(vendaPayload),
            });

            if (!vendaResponse.ok) {
                const errorData = await vendaResponse.json();
                throw new Error(errorData.message || 'Falha ao criar a venda.');
            }

                const newVendaId = await vendaResponse.text();

                if (newVendaId) {
                    setIdVenda(newVendaId);
            setStep(step + 1);
                } else {
                    throw new Error('ID da venda não foi retornado pela API.');
                }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro na comunicação com o servidor.');
            console.error(err);
        }
        } else if (step === 2) {
            const apiUrl = import.meta.env.VITE_API_URL;
            const systemToken = '47da971a7eb43c6921de9714a545906667d2b97bb8d7cb4bdfc0501067df53e6708ddc1d9890670533ea85d734efa1fe6c16a42fd9d37748e902475211ecd583';

            if (pixData || boletoData) {
                if (urlObrigado) {
                    window.location.href = urlObrigado;
                } else {
                    setStep(step + 1);
                }
                return;
            }

            if (paymentMethod === 'creditCard') {
                try {
                    const paymentResponse = await fetch(`${apiUrl}pagamento/cartao`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'token-sistema': systemToken,
                        },
                        body: JSON.stringify({
                            tipoCobranca: "CARTAO",
                            email,
                            idVenda,
                            dadosCartao: {
                                numeroCartao,
                                nomeImpresso,
                                dataVencimento,
                                codigoSeguranca,
                                bandeiraCartao: bandeiraCartao.toUpperCase(),
                                parcelas,
                            },
                        }),
                    });

                    if (!paymentResponse.ok) {
                        const errorData = await paymentResponse.json();
                        throw new Error(errorData.message || 'Falha no pagamento com cartão.');
                    }
                    
                    if (urlObrigado) {
                        window.location.href = urlObrigado;
                    } else {
            setStep(step + 1);
                    }

                } catch (err: any) {
                    setError(err.message);
                    console.error(err);
                }
                return;
            }

            let endpoint = '';
            let tipoCobranca = '';

            if (paymentMethod === 'pix') {
                endpoint = 'pagamento/pix';
                tipoCobranca = 'PIX';
            } else if (paymentMethod === 'boleto') {
                endpoint = 'pagamento/boleto';
                tipoCobranca = 'BOLETO';
            } else {
                setError('Método de pagamento não suportado.');
                return;
            }

            try {
                const paymentResponse = await fetch(`${apiUrl}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token-sistema': systemToken
                    },
                    body: JSON.stringify({
                        tipoCobranca,
                        email,
                        idVenda,
                    }),
                });

                if (!paymentResponse.ok) {
                    const errorData = await paymentResponse.json();
                    throw new Error(errorData.message || `Falha ao gerar ${paymentMethod}.`);
                }

                const paymentData = await paymentResponse.json();
                if (paymentMethod === 'pix') {
                    setPixData({ qrCode: paymentData.location, copiaECola: paymentData.pixCopiaECola });
                } else if (paymentMethod === 'boleto') {
                    setBoletoData(paymentData.pdf);
                }

            } catch (err: any) {
                setError(err.message);
                console.error(err);
            }
        }
    };

    return (
        <div className={styles.mainContainer}>
            <Header />
            
            <div className={styles.checkoutContainer}>
                <div className={styles.checkoutForm}>
                    <CheckoutStepper step={step} />
                    
                    {step === 1 && <RegistrationForm 
                        nome={nome} setNome={setNome} 
                        email={email} setEmail={setEmail} 
                        celular={celular} setCelular={setCelular} 
                        cpf={cpf} setCpf={setCpf} 
                        password={password} setPassword={setPassword}
                        cep={cep} setCep={setCep}
                        logradouro={logradouro} setLogradouro={setLogradouro}
                        numero={numero} setNumero={setNumero}
                        complemento={complemento} setComplemento={setComplemento}
                        bairro={bairro} setBairro={setBairro}
                        cidade={cidade} setCidade={setCidade}
                        uf={uf} setUf={setUf}
                    />}
                    {step === 2 && <PaymentForm 
                        paymentMethod={paymentMethod} 
                        setPaymentMethod={setPaymentMethod}
                        idVenda={idVenda}
                        email={email}
                        setPixData={setPixData}
                        setBoletoData={setBoletoData}
                        pixData={pixData}
                        boletoData={boletoData}
                        numeroCartao={numeroCartao}
                        setNumeroCartao={setNumeroCartao}
                        nomeImpresso={nomeImpresso}
                        setNomeImpresso={setNomeImpresso}
                        dataVencimento={dataVencimento}
                        setDataVencimento={setDataVencimento}
                        codigoSeguranca={codigoSeguranca}
                        setCodigoSeguranca={setCodigoSeguranca}
                        bandeiraCartao={bandeiraCartao}
                        setBandeiraCartao={setBandeiraCartao}
                        parcelas={parcelas}
                        setParcelas={setParcelas}
                    />}
                    {step === 3 && <Confirmation />}
                    
                    {error && <p className={styles.errorMessage}>{error}</p>}

                    {step < 3 && (
                         <div className={styles.formFooter}>
                            <button onClick={handleNextStep} className={styles.btnPrimary}>
                                {step === 1 ? 'Próximo' : (pixData || boletoData) ? 'Avançar' : 'Finalizar Pagamento'}
                            </button>
                        </div>
                    )}
                </div>
                
                <OrderSummary
                        productName={product?.nome || ''}
                        planName={product?.planos.find(p => p.id === selectedPlanoId)?.nome || ''}
                        totalPrice={totalPrice}
                        discount={discount}
                        finalPrice={finalPrice}
                        couponCode={couponCode}
                        setCouponCode={setCouponCode}
                        onApplyCoupon={handleApplyCoupon}
                    />
                
                
            </div>
        </div>
    );
};

export default Checkout; 