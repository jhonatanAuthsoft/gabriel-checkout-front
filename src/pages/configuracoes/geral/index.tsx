import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { FaShoppingBag, FaBox, FaCog, FaChevronDown, FaBars, FaPencilAlt, FaTrashAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import logoImage from '../../../assets/img/df.png';

interface Webhook {
    id: number;
    url: string;
}

const ConfiguracoesGerais: React.FC = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState<string[]>(['Configurações']);
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [editingWebhookId, setEditingWebhookId] = useState<number | null>(null);
    const [editingUrl, setEditingUrl] = useState('');
    const overlayRef = useRef<HTMLDivElement>(null);

    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken');

    const fetchWebhooks = async () => {
        if (!token || !apiUrl) return;
        try {
            const response = await fetch(`${apiUrl}webhook/listar`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setWebhooks(Array.isArray(data) ? data : (data ? [data] : []));
            }
        } catch (error) {
            console.error("Erro ao buscar webhooks:", error);
        }
    };

    useEffect(() => {
        fetchWebhooks();
    }, [apiUrl, token]);

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

    const toggleSidebar = (e: React.MouseEvent) => {
        e.preventDefault();
        setSidebarActive(!isSidebarActive);
    };

    const toggleSubMenu = (menu: string) => {
        setOpenSubMenus(prev =>
            prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
        );
    };

    const handleStartEdit = (webhook: Webhook) => {
        setEditingWebhookId(webhook.id);
        setEditingUrl(webhook.url);
    };

    const handleCancelEdit = () => {
        setEditingWebhookId(null);
        setEditingUrl('');
    };

    const handleUpdateWebhook = async () => {
        if (!editingWebhookId) return;
        try {
            const response = await fetch(`${apiUrl}webhook/atualizar/${editingWebhookId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ url: editingUrl }),
            });

            if (response.ok) {
                handleCancelEdit();
                fetchWebhooks();
                alert('Webhook atualizado com sucesso!');
            } else {
                const errorData = await response.json();
                alert(`Falha ao atualizar webhook: ${errorData.message || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao comunicar com o servidor.');
        }
    };

    const handleAddWebhook = async () => {
        if (!newWebhookUrl.trim() || !token || !apiUrl) {
            alert('Por favor, insira uma URL válida.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}webhook/criar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ url: newWebhookUrl }),
            });

            if (response.ok) {
                setNewWebhookUrl('');
                fetchWebhooks();
                alert('Webhook adicionado com sucesso!');
            } else {
                const errorData = await response.json();
                alert(`Falha ao adicionar webhook: ${errorData.message || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao comunicar com o servidor.');
        }
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
                        <a href="#">
                            <div className={`${styles.subMenuItem} ${styles.active}`}>Geral</div>
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
            <div className={`${styles.overlay} ${isSidebarActive ? styles.active : ''}`} id="overlay" ref={overlayRef} onClick={toggleSidebar} />
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                    <h2 className={styles.pageTitle}>Configurações Gerais</h2>
                </div>
                <div className={styles.contentCard}>
                    <div className={styles.contentCardHeader}>
                        <h3 className={styles.contentCardTitle}>Adicionar Webhook</h3>
                    </div>
                    <div className={styles.contentCardBody}>
                        <div className={styles.addWebhookForm}>
                            <input
                                type="text"
                                id="webhookUrl"
                                name="webhookUrl"
                                className={styles.input}
                                value={newWebhookUrl}
                                onChange={(e) => setNewWebhookUrl(e.target.value)}
                                placeholder="https://exemplo.com/webhook"
                            />
                            <button
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                onClick={handleAddWebhook}
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.contentCard} style={{ marginTop: '20px' }}>
                     <div className={styles.contentCardHeader}>
                        <h3 className={styles.contentCardTitle}>Webhooks Cadastrados</h3>
                    </div>
                    <div className={styles.contentCardBody}>
                        <div className={styles.tableContainer}>
                            <table className={styles.webhookTable}>
                                <thead>
                                    <tr>
                                        <th>URL</th>
                                        <th className={styles.actionsHeader}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {webhooks.map(webhook => (
                                        <tr key={webhook.id}>
                                            <td>
                                                {editingWebhookId === webhook.id ? (
                                                    <input
                                                        type="text"
                                                        className={styles.inlineEditInput}
                                                        value={editingUrl}
                                                        onChange={(e) => setEditingUrl(e.target.value)}
                                                    />
                                                ) : (
                                                    webhook.url
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.btnActions}>
                                                    {editingWebhookId === webhook.id ? (
                                                        <>
                                                            <button onClick={handleUpdateWebhook} className={`${styles.btnAction} ${styles.btnSaveInline}`}>
                                                                <FaCheck />
                                                            </button>
                                                            <button onClick={handleCancelEdit} className={`${styles.btnAction} ${styles.btnCancelInline}`}>
                                                                <FaTimes />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={() => handleStartEdit(webhook)}>
                                                            <FaPencilAlt />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ConfiguracoesGerais;