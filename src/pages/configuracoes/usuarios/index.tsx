import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { FaShoppingBag, FaBox, FaCog, FaChevronDown, FaBars, FaSearch, FaSort, FaChevronRight, FaChevronLeft, FaPencilAlt } from 'react-icons/fa';
import { FaArrowRightFromBracket, FaTrashCan } from 'react-icons/fa6';
import logoImage from '../../../assets/img/df.png';

const Usuarios: React.FC = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState(['Configurações']);
    const [view, setView] = useState('table');
    const overlayRef = useRef<HTMLDivElement>(null);

    const initialUsers = Array(7).fill({}).map((_, i) => ({
        id: i + 1,
        name: 'Nome Usuário',
        email: 'email@email.com',
        active: false,
    }));
    const [users, setUsers] = useState(initialUsers);

    useEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay) return;

        if (isSidebarActive) {
            overlay.classList.add(styles.active);
            overlay.style.pointerEvents = 'auto';
            document.body.classList.add('no-scroll');
        } else {
            overlay.classList.remove(styles.active);
            setTimeout(() => {
                if (overlay) overlay.style.pointerEvents = 'none';
            }, 300);
            document.body.classList.remove('no-scroll');
        }
    }, [isSidebarActive]);

    const toggleSidebar = (e: React.MouseEvent) => {
        e.preventDefault();
        setSidebarActive(!isSidebarActive);
    };

    const toggleSubMenu = (menu: string) => {
        setOpenSubMenus(prev =>
            prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
        );
    };

    const handleToggleActive = (id: number) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === id ? { ...user, active: !user.active } : user
            )
        );
    };

    return (
        <div className={styles.mainContainer}>
            <header className={styles.mainHeader}>
                <div className={styles.headerLeft}>
                    <button id="mobileMenuBtn" className={styles.mobileMenuBtn} onClick={toggleSidebar}>
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
                        <a href="/clientes">
                            <div className={styles.subMenuItem}>Clientes</div>
                        </a>
                        <a href="#">
                            <div className={`${styles.subMenuItem} ${styles.active}`}>Usuários</div>
                        </a>
                    </div>
                </nav>
            </aside>
            <div className={`${styles.overlay} ${isSidebarActive ? styles.active : ''}`} id="overlay" ref={overlayRef} onClick={toggleSidebar} />
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                    <h2 className={styles.pageTitle}>Usuários</h2>
                </div>
                {view === 'table' && (
                    <div className={styles.mainPage} id="usuarioTableView">
                        <div className={styles.filterSection}>
                            <div className={styles.filterActions}>
                                <input type="text" placeholder="Cliente" className={styles.filterInput} />
                                <input type="text" placeholder="E-mail" className={styles.filterInput} />
                                <button className={styles.filterInputBtn}>
                                    <FaSearch />
                                    Filtrar
                                </button>
                                <button id="novoUsuarioBtn" className={styles.novoUsuarioBtn} onClick={() => setView('form')}>
                                    Novo Usuário
                                </button>
                            </div>
                        </div>
                        <div className={styles.tableContainer}>
                            <div className={styles.tableResponsive}>
                                <table className={styles.reportTable}>
                                    <thead>
                                        <tr>
                                            <th className={styles.sortable}>
                                                Nome do Usuário <FaSort />
                                            </th>
                                            <th className={styles.sortable}>
                                                e-mail <FaSort />
                                            </th>
                                            <th className={styles.sortable}>Ativo</th>
                                            <th className={styles.sortable}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.name}</td>
                                                <td className={styles.urlText}>{user.email}</td>
                                                <td style={{ width: 51 }}>
                                                    <div className={styles.switchContainer}>
                                                        <input
                                                            type="checkbox"
                                                            className={styles.slideCheckbox}
                                                            id={`cupomAtivo${user.id}`}
                                                            checked={user.active}
                                                            onChange={() => handleToggleActive(user.id)}
                                                        />
                                                        <label className={styles.slideSwitch} htmlFor={`cupomAtivo${user.id}`}>
                                                            <span className={styles.sliderSwitch} />
                                                        </label>
                                                    </div>
                                                </td>
                                                <td className={styles.btnActions}>
                                                    <div className={styles.actionsBtn}>
                                                        <button className={styles.btnEdit}>
                                                            <FaPencilAlt />
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
                    </div>
                )}
                {view === 'form' && (
                    <div id="novoUsuarioView">
                        <div className={styles.contentCard}>
                            <div className={styles.contentCardHeader}>
                                <h2 className={styles.contentCardTitle}>Novo Usuário</h2>
                            </div>
                            <div className={styles.contentCardBody}>
                                <div className={styles.dataSection}>
                                    <div className={styles.dataCol6}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label} htmlFor="nomeUsuario">
                                                Nome do Usuário
                                            </label>
                                            <input type="text" name="nomeUsuario" className={styles.input} />
                                        </div>
                                    </div>
                                    <div className={styles.dataCol6}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label} htmlFor="emailUsuario">
                                                E-mail
                                            </label>
                                            <input type="text" name="emailUsuario" className={styles.input} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.paginationContainerInside}>
                            <div className={styles.paginationControlsInside}>
                                <button
                                    id="btnCancelarUsuario"
                                    className={`${styles.paginationBtnInside} ${styles.btnCancelarUsuario}`}
                                    onClick={() => setView('table')}
                                >
                                    Cancelar
                                </button>
                                <button
                                    id="btnSalvarUsuario"
                                    className={`${styles.paginationBtnInside} ${styles.btnSalvarUsuario}`}
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Usuarios; 