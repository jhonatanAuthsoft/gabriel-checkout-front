import React, { useState, useEffect, useRef } from 'react';
import { IMaskInput, IMask } from 'react-imask';
import styles from './styles.module.css';
import { FaShoppingBag, FaBox, FaCog, FaBars, FaChevronDown, FaSearch, FaSort, FaChevronLeft, FaChevronRight, FaFilePdf, FaFileExcel, FaEdit, FaKey } from 'react-icons/fa';
import { FaArrowRightFromBracket, FaFileExport } from 'react-icons/fa6';
import logoImage from '../../../assets/img/df.png';
import { useNavigate } from 'react-router-dom';

interface Cliente {
    id: number;
    nome: string;
    email: string;
    dataCriacao: string;
    cpf?: string;
    celular?: string;
    permissao?: string;
    endereco?: {
        endereco: string;
        numeroResidencia: string;
        complementoEndereco: string;
        bairro: string;
        cidade: string;
        uf: string;
        cep: string;
    };
    status?: string;
}

const DateInput = ({ id, name, label, value, onChange }: { id: string, name: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        setDisplayValue(value ? value.split('-').reverse().join('/') : '');
    }, [value]);

    const handleAccept = (value: any, mask: any) => {
        setDisplayValue(mask.masked.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        const parts = displayValue.split('/');
        let newValue = '';

        if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);

            const daysInMonth = new Date(year, month, 0).getDate();
            if (day > 0 && day <= daysInMonth && month > 0 && month <= 12 && year > 1900) {
                newValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        const event = {
            target: {
                name,
                value: newValue
            }
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(event);
    };

    const hasValue = !!displayValue;

    return (
        <div className={styles.dateInputWrapper}>
            <IMaskInput
                mask="d/m/Y"
                blocks={{
                    d: {
                        mask: IMask.MaskedRange,
                        from: 1,
                        to: 31,
                        maxLength: 2,
                    },
                    m: {
                        mask: IMask.MaskedRange,
                        from: 1,
                        to: 12,
                        maxLength: 2,
                    },
                    Y: {
                        mask: IMask.MaskedRange,
                        from: 100,
                        to: new Date().getFullYear() + 100,
                    }
                }}
                placeholder=" "
                className={`${styles.filterInput} ${styles.dateInput}`}
                id={id}
                name={name}
                value={displayValue}
                onAccept={handleAccept}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
            />
            <label htmlFor={id} className={`${styles.dateLabel} ${isFocused || hasValue ? styles.dateFocused : ''}`}>
                {label}
            </label>
        </div>
    );
};

const Clientes: React.FC = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState<string[]>(['Configurações']);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [allClients, setAllClients] = useState<Cliente[]>([]);
    const [filteredAndSortedClients, setFilteredAndSortedClients] = useState<Cliente[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroEmail, setFiltroEmail] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isExportMenuOpen, setExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const [editingClient, setEditingClient] = useState<Cliente | null>(null);
    const [newEmail, setNewEmail] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const handleUpdateEmail = async (client: Cliente) => {
        setEditingClient(client);
        setNewEmail(client.email);
        setIsModalOpen(true);
    };

    const handleConfirmUpdateEmail = async () => {
        if (!editingClient || !newEmail) return;

        const token = localStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!token || !apiUrl) {
            alert('Erro de configuração. Tente novamente mais tarde.');
            return;
        }

        try {
            const updatePayload = {
                ...editingClient,
                email: newEmail
            };

            const response = await fetch(`${apiUrl}usuario/atualizar/${editingClient.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatePayload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Falha ao atualizar email.' }));
                throw new Error(errorData.message || 'Falha ao atualizar email.');
            }

            // Atualizar a lista local
            setAllClients(prev => prev.map(client => 
                client.id === editingClient.id 
                    ? { ...client, email: newEmail }
                    : client
            ));

            alert('Email atualizado com sucesso!');
            setIsModalOpen(false);
            setEditingClient(null);
            setNewEmail('');
        } catch (error: any) {
            console.error('Erro ao atualizar email:', error);
            alert(`Erro ao atualizar email: ${error.message}`);
        }
    };

    const handleResendPassword = async (clientId: number) => {
        const token = localStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!token || !apiUrl) {
            alert('Erro de configuração. Tente novamente mais tarde.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}usuario/reenviar-senha/${clientId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Falha ao reenviar senha.' }));
                throw new Error(errorData.message || 'Falha ao reenviar senha.');
            }

            alert('Nova senha enviada para o email do cliente!');
        } catch (error: any) {
            console.error('Erro ao reenviar senha:', error);
            alert(`Erro ao reenviar senha: ${error.message}`);
        }
    };

    useEffect(() => {
        setPage(0);
    }, [filtroNome, filtroEmail, dataInicio, dataFim]);

    useEffect(() => {
        const fetchAllClientes = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('authToken');
            const apiUrl = import.meta.env.VITE_API_URL;
            if (!token || !apiUrl) {
                console.error("Token ou URL da API não encontrados.");
                setIsLoading(false);
                return;
            }

            try {
                let currentPage = 0;
                let fetchedClients: Cliente[] = [];
                let totalPagesFromApi = 1;

                while (currentPage < totalPagesFromApi) {
                    const response = await fetch(`${apiUrl}usuario/listar-todos/clientes?page=${currentPage}&size=10`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('Falha ao buscar clientes.');
                    
                    const data = await response.json();
                    fetchedClients.push(...data.content);
                    totalPagesFromApi = data.totalPages;
                    currentPage++;
                }
                const filteredClients = fetchedClients.filter((user: any) => user.permissao === 'CLIENTE');
                setAllClients(filteredClients);
            } catch (error) {
                console.error("Erro ao buscar clientes:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllClientes();
    }, []);

    useEffect(() => {
        let filtered = [...allClients];

        if (filtroNome) {
            filtered = filtered.filter(client =>
                client.nome.toLowerCase().includes(filtroNome.toLowerCase())
            );
        }

        if (filtroEmail) {
            filtered = filtered.filter(client =>
                client.email.toLowerCase().includes(filtroEmail.toLowerCase())
            );
        }

        if (dataInicio) {
                const [year, month, day] = dataInicio.split('-').map(Number);
                const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
                filtered = filtered.filter(c => {
                    if (!c.dataCriacao) return false;
                    const clientDate = new Date(c.dataCriacao);
                    return clientDate >= startDate;
                });
            }
            if (dataFim) {
                const [year, month, day] = dataFim.split('-').map(Number);
                const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
                filtered = filtered.filter(c => {
                    if (!c.dataCriacao) return false;
                    const clientDate = new Date(c.dataCriacao);
                    return clientDate <= endDate;
                });
            }

        // Ordenar por data de criação decrescente (mais recentes primeiro)
        filtered.sort((a, b) => {
            const timeA = new Date(a.dataCriacao).getTime();
            const timeB = new Date(b.dataCriacao).getTime();

            if (isNaN(timeA)) return 1;
            if (isNaN(timeB)) return -1;

            return timeB - timeA;
        });

        setFilteredAndSortedClients(filtered);
        setPage(0);
    }, [allClients, filtroNome, filtroEmail, dataInicio, dataFim]);

    useEffect(() => {
        const itemsPerPage = 10;
        setTotalPages(Math.ceil(filteredAndSortedClients.length / itemsPerPage));

        const paginatedClients = filteredAndSortedClients.slice(
            page * itemsPerPage,
            (page + 1) * itemsPerPage
        );
        setClientes(paginatedClients);
    }, [filteredAndSortedClients, page]);

    const handleDownload = async (format: 'pdf' | 'excel') => {
        const token = localStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!token || !apiUrl) {
            alert('Erro de configuração. Tente novamente mais tarde.');
            return;
        }

        let url = `${apiUrl}relatorio/${format}/clientes`;
        const params = new URLSearchParams();
        if (dataInicio) {
            params.append('dataInicial', dataInicio);
        }
        if (dataFim) {
            params.append('dataFim', dataFim);
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Falha ao gerar o relatório.' }));
                throw new Error(errorData.message || 'Falha ao gerar o relatório.');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `clientes.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error: any) {
            console.error("Erro ao baixar o relatório:", error);
            alert(`Erro ao baixar o relatório: ${error.message}`);
        }
        setExportMenuOpen(false);
    };

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
    }, []);
    
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
                    <div className={styles.filterRow}>
                        <div className={styles.filterItem}>
                            <input type="text" placeholder="Cliente" className={styles.filterInput} value={filtroNome} onChange={(e) => { setFiltroNome(e.target.value); setPage(0); }} />
                        </div>
                        <div className={styles.filterItem}>
                            <input type="text" placeholder="E-mail" className={styles.filterInput} value={filtroEmail} onChange={(e) => { setFiltroEmail(e.target.value); setPage(0); }} />
                        </div>
                        <div className={styles.filterItem}>
                            <DateInput id="dataInicio" name="dataInicio" label="Data Cadastro de" value={dataInicio} onChange={(e) => { setDataInicio(e.target.value); setPage(0); }} />
                        </div>
                        <div className={styles.filterItem}>
                            <DateInput id="dataFim" name="dataFim" label="até" value={dataFim} onChange={(e) => { setDataFim(e.target.value); setPage(0); }} />
                        </div>
                    </div>
                    <div className={styles.filterActions}>
                        <div className={styles.exportContainer} ref={exportMenuRef}>
                            <button className={styles.exportInputBtn} onClick={() => setExportMenuOpen(prev => !prev)}>
                                <FaFileExport />
                                Exportar
                                <FaChevronDown className={`${styles.exportIcon} ${isExportMenuOpen ? styles.rotate : ''}`} />
                            </button>
                            {isExportMenuOpen && (
                                <div className={styles.exportMenu}>
                                    <button onClick={() => handleDownload('pdf')}><FaFilePdf /> Exportar PDF</button>
                                    <button onClick={() => handleDownload('excel')}><FaFileExcel /> Exportar Excel</button>
                                </div>
                            )}
                        </div>
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
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className={styles.loadingCell}>Carregando clientes...</td>
                                    </tr>
                                ) : clientes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className={styles.noDataCell}>Nenhum cliente encontrado.</td>
                                    </tr>
                                ) : (
                                    clientes.map((client) => {
                                        const formattedDate = client.dataCriacao ? client.dataCriacao.substring(0, 10).split('-').reverse().join('/') : '';
                                        return (
                                            <tr key={client.id}>
                                                <td>{client.nome}</td>
                                                <td className={styles.urlText}>{client.email}</td>
                                                <td>{formattedDate}</td>
                                                <td>
                                                    <div className={styles.actionButtons}>
                                                        <button 
                                                            className={styles.actionBtn} 
                                                            onClick={() => handleUpdateEmail(client)}
                                                            title="Atualizar Email"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button 
                                                            className={styles.actionBtn} 
                                                            onClick={() => handleResendPassword(client.id)}
                                                            title="Reenviar Senha"
                                                        >
                                                            <FaKey />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
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
            
            {/* Modal para editar email */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Atualizar Email do Cliente</h3>
                        <p><strong>Cliente:</strong> {editingClient?.nome}</p>
                        <div className={styles.modalField}>
                            <label htmlFor="newEmail">Novo Email:</label>
                            <input
                                type="email"
                                id="newEmail"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className={styles.modalInput}
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button 
                                className={styles.modalBtnCancel} 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingClient(null);
                                    setNewEmail('');
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.modalBtnConfirm} 
                                onClick={handleConfirmUpdateEmail}
                                disabled={!newEmail || newEmail === editingClient?.email}
                            >
                                Atualizar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clientes;