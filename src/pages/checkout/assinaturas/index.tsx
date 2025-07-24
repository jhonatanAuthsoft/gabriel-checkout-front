import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { FaBars, FaShoppingBag, FaCog, FaSearch, FaChevronDown, FaEllipsisV } from 'react-icons/fa';
import { FaArrowRightFromBracket, FaSquareWhatsapp } from 'react-icons/fa6';
import jwt_decode from 'jwt-decode';
import logo from '../../../assets/img/df.png';
import productImg from '../../../assets/img/dfCirculo.png';

interface Assinatura {
    id: string;
    venda: {
        id: number;
    produto: {
            dadosProduto: {
        dadosGerais: {
            nome: string;
                }
            }
        }
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

    const formatarStatus = (status: string) => {
        switch (status) {
            case 'ATIVA': return 'Ativa';
            case 'CANCELADA': return 'Cancelada';
            case 'INADIMPLENTE': return 'Inadimplente';
            default: return status;
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
                                        <input type="text" className={styles.searchInput} placeholder="Pesquisar" />
                                    </div>
                                </div>
                                <div className={styles.filterActionsRight}>
                                    <span className={styles.orderByText} style={{ display: 'none' }}>Ordenar por:</span>
                                    <div className={`${styles.selectWrapper} ${styles.orderByWrapper}`}>
                                        <span className={styles.orderByLabel}>Ordenar por :</span>
                                        <span className={styles.orderByValue}></span>
                                        <FaChevronDown className={styles.selectIcon} />
                                        <select className={styles.filterSelect} aria-label="Ordenar por">
                                            <option value="data" selected>Novos</option>
                                            <option value="valor">Mais Caros</option>
                                            <option value="cliente">Mais Baratos</option>
                                            <option value="cliente">Mais Vendidos</option>
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
                                        {assinaturas.map(assinatura => (
                                            <tr key={assinatura.id}>
                                                <td className={styles.productImageCell}>
                                                    <div className={styles.productImage}>
                                                        <img src={productImg} alt="Produto" />
                                                    </div>
                                                </td>
                                                <td>{assinatura.venda?.produto?.dadosProduto?.dadosGerais?.nome || 'Produto Indisponível'} - {assinatura.plano?.nome || 'Plano Indisponível'}</td>
                                                <td>#{assinatura.venda?.id}</td>
                                                <td>{formatarData(assinatura.dataInicio)}</td>
                                                <td>R$ {assinatura.plano?.valor?.toFixed(2).replace('.', ',') || '0,00'}</td>
                                                <td>{assinatura.metodoPagamento || 'N/A'}</td>
                                                <td className={styles['text-center']}>
                                                    <div className={styles.statusItens}>
                                                        <span className={`${styles.statusProduto} ${styles[assinatura.statusAssinatura]}`}>{formatarStatus(assinatura.statusAssinatura)}</span>
                                                        <div className={styles.actionsContainer} ref={openMenuId === assinatura.id ? menuRef : null}>
                                                            <FaEllipsisV id={assinatura.id} className={styles.actionsBtn} onClick={(e) => toggleActionsMenu(assinatura.id, e)} />
                                                            <FaSquareWhatsapp className={`${styles.actionsBtn} ${styles.whatsappBtn}`} />
                                                            {openMenuId === assinatura.id && (
                                                                <div className={`${styles.actionsMenu} ${styles.show}`} data-menu-for={assinatura.id}>
                                                                    {assinatura.statusAssinatura === 'ATIVA' &&
                                                                        <a href="#" onClick={() => handleCancelSubscription(assinatura.id)}>Cancelar assinatura</a>
                                                                    }
                                                                    <a href="#" onClick={handleChangePaymentClick}>Alterar forma de pagamento</a>
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
        </div>
    );
};

export default Assinaturas; 