import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { FaBars, FaShoppingBag, FaCog, FaSearch, FaChevronDown, FaEllipsisV, FaUndo, FaCreditCard, FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa';
import { FaArrowRightFromBracket, FaSquareWhatsapp } from 'react-icons/fa6';

import jwt_decode from 'jwt-decode';

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className={styles.errorMessage}>
        {message}
    </div>
);
import logo from '../../../assets/img/df.png';
import productImg from '../../../assets/img/dfCirculo.png';

interface Produto {
    id: number;
    dadosProduto: {
        dadosGerais: {
            nome: string;
        }
        cobranca: {
            preco: number;
        }
        suporteGarantia: {
            whatsappSuporte: number;
        };
    }
}

interface Plano {
    id: number;
    nome: string;
    valor: number;
}

interface Venda {
    id: number;
    codigoSolicitacao: string;
    produtos: {
        id: string;
        dadosProduto: {
            dadosGerais: {
                nome: string;
            };
            suporteGarantia: {
                whatsappSuporte: number;
            };
        };
    }[];
    planos: {
        id: string;
        nome: string;
        valor: number;
    }[];
    dataCompra: string;
    cliente: {
        id: string;
        nome: string;
        email: string;
        cpf?: string;
    };
    valorPago: number;
    metodoPagamento: string;
    statusVenda: string;
    statusPagamento: string;
}

interface Assinatura {
    id: string;
    produto: {
        dadosProduto: {
            suporteGarantia: {
                whatsappSuporte: number;
            };
        }
    }
    venda: {
        id: number;
        produtos: Produto[];
        planos: Plano[];
        statusVenda: string;
        valorTotal: number;
        valorPago: number;
        dataCompra: string;
    };
    planos: Plano[];
    plano: {
        nome: string;
        valor: number;
    };
    dataInicio: string;
    dataFim: string;
    statusAssinatura: 'ATIVA' | 'CANCELADA' | 'INADIMPLENTE';
    metodoPagamento: string;
    cliente: {
        id: string;
        cpf: string;
        email: string;
    };
}

interface DecodedToken {
    sub: string;
    iat: number;
    exp: number;
}

