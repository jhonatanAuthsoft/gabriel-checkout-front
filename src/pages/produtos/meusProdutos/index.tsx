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
    const [productsPage, setProductsPage] = useState<Page<Product>>({ content: [], totalPages: 0, number: 0 });
    const [error, setError] = useState<string | null>(null);
    const [showInactive, setShowInactive] = useState(false);

    const navigate = useNavigate();
    const overlayRef = useRef<HTMLDivElement>(null);

    const fetchProducts = async (page = 0, size = 10, name = '') => {
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL;
        const apiToken = localStorage.getItem('authToken');

        if (!apiUrl || !apiToken) {
            setError('API não configurada ou token ausente.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}produto/listar-todos?page=${page}&size=${size}&nome_busca=${name}`, {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar produtos.');
            }

            const data: Page<Product> = await response.json();
            console.log('API Response - Products:', data.content);
            setProductsPage(data);
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts(0, 10, searchTerm);
    }, [searchTerm]);

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
                setProductsPage(prevPage => ({
                    ...prevPage,
                    content: prevPage.content.map(product =>
                        product.id === productId
                            ? { ...product, status: newStatus }
                            : product
                    ),
                }));
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
        fetchProducts(0, 10, searchTerm);
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
                                {productsPage.content
                                    .filter(p => showInactive || p.status?.toUpperCase() === 'ATIVO')
                                    .map(product => (
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
                                                    checked={product.status?.toUpperCase() === 'ATIVO'}
                                                    onChange={() => handleStatusChange(product.id, product.status?.toUpperCase() === 'ATIVO' ? 'INATIVO' : 'ATIVO')}
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
                    <div className={styles.paginationInfo}>Exibindo página {productsPage.number + 1} de {productsPage.totalPages}</div>
                    <div className={styles.paginationControls}>
                        <button className={`${styles.paginationBtn} ${styles.paginationPrev}`} onClick={() => fetchProducts(productsPage.number - 1)} disabled={productsPage.number === 0}>
                            <FaChevronLeft />
                        </button>
                        {[...Array(productsPage.totalPages).keys()].map(pageNumber => (
                             <button key={pageNumber} className={`${styles.paginationBtn} ${styles.paginationNumber} ${productsPage.number === pageNumber ? styles.active : ''}`} onClick={() => fetchProducts(pageNumber)}>
                                {pageNumber + 1}
                            </button>
                        ))}
                        <button className={`${styles.paginationBtn} ${styles.paginationNext}`} onClick={() => fetchProducts(productsPage.number + 1)} disabled={productsPage.number >= productsPage.totalPages - 1}>
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MeusProdutos; 