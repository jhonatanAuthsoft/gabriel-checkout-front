import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { FaShoppingBag, FaCog, FaSearch } from 'react-icons/fa';
import { FaBars, FaArrowRightFromBracket, FaChevronDown, FaBox, FaArrowRightArrowLeft, FaPencil, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import logoImage from '../../../assets/img/df.png';
import productPlaceholder from '../../../assets/img/dfCirculo.png';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: number;
    nome: string;
    codigo: string;
    valor: number;
    status: string;
    imagens: string;
}

interface Page<T> {
    content: T[];
    totalPages: number;
    number: number;
}

const MeusProdutos = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState(['Produtos']);
    const [orderBy, setOrderBy] = useState('Novos');
    const [searchTerm, setSearchTerm] = useState('');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    const [recentlyChangedId, setRecentlyChangedId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const productsPerPage = 10;

    const productsToDisplay = allProducts
        .filter(p => showInactive || p.status === 'ATIVO' || p.id === recentlyChangedId)
        .sort((a, b) => {
            if (a.status === b.status) {
                return b.id - a.id;
            }
            return a.status === 'ATIVO' ? -1 : 1;
        });

    const totalPages = Math.ceil(productsToDisplay.length / productsPerPage);
    const paginatedProducts = productsToDisplay.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    const fetchProducts = async (name = '') => {
        setRecentlyChangedId(null);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL;
        const apiToken = localStorage.getItem('authToken');

        if (!apiUrl || !apiToken) {
            setError('API não configurada ou token ausente.');
            return;
        }

        try {
            const fetchedProducts = [];
            let currentPage = 0;
            let totalPages = 1;

            while (currentPage < totalPages) {
                const params = new URLSearchParams({
                    nome_busca: name,
                    page: currentPage.toString(),
                    size: '100',
                });
                const response = await fetch(`${apiUrl}produto/listar-todos?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${apiToken}` },
                });

                if (!response.ok) throw new Error('Falha ao buscar produtos.');

                const data: Page<Product> = await response.json();
                fetchedProducts.push(...data.content);
                totalPages = data.totalPages;
                currentPage++;
            }
            setAllProducts(fetchedProducts);
            setCurrentPage(1);
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [showInactive]);

    const handleStatusChange = async (productId: number, newStatus: string) => {
        setError(null);
        try {
            const apiToken = localStorage.getItem('authToken');
            const apiUrl = import.meta.env.VITE_API_URL;
            if (!apiUrl || !apiToken) {
                setError("API não configurada ou token ausente.");
                return;
            }

            const response = await fetch(`${apiUrl}produto/alterar-status/${productId}/${newStatus}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${apiToken}` },
            });

            if (response.ok) {
                setAllProducts(prevProducts =>
                    prevProducts.map(p =>
                        p.id === productId ? { ...p, status: newStatus } : p
                    )
                );
                setRecentlyChangedId(productId);
            } else {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || 'Não foi possível alterar o status do produto.');
            }
        } catch (err) {
            setError('Erro de comunicação. Verifique sua conexão e tente novamente.');
        }
    };

    const handleEdit = (productId: number) => {
        navigate(`/produtos/editar/${productId}`);
    };

    const toggleMobileMenu = () => {
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

    const handleSearch = () => {
        fetchProducts(searchTerm);
    };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };
    
    const handleOrderByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      setOrderBy(selectedOption.text);
    }

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
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
                    <button onClick={handleLogout} className={styles.exitButton}>
                        <FaArrowRightFromBracket />
                    </button>
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
                        <a href="/relatorios">
                            <div className={styles.subMenuItem}>Relatórios</div>
                        </a>
                    </div>

                    <div className={styles.navItem} onClick={() => toggleSubMenu('Produtos')}>
                        <FaBox />
                        <span>Produtos</span>
                        <FaChevronDown className={`${styles.expandIcon} ${openSubMenus.includes('Produtos') ? styles.rotate : ''}`} />
                    </div>
                    <div className={styles.subMenu} style={{ display: openSubMenus.includes('Produtos') ? 'block' : 'none' }}>
                        <a href="#">
                            <div className={`${styles.subMenuItem} ${styles.active}`}>Meus Produtos</div>
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
            <div className={styles.overlay} id="overlay" ref={overlayRef} onClick={toggleMobileMenu} />
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                    <h2 className={styles.pageTitle}>Meus Produtos</h2>
                    <div className={styles.filterActions}>
                        <div className={styles.filterActionsLeft}>
                            <div className={styles.searchWrapper}>
                                <FaSearch className={styles.searchIcon} onClick={handleSearch} />
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Pesquisar"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyUp={handleKeyUp}
                                />
                            </div>
                            <div className={styles.checkboxWrapper}>
                                <input
                                    type="checkbox"
                                    id="showInactive"
                                    checked={showInactive}
                                    onChange={(e) => setShowInactive(e.target.checked)}
                                    className={styles.checkboxInput}
                                />
                                <label htmlFor="showInactive" className={styles.checkboxLabel}>Mostrar inativos</label>
                            </div>
                        </div>
                        <div className={styles.filterActionsRight}>
                            <div className={styles.selectWrapper + ' ' + styles.orderByWrapper}>
                                <span className={styles.orderByLabel}>Ordenar por :</span>
                                <span className={styles.orderByValue}>{orderBy}</span>
                                <FaChevronDown className={styles.selectIcon} />
                                <select className={styles.filterSelect} aria-label="Ordenar por" onChange={handleOrderByChange}>
                                    <option value="data">Novos</option>
                                    <option value="valor">Mais Caros</option>
                                    <option value="cliente">Mais Baratos</option>
                                    <option value="cliente">Mais Vendidos</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                {error && <div className={styles.errorBanner}>{error}</div>}
                <div className={styles.tableContainer}>
                    <div className={styles.tableResponsive}>
                        <table className={styles.reportTable}>
                            <thead>
                                <tr>
                                    <th className={styles.productImageHeader} />
                                    <th className={styles.sortable}>
                                        Nome do Produto{" "}
                                        <FaArrowRightArrowLeft style={{ transform: "scale(1.5) rotate(90deg)" }} />
                                    </th>
                                    <th className={styles.sortable}>Código</th>
                                    <th className={styles.sortable}>Preço</th>
                                    <th className={styles.sortable}>Afiliados</th>
                                    <th className={styles.sortable}>Vendas</th>
                                    <th className={`${styles.sortable} ${styles.textCenter}`}>Status</th>
                                    <th className={`${styles.sortable} ${styles.textCenter}`}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProducts.map(product => (
                                    <tr key={product.id}>
                                        <td className={styles.productImageCell}>
                                            <div className={styles.productImage}>
                                                <img src={product.imagens || productPlaceholder} alt={product.nome ?? 'Produto sem nome'} />
                                            </div>
                                        </td>
                                        <td>{product.nome ?? 'N/A'}</td>
                                        <td>{product.codigo ?? 'N/A'}</td>
                                        <td>{`R$ ${product.valor?.toFixed(2) ?? '0.00'}`}</td>
                                        <td>0</td>
                                        <td>0</td>
                                        <td className={`${styles.textCenter} ${styles.statusCell}`}>
                                            <label className={styles.switch}>
                                                <input
                                                    type="checkbox"
                                                    checked={product.status === 'ATIVO'}
                                                    onChange={() => handleStatusChange(product.id, product.status === 'ATIVO' ? 'INATIVO' : 'ATIVO')}
                                                />
                                                <span className={`${styles.slider} ${styles.round}`}></span>
                                            </label>
                                        </td>
                                        <td className={styles.btnActions}>
                                            <div className={styles.actionsBtn}>
                                                <button className={styles.btnEdit} onClick={() => handleEdit(product.id)}>
                                                    <FaPencil />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styles.paginationContainer}>
                    <div className={styles.paginationInfo}>Exibindo página {currentPage} de {totalPages}</div>
                    <div className={styles.paginationControls}>
                        <button className={`${styles.paginationBtn} ${styles.paginationPrev}`} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            <FaChevronLeft />
                        </button>
                        {[...Array(totalPages).keys()].map(p => (
                             <button key={p} className={`${styles.paginationBtn} ${styles.paginationNumber} ${currentPage === p + 1 ? styles.active : ''}`} onClick={() => handlePageChange(p + 1)}>
                                {p + 1}
                            </button>
                        ))}
                        <button className={`${styles.paginationBtn} ${styles.paginationNext}`} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MeusProdutos; 