import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './styles.module.css';
import Header from '../../components/header';
import OrderSummary from '../../components/orderSummary';
import CheckoutStepper from '../../components/checkoutStepper';
import RegistrationForm from '../../components/registrationForm';
import PaymentForm from '../../components/paymentForm';
import Confirmation from '../../components/confirmation';

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className={styles.errorMessage}>
        {message}
    </div>
);

const formatUrl = (url: string): string => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }
    return url;
};

interface Plan {
    id: number;
    nome: string;
    preco: number;
    status: boolean;
}

interface Cupom {
    codigoCupom: string;
    tipoDesconto: 'PERCENTUAL' | 'VALOR';
    valor: number;
}

interface Pergunta {
    id: number;
    pergunta: string;
    resposta: string;
}

interface Imagem {
    id: number;
    nomeImagem: string;
    caminhoImagem: string;
    tipoImagem: 'PRODUTO' | 'BANNER' | 'SELO';
    signedUrl: string;
}

interface Upsell {
    produto: {
        id: string;
        dadosProduto: {
            dadosGerais: {
                nome: string;
            }
        }
    };
    plano: {
        id: number;
        nome: string;
        preco: number;
    };
}

interface Product {
    id: string;
    dadosProduto: {
        dadosGerais: {
            nome: string;
        },
        suporteGarantia: {
            email?: string;
            mostrarTelefoneSuporte: boolean;
            mostrarWhatsappSuporte: boolean;
            telefoneSuporte?: number;
            whatsappSuporte?: number;
        },
        urlPersonalizada?: string;
    };
    checkoutProduto: {
        perguntas: Pergunta[];
    };
    planos: Plan[];
    cupom?: Cupom[];
    imagens: Imagem[];
    produtosUpsell?: Upsell[];
}

const Checkout: React.FC = () => {
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('creditCard');

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [celular, setCelular] = useState('');
    const [cpf, setCpf] = useState('');
    const [cep, setCep] = useState('01310100');
    const [logradouro, setLogradouro] = useState('Avenida Paulista');
    const [numero, setNumero] = useState('1000');
    const [complemento, setComplemento] = useState('Sala 101');
    const [bairro, setBairro] = useState('Bela Vista');
    const [cidade, setCidade] = useState('São Paulo');
    const [uf, setUf] = useState('SP');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isFormValid, setIsFormValid] = useState(false);

    const [numeroCartao, setNumeroCartao] = useState('');
    const [nomeImpresso, setNomeImpresso] = useState('');
    const [dataVencimento, setDataVencimento] = useState('');
    const [codigoSeguranca, setCodigoSeguranca] = useState('');
    const [bandeiraCartao, setBandeiraCartao] = useState('');
    const [parcelas, setParcelas] = useState(1);

    const [product, setProduct] = useState<Product | null>(null);
    const [imagens, setImagens] = useState<Imagem[]>([]);
    const [selectedPlanoId, setSelectedPlanoId] = useState<number | null>(null);

    const [totalPrice, setTotalPrice] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);

    const [selectedUpsells, setSelectedUpsells] = useState<{[key: string]: boolean}>({});
    const [upsellsPrice, setUpsellsPrice] = useState(0);

    const [idVenda, setIdVenda] = useState<string | null>(null);
    const [pixData, setPixData] = useState<{ qrCode: string, copiaECola: string } | null>(null);
    const [boletoData, setBoletoData] = useState<string | null>(null);
    const [urlObrigado, setUrlObrigado] = useState<string | null>(null);

        const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const navigate = useNavigate();
    const { idProduto, idPlano } = useParams();

    const handleUpsellToggle = (upsellKey: string) => {
        setSelectedUpsells(prev => {
            const newSelected = { ...prev };
            if (newSelected[upsellKey]) {
                delete newSelected[upsellKey];
            } else {
                newSelected[upsellKey] = true;
            }
            return newSelected;
        });
    };

    useEffect(() => {
        if (!product?.produtosUpsell) {
            setUpsellsPrice(0);
            return;
        }

        const newUpsellsPrice = product.produtosUpsell.reduce((total, upsell) => {
            const upsellKey = `${upsell.produto.id}-${upsell.plano.id}`;
            if (selectedUpsells[upsellKey]) {
                return total + upsell.plano.preco;
            }
            return total;
        }, 0);

        setUpsellsPrice(newUpsellsPrice);
    }, [selectedUpsells, product]);

    const calculateFinalPrice = () => {
        const basePrice = totalPrice - discount;
        return basePrice + upsellsPrice;
    };

    useEffect(() => {
        if (couponCode.trim() === '') {
            setDiscount(0);
        }
    }, [couponCode]);

    useEffect(() => {
        setFinalPrice(calculateFinalPrice());
    }, [totalPrice, discount, upsellsPrice]);

    useEffect(() => {
        const validateForm = () => {
            const newErrors: Record<string, string> = {};
            if (!nome) newErrors.nome = 'Nome é obrigatório.';
            if (!email) newErrors.email = 'E-mail é obrigatório.';
            else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'E-mail inválido.';
            if (!celular || celular.replace(/\D/g, '').length < 10) newErrors.celular = 'Celular inválido.';
            if (!cpf || cpf.replace(/\D/g, '').length < 11) newErrors.cpf = 'CPF/CNPJ inválido.';
            if (!cep || cep.replace(/\D/g, '').length < 8) newErrors.cep = 'CEP inválido.';
            if (!logradouro) newErrors.logradouro = 'Endereço é obrigatório.';
            if (!numero) newErrors.numero = 'Número é obrigatório.';
            if (!bairro) newErrors.bairro = 'Bairro é obrigatório.';
            if (!cidade) newErrors.cidade = 'Cidade é obrigatória.';
            if (!uf) newErrors.uf = 'UF é obrigatório.';
            
            setErrors(newErrors);
            setIsFormValid(Object.keys(newErrors).length === 0);
        };
        validateForm();
    }, [nome, email, celular, cpf, cep, logradouro, numero, bairro, cidade, uf]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!idProduto || !idPlano) return;

            const apiUrl = import.meta.env.VITE_API_URL;
            try {
                const response = await fetch(`${apiUrl}produto/listar-por-id/${idProduto}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Produto não encontrado.');
                    }
                    throw new Error('Falha ao buscar detalhes do produto.');
                }
                
                const data = await response.json();
                const productData = data.dados;

                if (!productData) {
                    throw new Error('Produto não encontrado ou inativo.');
                }

                setProduct(productData);
                setImagens(productData.imagens || []);
                setUrlObrigado(productData.dadosProduto.urlPersonalizada || null);
                
                if (productData.planos && productData.planos.length > 0) {
                    const planIdFromUrl = parseInt(idPlano, 10);
                    const selectedPlan = productData.planos.find((p: Plan) => p.id === planIdFromUrl);

                    if (selectedPlan) {
                        if (!selectedPlan.status) {
                            navigate('/');
                            return;
                        }
                        setSelectedPlanoId(selectedPlan.id);
                        const initialPrice = selectedPlan.preco || 0;
                        setTotalPrice(initialPrice);
                        setFinalPrice(initialPrice);
                    } else {
                        throw new Error('Plano selecionado não é válido para este produto.');
                    }
                } else {
                    throw new Error('Este produto não possui planos disponíveis.');
                }
            } catch (err: any) {
                setErrorMessage(err.message);
                setTimeout(() => setErrorMessage(null), 5000);
                console.error(err);
            }
        };

        fetchProductDetails();
    }, [idProduto, idPlano, navigate]);

    useEffect(() => {
        if (product && selectedPlanoId) {
            const selectedPlan = product.planos.find(p => p.id === selectedPlanoId);
            if (selectedPlan) {
                const newPrice = (selectedPlan.preco || 0) * quantity;
                setTotalPrice(newPrice);
                const newFinalPrice = newPrice - discount;
                setFinalPrice(newFinalPrice > 0 ? newFinalPrice : 0);
            }
        }
    }, [selectedPlanoId, product, discount, quantity]);

    useEffect(() => {
        if (pixData && idVenda) {
            const interval = setInterval(async () => {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL;
                    const systemToken = '47da971a7eb43c6921de9714a545906667d2b97bb8d7cb4bdfc0501067df53e6708ddc1d9890670533ea85d734efa1fe6c16a42fd9d37748e902475211ecd583';
                    const response = await fetch(`${apiUrl}venda/listar-id/${idVenda}`, {
                        headers: {
                            'token-sistema': systemToken
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data?.statusPagamento === 'APROVADO') {
                            clearInterval(interval);
                            if (urlObrigado) {
                                window.open(formatUrl(urlObrigado), '_blank');
                            }
                            navigate('/');
                        }
                    }
                } catch (error) {
                    console.error('Erro ao verificar status da venda:', error);
                }
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [pixData, idVenda, urlObrigado]);

    const generatePayment = useCallback(async (method: 'pix' | 'boleto') => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const systemToken = '47da971a7eb43c6921de9714a545906667d2b97bb8d7cb4bdfc0501067df53e6708ddc1d9890670533ea85d734efa1fe6c16a42fd9d37748e902475211ecd583';

        let endpoint = '';
        let tipoCobranca = '';

        if (method === 'pix') {
            endpoint = 'pagamento/pix';
            tipoCobranca = 'PIX';
        } else if (method === 'boleto') {
            endpoint = 'pagamento/boleto';
            tipoCobranca = 'BOLETO';
        } else {
            setErrorMessage('Método de pagamento não suportado.');
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
                throw new Error(errorData.message || `Falha ao gerar ${method}.`);
            }

            const responseText = await paymentResponse.text();
            try {
                const paymentData = JSON.parse(responseText);
                if (method === 'pix') {
                    setPixData({ qrCode: paymentData.location, copiaECola: paymentData.pixCopiaECola });
                } else if (method === 'boleto') {
                    setBoletoData(paymentData.pdf);
                }
            } catch (e) {
                throw new Error(`Falha ao processar a resposta do pagamento: ${responseText}`);
            }

        } catch (err: any) {
            setErrorMessage(err.message);
            console.error(err);
        }
    }, [email, idVenda]);

    useEffect(() => {
        if (step === 2) {
            if (paymentMethod === 'pix' && !pixData) {
                generatePayment('pix');
            } else if (paymentMethod === 'boleto' && !boletoData) {
                generatePayment('boleto');
            }
        }
    }, [paymentMethod, step, pixData, boletoData, generatePayment]);

    const handleApplyCoupon = () => {
        if (!product || !product.cupom || couponCode.trim() === '') {
            setErrorMessage('Cupom inválido ou não aplicável a este produto.');
            setTimeout(() => setErrorMessage(null), 5000);
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
        } else {
            setErrorMessage('Cupom inválido.');
            setTimeout(() => setErrorMessage(null), 5000);
            setDiscount(0);
            setFinalPrice(totalPrice);
        }
    };

    const handleNextStep = async (method?: string) => {
        if (!isFormValid) {
            setErrorMessage('Por favor, preencha todos os campos corretamente.');
            setTimeout(() => setErrorMessage(null), 5000);
            const newTouched: Record<string, boolean> = {
                nome: true, email: true, celular: true, cpf: true,
                cep: true, logradouro: true, numero: true, bairro: true, cidade: true, uf: true
            };
            const newErrors: Record<string, string> = {};
            if (!nome) newErrors.nome = 'Nome é obrigatório.';
            if (!email) newErrors.email = 'E-mail é obrigatório.';
            else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'E-mail inválido.';
            if (!celular || celular.replace(/\D/g, '').length < 10) newErrors.celular = 'Celular inválido.';
            if (!cpf || cpf.replace(/\D/g, '').length < 11) newErrors.cpf = 'CPF/CNPJ inválido.';
            if (!cep || cep.replace(/\D/g, '').length < 8) newErrors.cep = 'CEP inválido.';
            if (!logradouro) newErrors.logradouro = 'Endereço é obrigatório.';
            if (!numero) newErrors.numero = 'Número é obrigatório.';
            if (!bairro) newErrors.bairro = 'Bairro é obrigatório.';
            if (!cidade) newErrors.cidade = 'Cidade é obrigatória.';
            if (!uf) newErrors.uf = 'UF é obrigatório.';
            setErrors(newErrors);

            return;
        }

        if (step === 1) {
        const apiUrl = import.meta.env.VITE_API_URL;
        const systemToken = '47da971a7eb43c6921de9714a545906667d2b97bb8d7cb4bdfc0501067df53e6708ddc1d9890670533ea85d734efa1fe6c16a42fd9d37748e902475211ecd583';

        if (!apiUrl || !product || !selectedPlanoId) {
            setErrorMessage('Dados do produto ou plano incompletos.');
            setTimeout(() => setErrorMessage(null), 5000);
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
                        status: 'ATIVO',
                        senha: '123456',
                        endereco: {
                            endereco: logradouro,
                            numeroResidencia: numero,
                            complementoEndereco: complemento,
                            bairro,
                            cidade,
                            uf,
                            cep
                        },
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

                const produtosUpsell = Object.keys(selectedUpsells)
                    .filter(key => selectedUpsells[key])
                    .map(key => {
                        const [produtoId, planoId] = key.split('-');
                        return {
                            produto: { id: parseInt(produtoId) },
                            plano: { id: parseInt(planoId) }
                        };
                    });

                const upsellProductIds = produtosUpsell.map(upsell => upsell.produto.id);
                const upsellPlanIds = produtosUpsell.map(upsell => upsell.plano.id);

                const vendaPayload: { 
                    idsProduto: number[]; 
                    idsPlano: number[]; 
                    idCliente: any; 
                    codigoCupom?: string;
                } = {
                    idsProduto: [parseInt(product.id), ...upsellProductIds],
                    idsPlano: [selectedPlanoId, ...upsellPlanIds],
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
            setErrorMessage(err.message || 'Ocorreu um erro na comunicação com o servidor.');
            setTimeout(() => setErrorMessage(null), 5000);
            console.error(err);
        }
        } else if (step === 2) {
            const apiUrl = import.meta.env.VITE_API_URL;
            const systemToken = '47da971a7eb43c6921de9714a545906667d2b97bb8d7cb4bdfc0501067df53e6708ddc1d9890670533ea85d734efa1fe6c16a42fd9d37748e902475211ecd583';

            if (pixData) {
                return;
            }

            if (boletoData) {
                if (urlObrigado) {
                    window.open(formatUrl(urlObrigado), '_blank');
                }
                navigate('/');
                return;
            }

            const currentPaymentMethod = method || paymentMethod;

            if (currentPaymentMethod === 'creditCard') {
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
                        window.open(formatUrl(urlObrigado), '_blank');
                    }
                    navigate('/');

                } catch (err: any) {
                    setErrorMessage(err.message);
                    setTimeout(() => setErrorMessage(null), 5000);
                    console.error(err);
                }
                return;
            }

            if (currentPaymentMethod === 'pix') {
                await generatePayment(currentPaymentMethod);
            } else if (currentPaymentMethod === 'boleto') {
                await generatePayment(currentPaymentMethod);
            }
        }
    };



    const selectedPlan = product?.planos.find(p => p.id === selectedPlanoId);

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
                        cep={cep} setCep={setCep}
                        logradouro={logradouro} setLogradouro={setLogradouro}
                        numero={numero} setNumero={setNumero}
                        complemento={complemento} setComplemento={setComplemento}
                        bairro={bairro} setBairro={setBairro}
                        cidade={cidade} setCidade={setCidade}
                        uf={uf} setUf={(value) => setUf(value.toUpperCase())}
                        errors={errors} setErrors={setErrors}
                        isFormValid={isFormValid}
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
                        handleNextStep={(method) => handleNextStep(method)}
                    />}
                    {step === 3 && <Confirmation />}
                    
                    {}
                    {step === 1 && product?.produtosUpsell && product.produtosUpsell.length > 0 && (
                        <div className={styles.upsellSection}>
                            <h3 className={styles.upsellTitle}>🎁 Produtos Recomendados</h3>
                            <p className={styles.upsellSubtitle}>Aproveite e adicione estes produtos ao seu pedido com desconto especial!</p>
                            
                            <div className={styles.upsellGrid}>
                                {product.produtosUpsell.map((upsell, index) => {
                                    const upsellKey = `${upsell.produto.id}-${upsell.plano.id}`;
                                    const isSelected = selectedUpsells[upsellKey] || false;
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            className={`${styles.upsellCard} ${isSelected ? styles.upsellCardSelected : ''}`}
                                            onClick={() => handleUpsellToggle(upsellKey)}
                                        >
                                            <div className={styles.upsellCardHeader}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected}
                                                    className={styles.upsellCheckbox}

                                                />
                                                <h4 className={styles.upsellProductName}>
                                                    {upsell.produto.dadosProduto.dadosGerais.nome}
                                                </h4>
                                            </div>
                                            
                                            <div className={styles.upsellDetails}>
                                                <p className={styles.upsellPlanName}>📋 {upsell.plano.nome}</p>
                                                <p className={styles.upsellPrice}>💰 R$ {upsell.plano.preco.toFixed(2)}</p>
                                            </div>
                                            
                                            <div className={styles.upsellBadge}>
                                                {isSelected ? '✅ Adicionado' : '➕ Adicionar'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    {errorMessage && <ErrorMessage message={errorMessage} />}

                    {step < 3 && (
                         <div className={styles.formFooter}>
                            <button 
                                onClick={() => handleNextStep()}
                                className={styles.btnPrimary}
                                disabled={(step === 1 && !isFormValid) || (step === 2 && paymentMethod === 'boleto' && !!boletoData)}
                            >
                                {step === 1 ? 'Próximo' : (paymentMethod === 'boleto' && boletoData) ? 'Boleto Gerado' : (pixData || boletoData) ? 'Avançar' : 'Finalizar Pagamento'}
                            </button>
                        </div>
                    )}
                </div>
                
                                    <OrderSummary
                        imagens={imagens}
                        productName={product?.dadosProduto?.dadosGerais?.nome || ''}
                        planName={product?.planos?.find(p => p.id === selectedPlanoId)?.nome || ''}
                        price={totalPrice}
                        discount={discount}
                        finalPrice={finalPrice}
                        couponCode={couponCode}
                        onCouponChange={setCouponCode}
                        onApplyCoupon={handleApplyCoupon}
                        mostrarTelefoneSuporte={product?.dadosProduto?.suporteGarantia?.mostrarTelefoneSuporte || false}
                        mostrarWhatsappSuporte={product?.dadosProduto?.suporteGarantia?.mostrarWhatsappSuporte || false}
                        telefoneSuporte={product?.dadosProduto?.suporteGarantia?.telefoneSuporte}
                        whatsappSuporte={product?.dadosProduto?.suporteGarantia?.whatsappSuporte}
                        quantity={quantity}
                        onQuantityChange={setQuantity}
                        perguntas={product?.checkoutProduto?.perguntas || []}
                        selectedUpsells={selectedUpsells}
                        upsellsPrice={upsellsPrice}
                        upsellsData={product?.produtosUpsell || []}
                    />
                
                
            </div>
        </div>
    );
};

export default Checkout;