import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './styles.module.css';
import { FaShoppingBag, FaCog, FaBox, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { FaBars, FaArrowRightFromBracket, FaChevronDown, FaFileExport, FaXmark, FaSort, FaArrowUpRightFromSquare, FaChevronLeft, FaChevronRight, FaFilter } from 'react-icons/fa6';
import logoImage from '../../../assets/img/df.png';

interface Venda {
    id: number;
    codigo: string;
    produto: { nome: string };
    dataCriacao: string;
    dataAtualizacao: string;
    cliente: { nome: string };
    comissaoVenda: number;
    valor: number;
    tipoPagamento: string;
    statusVenda: string;
    dataPagamento: string;
    tipoVenda: string;
    origemVenda: string;
    cpfCnpj: string;
    cupom: string;
    moeda: string;
}

const DateInput = ({ id, name, label, value, onChange }: { id: string, name: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = !!value;

    return (
        <div className={styles.dateInputWrapper}>
            <input
                type="date"
                className={`${styles.filterInput} ${styles.dateInput} ${hasValue ? styles.hasValue : ''}`}
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            <label htmlFor={id} className={`${styles.dateLabel} ${isFocused ? styles.dateFocused : ''} ${hasValue ? styles.dateHasValue : ''}`}>
                {label}
            </label>
        </div>
    );
};

const initialFilters = {
    codigoSolicitacao: '',
    clienteNome: '',
    statusVenda: '',
    tipoVenda: '',
    metodoPagamento: '',
    dataCompraInicio: '',
    dataCompraFim: '',
    origemVenda: '',
    cpfCnpj: '',
    produtoNome: '',
    cupom: '',
    moeda: '',
    dataPagamentoInicio: '',
    dataPagamentoFim: '',
};

const Relatorios = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState(['Vendas']);
    const [orderBy, setOrderBy] = useState('data');
    const overlayRef = useRef<HTMLDivElement>(null);
    const [selectedSales, setSelectedSales] = useState<number[]>([]);
    const [isExportMenuOpen, setExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const [filters, setFilters] = useState(initialFilters);
    const [allVendas, setAllVendas] = useState<Venda[]>([]);
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [rowExportMenu, setRowExportMenu] = useState<number | null>(null);
    const rowExportMenuRef = useRef<HTMLDivElement>(null);

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

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(0);
    };

    const fetchVendas = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setFetchError("Você precisa estar logado para ver as vendas.");
            setLoading(false);
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}venda/listar`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Falha ao buscar os dados das vendas.' }));
                throw new Error(errorData.message || 'Falha ao buscar os dados das vendas.');
            }

            const data = await response.json();
            const vendasMapeadas = (data.content || []).map((venda: any) => ({
                id: venda.id,
                codigo: venda.codigoSolicitacao,
                produto: { nome: venda.produto?.dadosProduto?.dadosGerais?.nome || 'N/A' },
                dataCriacao: venda.dataCompra,
                dataAtualizacao: venda.dataAtualizacao,
                dataPagamento: venda.dataPagamento,
                cliente: { nome: venda.cliente?.nome || 'N/A' },
                comissaoVenda: 0,
                valor: venda.valorPago,
                tipoPagamento: venda.metodoPagamento,
                statusVenda: venda.statusVenda,
                tipoVenda: venda.tipoVenda,
                origemVenda: venda.origemVenda,
                cpfCnpj: venda.cliente?.documento,
                cupom: venda.cupom,
                moeda: venda.moeda,
            }));
            setAllVendas(vendasMapeadas);
        } catch (err: any) {
            setFetchError(err.message);
            console.error("Erro ao buscar vendas:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVendas();
    }, [fetchVendas]);

    useEffect(() => {
        const processVendas = () => {
            const filtered = allVendas.filter(venda => {
                const {
                    codigoSolicitacao, clienteNome, statusVenda, tipoVenda, metodoPagamento,
                    dataCompraInicio, dataCompraFim, origemVenda, cpfCnpj, produtoNome,
                    cupom, moeda, dataPagamentoInicio, dataPagamentoFim
                } = filters;

                if (codigoSolicitacao && !venda.codigo?.toLowerCase().includes(codigoSolicitacao.toLowerCase())) return false;
                if (clienteNome && !venda.cliente.nome?.toLowerCase().includes(clienteNome.toLowerCase())) return false;
                if (statusVenda && venda.statusVenda !== statusVenda) return false;
                if (tipoVenda && venda.tipoVenda !== tipoVenda) return false;
                if (metodoPagamento && venda.tipoPagamento !== metodoPagamento) return false;
                if (origemVenda && venda.origemVenda !== origemVenda) return false;
                if (cpfCnpj && !venda.cpfCnpj?.includes(cpfCnpj)) return false;
                if (produtoNome && !venda.produto.nome?.toLowerCase().includes(produtoNome.toLowerCase())) return false;
                if (cupom && !venda.cupom?.toLowerCase().includes(cupom.toLowerCase())) return false;
                if (moeda && venda.moeda !== moeda) return false;

                if (dataCompraInicio) {
                    const dataCompra = new Date(venda.dataCriacao);
                    const inicio = new Date(dataCompraInicio);
                    inicio.setUTCHours(0, 0, 0, 0);
                    if (dataCompra < inicio) return false;
                }
                if (dataCompraFim) {
                    const dataCompra = new Date(venda.dataCriacao);
                    const fim = new Date(dataCompraFim);
                    fim.setUTCHours(23, 59, 59, 999);
                    if (dataCompra > fim) return false;
                }
                if (dataPagamentoInicio) {
                    if (!venda.dataPagamento) return false;
                    const dataPagamento = new Date(venda.dataPagamento);
                    const inicio = new Date(dataPagamentoInicio);
                    inicio.setUTCHours(0, 0, 0, 0);
                    if (dataPagamento < inicio) return false;
                }
                if (dataPagamentoFim) {
                    if (!venda.dataPagamento) return false;
                    const dataPagamento = new Date(venda.dataPagamento);
                    const fim = new Date(dataPagamentoFim);
                    fim.setUTCHours(23, 59, 59, 999);
                    if (dataPagamento > fim) return false;
                }

                return true;
            });

            const sorted = [...filtered].sort((a, b) => {
                switch (orderBy) {
                    case 'valor':
                        return b.valor - a.valor;
                    case 'cliente':
                        return a.cliente.nome.localeCompare(b.cliente.nome);
                    case 'data':
                    default:
                        return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
                }
            });

            const itemsPerPage = 10;
            const newTotalPages = Math.ceil(sorted.length / itemsPerPage);
            setTotalPages(newTotalPages);
            setTotalItems(sorted.length);

            const startIndex = currentPage * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            setVendas(sorted.slice(startIndex, endIndex));
        };

        if (!loading) {
            processVendas();
        }
    }, [filters, allVendas, currentPage, loading, orderBy]);

    const handleClearFilters = () => {
        setFilters(initialFilters);
        setCurrentPage(0);
    };

    const handleDownload = async (url: string, body: any = null, method: string = 'GET') => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error("Token não encontrado");
            alert('Você precisa estar logado para realizar esta ação.');
            return;
        }

        const headers: HeadersInit = {
            'Authorization': `Bearer ${token}`,
        };

        const options: RequestInit = {
            method: method,
            headers: headers,
        };

        if (body) {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Falha ao gerar o relatório.' }));
                throw new Error(errorData.message || 'Falha ao gerar o relatório.');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;

            const contentDisposition = response.headers.get('content-disposition');
            let fileName = url.includes('pdf') ? 'relatorio.pdf' : 'relatorio.xlsx';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                if (fileNameMatch && fileNameMatch.length > 1) {
                    fileName = fileNameMatch[1];
                }
            }
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error: any) {
            console.error("Erro ao baixar o relatório:", error);
            alert(`Erro ao baixar o relatório: ${error.message}`);
        }
    };

    const handleExport = (format: 'pdf' | 'excel', type: 'vendas' | 'clientes' | 'dashboard') => {
        const apiUrl = import.meta.env.VITE_API_URL;
        let url = `${apiUrl}relatorio/${format}`;
        let method = 'GET';
        let body = null;

        switch (type) {
            case 'vendas':
                if (selectedSales.length === 0) {
                    alert('Por favor, selecione pelo menos uma venda para gerar o relatório.');
                    return;
                }
                url += '/vendas';
                method = 'POST';
                body = { ids: selectedSales };
                break;
            case 'clientes':
                url += '/clientes';
                break;
            case 'dashboard':
                if (!filters.dataCompraInicio || !filters.dataCompraFim) {
                    alert('Por favor, selecione a data inicial e final para o relatório do dashboard.');
                    return;
                }
                url += `/dashboard?dataInicial=${filters.dataCompraInicio}&dataFim=${filters.dataCompraFim}`;
                break;
        }

        handleDownload(url, body, method);
        setExportMenuOpen(false);
    };

    const handleExportSingleSale = (format: 'pdf' | 'excel', saleId: number) => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const url = `${apiUrl}relatorio/${format}/vendas`;
        const method = 'POST';
        const body = { ids: [saleId] };

        handleDownload(url, body, method);
        setRowExportMenu(null);
    };

    const toggleSelectAll = () => {
        if (selectedSales.length === vendas.length) {
            setSelectedSales([]);
        } else {
            setSelectedSales(vendas.map((sale) => sale.id));
        }
    };

    const handleSelectSale = (id: number) => {
        setSelectedSales(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setExportMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [exportMenuRef]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (rowExportMenuRef.current && !rowExportMenuRef.current.contains(event.target as Node)) {
                setRowExportMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
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
        setOrderBy(e.target.value);
        setCurrentPage(0);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const halfPagesToShow = Math.floor(maxPagesToShow / 2);
    
        let startPage = Math.max(0, currentPage - halfPagesToShow);
        let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);
    
        if (currentPage < halfPagesToShow) {
            endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
        }
    
        if (currentPage > totalPages - 1 - halfPagesToShow) {
            startPage = Math.max(0, totalPages - maxPagesToShow);
        }
    
        if (startPage > 0) {
            pageNumbers.push(<button key="first" className={`${styles.paginationBtn} ${styles.paginationNumber}`} onClick={() => handlePageChange(0)}>1</button>);
            if (startPage > 1) {
                pageNumbers.push(<span key="start-ellipsis" className={styles.paginationEllipsis}>...</span>);
            }
        }
    
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    className={`${styles.paginationBtn} ${styles.paginationNumber} ${currentPage === i ? styles.active : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i + 1}
                </button>
            );
        }
    
        if (endPage < totalPages - 1) {
            if (endPage < totalPages - 2) {
                pageNumbers.push(<span key="end-ellipsis" className={styles.paginationEllipsis}>...</span>);
            }
            pageNumbers.push(<button key="last" className={`${styles.paginationBtn} ${styles.paginationNumber}`} onClick={() => handlePageChange(totalPages - 1)}>{totalPages}</button>);
        }
    
        return pageNumbers;
    };

    const orderByOptions: { [key: string]: string } = {
        'data': 'Mais Recente',
        'valor': 'Maior Valor',
        'cliente': 'Nome do Cliente'
    };

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
                        <a href="/configuracoes">
                            <div className={`${styles.subMenuItem}`}>Geral</div>
                        </a>
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
                        <div className={styles.filterItem}><input type="text" placeholder="Nº Pedido" name="codigoSolicitacao" value={filters.codigoSolicitacao} onChange={handleFilterChange} className={styles.filterInput} /></div>
                        <div className={styles.filterItem}><input type="text" placeholder="Comprador" name="clienteNome" value={filters.clienteNome} onChange={handleFilterChange} className={styles.filterInput} /></div>
                        <div className={styles.filterItem}>
                            <div className={styles.selectWrapper}>
                                <select className={styles.filterSelect} name="statusVenda" value={filters.statusVenda} onChange={handleFilterChange}><option value="">Status</option><option value="FINALIZADO">Concluído</option><option value="PENDENTE">Pendente</option><option value="CANCELADO">Cancelado</option></select>
                                <FaChevronDown className={styles.selectIcon} />
                            </div>
                        </div>
                        <div className={styles.filterItem}>
                            <div className={styles.selectWrapper}>
                                <select className={styles.filterSelect} name="tipoVenda" value={filters.tipoVenda} onChange={handleFilterChange}><option value="">Tipo de Venda</option><option value="RECORRENTE">Renovação</option><option value="UNICA">Pagamento Único</option></select>
                                <FaChevronDown className={styles.selectIcon} />
                            </div>
                        </div>
                        <div className={styles.filterItem}>
                            <div className={styles.selectWrapper}>
                                <select className={styles.filterSelect} name="metodoPagamento" value={filters.metodoPagamento} onChange={handleFilterChange}><option value="">Forma de Pagamento</option><option value="CARTAO_CREDITO">Cartão de Crédito</option><option value="CARTAO_DEBITO">Cartão de Débito</option><option value="PIX">PIX</option><option value="BOLETO">Boleto</option></select>
                                <FaChevronDown className={styles.selectIcon} />
                            </div>
                        </div>
                        <div className={styles.filterItem}><DateInput id="dataCompraInicio" name="dataCompraInicio" label="Data Pedido de" value={filters.dataCompraInicio} onChange={handleFilterChange} /></div>
                        <div className={styles.filterItem}><DateInput id="dataCompraFim" name="dataCompraFim" label="até" value={filters.dataCompraFim} onChange={handleFilterChange} /></div>
                    </div>
                    <div className={styles.filterRow}>
                        <div className={styles.filterItem}>
                            <div className={styles.selectWrapper}>
                                <select className={styles.filterSelect} name="origemVenda" value={filters.origemVenda} onChange={handleFilterChange}><option value="">Origem da Venda</option><option value="SITE">Site</option><option value="APP">Aplicativo</option></select>
                                <FaChevronDown className={styles.selectIcon} />
                            </div>
                        </div>
                        <div className={styles.filterItem}><input type="text" placeholder="CPF/CNPJ" name="cpfCnpj" value={filters.cpfCnpj} onChange={handleFilterChange} className={styles.filterInput} /></div>
                        <div className={styles.filterItem}>
                            <div className={styles.selectWrapper}>
                                <select className={styles.filterSelect} name="produtoNome" value={filters.produtoNome} onChange={handleFilterChange}><option value="">Produto</option><option value="mensal">Designerflix Mensal</option><option value="anual">Designerflix Anual</option></select>
                                <FaChevronDown className={styles.selectIcon} />
                            </div>
                        </div>
                        <div className={styles.filterItem}><input type="text" placeholder="Cupom" name="cupom" value={filters.cupom} onChange={handleFilterChange} className={styles.filterInput} /></div>
                        <div className={styles.filterItem}>
                            <div className={styles.selectWrapper}>
                                <select className={styles.filterSelect} name="moeda" value={filters.moeda} onChange={handleFilterChange}><option value="">Moeda</option><option value="brl">BRL</option><option value="usd">USD</option><option value="eur">EUR</option></select>
                                <FaChevronDown className={styles.selectIcon} />
                            </div>
                        </div>
                        <div className={styles.filterItem}><DateInput id="dataPagamentoInicio" name="dataPagamentoInicio" label="Data Finalização de" value={filters.dataPagamentoInicio} onChange={handleFilterChange} /></div>
                        <div className={styles.filterItem}><DateInput id="dataPagamentoFim" name="dataPagamentoFim" label="até" value={filters.dataPagamentoFim} onChange={handleFilterChange} /></div>
                    </div>
                    <div className={styles.filterActions}>
                        <div className={styles.filterActionsLeft}>
                            <div className={styles.exportContainer} ref={exportMenuRef}>
                                <button className={styles.btnExport} onClick={() => setExportMenuOpen(prev => !prev)}>
                                    <FaFileExport /> Exportar
                                    <FaChevronDown className={`${styles.exportIcon} ${isExportMenuOpen ? styles.rotate : ''}`} />
                                </button>
                                {isExportMenuOpen && (
                                    <div className={styles.exportMenu}>
                                        <div className={styles.exportMenuGroup}>
                                            <span className={styles.exportMenuTitle}>PDF</span>
                                            <button onClick={() => handleExport('pdf', 'vendas')}><FaFilePdf /> Vendas Selecionadas</button>
                                            <button onClick={() => handleExport('pdf', 'clientes')}><FaFilePdf /> Clientes</button>
                                            <button onClick={() => handleExport('pdf', 'dashboard')}><FaFilePdf /> Dashboard</button>
                                        </div>
                                        <div className={styles.exportMenuGroup}>
                                            <span className={styles.exportMenuTitle}>Excel</span>
                                            <button onClick={() => handleExport('excel', 'vendas')}><FaFileExcel /> Vendas Selecionadas</button>
                                            <button onClick={() => handleExport('excel', 'clientes')}><FaFileExcel /> Clientes</button>
                                            <button onClick={() => handleExport('excel', 'dashboard')}><FaFileExcel /> Dashboard</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button className={styles.btnClear} onClick={handleClearFilters}><FaXmark /> Limpar Filtros</button>
                        </div>
                        <div className={styles.filterActionsRight}>
                            <div className={`${styles.selectWrapper} ${styles.orderByWrapper}`}>
                                <span className={styles.orderByLabel}>Ordenar por :</span>
                                <span className={styles.orderByValue}>{orderByOptions[orderBy]}</span>
                                <FaChevronDown className={styles.selectIcon} />
                                <select className={styles.filterSelect} aria-label="Ordenar por" value={orderBy} onChange={handleOrderByChange}>
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
                                    <th><input type="checkbox" onChange={toggleSelectAll} checked={vendas.length > 0 && selectedSales.length === vendas.length} /></th>
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
                                {loading ? (
                                    <tr><td colSpan={11} style={{ textAlign: 'center' }}>Carregando...</td></tr>
                                ) : fetchError ? (
                                    <tr><td colSpan={11} style={{ textAlign: 'center', color: 'red' }}>{fetchError}</td></tr>
                                ) : (
                                    vendas.map((sale) => (
                                    <tr key={sale.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedSales.includes(sale.id)}
                                                onChange={() => handleSelectSale(sale.id)}
                                            />
                                        </td>
                                        <td>{sale.codigo}</td>
                                        <td>{sale.produto?.nome || 'N/A'}</td>
                                        <td>{new Date(sale.dataCriacao).toLocaleDateString()}</td>
                                        <td>{sale.dataPagamento ? new Date(sale.dataPagamento).toLocaleDateString() : 'N/A'}</td>
                                        <td>{sale.cliente?.nome || 'N/A'}</td>
                                        <td>R$ {sale.comissaoVenda.toFixed(2)}</td>
                                        <td>R$ {sale.valor.toFixed(2)}</td>
                                        <td>{sale.tipoPagamento}</td>
                                        <td><span className={styles.statusConcluido}>{sale.statusVenda}</span></td>
                                        <td className={styles.actionCellContainer}>
                                            <button className={styles.btnAction} onClick={() => setRowExportMenu(rowExportMenu === sale.id ? null : sale.id)}>
                                                <FaFileExport />
                                            </button>
                                            {rowExportMenu === sale.id && (
                                                <div className={styles.rowExportMenu} ref={rowExportMenuRef}>
                                                    <button onClick={() => handleExportSingleSale('pdf', sale.id)}><FaFilePdf /> PDF</button>
                                                    <button onClick={() => handleExportSingleSale('excel', sale.id)}><FaFileExcel /> Excel</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className={styles.paginationContainer}>
                        <div className={styles.paginationInfo}>Exibindo página {currentPage + 1} de {totalPages}</div>
                        <div className={styles.paginationControls}>
                            <button className={`${styles.paginationBtn} ${styles.paginationPrev}`} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}><FaChevronLeft /></button>
                            {renderPageNumbers()}
                            <button className={`${styles.paginationBtn} ${styles.paginationNext}`} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}><FaChevronRight /></button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Relatorios; 