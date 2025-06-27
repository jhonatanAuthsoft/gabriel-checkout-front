import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { FaShoppingBag, FaCog, FaBox } from 'react-icons/fa';
import { FaBars, FaArrowRightFromBracket, FaChevronDown, FaFileExport, FaXmark, FaSort, FaArrowUpRightFromSquare, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import logoImage from '../../../assets/img/df.png';

const Relatorios = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState(['Vendas']);
    const [orderBy, setOrderBy] = useState('Mais Recente');
    const overlayRef = useRef<HTMLDivElement>(null);

    const toggleMobileMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setSidebarActive(prev => !prev);
    };

    const toggleSubMenu = (menuName: string) => {
        setOpenSubMenus(prev =>
            prev.includes(menuName)
                ? prev.filter(m => m !== menuName)
                : [...prev, menuName]
        );
    };
    
    useEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay) return;

        if (isSidebarActive) {
            overlay.classList.add(styles.active);
            overlay.style.pointerEvents = 'auto';
        } else {
            overlay.classList.remove(styles.active);
            setTimeout(() => {
                if (overlay) overlay.style.pointerEvents = 'none';
            }, 300);
        }
    }, [isSidebarActive]);

    const handleOrderByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        setOrderBy(selectedOption.text);
    };

    const DateInput = ({ id, label }: { id: string, label: string }) => {
        const [hasValue, setHasValue] = useState(false);
        const [isFocused, setIsFocused] = useState(false);

        const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasValue(!!e.target.value);
        };
        
        return (
            <div className={styles.dateInputWrapper}>
                <input
                    type="date"
                    className={`${styles.filterInput} ${styles.dateInput} ${hasValue ? styles.hasValue : ''}`}
                    id={id}
                    onChange={handleDateChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                <label htmlFor={id} className={`${styles.dateLabel} ${isFocused ? styles.dateFocused : ''} ${hasValue ? styles.dateHasValue : ''}`}>
                    {label}
                </label>
            </div>
        );
    };
    
    const salesData = Array(9).fill({
        pedido: '#999999',
        produto: 'Nome do Produto',
        dataPedido: 'dd/mm/aaaa hh:mm',
        dataFinalizacao: 'dd/mm/aaaa hh:mm',
        cliente: 'Nome do Cliente',
        comissao: '00,00',
        valorVenda: '00,00',
        formaPgto: 'Pix',
        status: 'Concluído'
    });

    return (
        <div className={styles.mainContainer}>
            <header className={styles.mainHeader}>
                <div className={styles.headerLeft}>
                    <button id="mobileMenuBtn" className={styles.mobileMenuBtn} onClick={toggleMobileMenu}>
                        <FaBars />
                    </button>
                    <div className={styles.logo} style={{ backgroundImage: `url(${logoImage})` }} />
                </div>
                <div className={styles.headerActions}>
                    <a href="#" className={styles.exitButton}>
                        <FaArrowRightFromBracket />
                    </a>
                </div>
            </header>
            <aside className={`${styles.sidebar} ${isSidebarActive ? styles.active : ''}`}>
                <nav className={styles.sidebarNav}>
                    <div className={styles.navItem} onClick={() => toggleSubMenu('Vendas')}>
                        <FaShoppingBag />
                        <span>Vendas</span>
                        <FaChevronDown className={`${styles.expandIcon} ${openSubMenus.includes('Vendas') ? styles.rotate : ''}`} />
                    </div>
                    <div className={styles.subMenu} style={{ display: openSubMenus.includes('Vendas') ? 'block' : 'none' }}>
                        <a href="/vendas">
                            <div className={styles.subMenuItem}>Painel de Vendas</div>
                        </a>
                        <a href="#">
                            <div className={`${styles.subMenuItem} ${styles.active}`}>Relatórios</div>
                        </a>
                    </div>
                    <div className={styles.navItem} onClick={() => toggleSubMenu('Produtos')}>
                        <FaBox />
                        <span>Produtos</span>
                        <FaChevronDown className={`${styles.expandIcon} ${openSubMenus.includes('Produtos') ? styles.rotate : ''}`} />
                    </div>
                    <div className={styles.subMenu} style={{ display: openSubMenus.includes('Produtos') ? 'block' : 'none' }}>
                        <a href="/produtos">
                            <div className={styles.subMenuItem}>Meus Produtos</div>
                        </a>
                        <a href="/produtos/novo">
                            <div className={styles.subMenuItem}>Novo Produto</div>
                        </a>
                    </div>
                    <div className={styles.navItem} onClick={() => toggleSubMenu('Configurações')}>
                        <FaCog />
                        <span>Configurações</span>
                        <FaChevronDown className={`${styles.expandIcon} ${openSubMenus.includes('Configurações') ? styles.rotate : ''}`} />
                    </div>
                    <div className={styles.subMenu} style={{ display: openSubMenus.includes('Configurações') ? 'block' : 'none' }}>
                        <a href="/clientes">
                            <div className={styles.subMenuItem}>Clientes</div>
                        </a>
                        <a href="/usuarios">
                            <div className={styles.subMenuItem}>Usuários</div>
                        </a>
                    </div>
                </nav>
            </aside>
            <div className={`${styles.overlay} ${isSidebarActive ? styles.active : ''}`} id="overlay" ref={overlayRef} onClick={toggleMobileMenu} />
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                    <h2 className={styles.pageTitle}>Relatório de Vendas</h2>
                </div>
                <div className={styles.filterSection}>
                    <div className={styles.filterRow}>
                        <div className={styles.filterItem}><input type="text" placeholder="Nº Pedido" className={styles.filterInput} /></div>
                        <div className={styles.filterItem}><input type="text" placeholder="Comprador" className={styles.filterInput} /></div>
                        <div className={styles.filterItem}>
                            <div className={styles.selectWrapper}>
                                <select className={styles.filterSelect}><option value="">Status</option><option value="concluido">Concluído</option><option value="pendente">Pendente</option><option value="cancelado">Cancelado</option></select>
                                <FaChevronDown className={styles.selectIcon} />
                            </div>
                        </div>
                        <div className={styles.filterItem}>
                            <div className={styles.selectWrapper}>
                                <select className={styles.filterSelect}><option value="">Tipo de Venda</option><option value="online">Renovação</option><option value="presencial">Pagamento Único</option></select>
                                <FaChevronDown className={styles.selectIcon} />
                            </div>
                        </div>
                        <div className={styles.filterItem}>
                            <div className={styles.selectWrapper}>
                                <select className={styles.filterSelect}><option value="">Forma de Pagamento</option><option value="cartao">Cartão de Crédito</option><option value="cartao">Cartão de Débito</option><option value="pix">PIX</option><option value="boleto">Boleto</option></select>
                                <FaChevronDown className={styles.selectIcon} />
                            </div>
                        </div>
                        <div className={styles.filterItem}><DateInput id="dataPedidoInicio" label="Data Pedido de" /></div>
                        <div className={styles.filterItem}><DateInput id="dataPedidoFim" label="até" /></div>
                    </div>
                    <div className={styles.filterRow}>
                        <div className={styles.filterItem}>
                            <div className={styles.selectWrapper}>
                                <select className={styles.filterSelect}><option value="">Origem da Venda</option><option value="site">Site</option><option value="app">Aplicativo</option></select>
                                <FaChevronDown className={styles.selectIcon} />
                            </div>
                        </div>
                        <div className={styles.filterItem}><input type="text" placeholder="CPF/CNPJ" className={styles.filterInput} /></div>
                        <div className={styles.filterItem}>
                            <div className={styles.selectWrapper}>
                                <select className={styles.filterSelect}><option value="">Produto</option><option value="mensal">Designerflix Mensal</option><option value="anual">Designerflix Anual</option></select>
                                <FaChevronDown className={styles.selectIcon} />
                            </div>
                        </div>
                        <div className={styles.filterItem}><input type="text" placeholder="Cupom" className={styles.filterInput} /></div>
                        <div className={styles.filterItem}>
                            <div className={styles.selectWrapper}>
                                <select className={styles.filterSelect}><option value="">Moeda</option><option value="brl">BRL</option><option value="usd">USD</option><option value="eur">EUR</option></select>
                                <FaChevronDown className={styles.selectIcon} />
                            </div>
                        </div>
                        <div className={styles.filterItem}><DateInput id="dataFinalizacaoInicio" label="Data Finalização de" /></div>
                        <div className={styles.filterItem}><DateInput id="dataFinalizacaoFim" label="até" /></div>
                    </div>
                    <div className={styles.filterActions}>
                        <div className={styles.filterActionsLeft}>
                            <button className={styles.btnExport}><FaFileExport /> Exportar</button>
                            <button className={styles.btnClear}><FaXmark /> Limpar Filtros</button>
                        </div>
                        <div className={styles.filterActionsRight}>
                            <div className={`${styles.selectWrapper} ${styles.orderByWrapper}`}>
                                <span className={styles.orderByLabel}>Ordenar por :</span>
                                <span className={styles.orderByValue}>{orderBy}</span>
                                <FaChevronDown className={styles.selectIcon} />
                                <select className={styles.filterSelect} aria-label="Ordenar por" onChange={handleOrderByChange}>
                                    <option value="data">Mais Recente</option>
                                    <option value="valor">Maior Valor</option>
                                    <option value="cliente">Nome do Cliente</option>
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
                                    <th className={styles.sortable}>Nº Pedido <FaSort /></th>
                                    <th className={styles.sortable}>Produto <FaSort /></th>
                                    <th className={styles.sortable}>Data Pedido <FaSort /></th>
                                    <th className={styles.sortable}>Data Finalização <FaSort /></th>
                                    <th className={styles.sortable}>Cliente <FaSort /></th>
                                    <th className={styles.sortable}>Comissão <FaSort /></th>
                                    <th className={styles.sortable}>Valor Venda <FaSort /></th>
                                    <th className={styles.sortable}>Forma Pgto <FaSort /></th>
                                    <th className={styles.sortable}>Status <FaSort /></th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {salesData.map((sale, index) => (
                                <tr key={index}>
                                    <td>{sale.pedido}</td>
                                    <td>{sale.produto}</td>
                                    <td>{sale.dataPedido}</td>
                                    <td>{sale.dataFinalizacao}</td>
                                    <td>{sale.cliente}</td>
                                    <td>{sale.comissao}</td>
                                    <td>{sale.valorVenda}</td>
                                    <td>{sale.formaPgto}</td>
                                    <td><span className={styles.statusConcluido}>{sale.status}</span></td>
                                    <td><button className={styles.btnAction}><FaArrowUpRightFromSquare /></button></td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styles.paginationContainer}>
                    <div className={styles.paginationInfo}>Exibindo página 1 de 20</div>
                    <div className={styles.paginationControls}>
                        <button className={`${styles.paginationBtn} ${styles.paginationPrev}`}><FaChevronLeft /></button>
                        <button className={`${styles.paginationBtn} ${styles.paginationNumber} ${styles.active}`}>1</button>
                        <button className={`${styles.paginationBtn} ${styles.paginationNumber}`}>2</button>
                        <button className={`${styles.paginationBtn} ${styles.paginationNumber}`}>3</button>
                        <button className={`${styles.paginationBtn} ${styles.paginationNumber}`}>4</button>
                        <span className={styles.paginationEllipsis}>...</span>
                        <button className={`${styles.paginationBtn} ${styles.paginationNumber}`}>20</button>
                        <button className={`${styles.paginationBtn} ${styles.paginationNext}`}><FaChevronRight /></button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Relatorios; 