const Assinaturas: React.FC = () => {
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [showChangePaymentPanel, setShowChangePaymentPanel] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cartao');
    const [selectedVendaId, setSelectedVendaId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [filteredAssinaturas, setFilteredAssinaturas] = useState<Assinatura[]>([]);
    const [filteredVendas, setFilteredVendas] = useState<Venda[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('data');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const [pixData, setPixData] = useState<{ qrCode: string; copiaECola: string } | null>(null);
    const [boletoData, setBoletoData] = useState<string | null>(null);
    const [boletoMessage, setBoletoMessage] = useState<string | null>(null);
    const [idVenda, setIdVenda] = useState<string>('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [pixStatus, setPixStatus] = useState<'checking' | 'paid' | null>(null);
    const [pixCheckInterval, setPixCheckInterval] = useState<number | null>(null);

    const [numeroCartao, setNumeroCartao] = useState('');
    const [nomeImpresso, setNomeImpresso] = useState('');
    const [dataVencimento, setDataVencimento] = useState('');
    const [codigoSeguranca, setCodigoSeguranca] = useState('');
    const [bandeiraCartao, setBandeiraCartao] = useState('');
    const [parcelas, setParcelas] = useState(1);
    const [email] = useState('teste@teste.com');
    
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
            const cardType = getCardType(value);
            setBandeiraCartao(cardType);
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

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 4) {
            setCodigoSeguranca(value);
        }
    };

    const renderCardIcon = () => {
        switch (bandeiraCartao) {
            case 'Visa': return <FaCcVisa />;
            case 'Master': return <FaCcMastercard />;
            case 'American Express': return <FaCcAmex />;
            default: return <FaCreditCard />;
        }
    };

    const [cep] = useState('01310100');
    const [logradouro] = useState('Avenida Paulista');
    const [numero] = useState('1000');
    const [complemento] = useState('Sala 101');
    const [bairro] = useState('Bela Vista');
    const [cidade] = useState('São Paulo');
    const [uf] = useState('SP');
    
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const fetchAssinaturas = async () => {
        const token = localStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!token) {
            console.error("Token de autenticação não encontrado.");
            return;
        }

        try {
            const decodedToken = jwt_decode<DecodedToken>(token);
            const userEmail = decodedToken.sub;

            const assinaturasResponse = await fetch(`${apiUrl}assinatura/listar-todos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (assinaturasResponse.status === 401 || assinaturasResponse.status === 403) {
                navigate('/vendas');
                return;
            }
            if (!assinaturasResponse.ok) throw new Error('Falha ao buscar assinaturas');
            const assinaturasData = await assinaturasResponse.json();
            
            const userAssinaturas = assinaturasData.content.filter(
                (assinatura: Assinatura) => assinatura.cliente.email === userEmail
            );
            
            const vendasResponse = await fetch(`${apiUrl}venda/listar?size=10000`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!vendasResponse.ok) throw new Error('Falha ao buscar vendas');
            const vendasData = await vendasResponse.json();
            
            const vendasMapeadas = (vendasData.content || []).map((venda: any) => ({
                id: venda.id,
                codigoSolicitacao: venda.codigoSolicitacao,
                produtos: venda.produtos?.map((produto: any) => ({
                    id: produto.id || '',
                    dadosProduto: {
                        dadosGerais: {
                            nome: produto.dadosProduto?.dadosGerais?.nome || 'N/A'
                        },
                        suporteGarantia: {
                            whatsappSuporte: produto.dadosProduto?.suporteGarantia?.whatsappSuporte || 0
                        }
                    }
                })) || [],
                planos: venda.planos?.map((plano: any) => ({
                    id: plano.id || '',
                    nome: plano.nome || 'N/A',
                    valor: plano.valor || 0
                })) || [],
                dataCompra: venda.dataCompra,
                cliente: {
                    id: venda.cliente?.id || '',
                    nome: venda.cliente?.nome || 'N/A',
                    email: venda.cliente?.email || '',
                    cpf: venda.cliente?.cpf
                },
                valorPago: venda.valorPago,
                metodoPagamento: venda.metodoPagamento,
                statusVenda: venda.statusVenda,
                statusPagamento: venda.statusPagamento
            }));
            
            const userVendas = vendasMapeadas.filter(
                (venda: Venda) => venda.cliente.email === userEmail
            );
            
            const vendasComAssinatura = userAssinaturas.map((a: Assinatura) => a.venda.id);
            const vendasSemAssinatura = userVendas.filter(
                (venda: Venda) => !vendasComAssinatura.includes(venda.id)
            );
            
            setAssinaturas(userAssinaturas || []);
            setVendas(vendasSemAssinatura || []);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    };
    
    useEffect(() => {
        fetchAssinaturas();
    }, []);

    // Limpar intervalo do PIX quando o componente for desmontado
    useEffect(() => {
        return () => {
            if (pixCheckInterval) {
                clearInterval(pixCheckInterval as number);
            }
        };
    }, [pixCheckInterval]);

    useEffect(() => {
        let resultAssinaturas = [...assinaturas];
        let resultVendas = [...vendas];

        if (searchTerm) {
            resultAssinaturas = resultAssinaturas.filter(a => {
                const produtoPrincipal = a.venda?.produtos?.[0]?.dadosProduto?.dadosGerais?.nome || '';
                const planoPrincipal = a.plano?.nome || '';
                
                const todosProdutos = a.venda?.produtos?.map(p => p.dadosProduto?.dadosGerais?.nome || '').join(' ') || '';
                const todosPlanos = a.planos?.map(p => p.nome || '').join(' ') || '';
                
                const searchLower = searchTerm.toLowerCase();
                return produtoPrincipal.toLowerCase().includes(searchLower) ||
                       planoPrincipal.toLowerCase().includes(searchLower) ||
                       todosProdutos.toLowerCase().includes(searchLower) ||
                       todosPlanos.toLowerCase().includes(searchLower);
            });
            
            resultVendas = resultVendas.filter(v => {
                const todosProdutos = v.produtos?.map(p => p.dadosProduto?.dadosGerais?.nome || '').join(' ') || '';
                const todosPlanos = v.planos?.map(p => p.nome || '').join(' ') || '';
                const clienteNome = v.cliente?.nome || '';
                
                const searchLower = searchTerm.toLowerCase();
                return todosProdutos.toLowerCase().includes(searchLower) ||
                       todosPlanos.toLowerCase().includes(searchLower) ||
                       clienteNome.toLowerCase().includes(searchLower);
            });
        }

        switch (sortOrder) {
            case 'data':
                resultAssinaturas.sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
                resultVendas.sort((a, b) => new Date(b.dataCompra).getTime() - new Date(a.dataCompra).getTime());
                break;
            case 'valor-maior':
                resultAssinaturas.sort((a, b) => (b.venda?.valorPago || 0) - (a.venda?.valorPago || 0));
                resultVendas.sort((a, b) => (b.valorPago || 0) - (a.valorPago || 0));
                break;
            case 'valor-menor':
                resultAssinaturas.sort((a, b) => (a.venda?.valorPago || 0) - (b.venda?.valorPago || 0));
                resultVendas.sort((a, b) => (a.valorPago || 0) - (b.valorPago || 0));
                break;
            default:
                break;
        }

        setFilteredAssinaturas(resultAssinaturas);
        setFilteredVendas(resultVendas);
    }, [assinaturas, vendas, searchTerm, sortOrder]);

    const handleCancelSubscription = async (idAssinatura: string) => {
        const token = localStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!token) return;

        if (!confirm('Tem certeza de que deseja cancelar esta assinatura?')) return;
        
        try {
            const response = await fetch(`${apiUrl}assinatura/atualizar/${idAssinatura}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ statusAssinatura: 'CANCELADA' })
            });

            if (response.ok) {
                alert('Assinatura cancelada com sucesso!');
                fetchAssinaturas();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao cancelar assinatura');
            }
        } catch (error) {
            alert(error);
            console.error("Erro ao cancelar assinatura:", error);
        } finally {
            setOpenMenuId(null);
        }
    };

    const handleRefundRequest = async (vendaId: number) => {
        const token = localStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!token) return;

        if (!confirm('Tem certeza de que deseja solicitar o reembolso desta venda?')) return;
        
        try {
            const response = await fetch(`${apiUrl}venda/solicitar-reembolso/${vendaId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idProduto: "1",
                    valorPago: 999.90,
                    idPlano: "1",
                    origemCompra: "PRIMEIRA_COMPRA",
                    statusPagamento: "CARTAO",
                    statusVenda: "REEMBOLSADO",
                    tipoRecorrencia: "UNICA",
                    idCliente: "1",
                    idVendedor: null,
                    dataReembolso: new Date().toISOString().split('T')[0] + 'T15:28:59'
                })
            });

            if (response.ok) {
                alert('Solicitação de reembolso enviada com sucesso!');
                fetchAssinaturas();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao solicitar reembolso');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Erro ao solicitar reembolso');
            setTimeout(() => setErrorMessage(null), 5000);
            console.error("Erro ao solicitar reembolso:", error);
        } finally {
            setOpenMenuId(null);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarActive(!isSidebarActive);
    };

    const toggleActionsMenu = (menuId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setOpenMenuId(prev => (prev === menuId ? null : menuId));
    };

    const handleChangePaymentClick = (e: React.MouseEvent, vendaId: number) => {
        e.preventDefault();
        setSelectedVendaId(vendaId);
        setShowChangePaymentPanel(true);
        setOpenMenuId(null);

        // Limpar dados anteriores
        setPixData(null);
        setBoletoData(null);
        setBoletoMessage(null);
        setErrorMessage(null);
        setPixStatus(null);
        
        // Limpar intervalo do PIX se existir
        if (pixCheckInterval) {
            clearInterval(pixCheckInterval as number);
            setPixCheckInterval(null);
        }
    };

    const createTestVenda = async () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const systemToken = '47da971a7eb43c6921de9714a545906667d2b97bb8d7cb4bdfc0501067df53e6708ddc1d9890670533ea85d734efa1fe6c16a42fd9d37748e902475211ecd583';
        
        try {
            const vendaPayload = {
                idsProduto: ['152'],
                idsPlano: ['152'],
                idCliente: '552',
                codigoCupom: null,
                dadosCliente: {
                    nome: 'Teste Usuario',
                    email: email,
                    cpf: '12345678901',
                    celular: '11999999999',
                    endereco: {
                        endereco: logradouro,
                        numeroResidencia: numero,
                        complementoEndereco: complemento,
                        bairro: bairro,
                        cidade: cidade,
                        uf: uf,
                        cep: cep
                    }
                }
            };

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
                return newVendaId;
            } else {
                throw new Error('ID da venda não foi retornado pela API.');
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Ocorreu um erro na comunicação com o servidor.');
            setTimeout(() => setErrorMessage(null), 5000);
            console.error(err);
            return null;
        }
    };

    const checkPixPaymentStatus = async (vendaId: string) => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const systemToken = '47da971a7eb43c6921de9714a545906667d2b97bb8d7cb4bdfc0501067df53e6708ddc1d9890670533ea85d734efa1fe6c16a42fd9d37748e902475211ecd583';

        try {
            const response = await fetch(`${apiUrl}venda/listar-id/${vendaId}`, {
                headers: {
                    'token-sistema': systemToken
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data?.statusPagamento === 'APROVADO') {
                    setPixStatus('paid');
                    if (pixCheckInterval) {
                        clearInterval(pixCheckInterval as number);
                        setPixCheckInterval(null);
                    }
                    alert('Pagamento PIX confirmado com sucesso!');
                    setShowChangePaymentPanel(false);
                    fetchAssinaturas(); // Atualizar a lista
                }
            }
        } catch (error) {
            console.error('Erro ao verificar status da venda:', error);
        }
    };

    const generatePayment = async (method: 'pix' | 'boleto', vendaId: string) => {
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
                    idVenda: vendaId,
                }),
            });

            if (!paymentResponse.ok) {
                let errorMessage = `Falha ao gerar ${method}.`;
                try {
                    const errorData = await paymentResponse.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // Se não conseguir fazer parse do JSON, usar mensagem padrão
                    errorMessage = `Erro ${paymentResponse.status}: ${paymentResponse.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const responseText = await paymentResponse.text();
            try {
                const paymentData = JSON.parse(responseText);
                if (method === 'pix') {
                    console.log('Dados PIX recebidos:', paymentData);
                    console.log('QR Code URL:', paymentData.location);
                    setPixData({ qrCode: paymentData.location, copiaECola: paymentData.pixCopiaECola });
                    setPixStatus('checking');
                    
                    // Iniciar verificação automática a cada 5 segundos
                    const interval = setInterval(() => {
                        checkPixPaymentStatus(vendaId);
                    }, 5000) as number;
                    setPixCheckInterval(interval);
                    
                } else if (method === 'boleto') {
                    setBoletoData(paymentData.pdf);
                    setBoletoMessage('Boleto gerado com sucesso! Verifique seu e-mail.');
                }
            } catch (e) {
                throw new Error(`Falha ao processar a resposta do pagamento: ${responseText}`);
            }

        } catch (err: any) {
            setErrorMessage(err.message);
            console.error(err);
        }
    };

    const processCardPayment = async (vendaId: string) => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const systemToken = '47da971a7eb43c6921de9714a545906667d2b97bb8d7cb4bdfc0501067df53e6708ddc1d9890670533ea85d734efa1fe6c16a42fd9d37748e902475211ecd583';

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
                    idVenda: vendaId,
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
            
            alert('Pagamento processado com sucesso!');
            setShowChangePaymentPanel(false);

        } catch (err: any) {
            setErrorMessage(err.message);
            setTimeout(() => setErrorMessage(null), 5000);
            console.error(err);
        }
    };

    const handlePaymentSubmit = async () => {
        if (isProcessingPayment) return;
        
        setIsProcessingPayment(true);
        setErrorMessage(null);
        
        try {
            // Usar o ID da venda selecionada ao invés de criar uma nova
            const vendaId = selectedVendaId?.toString();
            if (!vendaId) {
                setErrorMessage('Nenhuma venda selecionada para alterar o pagamento.');
                setIsProcessingPayment(false);
                return;
            }

            if (selectedPaymentMethod === 'cartao') {
                await processCardPayment(vendaId);
            } else if (selectedPaymentMethod === 'pix') {
                await generatePayment('pix', vendaId);
            } else if (selectedPaymentMethod === 'boleto') {
                await generatePayment('boleto', vendaId);
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Erro ao processar pagamento.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openMenuId && !menuRef.current?.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenuId]);

    useEffect(() => {
        document.body.classList.toggle('no-scroll', isSidebarActive);
    }, [isSidebarActive]);

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const formatarStatus = (statusVenda: string) => {
        switch (statusVenda) {
            case 'PENDENTE': return 'Pendente';
            case 'FINALIZADO': return 'Finalizado';
            case 'CANCELADO': return 'Cancelado';
            case 'CARRINHO_ABANDONADO': return 'Carrinho Abandonado';
            default: return statusVenda;
        }
    };

    const renderProdutosEPlanos = (assinatura: Assinatura) => {
        const produtos = assinatura.venda?.produtos || [];
        const planos = assinatura.planos || [];
        
        if (produtos.length === 0) {
            return <span>Produto Indisponível - Plano Indisponível</span>;
        }
        
        const produtoPrincipal = produtos[0];
        const planoPrincipal = planos[0];
        
        return (
            <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {produtoPrincipal?.dadosProduto?.dadosGerais?.nome || 'Produto Indisponível'} - {planoPrincipal?.nome || 'Plano Indisponível'}
                </div>
                
                {/* Se houver produtos de upsell (mais de 1 produto) */}
                {produtos.length > 1 && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>+ Produtos Adicionais:</div>
                        {produtos.slice(1).map((produto, index) => {
                            const planoUpsell = planos[index + 1];
                            return (
                                <div key={index} style={{ marginLeft: '8px', marginBottom: '2px' }}>
                                    • {produto?.dadosProduto?.dadosGerais?.nome || 'Produto Indisponível'} - {planoUpsell?.nome || 'Plano Indisponível'}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const renderVendaProdutoEPlano = (venda: Venda) => {
        const produtos = venda.produtos || [];
        const planos = venda.planos || [];
        
        if (produtos.length === 0) {
            return <span>Produto Indisponível - Plano Indisponível</span>;
        }
        
        const produtoPrincipal = produtos[0];
        const planoPrincipal = planos[0];
        
        return (
            <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {produtoPrincipal?.dadosProduto?.dadosGerais?.nome || 'Produto Indisponível'} - {planoPrincipal?.nome || 'Plano Indisponível'}
                </div>
                
                {/* Se houver produtos de upsell (mais de 1 produto) */}
                {produtos.length > 1 && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>+ Produtos Adicionais:</div>
                        {produtos.slice(1).map((produto, index) => {
                            const planoUpsell = planos[index + 1];
                            return (
                                <div key={index} style={{ marginLeft: '8px', marginBottom: '2px' }}>
                                    • {produto?.dadosProduto?.dadosGerais?.nome || 'Produto Indisponível'} - {planoUpsell?.nome || 'Plano Indisponível'}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const getStatusVendaClass = (status: string) => {
        switch (status) {
            case 'FINALIZADO':
                return styles.ATIVA;
            case 'PENDENTE':
                return styles.PENDENTE;
            case 'CANCELADO':
                return styles.CANCELADA;
            case 'CARRINHO_ABANDONADO':
                return styles.CARRINHO_ABANDONADO;
            default:
                return '';
        }
    };

    const formatarStatusVenda = (status: string) => {
        switch (status) {
            case 'FINALIZADO': return 'Finalizado';
            case 'PENDENTE': return 'Pendente';
            case 'CANCELADO': return 'Cancelado';
            case 'CARRINHO_ABANDONADO': return 'Carrinho Abandonado';
            default: return status;
        }
    };

    const renderChangePaymentPanel = () => {
        // Encontrar a venda selecionada
        const vendaSelecionada = [...assinaturas.map(a => a.venda), ...vendas]
            .find(venda => venda?.id === selectedVendaId);
        
        if (!vendaSelecionada) {
            return (
                <div className={styles.contentSection}>
                    <h2 className={styles.pageTitle}>Alterar Forma de Pagamento da Assinatura</h2>
                    <div className={styles.contentCard}>
                        <div className={styles.contentCardBody}>
                            <p>Venda não encontrada.</p>
                        </div>
                    </div>
                </div>
            );
        }
        
        return (
            <div className={styles.contentSection}>
                <h2 className={styles.pageTitle}>Alterar Forma de Pagamento da Assinatura</h2>
                
                {errorMessage && <ErrorMessage message={errorMessage} />}
                
                <div className={styles.contentCard}>
                    <div className={styles.contentCardBody}>
                        <div className={styles.subscriptionTable}>
                            <div className={styles.subscriptionHeader}>
                                <div className={`${styles.headerCell} ${styles.productHeader}`}></div>
                                <div className={styles.headerCell}>Data da assinatura</div>
                                <div className={styles.headerCell}>Valor Total</div>
                            </div>
                            <div className={styles.subscriptionRow}>
                                <div className={`${styles.dataCell} ${styles.productCell}`}>
                                    <img src={productImg} alt="Produto" className={styles.subscriptionProductImage} />
                                    <span className={styles.subscriptionName}>
                                        {vendaSelecionada.produtos?.[0]?.dadosProduto?.dadosGerais?.nome || 'Produto Indisponível'} - {vendaSelecionada.planos?.[0]?.nome || 'Plano Indisponível'}
                                    </span>
                                </div>
                                <div className={styles.dataCell}>{formatarData(vendaSelecionada.dataCompra)}</div>
                                <div className={styles.dataCell}>R$ {vendaSelecionada.valorPago?.toFixed(2).replace('.', ',') || '0,00'}</div>
                            </div>
                        </div>
                    </div>
                </div>

            <div className={`${styles.contentCard} ${styles.contentCardPayment}`}>
                <div className={styles.contentCardHeader}>
                    <h3 className={styles.contentCardTitle}>Forma de Pagamento</h3>
                    <div className={styles.radioBody}>
                        <label className={styles.radioButton}>
                            <input type="radio" name="paymentMethod" value="cartao" checked={selectedPaymentMethod === 'cartao'} onChange={(e) => setSelectedPaymentMethod(e.target.value)} />
                            <span className={styles.radio} />
                            Cartão de Crédito
                        </label>
                        <label className={styles.radioButton}>
                            <input type="radio" name="paymentMethod" value="pix" checked={selectedPaymentMethod === 'pix'} onChange={(e) => setSelectedPaymentMethod(e.target.value)} />
                            <span className={styles.radio} />
                            PIX
                        </label>
                        <label className={styles.radioButton}>
                            <input type="radio" name="paymentMethod" value="boleto" checked={selectedPaymentMethod === 'boleto'} onChange={(e) => setSelectedPaymentMethod(e.target.value)} />
                            <span className={styles.radio} />
                            Boleto
                        </label>
                    </div>
                </div>
                <div className={styles.contentCardBody}>
                    {selectedPaymentMethod === 'cartao' && (
                        <div className={styles.creditCardForm}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label} htmlFor="cardNumber">Número do Cartão</label>
                                <div className={styles.inputWrapper}>
                                     <input 
                                          type="text" 
                                          id="cardNumber" 
                                          className={styles.input} 
                                          placeholder="0000 0000 0000 0000" 
                                          value={formatCardNumber(numeroCartao)} 
                                          onChange={handleCardNumberChange}
                                          maxLength={19}
                                      />
                                      <div className={styles.cardIcon}>{renderCardIcon()}</div>
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label} htmlFor="cardName">Nome Impresso no Cartão</label>
                                <input 
                                    type="text" 
                                    id="cardName" 
                                    className={styles.input} 
                                    placeholder="Nome como está no cartão" 
                                    value={nomeImpresso} 
                                    onChange={(e) => setNomeImpresso(e.target.value)}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label} htmlFor="expiryDate">Validade</label>
                                    <input 
                                         type="text" 
                                         id="expiryDate" 
                                         className={styles.input} 
                                         placeholder="MM/AA" 
                                         value={dataVencimento} 
                                         onChange={handleExpiryDateChange}
                                         maxLength={7}
                                     />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label} htmlFor="cvv">Código de Segurança</label>
                                    <input 
                                         type="text" 
                                         id="cvv" 
                                         className={styles.input} 
                                         placeholder="CVV" 
                                         value={codigoSeguranca} 
                                         onChange={handleCvvChange}
                                         maxLength={4}
                                     />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {selectedPaymentMethod === 'pix' && pixData && (
                        <div className={styles.pixPayment}>
                            <h4>Pagamento via PIX</h4>
                            
                            {pixStatus && (
                                <div className={`${styles.pixStatus} ${styles[pixStatus]}`}>
                                    {pixStatus === 'checking' && 'Verificando pagamento a cada 5 segundos...'}
                                    {pixStatus === 'paid' && 'Pagamento confirmado!'}
                                </div>
                            )}
                            
                            <div className={styles.qrCodeContainer}>
                                {pixData.qrCode ? (
                                    <img 
                                        src={pixData.qrCode} 
                                        alt="QR Code PIX" 
                                        onError={(e) => {
                                            console.error('Erro ao carregar imagem QR Code:', pixData.qrCode);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                        onLoad={() => console.log('QR Code carregado com sucesso')}
                                    />
                                ) : (
                                    <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                                        QR Code não disponível
                                    </div>
                                )}
                            </div>
                            <div className={styles.pixCopyPaste}>
                                <label>Código PIX (Copia e Cola):</label>
                                <textarea 
                                    value={pixData.copiaECola} 
                                    readOnly 
                                    className={styles.pixTextarea}
                                />
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(pixData.copiaECola);
                                        alert('Código PIX copiado para a área de transferência!');
                                    }}
                                    className={styles.pixCopyButton}
                                >
                                    Copiar Código PIX
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {selectedPaymentMethod === 'boleto' && boletoData && (
                        <div className={styles.boletoPayment}>
                            <h4>Boleto Bancário</h4>
                            {boletoMessage && <p style={{color: '#28a745', fontWeight: '600'}}>{boletoMessage}</p>}
                            <div style={{margin: '20px 0'}}>
                                <a 
                                    href={boletoData} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    Visualizar Boleto
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.paginationControls}>
                <button className={`${styles.paginationBtn} ${styles.cancelBtn}`} onClick={() => setShowChangePaymentPanel(false)}>Cancelar</button>
                <button 
                    className={`${styles.paginationBtn} ${styles.saveBtn}`} 
                    onClick={handlePaymentSubmit}
                    disabled={isProcessingPayment}
                >
                    {isProcessingPayment ? 'Processando...' : 'Finalizar Pagamento'}
                </button>
            </div>
        </div>
        );
    };

    return (
        <div className={styles.mainContainer}>
            <header className={styles.mainHeader}>
                <div className={styles.headerLeft}>
                    <button id="mobileMenuBtn" className={styles.mobileMenuBtn} onClick={toggleSidebar}>
                        <FaBars />
                    </button>
                    <div id="logo" style={{ backgroundImage: `url(${logo})`}}></div>
                </div>
                <div className={styles.headerActions}>
                    <button onClick={handleLogout} className={styles.exitButton}>
                        <FaArrowRightFromBracket />
                    </button>
                </div>
            </header>

            <aside className={`${styles.sidebar} ${isSidebarActive ? styles.active : ''}`}>
                <nav className={styles.sidebarNav}>
                    <div className={styles.navItem}>
                        <FaShoppingBag />
                        <span>Meus Pedidos</span>
                    </div>
                    <div className={styles.navItem}>
                        <FaCog />
                        <span>Conta</span>
                    </div>
                </nav>
            </aside>

            <div className={`${styles.overlay} ${isSidebarActive ? styles.active : ''}`} id="overlay" onClick={toggleSidebar}></div>

            <main className={styles.mainContent}>
                {showChangePaymentPanel ? renderChangePaymentPanel() : (
                    <>
                        <div className={styles.contentHeader}>
                            <h2 className={styles.pageTitle}>Meus Pedidos</h2>

                            <div className={styles.filterActions}>
                                <div className={styles.filterActionsLeft}>
                                    <div className={styles.searchWrapper}>
                                        <FaSearch className={styles.searchIcon} />
                                        <input 
                                            type="text" 
                                            className={styles.searchInput} 
                                            placeholder="Pesquisar" 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles.filterActionsRight}>
                                    <span className={styles.orderByText} style={{ display: 'none' }}>Ordenar por:</span>
                                    <div className={`${styles.selectWrapper} ${styles.orderByWrapper}`}>
                                        <span className={styles.orderByLabel}>Ordenar por :</span>
                                        <span className={styles.orderByValue}></span>
                                        <FaChevronDown className={styles.selectIcon} />
                                        <select 
                                            className={styles.filterSelect} 
                                            aria-label="Ordenar por"
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                        >
                                            <option value="data">Novos</option>
                                            <option value="valor-maior">Mais Caros</option>
                                            <option value="valor-menor">Mais Baratos</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.tableContainer}>
                            <div className={styles.tableResponsive}>
                                <table className={styles.reportTable}>
                                    <thead>
                                        <tr>
                                            <th className={styles.productImageHeader}></th>
                                            <th>Produto(s)</th>
                                            <th>N ° Pedido</th>
                                            <th>Data</th>
                                            <th>Valor</th>
                                            <th>Forma Pagamento</th>
                                            <th className={styles['text-center']}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssinaturas.map(assinatura => (
                                            <tr key={assinatura.id}>
                                                <td className={styles.productImageCell}>
                                                    <div className={styles.productImage}>
                                                        <img src={productImg} alt="Produto" />
                                                    </div>
                                                </td>
                                                <td>{renderProdutosEPlanos(assinatura)}</td>
                                                <td>#{assinatura.venda?.id}</td>
                                                <td>{formatarData(assinatura.dataInicio)}</td>
                                                <td>R$ {assinatura.venda?.valorPago?.toFixed(2).replace('.', ',') || '0,00'}</td>
                                                <td>{assinatura.metodoPagamento || 'N/A'}</td>
                                                <td className={styles['text-center']}>
                                                    <div className={styles.statusItens}>
                                                        <span className={`${styles.statusProduto} ${styles[assinatura.statusAssinatura]}`}>{formatarStatus(assinatura.venda?.statusVenda)}</span>
                                                        <div className={styles.actionsContainer} ref={openMenuId === assinatura.id ? menuRef : null}>
                                                            <FaEllipsisV id={assinatura.id} className={styles.actionsBtn} onClick={(e) => toggleActionsMenu(assinatura.id, e)} />
                                                            <a className={`${styles.actionsBtn} ${styles.whatsappBtn}`} href={`https://wa.me/${assinatura.venda?.produtos?.[0]?.dadosProduto?.suporteGarantia?.whatsappSuporte || assinatura.produto?.dadosProduto?.suporteGarantia?.whatsappSuporte}`}><FaSquareWhatsapp  /></a>
                                                            {openMenuId === assinatura.id && (
                                                                <div className={`${styles.actionsMenu} ${styles.show}`} data-menu-for={assinatura.id}>
                                                                    {assinatura.venda?.statusVenda === 'FINALIZADO' && (
                                                                        <>
                                                                            <a href="#" className={styles.refundBtn} onClick={() => handleRefundRequest(assinatura.venda.id)}>
                                                                                <FaUndo /> Solicitar reembolso
                                                                            </a>
                                                                        </>
                                                                    )}
                                                                    {assinatura.venda?.statusVenda != 'FINALIZADO' &&
                                                                        <a href="#" onClick={(e) => handleChangePaymentClick(e, assinatura.venda.id)}>Alterar forma de pagamento</a>
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredVendas.map(venda => (
                                            <tr key={`venda-${venda.id}`}>
                                                <td className={styles.productImageCell}>
                                                    <div className={styles.productImage}>
                                                        <img src={productImg} alt="Produto" />
                                                    </div>
                                                </td>
                                                <td>{renderVendaProdutoEPlano(venda)}</td>
                                                <td>#{venda.id}</td>
                                                <td>{formatarData(venda.dataCompra)}</td>
                                                <td>R$ {venda.valorPago?.toFixed(2).replace('.', ',') || '0,00'}</td>
                                                <td>{venda.metodoPagamento || 'N/A'}</td>
                                                <td className={styles['text-center']}>
                                                    <div className={styles.statusItens}>
                                                        <span className={`${styles.statusProduto} ${getStatusVendaClass(venda.statusVenda)}`}>{formatarStatusVenda(venda.statusVenda)}</span>
                                                        <div className={styles.actionsContainer} ref={openMenuId === `venda-${venda.id}` ? menuRef : null}>
                                                            <FaEllipsisV id={`venda-${venda.id}`} className={styles.actionsBtn} onClick={(e) => toggleActionsMenu(`venda-${venda.id}`, e)} />
                                                            <a className={`${styles.actionsBtn} ${styles.whatsappBtn}`} href={`https://wa.me/${venda.produtos?.[0]?.dadosProduto?.suporteGarantia?.whatsappSuporte}`}><FaSquareWhatsapp  /></a>
                                                            {openMenuId === `venda-${venda.id}` && (
                                                                <div className={`${styles.actionsMenu} ${styles.show}`} data-menu-for={`venda-${venda.id}`}>
                                                                    {venda.statusVenda === 'FINALIZADO' && (
                                                                        <>
                                                                            <a href="#" className={styles.refundBtn} onClick={() => handleRefundRequest(venda.id)}>
                                                                                <FaUndo /> Solicitar reembolso
                                                                            </a>
                                                                        </>
                                                                    )}
                                                                    {venda.statusVenda != 'FINALIZADO' &&
                                                                        <a href="#" onClick={(e) => handleChangePaymentClick(e, venda.id)}>Alterar forma de pagamento</a>
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
            
            {errorMessage && <ErrorMessage message={errorMessage} />}
        </div>
    );
};

export default Assinaturas;