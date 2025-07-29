import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { FaBars, FaShoppingBag, FaCog, FaSearch, FaChevronDown, FaEllipsisV, FaUndo } from 'react-icons/fa';
import { FaArrowRightFromBracket, FaSquareWhatsapp } from 'react-icons/fa6';

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className={styles.errorMessage}>
        {message}
    </div>
);
import jwt_decode from 'jwt-decode';
import logo from '../../../assets/img/df.png';
import productImg from '../../../assets/img/dfCirculo.png';

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
        produto: {
            dadosProduto: {
                dadosGerais: {
                    nome: string;
                }
                cobranca: {
                    preco: number;
                }
            }
        }
        statusVenda: string;
    };
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
    const menuRef = useRef<HTMLDivElement>(null);
    const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
    const [filteredAssinaturas, setFilteredAssinaturas] = useState<Assinatura[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('data');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

            const response = await fetch(`${apiUrl}assinatura/listar-todos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401 || response.status === 403) {
                navigate('/vendas');
                return;
            }
            if (!response.ok) throw new Error('Falha ao buscar assinaturas');
            const data = await response.json();
            
            const userAssinaturas = data.content.filter(
                (assinatura: Assinatura) => assinatura.cliente.email === userEmail
            );
            
            setAssinaturas(userAssinaturas || []);
        } catch (error) {
            console.error("Erro ao buscar assinaturas:", error);
        }
    };
    
    useEffect(() => {
        fetchAssinaturas();
    }, []);

    useEffect(() => {
        let result = [...assinaturas];

        if (searchTerm) {
            result = result.filter(a => 
                a.venda?.produto?.dadosProduto?.dadosGerais?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.plano?.nome.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        switch (sortOrder) {
            case 'data':
                result.sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
                break;
            case 'valor-maior':
                result.sort((a, b) => (b.venda?.produto?.dadosProduto?.cobranca?.preco || 0) - (a.venda?.produto?.dadosProduto?.cobranca?.preco || 0));
                break;
            case 'valor-menor':
                result.sort((a, b) => (a.venda?.produto?.dadosProduto?.cobranca?.preco || 0) - (b.venda?.produto?.dadosProduto?.cobranca?.preco || 0));
                break;
            default:
                break;
        }

        setFilteredAssinaturas(result);
    }, [assinaturas, searchTerm, sortOrder]);

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

    const handleChangePaymentClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowChangePaymentPanel(true);
        setOpenMenuId(null);
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

    const renderChangePaymentPanel = () => (
        <div className={styles.contentSection}>
            <h2 className={styles.pageTitle}>Alterar Forma de Pagamento da Assinatura</h2>
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
                                <span className={styles.subscriptionName}>DESIGNER FLIX MENSAL</span>
                            </div>
                            <div className={styles.dataCell}>dd/mm/aaaa</div>
                            <div className={styles.dataCell}>R$ 000,00</div>
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
                                <input type="text" id="cardNumber" className={styles.input} placeholder="Somente Números" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label} htmlFor="cardName">Nome Impresso no Cartão</label>
                                <input type="text" id="cardName" className={styles.input} placeholder="Informe o nome exatamente como está no cartão" />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label} htmlFor="expiryDate">Validade</label>
                                    <div className={styles.expiryDate}>
                                        <div className={styles.selectWrapper}>
                                            <select className={styles.filterSelect} aria-label="Mês de validade">
                                                <option>MM</option>
                                            </select>
                                            <FaChevronDown className={styles.selectIcon} />
                                        </div>
                                        <div className={styles.selectWrapper}>
                                            <select className={styles.filterSelect} aria-label="Ano de validade">
                                                <option>AA</option>
                                            </select>
                                            <FaChevronDown className={styles.selectIcon} />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label} htmlFor="cvv">Código de Segurança</label>
                                    <input type="text" id="cvv" className={styles.input} placeholder="CVV" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.paginationControls}>
                <button className={`${styles.paginationBtn} ${styles.cancelBtn}`} onClick={() => setShowChangePaymentPanel(false)}>Cancelar</button>
                <button className={`${styles.paginationBtn} ${styles.saveBtn}`}>Salvar</button>
            </div>
        </div>
    );

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
                                                <td>{assinatura.venda?.produto?.dadosProduto?.dadosGerais?.nome || 'Produto Indisponível'} - {assinatura.plano?.nome || 'Plano Indisponível'}</td>
                                                <td>#{assinatura.venda?.id}</td>
                                                <td>{formatarData(assinatura.dataInicio)}</td>
                                                <td>R$ {assinatura.venda?.produto?.dadosProduto?.cobranca?.preco?.toFixed(2).replace('.', ',') || '0,00'}</td>
                                                <td>{assinatura.metodoPagamento || 'N/A'}</td>
                                                <td className={styles['text-center']}>
                                                    <div className={styles.statusItens}>
                                                        <span className={`${styles.statusProduto} ${styles[assinatura.statusAssinatura]}`}>{formatarStatus(assinatura.venda?.statusVenda)}</span>
                                                        <div className={styles.actionsContainer} ref={openMenuId === assinatura.id ? menuRef : null}>
                                                            <FaEllipsisV id={assinatura.id} className={styles.actionsBtn} onClick={(e) => toggleActionsMenu(assinatura.id, e)} />
                                                            <a className={`${styles.actionsBtn} ${styles.whatsappBtn}`} href={`https://wa.me/${assinatura.produto?.dadosProduto?.suporteGarantia?.whatsappSuporte}`}><FaSquareWhatsapp  /></a>
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
                                                                        <a href="#" onClick={handleChangePaymentClick}>Alterar forma de pagamento</a>
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