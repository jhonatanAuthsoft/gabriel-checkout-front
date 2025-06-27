import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { FaShoppingBag, FaBox, FaCog, FaBars, FaChevronDown, FaSearch, FaSort, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaArrowRightFromBracket, FaArrowUpRightFromSquare } from 'react-icons/fa6';
import logoImage from '../../../assets/img/df.png';

const Clientes = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState(['Configurações']);
    const overlayRef = useRef<HTMLDivElement>(null);

    const initialClients = Array(7).fill({}).map((_, i) => ({
        id: i + 1,
        name: 'Nome Cliente',
        email: 'email@email.com',
        date: 'dd/mm/aaaa',
        active: false,
    }));

    const [clients, setClients] = useState(initialClients);

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
    
    const handleToggleActive = (id: number) => {
        setClients(prevClients =>
            prevClients.map(client =>
                client.id === id ? { ...client, active: !client.active } : client
            )
        );
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
                        <a href="#">
                            <div className={`${styles.subMenuItem} ${styles.active}`}>Clientes</div>
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
                    <h2 className={styles.pageTitle}>Clientes</h2>
                </div>
                <div className={styles.filterSection}>
                    <div className={styles.filterActions}>
                        <input type="text" placeholder="Cliente" className={styles.filterInput} />
                        <input type="text" placeholder="E-mail" className={styles.filterInput} />
                        <button className={styles.filterInputBtn}>
                            <FaSearch />
                            Filtrar
                        </button>
                        <button className={styles.exportInputBtn}>
                            <FaArrowRightFromBracket />
                            Exportar
                        </button>
                    </div>
                </div>
                <div className={styles.tableContainer}>
                    <div className={styles.tableResponsive}>
                        <table className={styles.reportTable}>
                            <thead>
                                <tr>
                                    <th className={styles.sortable}>Nome do Cliente <FaSort /></th>
                                    <th className={styles.sortable}>e-mail <FaSort /></th>
                                    <th className={styles.sortable}>Data Cadastro <FaSort /></th>
                                    <th className={styles.sortable}>Ativo</th>
                                    <th className={styles.sortable}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id}>
                                        <td>{client.name}</td>
                                        <td className={styles.urlText}>{client.email}</td>
                                        <td>{client.date}</td>
                                        <td style={{ width: 51 }}>
                                            <div className={styles.switchContainer}>
                                                <input
                                                    type="checkbox"
                                                    className={styles.slideCheckbox}
                                                    id={`client-active-${client.id}`}
                                                    checked={client.active}
                                                    onChange={() => handleToggleActive(client.id)}
                                                />
                                                <label className={styles.slideSwitch} htmlFor={`client-active-${client.id}`}>
                                                    <span className={styles.sliderSwitch} />
                                                </label>
                                            </div>
                                        </td>
                                        <td>
                                            <button className={styles.btnAction}>
                                                <FaArrowUpRightFromSquare />
                                            </button>
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

export default Clientes; 