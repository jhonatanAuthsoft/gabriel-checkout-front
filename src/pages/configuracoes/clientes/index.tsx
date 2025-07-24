import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { FaShoppingBag, FaBox, FaCog, FaBars, FaChevronDown, FaSearch, FaSort, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaArrowRightFromBracket, FaArrowUpRightFromSquare } from 'react-icons/fa6';
import logoImage from '../../../assets/img/df.png';
import { useNavigate } from 'react-router-dom';

interface Cliente {
    id: number;
    nome: string;
    email: string;
    dataCriacao: string;
}

const Clientes: React.FC = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState<string[]>(['Configurações']);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    useEffect(() => {
        const fetchClientes = async () => {
            const token = localStorage.getItem('authToken');
            const apiUrl = import.meta.env.VITE_API_URL;
            if (!token || !apiUrl) {
                console.error("Token ou URL da API não encontrados.");
                return;
            }

            try {
                const response = await fetch(`${apiUrl}usuario/listar-todos/clientes?page=${page}&size=10`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Falha ao buscar clientes.');
                }
                const data = await response.json();
                setClientes(data.content || []);
                setTotalPages(data.totalPages || 0);
            } catch (error) {
                console.error("Erro ao buscar clientes:", error);
            }
        };

        fetchClientes();
    }, [page]);

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
    
    const renderPaginationButtons = () => {
        const pageNumbers = [];
        const pagesToShow = 3; 
        let startPage = Math.max(0, page - 1);
        let endPage = Math.min(totalPages - 1, page + 1);

        if (page === 0) {
            endPage = Math.min(totalPages - 1, pagesToShow - 1);
        }
        if (page === totalPages - 1) {
            startPage = Math.max(0, totalPages - pagesToShow);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button key={i} onClick={() => setPage(i)} className={`${styles.paginationBtn} ${styles.paginationNumber} ${page === i ? styles.active : ''}`}>
                    {i + 1}
                </button>
            );
        }
        return pageNumbers;
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
                                </tr>
                            </thead>
                            <tbody>
                                {clientes.map((client) => (
                                    <tr key={client.id}>
                                        <td>{client.nome}</td>
                                        <td className={styles.urlText}>{client.email}</td>
                                        <td>{client.dataCriacao ? new Date(client.dataCriacao).toLocaleDateString('pt-BR') : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styles.paginationContainer}>
                    <div className={styles.paginationInfo}>Exibindo página {page + 1} de {totalPages}</div>
                    <div className={styles.paginationControls}>
                        <button className={`${styles.paginationBtn} ${styles.paginationPrev}`} onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                            <FaChevronLeft />
                        </button>
                        {page > 1 && (
                             <>
                                <button onClick={() => setPage(0)} className={`${styles.paginationBtn} ${styles.paginationNumber}`}>1</button>
                                <span className={styles.paginationEllipsis}>...</span>
                             </>
                        )}
                        {renderPaginationButtons()}
                        {page < totalPages - 2 && (
                            <>
                                <span className={styles.paginationEllipsis}>...</span>
                                <button onClick={() => setPage(totalPages - 1)} className={`${styles.paginationBtn} ${styles.paginationNumber}`}>{totalPages}</button>
                            </>
                        )}
                        <button className={`${styles.paginationBtn} ${styles.paginationNext}`} onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Clientes; 