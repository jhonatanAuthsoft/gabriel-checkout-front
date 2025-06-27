import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { FaShoppingBag, FaCog, FaSearch } from 'react-icons/fa';
import { FaBars, FaArrowRightFromBracket, FaChevronDown, FaBox, FaArrowRightArrowLeft, FaPencil, FaTrashCan, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import logoImage from '../../../assets/img/df.png';
import productPlaceholder from '../../../assets/img/dfCirculo.png';

const MeusProdutos = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState(['Produtos']);
    const [orderBy, setOrderBy] = useState('Novos');
    const [searchTerm, setSearchTerm] = useState('');

    const initialProducts = [
        { id: 1, name: 'Produto 1', code: '999999', price: 'R$ 000,00', affiliates: 0, sales: 0, status: 'Status do Produto', image: productPlaceholder },
        { id: 2, name: 'Produto 2', code: '999999', price: 'R$ 100,00', affiliates: 5, sales: 10, status: 'Status do Produto', image: productPlaceholder },
        { id: 3, name: 'Produto 3', code: '999999', price: 'R$ 150,00', affiliates: 2, sales: 8, status: 'Status do Produto', image: productPlaceholder },
        { id: 4, name: 'Produto 4', code: '999999', price: 'R$ 200,00', affiliates: 10, sales: 25, status: 'Status do Produto', image: productPlaceholder },
        { id: 5, name: 'Produto 5', code: '999999', price: 'R$ 50,00', affiliates: 1, sales: 3, status: 'Status do Produto', image: productPlaceholder },
        { id: 6, name: 'Produto 6', code: '999999', price: 'R$ 300,00', affiliates: 15, sales: 50, status: 'Status do Produto', image: productPlaceholder },
    ];

    const [products, setProducts] = useState(initialProducts);
    const overlayRef = useRef<HTMLDivElement>(null);


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
        const term = searchTerm.trim().toLowerCase();
        if (!term) {
            setProducts(initialProducts);
            return;
        }
        const filteredProducts = initialProducts.filter(p => 
            p.name.toLowerCase().includes(term)
        );
        setProducts(filteredProducts);
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
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td className={styles.productImageCell}>
                                            <div className={styles.productImage}>
                                                <img src={product.image} alt={product.name} />
                                            </div>
                                        </td>
                                        <td>{product.name}</td>
                                        <td>{product.code}</td>
                                        <td>{product.price}</td>
                                        <td>{product.affiliates}</td>
                                        <td>{product.sales}</td>
                                        <td className={styles.textCenter}>
                                            <span className={styles.statusProduto}>{product.status}</span>
                                        </td>
                                        <td className={styles.btnActions}>
                                            <div className={styles.actionsBtn}>
                                                <button className={styles.btnEdit}>
                                                    <FaPencil />
                                                </button>
                                                <button className={styles.btnDelete}>
                                                    <FaTrashCan />
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
                    <div className={styles.paginationInfo}>Exibindo página 1 de 20</div>
                    <div className={styles.paginationControls}>
                        <button className={`${styles.paginationBtn} ${styles.paginationPrev}`}>
                            <FaChevronLeft />
                        </button>
                        <button className={`${styles.paginationBtn} ${styles.paginationNumber} ${styles.active}`}>1</button>
                        <button className={`${styles.paginationBtn} ${styles.paginationNumber}`}>2</button>
                        <button className={`${styles.paginationBtn} ${styles.paginationNumber}`}>3</button>
                        <button className={`${styles.paginationBtn} ${styles.paginationNumber}`}>4</button>
                        <span className={styles.paginationEllipsis}>...</span>
                        <button className={`${styles.paginationBtn} ${styles.paginationNumber}`}>20</button>
                        <button className={`${styles.paginationBtn} ${styles.paginationNext}`}>
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MeusProdutos; 