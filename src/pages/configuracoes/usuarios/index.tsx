import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { FaShoppingBag, FaBox, FaCog, FaChevronDown, FaBars, FaSearch, FaSort, FaChevronRight, FaChevronLeft, FaPencilAlt } from 'react-icons/fa';
import { FaArrowRightFromBracket, FaTrashCan } from 'react-icons/fa6';
import logoImage from '../../../assets/img/df.png';
import { useNavigate } from 'react-router-dom';

interface Usuario {
    id: number;
    nome: string;
    email: string;
    ativo: boolean;
    permissao: string;
    cpf: string;
    celular: string;
    endereco: {
        endereco: string;
        numeroResidencia: string;
        complementoEndereco: string;
        bairro: string;
        cidade: string;
        uf: string;
        cep: string;
    };
}

const initialUserState = {
    nome: '',
    email: '',
    permissao: 'FUNCIONARIO',
    cpf: '',
    celular: '',
    endereco: {
        endereco: '',
        numeroResidencia: '',
        complementoEndereco: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: '',
    },
};

const Usuarios: React.FC = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState<string[]>(['Configurações']);
    const [view, setView] = useState('table');
    const overlayRef = useRef<HTMLDivElement>(null);
    const [allUsers, setAllUsers] = useState<Usuario[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroEmail, setFiltroEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [newUser, setNewUser] = useState(initialUserState);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    useEffect(() => {
        const fetchAllUsuarios = async () => {
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
                let fetchedUsers: Usuario[] = [];
                let totalPagesFromApi = 1;

                while (currentPage < totalPagesFromApi) {
                    const response = await fetch(`${apiUrl}usuario/listar-todos/usuarios?page=${currentPage}&size=10`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('Falha ao buscar usuários.');
                    
                    const data = await response.json();
                    fetchedUsers.push(...data.content);
                    totalPagesFromApi = data.totalPages;
                    currentPage++;
                }
                setAllUsers(fetchedUsers);
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (view === 'table') {
            fetchAllUsuarios();
        }
    }, [view]);

    useEffect(() => {
        let filtered = allUsers.filter(user =>
            user.permissao === 'ADMIN' || user.permissao === 'FUNCIONARIO'
        );

        if (filtroNome) {
            filtered = filtered.filter(user =>
                user.nome.toLowerCase().includes(filtroNome.toLowerCase())
            );
        }

        if (filtroEmail) {
            filtered = filtered.filter(user =>
                user.email.toLowerCase().includes(filtroEmail.toLowerCase())
            );
        }

        const itemsPerPage = 10;
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        
        const paginatedUsers = filtered.slice(
            page * itemsPerPage,
            (page + 1) * itemsPerPage
        );
        setUsuarios(paginatedUsers);

    }, [allUsers, page, filtroNome, filtroEmail]);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const stateToUpdate = editingUser ? setEditingUser : setNewUser;

        stateToUpdate((prev: any) => {
        if (name.startsWith('endereco.')) {
            const field = name.split('.')[1];
                return {
                ...prev,
                endereco: {
                    ...prev.endereco,
                    [field]: value,
                },
                };
        } else {
                return { ...prev, [name]: value };
        }
        });
    };

    const handleSaveUser = async () => {
        const token = localStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!token || !apiUrl) {
            alert('Erro de configuração. Tente novamente mais tarde.');
            return;
        }

        const userToSave = editingUser || newUser;
        const { nome, email, permissao, cpf, celular, endereco } = userToSave as any;

        if (!nome || !email) {
            alert('Nome e e-mail são obrigatórios.');
            return;
        }

        const payload: any = { nome, email, permissao };

        if (cpf) payload.cpf = cpf;
        if (celular) payload.celular = celular;

        const hasAddressInfo = endereco && Object.values(endereco).some(field => typeof field === 'string' && field.trim() !== '');
        if (hasAddressInfo) {
            payload.endereco = endereco;
        }

        const url = editingUser ? `${apiUrl}usuario/atualizar/${editingUser.id}` : `${apiUrl}usuario/cadastrar`;
        const method = editingUser ? 'PATCH' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(`Usuário ${editingUser ? 'atualizado' : 'criado'} com sucesso!`);
                setNewUser(initialUserState);
                setEditingUser(null);
                setView('table');
            } else {
                const errorData = await response.json();
                alert(`Falha ao ${editingUser ? 'atualizar' : 'criar'} usuário: ${errorData.message || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error(`Erro ao ${editingUser ? 'atualizar' : 'criar'} usuário:`, error);
            alert('Erro ao conectar com o servidor.');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm('Tem certeza que deseja deletar este usuário?')) {
            return;
        }

        const token = localStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!token || !apiUrl) {
            alert('Erro de configuração. Tente novamente mais tarde.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}usuario/deletar/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Usuário deletado com sucesso!');
                setUsuarios(prev => prev.filter(u => u.id !== userId));
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                alert(`Falha ao deletar usuário: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            alert('Erro ao conectar com o servidor.');
        }
    };

    const handleEditClick = (usuario: Usuario) => {
        setEditingUser(usuario);
        setView('form');
    };

    const handleCancel = () => {
        setView('table');
        setNewUser(initialUserState);
        setEditingUser(null);
    };

    const handleToggleActive = (id: number) => {
        setUsuarios(prevUsers =>
            prevUsers.map(user =>
                user.id === id ? { ...user, ativo: !user.ativo } : user
            )
        );
    };

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
                    <button id="mobileMenuBtn" className={styles.mobileMenuBtn} onClick={toggleSidebar}>
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
                                <input type="text" placeholder="Nome do Usuário" className={styles.filterInput} value={filtroNome} onChange={(e) => { setFiltroNome(e.target.value); setPage(0); }} />
                                <input type="text" placeholder="E-mail" className={styles.filterInput} value={filtroEmail} onChange={(e) => { setFiltroEmail(e.target.value); setPage(0); }} />
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
                                            <th className={styles.sortable}>Perfil</th>
                                            <th className={styles.sortable}>Ativo</th>
                                            <th className={styles.sortable}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.nome}</td>
                                                <td className={styles.urlText}>{user.email}</td>
                                                <td>{user.permissao}</td>
                                                <td style={{ width: 51 }}>
                                                    <div className={styles.switchContainer}>
                                                        <input
                                                            type="checkbox"
                                                            className={styles.slideCheckbox}
                                                            id={`cupomAtivo${user.id}`}
                                                            checked={user.ativo}
                                                            onChange={() => handleToggleActive(user.id)}
                                                        />
                                                        <label className={styles.slideSwitch} htmlFor={`cupomAtivo${user.id}`}>
                                                            <span className={styles.sliderSwitch} />
                                                        </label>
                                                    </div>
                                                </td>
                                                <td className={styles.btnActions}>
                                                    <div className={styles.actionsBtn}>
                                                        <button className={styles.btnEdit} onClick={() => handleEditClick(user)}>
                                                            <FaPencilAlt />
                                                        </button>
                                                        <button className={styles.btnDelete} onClick={() => handleDeleteUser(user.id)}>
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
                    </div>
                )}
                {view === 'form' && (
                    <div id="novoUsuarioView">
                        <div className={styles.contentCard}>
                            <div className={styles.contentCardHeader}>
                                <h2 className={styles.contentCardTitle}>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                            </div>
                            <div className={styles.contentCardBody}>
                                <div className={styles.dataSection}>
                                    <div className={styles.dataCol6}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label} htmlFor="nome">
                                                Nome do Usuário
                                            </label>
                                            <input type="text" name="nome" className={styles.input} value={editingUser?.nome || newUser.nome} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className={styles.dataCol6}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label} htmlFor="email">
                                                E-mail
                                            </label>
                                            <input type="email" name="email" className={styles.input} value={editingUser?.email || newUser.email} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className={styles.dataCol6}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label} htmlFor="permissao">
                                                Perfil
                                            </label>
                                            <div className={styles.selectWrapper}>
                                                <select name="permissao" className={styles.filterSelect} value={editingUser?.permissao || newUser.permissao} onChange={handleInputChange}>
                                                    <option value="FUNCIONARIO">Funcionário</option>
                                                    <option value="ADMIN">Administrador</option>
                                                </select>
                                                <FaChevronDown className={styles.selectIcon} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.dataCol6}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label} htmlFor="cpf">CPF (Opcional)</label>
                                            <input type="text" name="cpf" className={styles.input} value={editingUser?.cpf || newUser.cpf} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className={styles.dataCol6}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label} htmlFor="celular">Celular (Opcional)</label>
                                            <input type="text" name="celular" className={styles.input} value={editingUser?.celular || newUser.celular} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={styles.addressSection}>
                                    <h4 className={styles.addressTitle}>Endereço (Opcional)</h4>
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol6}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="endereco.cep">CEP</label>
                                                <input type="text" name="endereco.cep" className={styles.input} value={editingUser?.endereco?.cep || newUser.endereco.cep} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol6}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="endereco.endereco">Endereço</label>
                                                <input type="text" name="endereco.endereco" className={styles.input} value={editingUser?.endereco?.endereco || newUser.endereco.endereco} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol6}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="endereco.numeroResidencia">Número</label>
                                                <input type="text" name="endereco.numeroResidencia" className={styles.input} value={editingUser?.endereco?.numeroResidencia || newUser.endereco.numeroResidencia} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol6}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="endereco.complementoEndereco">Complemento</label>
                                                <input type="text" name="endereco.complementoEndereco" className={styles.input} value={editingUser?.endereco?.complementoEndereco || newUser.endereco.complementoEndereco} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol6}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="endereco.bairro">Bairro</label>
                                                <input type="text" name="endereco.bairro" className={styles.input} value={editingUser?.endereco?.bairro || newUser.endereco.bairro} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol6}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="endereco.cidade">Cidade</label>
                                                <input type="text" name="endereco.cidade" className={styles.input} value={editingUser?.endereco?.cidade || newUser.endereco.cidade} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol6}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="endereco.uf">UF</label>
                                                <input type="text" name="endereco.uf" className={styles.input} value={editingUser?.endereco?.uf || newUser.endereco.uf} onChange={handleInputChange} />
                                            </div>
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
                                    onClick={handleCancel}
                                >
                                    Cancelar
                                </button>
                                <button
                                    id="btnSalvarUsuario"
                                    className={`${styles.paginationBtnInside} ${styles.btnSalvarUsuario}`}
                                    onClick={handleSaveUser}
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