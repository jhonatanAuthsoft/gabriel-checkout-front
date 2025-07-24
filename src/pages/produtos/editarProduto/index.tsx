import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { FaShoppingBag, FaCog, FaPlus, FaMinus, FaCheck, FaCopy, FaCheckCircle, FaPencilAlt, FaTrashAlt, FaSearch } from 'react-icons/fa';
import { FaBars, FaArrowRightFromBracket, FaChevronDown, FaBox, FaArrowUpFromBracket } from 'react-icons/fa6';
import logoImg from '../../../assets/img/df.png';
import seloGarantiaImg from '../../../assets/img/seloGarantia.png';

const EditarProduto: React.FC = () => {
    const { produtoId } = useParams<{ produtoId: string }>();
    const navigate = useNavigate();

    const [produtoData, setProdutoData] = useState({
        dadosProduto: {
            dadosGerais: {
                codigo: '',
                chave: '',
                nome: '',
                codigoSku: '',
                descricao: ''
            },
            formatoCategoria: {
                formato: '',
                categoria: ''
            },
            cobranca: {
                tipoCobranca: 'UNICA',
                peridiocidade: 'MENSAL',
                preco: 0,
                gratis: false,
                tipoPrimeiraParcela: 'IGUAL',
                valorPrimeiraParcela: 0,
                carencia: 0
            },
            disponibilidade: {
                disponivel: true,
                quantidadeMaxima: 0
            },
            suporteGarantia: {
                email: '',
                telefoneSuporte: '',
                mostrarTelefoneSuporte: false,
                whatsappSuporte: '',
                mostrarWhatsappSuporte: false
            },
            urlPersonalizada: ''
        },
        checkoutProduto: {
            exibicoes: {
                exibirImagensProduto: true,
                exibirSelos: true,
                exibirFaq: true
            },
            perguntas: [] as { id?: number; pergunta: string; resposta: string }[]
        },
        planos: [] as any[],
        cupom: [] as any[]
    });
    
    const [imagens, setImagens] = useState<File[]>([]);
    const [mapeamentoImagens, setMapeamentoImagens] = useState<{ nomeArquivo: string, tipo: string }[]>([]);
    const [imagensParaDeletar, setImagensParaDeletar] = useState<number[]>([]);
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [activeSubMenus, setActiveSubMenus] = useState<string[]>(['Produtos']);
    const [activeSection, setActiveSection] = useState('dados');
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
    const [showPlanoForm, setShowPlanoForm] = useState(false);
    const [showCupomForm, setShowCupomForm] = useState(false);
    const [copiedUrlStatuses, setCopiedUrlStatuses] = useState<{ [key: string]: boolean }>({});
    const [tipoCobranca, setTipoCobranca] = useState('unica');
    const [primeiraParcela, setPrimeiraParcela] = useState('igual');
    const [editingPlanoIndex, setEditingPlanoIndex] = useState<number | null>(null);
    const [editingCupomIndex, setEditingCupomIndex] = useState<number | null>(null);
    const [cupomFilter, setCupomFilter] = useState('');
    const [codigoRefFilter, setCodigoRefFilter] = useState('');
    const [filteredCupons, setFilteredCupons] = useState<any[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

    const initialPlanoState = { nome: '', peridiocidade: 'MENSAL', descricao: '', preco: 0, gratis: false, primeiraParcela: 'IGUAL', recorrencia: '', sku: '' };
    const [newPlano, setNewPlano] = useState(initialPlanoState);

    const initialCupomState = { codigoCupom: '', tipoDesconto: 'PERCENTUAL', valor: 0, url: '', ativo: true };
    const [newCupom, setNewCupom] = useState(initialCupomState);

    const overlayRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const fotosFileInputRef = useRef<HTMLInputElement>(null);
    const bannerFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const lowerCupomFilter = cupomFilter.toLowerCase();
        const lowerCodigoRefFilter = codigoRefFilter.toLowerCase();

        const filtered = (produtoData.cupom || []).filter(cupom => {
            const cupomCode = (cupom.codigoCupom || '').toLowerCase();
            const cupomUrl = (cupom.url || '').toLowerCase();

            let matchesCupomFilter = true;
            if (lowerCupomFilter) {
                matchesCupomFilter = cupomCode.includes(lowerCupomFilter);
            }

            let matchesCodigoRefFilter = true;
            if (lowerCodigoRefFilter) {
                matchesCodigoRefFilter = cupomCode.includes(lowerCodigoRefFilter) || cupomUrl.includes(lowerCodigoRefFilter);
            }
            
            return matchesCupomFilter && matchesCodigoRefFilter;
        });

        setFilteredCupons(filtered);
    }, [cupomFilter, codigoRefFilter, produtoData.cupom]);

    useEffect(() => {
        const fetchProductData = async () => {
            if (!produtoId) return;
            const apiUrl = import.meta.env.VITE_API_URL;
            const token = localStorage.getItem('authToken');
            if (!apiUrl || !token) {
                console.error("API URL ou token não encontrado.");
                return;
            }
            try {
                const response = await fetch(`${apiUrl}produto/listar-por-id/${produtoId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Falha ao carregar dados do produto.');
                
                const data = await response.json();
                
                setProdutoData(prevState => ({
                    ...prevState,
                    dadosProduto: data.dados.dadosProduto || prevState.dadosProduto,
                    checkoutProduto: data.dados.checkoutProduto || prevState.checkoutProduto,
                    planos: data.dados.planos || prevState.planos,
                    cupom: data.dados.cupom || prevState.cupom,
                }));
            } catch (error) {
                console.error("Erro ao buscar produto:", error);
            }
        };

        fetchProductData();
    }, [produtoId]);

    useEffect(() => {
        const sidebar = sidebarRef.current;
        const overlay = overlayRef.current;

        if (!sidebar || !overlay) return;

        if (isSidebarActive) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            overlay.style.pointerEvents = 'auto';
        } else {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            const timer = setTimeout(() => {
                if (!sidebar.classList.contains('active')) {
                    overlay.style.pointerEvents = 'none';
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isSidebarActive]);

    const toggleSidebar = () => {
        setSidebarActive(prev => !prev);
    };

    const toggleSubMenu = (menu: string) => {
        setActiveSubMenus(prev =>
            prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
        );
    };

    const handleSectionChange = (section: string) => {
        setActiveSection(section);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleInputChange(e.target.name, e.target.value);
    };

    const handleFileButtonClick = (ref: React.RefObject<HTMLInputElement | null>) => {
        ref.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, inputName: string) => {
        if (event.target.files && event.target.files.length > 0) {
            const files = Array.from(event.target.files);
            const newMapeamento = files.map(file => ({
                nomeArquivo: file.name,
                tipo: inputName.toUpperCase()
            }));

            setImagens(prev => [...prev, ...files]);
            setMapeamentoImagens(prev => [...prev, ...newMapeamento]);
        }
    };

    const handleInputChange = (name: string, value: any) => {
        const keys = name.split('.');
        setProdutoData(prev => {
            const newState = { ...prev };
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };

    const validateProductData = () => {
        const errors: string[] = [];
        const { dadosGerais, formatoCategoria, cobranca, suporteGarantia, urlPersonalizada } = produtoData.dadosProduto;

        if (!dadosGerais.nome.trim()) {
            errors.push('dadosGerais');
        }
        if (!formatoCategoria.formato || !formatoCategoria.categoria) {
            errors.push('formatoCategoria');
        }
        if (!cobranca.gratis && cobranca.preco <= 0) {
            errors.push('cobranca');
        }
        if (!suporteGarantia.email.trim()) {
            errors.push('suporteGarantia');
        }
        if (!urlPersonalizada.trim()) {
            errors.push('urlsPersonalizadas');
        }
        // Na edição, as imagens podem já existir, então não validamos se a lista de novas imagens está vazia
        // A lógica de validação para imagens existentes (se aplicável) deve ser adicionada aqui

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSave = async () => {
        setHasAttemptedSave(true);
        if (!validateProductData()) {
            console.log('Validação falhou', validationErrors);
            return;
        }

        const formData = new FormData();
        
        const dadosPayload = {
            dados: produtoData,
            mapeamentoImagens: mapeamentoImagens,
            imagensParaDeletar: imagensParaDeletar
        };

        formData.append('dados', JSON.stringify(dadosPayload));

        imagens.forEach(file => {
            formData.append('imagens', file);
        });

        const token = localStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL;

        if (!apiUrl) {
            console.error('URL da API não configurada.');
            return;
        }

        if (!token) {
            console.error('Token de autenticação não encontrado.');
            return;
        }

        // Para edição, sempre usaremos o endpoint de editar
        const url = `${apiUrl}produto/editar-produto/${produtoId}`;
        const method = 'PATCH';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Produto salvo:', result);
                navigate('/produtos/');
            } else {
                const errorData = await response.json().catch(() => response.text());
                console.error('Falha ao salvar produto', errorData);
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };

    const alignExpandedRows = (expandedContent: HTMLElement) => {
        const infoLabels = expandedContent.querySelector('.infoLabels');
        const infoValues = expandedContent.querySelector('.infoValues');

        if (infoLabels && infoValues) {
            const labels = infoLabels.querySelectorAll('.infoLabel') as NodeListOf<HTMLElement>;
            const values = infoValues.querySelectorAll('.infoValue') as NodeListOf<HTMLElement>;

            if (labels.length === values.length) {
                for (let i = 0; i < labels.length; i++) {
                    labels[i].style.height = 'auto';
                    values[i].style.height = 'auto';

                    const labelHeight = labels[i].offsetHeight;
                    const valueHeight = values[i].offsetHeight;
                    
                    const maxHeight = Math.max(labelHeight, valueHeight);
                    
                    labels[i].style.height = `${maxHeight}px`;
                    values[i].style.height = `${maxHeight}px`;
                }
            }
        }
    };

    const toggleRowExpansion = (rowId: string) => {
        setExpandedRows(prev => {
            const newExpandedState = !prev[rowId];
            const updatedRows = { ...prev, [rowId]: newExpandedState };
            
            if (newExpandedState) {
                setTimeout(() => {
                    const expandedContent = document.getElementById('expandedContent' + rowId);
                    if (expandedContent) {
                        alignExpandedRows(expandedContent);
                    }
                }, 0);
            }
            return updatedRows;
        });
    };
    
    useEffect(() => {
        const handleResize = () => {
            document.querySelectorAll<HTMLElement>('.expandedRow').forEach(row => {
                if (row.style.display !== 'none') {
                    const rowId = row.id.replace('expandedContent', '');
                    if (expandedRows[rowId]) {
                       alignExpandedRows(row);
                    }
                }
            });
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [expandedRows]);

    const handleCopyUrl = async (inputId: string) => {
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (!input) {
            console.error(`Input with id ${inputId} not found for copy`);
            return;
        }
        const url = input.value;

        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(url);
                setCopiedUrlStatuses(prev => ({ ...prev, [inputId]: true }));
                
                setTimeout(() => {
                    setCopiedUrlStatuses(prev => ({ ...prev, [inputId]: false }));
                }, 2000);
            } catch (err) {
                console.error('Erro ao copiar URL: ', err);
            }
        } else {
            console.warn('Clipboard API not available');
            try {
                input.select();
                document.execCommand('copy');
                setCopiedUrlStatuses(prev => ({ ...prev, [inputId]: true }));
                setTimeout(() => {
                    setCopiedUrlStatuses(prev => ({ ...prev, [inputId]: false }));
                }, 2000);
            } catch (err) {
                console.error('Fallback copy failed: ', err);
            }
        }
    };

    const handleRemoveImage = (index: number, imageId?: number) => {
        if (imageId) {
            setImagensParaDeletar(prev => [...prev, imageId]);
        }
        
        setImagens(prev => prev.filter((_, i) => i !== index));
        setMapeamentoImagens(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddPergunta = () => {
        setProdutoData(prev => ({
            ...prev,
            checkoutProduto: {
                ...prev.checkoutProduto,
                perguntas: [...prev.checkoutProduto.perguntas, { pergunta: '', resposta: '' }]
            }
        }));
    };

    const handleUpdatePergunta = (index: number, field: string, value: string) => {
        setProdutoData(prev => {
            const novasPerguntas = [...prev.checkoutProduto.perguntas];
            novasPerguntas[index] = { ...novasPerguntas[index], [field]: value };
            
            return {
                ...prev,
                checkoutProduto: {
                    ...prev.checkoutProduto,
                    perguntas: novasPerguntas
                }
            };
        });
    };

    const handleRemovePergunta = (index: number) => {
        setProdutoData(prev => {
            const novasPerguntas = prev.checkoutProduto.perguntas.filter((_, i) => i !== index);
            
            return {
                ...prev,
                checkoutProduto: {
                    ...prev.checkoutProduto,
                    perguntas: novasPerguntas
                }
            };
        });
    };

    const handleEditPlano = (index: number) => {
        setEditingPlanoIndex(index);
        setNewPlano(produtoData.planos[index]);
        setShowPlanoForm(true);
    };

    const handleSavePlano = () => {
        if (editingPlanoIndex !== null) {
            handleUpdatePlano(editingPlanoIndex, newPlano);
        } else {
        handleAddPlano(newPlano);
        }
        setNewPlano(initialPlanoState);
        setShowPlanoForm(false);
        setEditingPlanoIndex(null);
    };

    const handleAddPlano = (novoPlano: any) => {
        setProdutoData(prev => ({
            ...prev,
            planos: [...prev.planos, novoPlano]
        }));
    };

    const handleUpdatePlano = (index: number, planoAtualizado: any) => {
        setProdutoData(prev => {
            const novosPlanos = [...prev.planos];
            novosPlanos[index] = planoAtualizado;
            
            return {
                ...prev,
                planos: novosPlanos
            };
        });
    };

    const handleRemovePlano = (index: number) => {
        setProdutoData(prev => ({
            ...prev,
            planos: prev.planos.filter((_, i) => i !== index)
        }));
    };

    const handleEditCupom = (index: number) => {
        setEditingCupomIndex(index);
        setNewCupom(produtoData.cupom[index]);
        setShowCupomForm(true);
    };

    const handleSaveCupom = () => {
        if (editingCupomIndex !== null) {
            handleUpdateCupom(editingCupomIndex, newCupom);
        } else {
            handleAddCupom(newCupom);
        }
        setNewCupom(initialCupomState);
        setShowCupomForm(false);
        setEditingCupomIndex(null);
    };

    const handleAddCupom = (novoCupom: any) => {
        setProdutoData(prev => ({
            ...prev,
            cupom: [...prev.cupom, novoCupom]
        }));
    };

    const handleUpdateCupom = (index: number, cupomAtualizado: any) => {
        setProdutoData(prev => {
            const novosCupons = [...prev.cupom];
            novosCupons[index] = cupomAtualizado;
            
            return {
                ...prev,
                cupom: novosCupons
            };
        });
    };

    const handleRemoveCupom = (index: number) => {
        setProdutoData(prev => ({
            ...prev,
            cupom: prev.cupom.filter((_, i) => i !== index)
        }));
    };

    const handleFilterCupons = () => {
        let tempCupons = [...produtoData.cupom];
        const cupomFilterLower = cupomFilter.toLowerCase();
        const codigoRefFilterLower = codigoRefFilter.toLowerCase();
    
        if (cupomFilterLower) {
            tempCupons = tempCupons.filter(c => 
                c.codigoCupom && c.codigoCupom.toLowerCase().includes(cupomFilterLower)
            );
        }
    
        if (codigoRefFilterLower) {
            tempCupons = tempCupons.filter(c => 
                (c.codigoCupom && c.codigoCupom.toLowerCase().includes(codigoRefFilterLower)) ||
                (c.url && c.url.toLowerCase().includes(codigoRefFilterLower))
            );
        }
    
        setFilteredCupons(tempCupons);
    };

    const handleToggleCupomAtivo = (index: number) => {
        setProdutoData(prev => {
            const novosCupons = [...prev.cupom];
            novosCupons[index] = {
                ...novosCupons[index],
                ativo: !novosCupons[index].ativo
            };
            return {
                ...prev,
                cupom: novosCupons
            };
        });
    };

    return (
        <div className={styles.mainContainer}>
            <header className={styles.mainHeader}>
                <div className={styles.headerLeft}>
                    <button id="mobileMenuBtn" className={styles.mobileMenuBtn} onClick={toggleSidebar}>
                        <FaBars />
                    </button>
                    <div id="logo" style={{ backgroundImage: `url(${logoImg})` }} />
                </div>
                <div className={styles.headerActions}>
                    <a href="#" className={styles.exitButton}>
                        <FaArrowRightFromBracket />
                    </a>
                </div>
            </header>
            <aside className={styles.sidebar} ref={sidebarRef}>
                <nav className={styles.sidebarNav}>
                    <div className={styles.navItem} onClick={() => toggleSubMenu('Vendas')}>
                        <FaShoppingBag />
                        <span>Vendas</span>
                        <FaChevronDown className={`${styles.expandIcon} ${activeSubMenus.includes('Vendas') ? styles.rotate : ''}`} />
                    </div>
                    <div className={styles.subMenu} style={{ display: activeSubMenus.includes('Vendas') ? 'block' : 'none' }}>
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
                        <FaChevronDown className={`${styles.expandIcon} ${activeSubMenus.includes('Produtos') ? styles.rotate : ''}`} />
                    </div>
                    <div className={styles.subMenu} style={{ display: activeSubMenus.includes('Produtos') ? 'block' : 'none' }}>
                        <a href="/produtos">
                            <div className={`${styles.subMenuItem} ${styles.active}`}>Meus Produtos</div>
                        </a>
                        <a href="/produtos/novo">
                            <div className={styles.subMenuItem}>Novo Produto</div>
                        </a>
                    </div>
                    <div className={styles.navItem} onClick={() => toggleSubMenu('Configurações')}>
                        <FaCog />
                        <span>Configurações</span>
                        <FaChevronDown className={`${styles.expandIcon} ${activeSubMenus.includes('Configurações') ? styles.rotate : ''}`} />
                    </div>
                    <div className={styles.subMenu} style={{ display: activeSubMenus.includes('Configurações') ? 'block' : 'none' }}>
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
            <div className={`${styles.overlay}`} id="overlay" ref={overlayRef} onClick={toggleSidebar} />
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                    <h1 className={styles.pageTitle}>Editar Produto</h1>
                </div>
                <div className={styles.pageContent}>
                    <div className={styles.pageHeader}>
                        <div className={styles.pageSelector}>
                            <button className={`${styles.selectorBtn} ${activeSection === 'dados' ? styles.active : ''}`} onClick={() => handleSectionChange('dados')}>Dados</button>
                            <button className={`${styles.selectorBtn} ${activeSection === 'checkout' ? styles.active : ''}`} onClick={() => handleSectionChange('checkout')}>Checkout</button>
                            <button className={`${styles.selectorBtn} ${activeSection === 'plano' ? styles.active : ''}`} onClick={() => handleSectionChange('plano')}>Plano</button>
                            <button className={`${styles.selectorBtn} ${activeSection === 'cupom' ? styles.active : ''}`} onClick={() => handleSectionChange('cupom')}>Cupom</button>
                        </div>
                    </div>

                    {activeSection === 'dados' && (
                        <div className={styles.contentSection} id="dadosSection">
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Dados Gerais</h2>
                                    {hasAttemptedSave && !validationErrors.includes('dadosGerais') && <FaCheckCircle className={styles.checkIcon} />}
                                </div>
                                <div className={`${styles.contentCardBody} ${hasAttemptedSave && validationErrors.includes('dadosGerais') ? styles.missing : ''}`}>
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol1}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="codigo">Código</label>
                                                <input type="text" name="dadosProduto.dadosGerais.codigo" value={produtoData.dadosProduto.dadosGerais.codigo} onChange={(e) => handleInputChange(e.target.name, e.target.value)} className={styles.input} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="chave">Chave</label>
                                                <input type="text" name="dadosProduto.dadosGerais.chave" value={produtoData.dadosProduto.dadosGerais.chave} onChange={(e) => handleInputChange(e.target.name, e.target.value)} className={styles.input} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol2}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="nome">Nome</label>
                                                <input type="text" name="dadosProduto.dadosGerais.nome" value={produtoData.dadosProduto.dadosGerais.nome} onChange={(e) => handleInputChange(e.target.name, e.target.value)} className={styles.input} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="sku">Código SKU</label>
                                                <input type="text" name="dadosProduto.dadosGerais.codigoSku" value={produtoData.dadosProduto.dadosGerais.codigoSku} onChange={(e) => handleInputChange(e.target.name, e.target.value)} className={styles.input} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="descricao">Descrição</label>
                                                <textarea
                                                    id="descArea"
                                                    name="dadosProduto.dadosGerais.descricao"
                                                    className={styles.inputArea}
                                                    maxLength={1000}
                                                    value={produtoData.dadosProduto.dadosGerais.descricao}
                                                    onChange={handleDescriptionChange}
                                                />
                                                <p className={styles.textCount}>
                                                    <span>{produtoData.dadosProduto.dadosGerais.descricao.length}</span>/1000
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {hasAttemptedSave && validationErrors.includes('dadosGerais') && <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>}
                                </div>
                            </div>
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Formato e Categoria</h2>
                                    {hasAttemptedSave && !validationErrors.includes('formatoCategoria') && <FaCheckCircle className={styles.checkIcon} />}
                                </div>
                                <div className={`${styles.contentCardBody} ${hasAttemptedSave && validationErrors.includes('formatoCategoria') ? styles.missing : ''}`}>
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol3}>
                                            <div className={styles.selectWrapper}>
                                                <label className={styles.label} htmlFor="formato">
                                                    Formato
                                                </label>
                                                <select name="dadosProduto.formatoCategoria.formato" value={produtoData.dadosProduto.formatoCategoria.formato} onChange={(e) => handleInputChange(e.target.name, e.target.value)} className={styles.filterSelect}>
                                                    <option value="" />
                                                    <option value="FISICO">Físico</option>
                                                    <option value="DIGITAL">Digital</option>
                                                </select>
                                                <FaChevronDown className={styles.selectIcon} />
                                            </div>
                                            <div className={styles.selectWrapper}>
                                                <label className={styles.label} htmlFor="categoria">
                                                    Categoria
                                                </label>
                                                <select name="dadosProduto.formatoCategoria.categoria" value={produtoData.dadosProduto.formatoCategoria.categoria} onChange={(e) => handleInputChange(e.target.name, e.target.value)} className={styles.filterSelect}>
                                                    <option value="" />
                                                    <option value="ELETRONICOS">Eletrônicos</option>
                                                    <option value="CASA">Casa</option>
                                                    <option value="MODA">Moda</option>
                                                    <option value="SAUDE">Saúde</option>
                                                    <option value="ALIMENTOS">Alimentos</option>
                                                    <option value="ESPORTE">Esporte</option>
                                                    <option value="LAZER">Lazer</option>
                                                    <option value="ARTE">Arte</option>
                                                    <option value="CURSOS">Cursos</option>
                                                    <option value="COLECIONAVEIS">Colecionáveis</option>
                                                    <option value="SERVICOS">Serviços</option>
                                                </select>
                                                <FaChevronDown className={styles.selectIcon} />
                                            </div>
                                        </div>
                                    </div>
                                    {hasAttemptedSave && validationErrors.includes('formatoCategoria') && <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>}
                                </div>
                            </div>
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Cobrança</h2>
                                    {hasAttemptedSave && !validationErrors.includes('cobranca') && <FaCheckCircle className={styles.checkIcon} />}
                                </div>
                                <div className={`${styles.contentCardBody} ${hasAttemptedSave && validationErrors.includes('cobranca') ? styles.missing : ''}`}>
                                    <div className={styles.dataSection}>
                                        <div className={`${styles.dataCol3}`}>
                                            <div className={styles.radioSection}>
                                                <div className={styles.radioTop}>
                                                    <label className={styles.label} htmlFor="tipoCobrança">
                                                        Tipo de Cobrança
                                                    </label>
                                                </div>
                                                <div className={styles.radioBody}>
                                                    <label className={styles.radioButton}>
                                                        <input
                                                            type="radio"
                                                            name="dadosProduto.cobranca.tipoCobranca"
                                                            value="UNICA"
                                                            checked={produtoData.dadosProduto.cobranca.tipoCobranca === 'UNICA'}
                                                            onChange={(e) => {
                                                                handleInputChange(e.target.name, e.target.value)
                                                                setTipoCobranca('unica')
                                                            }}
                                                        />
                                                        <span className={styles.radio} />
                                                        Única
                                                    </label>
                                                    <label className={styles.radioButton}>
                                                        <input
                                                            type="radio"
                                                            name="dadosProduto.cobranca.tipoCobranca"
                                                            value="RECORRENTE"
                                                            checked={produtoData.dadosProduto.cobranca.tipoCobranca === 'RECORRENTE'}
                                                            onChange={(e) => {
                                                                handleInputChange(e.target.name, e.target.value)
                                                                setTipoCobranca('recorrente')
                                                            }}
                                                        />
                                                        <span className={styles.radio} />
                                                        Recorrente
                                                    </label>
                                                </div>
                                            </div>
                                            {tipoCobranca === 'recorrente' && (
                                                <div className={styles.inputGroup}>
                                                    <div className={styles.selectWrapper}>
                                                        <label className={styles.label} htmlFor="periodicidade">
                                                            Periodicidade
                                                        </label>
                                                        <select className={styles.filterSelect} name="dadosProduto.cobranca.peridiocidade" value={produtoData.dadosProduto.cobranca.peridiocidade} onChange={(e) => handleInputChange(e.target.name, e.target.value)}>
                                                            <option value="MENSAL">Mensal</option>
                                                            <option value="BIMESTRAL">Bimestral</option>
                                                            <option value="TRIMESTRAL">Trimestral</option>
                                                            <option value="SEMESTRAL">Semestral</option>
                                                            <option value="ANUAL">Anual</option>
                                                        </select>
                                                        <FaChevronDown className={styles.selectIcon} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className={`${styles.dataCol4}`}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="preco">
                                                    Preço
                                                </label>
                                                <input type="number" name="dadosProduto.cobranca.preco" placeholder="0,00" className={styles.input} value={produtoData.dadosProduto.cobranca.preco} onChange={(e) => handleInputChange(e.target.name, parseFloat(e.target.value))} />
                                            </div>
                                            <div className={styles.sliderGroup}>
                                                <div className={styles.switchContainer}>
                                                    <input
                                                        type="checkbox"
                                                        className={styles.slideCheckbox}
                                                        id="produtoGratis"
                                                        name="dadosProduto.cobranca.gratis"
                                                        checked={produtoData.dadosProduto.cobranca.gratis}
                                                        onChange={(e) => handleInputChange(e.target.name, e.target.checked)}
                                                    />
                                                    <label className={styles.slideSwitch} htmlFor="produtoGratis">
                                                        <span className={styles.sliderSwitch} />
                                                    </label>
                                                </div>
                                                <p className={styles.sliderText}>Grátis</p>
                                            </div>
                                        </div>
                                        {tipoCobranca === 'recorrente' && (
                                            <>
                                                <div className={`${styles.dataCol3}`}>
                                                    <div className={styles.inputGroup}>
                                                        <div className={styles.selectWrapper}>
                                                            <label className={styles.label} htmlFor="primeiraParcela">
                                                                Primeira Parcela
                                                            </label>
                                                            <select 
                                                                className={styles.filterSelect} 
                                                                name="dadosProduto.cobranca.tipoPrimeiraParcela"
                                                                value={produtoData.dadosProduto.cobranca.tipoPrimeiraParcela}
                                                                onChange={(e) => {
                                                                    handleInputChange(e.target.name, e.target.value);
                                                                    setPrimeiraParcela(e.target.value === 'IGUAL' ? 'igual' : 'diferente');
                                                                }}
                                                            >
                                                                <option value="IGUAL">Igual as demais</option>
                                                                <option value="DIFERENTE">Valor diferente</option>
                                                            </select>
                                                            <FaChevronDown className={styles.selectIcon} />
                                                        </div>
                                                    </div>
                                                </div>
                                                {primeiraParcela === 'diferente' && (
                                                    <div className={`${styles.dataCol4}`}>
                                                        <div className={styles.inputGroup}>
                                                            <label className={styles.label} htmlFor="precoPrimeiraParcela">
                                                                Preço Primeira Parcela
                                                            </label>
                                                            <input type="number" name="dadosProduto.cobranca.valorPrimeiraParcela" placeholder="0,00" className={styles.input} value={produtoData.dadosProduto.cobranca.valorPrimeiraParcela} onChange={(e) => handleInputChange(e.target.name, parseFloat(e.target.value))} />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className={`${styles.dataCol4}`}>
                                                     <div className={styles.inputGroup}>
                                                        <label className={styles.label} htmlFor="carencia">
                                                            Carência
                                                        </label>
                                                        <input type="number" name="dadosProduto.cobranca.carencia" placeholder="dias" className={styles.input} value={produtoData.dadosProduto.cobranca.carencia} onChange={(e) => handleInputChange(e.target.name, parseInt(e.target.value))} />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {hasAttemptedSave && validationErrors.includes('cobranca') && <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>}
                                </div>
                            </div>
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Disponibilidade</h2>
                                </div>
                                <div className={styles.contentCardBody}>
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol4}>
                                            <div className={styles.radioSection}>
                                                <div className={styles.radioTop}>
                                                    <label className={styles.label} htmlFor="maxima">
                                                        Disponível para Venda
                                                    </label>
                                                </div>
                                                <div className={styles.radioBody}>
                                                    <label className={styles.radioButton}>
                                                        <input
                                                            type="radio"
                                                            name="dadosProduto.disponibilidade.disponivel"
                                                            checked={produtoData.dadosProduto.disponibilidade.disponivel === true}
                                                            onChange={() => handleInputChange('dadosProduto.disponibilidade.disponivel', true)}
                                                        />
                                                        <span className={styles.radio} />
                                                        Sim
                                                    </label>
                                                    <label className={styles.radioButton}>
                                                        <input
                                                            type="radio"
                                                            name="dadosProduto.disponibilidade.disponivel"
                                                            checked={produtoData.dadosProduto.disponibilidade.disponivel === false}
                                                            onChange={() => handleInputChange('dadosProduto.disponibilidade.disponivel', false)}
                                                        />
                                                        <span className={styles.radio} />
                                                        Não
                                                    </label>
                                                </div>
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="maxima">
                                                    Quantidade Máxima
                                                </label>
                                                <input type="number" name="dadosProduto.disponibilidade.quantidadeMaxima" className={styles.input} value={produtoData.dadosProduto.disponibilidade.quantidadeMaxima} onChange={(e) => handleInputChange(e.target.name, parseInt(e.target.value))} />
                                            </div>
                                        </div>
                                    </div>
                                    <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>
                                </div>
                            </div>
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Score do Produto</h2>
                                </div>
                                <div className={styles.contentCardBody}>
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol}>
                                            <div className={styles.radioSection}>
                                                <div className={styles.radioTop}>
                                                    <label className={styles.label} htmlFor="maxima">
                                                        Score do produto disponível na vitrine de afiliação:
                                                    </label>
                                                </div>
                                                <div className={styles.radioBody}>
                                                    <label className={styles.radioButton}>
                                                        <input type="radio" name="score" defaultValue="sim" />
                                                        <span className={styles.radio} />
                                                        Sim
                                                    </label>
                                                    <label className={styles.radioButton}>
                                                        <input type="radio" name="score" defaultValue="nao" />
                                                        <span className={styles.radio} />
                                                        Não
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>
                                </div>
                            </div>
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Suporte e Garantia</h2>
                                    {hasAttemptedSave && !validationErrors.includes('suporteGarantia') && <FaCheckCircle className={styles.checkIcon} />}
                                </div>
                                <div className={`${styles.contentCardBody} ${hasAttemptedSave && validationErrors.includes('suporteGarantia') ? styles.missing : ''}`}>
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol5}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="email">
                                                    E-mail Suporte
                                                </label>
                                                <input type="text" name="dadosProduto.suporteGarantia.email" className={styles.input} value={produtoData.dadosProduto.suporteGarantia.email} onChange={(e) => handleInputChange(e.target.name, e.target.value)} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol4}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="telefone">
                                                    Telefone de Suporte
                                                </label>
                                                <input type="text" name="dadosProduto.suporteGarantia.telefoneSuporte" className={styles.input} value={produtoData.dadosProduto.suporteGarantia.telefoneSuporte} onChange={(e) => handleInputChange(e.target.name, e.target.value)} />
                                            </div>
                                            <div className={styles.checkboxWrapper}>
                                                <input
                                                    type="checkbox"
                                                    id="checkboxTelefone"
                                                    className={styles.checkboxInput}
                                                    name="dadosProduto.suporteGarantia.mostrarTelefoneSuporte"
                                                    checked={produtoData.dadosProduto.suporteGarantia.mostrarTelefoneSuporte}
                                                    onChange={(e) => handleInputChange(e.target.name, e.target.checked)}
                                                />
                                                <label htmlFor="checkboxTelefone" className={styles.checkbox}>
                                                    <span>
                                                        <FaCheck />
                                                    </span>
                                                    <span>Mostrar no Checkout</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className={styles.dataCol4}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="whatsapp">
                                                    Whatsapp de Suporte
                                                </label>
                                                <input type="text" name="dadosProduto.suporteGarantia.whatsappSuporte" className={styles.input} value={produtoData.dadosProduto.suporteGarantia.whatsappSuporte} onChange={(e) => handleInputChange(e.target.name, e.target.value)} />
                                            </div>
                                            <div className={styles.checkboxWrapper}>
                                                <input
                                                    type="checkbox"
                                                    id="checkboxWhatsapp"
                                                    className={styles.checkboxInput}
                                                    name="dadosProduto.suporteGarantia.mostrarWhatsappSuporte"
                                                    checked={produtoData.dadosProduto.suporteGarantia.mostrarWhatsappSuporte}
                                                    onChange={(e) => handleInputChange(e.target.name, e.target.checked)}
                                                />
                                                <label htmlFor="checkboxWhatsapp" className={styles.checkbox}>
                                                    <span>
                                                        <FaCheck />
                                                    </span>
                                                    <span>Mostrar no Checkout</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className={styles.dataCol}>
                                            <div className={styles.radioSection}>
                                                <div className={styles.radioTop}>
                                                    <label className={styles.label} htmlFor="maxima">
                                                        Habilitar chat com o consumidor:
                                                    </label>
                                                </div>
                                                <div className={styles.radioBody}>
                                                    <label className={styles.radioButton}>
                                                        <input type="radio" name="chat" defaultValue="sim" />
                                                        <span className={styles.radio} />
                                                        Sim
                                                    </label>
                                                    <label className={styles.radioButton}>
                                                        <input type="radio" name="chat" defaultValue="nao" />
                                                        <span className={styles.radio} />
                                                        Não
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.dataCol4}>
                                            <div className={styles.selectWrapper}>
                                                <label className={styles.label} htmlFor="garantia">
                                                    Tempo de garantia
                                                </label>
                                                <select className={styles.filterSelect}>
                                                    <option value="" />
                                                    <option value="fisico">3 Meses</option>
                                                    <option value="digital">6 Meses</option>
                                                    <option value="digital">1 Ano</option>
                                                    <option value="digital">2 Anos</option>
                                                    <option value="digital">3 Anos</option>
                                                    <option value="digital">4 Anos</option>
                                                    <option value="digital">5 Anos</option>
                                                </select>
                                                <FaChevronDown className={styles.selectIcon} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol}>
                                            <div className={styles.stampGroup}>
                                                <label className={styles.label} htmlFor="email">
                                                    Selo de Garantia
                                                </label>
                                                <div className={styles.stampGroupBody}>
                                                    <div className={`${styles.stamp} ${styles.active}`}>
                                                        <div className={styles.stampHead}>Selo 1</div>
                                                        <div className={styles.stampBody}>
                                                            <img
                                                                className={styles.stampImg}
                                                                src={seloGarantiaImg}
                                                                alt="Selo de Garantia"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className={styles.stamp}>
                                                        <div className={styles.stampHead}>Selo 2</div>
                                                        <div className={styles.stampBody}>
                                                            <img
                                                                className={styles.stampImg}
                                                                src={seloGarantiaImg}
                                                                alt="Selo de Garantia"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className={styles.stamp}>
                                                        <div className={styles.stampHead}>Selo 3</div>
                                                        <div className={styles.stampBody}>
                                                            <img
                                                                className={styles.stampImg}
                                                                src={seloGarantiaImg}
                                                                alt="Selo de Garantia"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className={styles.stamp}>
                                                        <div className={styles.stampHead}>Selo 4</div>
                                                        <div className={styles.stampBody}>
                                                            <img
                                                                className={styles.stampImg}
                                                                src={seloGarantiaImg}
                                                                alt="Selo de Garantia"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className={styles.stamp}>
                                                        <div className={styles.stampHead}>Selo 5</div>
                                                        <div className={styles.stampBody}>
                                                            <img
                                                                className={styles.stampImg}
                                                                src={seloGarantiaImg}
                                                                alt="Selo de Garantia"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className={styles.stamp}>
                                                        <div className={styles.stampHead}>Selo 6</div>
                                                        <div className={styles.stampBody}>
                                                            <img
                                                                className={styles.stampImg}
                                                                src={seloGarantiaImg}
                                                                alt="Selo de Garantia"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className={styles.stamp}>
                                                        <div className={styles.stampHead}>Selo 7</div>
                                                        <div className={styles.stampBody}>
                                                            <img
                                                                className={styles.stampImg}
                                                                src={seloGarantiaImg}
                                                                alt="Selo de Garantia"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {hasAttemptedSave && validationErrors.includes('suporteGarantia') && <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>}
                                </div>
                            </div>
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>URL's Personalizadas</h2>
                                    {hasAttemptedSave && !validationErrors.includes('urlsPersonalizadas') && <FaCheckCircle className={styles.checkIcon} />}
                                </div>
                                <div className={`${styles.contentCardBody} ${hasAttemptedSave && validationErrors.includes('urlsPersonalizadas') ? styles.missing : ''}`}>
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol}>
                                            <div className={styles.radioSection}>
                                                <div className={styles.radioTop}>
                                                    <label className={styles.label} htmlFor="maxima">
                                                        Página de Venda
                                                    </label>
                                                </div>
                                                <div className={styles.radioBody}>
                                                    <label className={styles.radioButton}>
                                                        <input
                                                            type="radio"
                                                            name="dadosProduto.urlPersonalizada"
                                                            defaultValue="proprio"
                                                        />
                                                        <span className={styles.radio} />
                                                        Meu próprio site
                                                    </label>
                                                    <label className={styles.radioButton}>
                                                        <input
                                                            type="radio"
                                                            name="dadosProduto.urlPersonalizada"
                                                            defaultValue="instagram"
                                                        />
                                                        <span className={styles.radio} />
                                                        Instagram
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.dataCol5}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="instagram">
                                                    URL da página do perfil do Instagram
                                                </label>
                                                <input type="text" name="dadosProduto.urlPersonalizada" className={styles.input} value={produtoData.dadosProduto.urlPersonalizada} onChange={(e) => handleInputChange(e.target.name, e.target.value)} />
                                            </div>
                                        </div>
                                        <label className={`${styles.label} ${styles.interSection}`}>
                                            URL's para as páginas de obrigado
                                        </label>
                                        <div className={styles.dataCol5}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="email">
                                                    URL da página de obrigado
                                                </label>
                                                <input type="text" name="dadosProduto.urlPersonalizada" className={styles.input} value={produtoData.dadosProduto.urlPersonalizada} onChange={(e) => handleInputChange(e.target.name, e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    {hasAttemptedSave && validationErrors.includes('urlsPersonalizadas') && <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>}
                                </div>
                            </div>
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Fotos</h2>
                                    <FaCheckCircle className={styles.checkIcon} />
                                </div>
                                <div className={styles.contentCardBody}>
                                    <div className={styles.selectDocs}>
                                        <button className={styles.fileBtn} onClick={() => handleFileButtonClick(fotosFileInputRef)}>
                                            <FaArrowUpFromBracket /> Selecionar Arquivos
                                        </button>
                                        <input
                                            type="file"
                                            ref={fotosFileInputRef}
                                            onChange={(e) => handleFileChange(e, 'produto')}
                                            style={{ display: "none" }}
                                            multiple
                                        />
                                        <p className={styles.maxLenght}>Tamanho Máximo: x MB</p>
                                    </div>
                                    <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>
                                </div>
                            </div>
                            <div className={styles.paginationContainer}>
                                <div className={styles.paginationControls}>
                                    <button className={`${styles.paginationBtn} ${styles.btnCancel}`} onClick={() => navigate('/produtos/')}>Cancelar</button>
                                    <button className={`${styles.paginationBtn} ${styles.btnSave}`} onClick={handleSave}>Salvar</button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeSection === 'checkout' && (
                        <div className={styles.contentSection} id="checkoutSection">
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Banner</h2>
                                </div>
                                <div className={styles.contentCardBody}>
                                    <div className={styles.selectDocs}>
                                        <button className={styles.fileBtn} onClick={() => handleFileButtonClick(bannerFileInputRef)}>
                                            <FaArrowUpFromBracket /> Selecionar Arquivo
                                        </button>
                                        <input
                                            type="file"
                                            ref={bannerFileInputRef}
                                            onChange={(e) => handleFileChange(e, 'banner')}
                                            style={{ display: "none" }}
                                        />
                                        <p className={styles.maxLenght}>Tamanho Máximo: x MB. Para melhor resultado utilize imagens no tamanho 999 x 99</p>
                                    </div>
                                    <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>
                                </div>
                            </div>
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Exibições</h2>
                                </div>
                                <div className={styles.contentCardBody}>
                                    <div className={styles.sliderGroup}>
                                        <div className={styles.switchContainer}>
                                            <input
                                                type="checkbox"
                                                className={styles.slideCheckbox}
                                                id="imagemProduto"
                                                name="checkoutProduto.exibicoes.exibirImagensProduto"
                                                checked={produtoData.checkoutProduto.exibicoes.exibirImagensProduto}
                                                onChange={(e) => handleInputChange(e.target.name, e.target.checked)}
                                            />
                                            <label className={styles.slideSwitch} htmlFor="imagemProduto">
                                                <span className={styles.sliderSwitch} />
                                            </label>
                                        </div>
                                        <p className={styles.sliderText}>Imagem do produto</p>
                                    </div>
                                    <div className={styles.sliderGroup}>
                                        <div className={styles.switchContainer}>
                                            <input
                                                type="checkbox"
                                                className={styles.slideCheckbox}
                                                id="seloGarantia"
                                                name="checkoutProduto.exibicoes.exibirSelos"
                                                checked={produtoData.checkoutProduto.exibicoes.exibirSelos}
                                                onChange={(e) => handleInputChange(e.target.name, e.target.checked)}
                                            />
                                            <label className={styles.slideSwitch} htmlFor="seloGarantia">
                                                <span className={styles.sliderSwitch} />
                                            </label>
                                        </div>
                                        <p className={styles.sliderText}>Selo de Garantia</p>
                                    </div>
                                    <div className={styles.sliderGroup}>
                                        <div className={styles.switchContainer}>
                                            <input
                                                type="checkbox"
                                                className={styles.slideCheckbox}
                                                id="faq"
                                                name="checkoutProduto.exibicoes.exibirFaq"
                                                checked={produtoData.checkoutProduto.exibicoes.exibirFaq}
                                                onChange={(e) => handleInputChange(e.target.name, e.target.checked)}
                                            />
                                            <label className={styles.slideSwitch} htmlFor="faq">
                                                <span className={styles.sliderSwitch} />
                                            </label>
                                        </div>
                                        <p className={styles.sliderText}>FAQ</p>
                                    </div>
                                </div>
                            </div>
                            {produtoData.checkoutProduto.exibicoes.exibirFaq && (
                                <div className={styles.contentCard}>
                                    <div className={styles.contentCardHeader}>
                                        <h2 className={styles.contentCardTitle}>Perguntas e Respostas (FAQ)</h2>
                                        <button className={styles.btnAddFaq} onClick={handleAddPergunta}><FaPlus /></button>
                                    </div>
                                    <div className={styles.contentCardBody}>
                                        {produtoData.checkoutProduto.perguntas.map((item, index) => (
                                            <div key={item.id || index} className={styles.dataCol8} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                                                <div className={styles.dataCol}>
                                                    <div className={styles.inputGroup}>
                                                        <label className={styles.label}>Pergunta</label>
                                                        <input 
                                                            type="text" 
                                                            className={styles.input} 
                                                            value={item.pergunta} 
                                                            onChange={(e) => handleUpdatePergunta(index, 'pergunta', e.target.value)} 
                                                        />
                                                    </div>
                                                </div>
                                                <div className={styles.dataCol}>
                                                    <div className={styles.inputGroup}>
                                                        <label className={styles.label}>Resposta</label>
                                                        <input
                                                            type="text"
                                                            className={styles.input}
                                                            value={item.resposta}
                                                            onChange={(e) => handleUpdatePergunta(index, 'resposta', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className={styles.paginationContainer}>
                                <div className={styles.paginationControls}>
                                    <button className={`${styles.paginationBtn} ${styles.btnCancel}`} onClick={() => navigate('/produtos/')}>Cancelar</button>
                                    <button className={`${styles.paginationBtn} ${styles.btnSave}`} onClick={handleSave}>Salvar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'plano' && (
                        <div className={styles.contentSection} id="planoSection">
                            {showPlanoForm ? (
                                <div id="planoFormView">
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                            <h2 className={styles.contentCardTitle}>Novo Plano</h2>
                                </div>
                                <div className={styles.contentCardBody}>
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol6}>
                                            <div className={styles.inputGroup}>
                                                        <label className={styles.label} htmlFor="planoNome">
                                                            Nome
                                                </label>
                                                        <input type="text" name="planoNome" className={styles.input} value={newPlano.nome} onChange={(e) => setNewPlano(p => ({...p, nome: e.target.value}))}/>
                                            </div>
                                        </div>
                                                <div className={styles.dataCol}>
                                                    <div className={styles.radioSection}>
                                                        <div className={styles.radioTop}>
                                                            <label className={styles.label}>Periodicidade</label>
                                                        </div>
                                                        <div className={styles.radioBody}>
                                                            <label className={styles.radioButton}>
                                                                <input
                                                                    type="radio"
                                                                    name="periodicidade"
                                                                    value="MENSAL"
                                                                    checked={newPlano.peridiocidade === 'MENSAL'}
                                                                    onChange={(e) => setNewPlano(p => ({...p, peridiocidade: e.target.value}))}
                                                                />
                                                                <span className={styles.radio} />
                                                                Mensal
                                                </label>
                                                            <label className={styles.radioButton}>
                                                                <input
                                                                    type="radio"
                                                                    name="periodicidade"
                                                                    value="TRIMESTRAL"
                                                                    checked={newPlano.peridiocidade === 'TRIMESTRAL'}
                                                                    onChange={(e) => setNewPlano(p => ({...p, peridiocidade: e.target.value}))}
                                                                />
                                                                <span className={styles.radio} />
                                                                Trimestral
                                                </label>
                                                            <label className={styles.radioButton}>
                                                                <input
                                                                    type="radio"
                                                                    name="periodicidade"
                                                                    value="SEMESTRAL"
                                                                    checked={newPlano.peridiocidade === 'SEMESTRAL'}
                                                                    onChange={(e) => setNewPlano(p => ({...p, peridiocidade: e.target.value}))}
                                                                />
                                                                <span className={styles.radio} />
                                                                Semestral
                                                </label>
                                                            <label className={styles.radioButton}>
                                                                <input
                                                                    type="radio"
                                                                    name="periodicidade"
                                                                    value="ANUAL"
                                                                    checked={newPlano.peridiocidade === 'ANUAL'}
                                                                    onChange={(e) => setNewPlano(p => ({...p, peridiocidade: e.target.value}))}
                                                                />
                                                                <span className={styles.radio} />
                                                                Anual
                                                </label>
                                            </div>
                                        </div>
                                            </div>
                                                <div className={styles.dataCol7}>
                                            <div className={styles.inputGroup}>
                                                        <label className={styles.label} htmlFor="preco">
                                                            Preço
                                                </label>
                                                        <input type="number" name="preco" className={styles.input} value={newPlano.preco} onChange={(e) => setNewPlano(p => ({...p, preco: parseFloat(e.target.value)}))} />
                                            </div>
                                                    <div className={styles.sliderGroup}>
                                                        <div className={styles.switchContainer}>
                                                            <input
                                                                type="checkbox"
                                                                className={styles.slideCheckbox}
                                                                id="planoGratis"
                                                                checked={newPlano.gratis}
                                                                onChange={(e) => setNewPlano(p => ({...p, gratis: e.target.checked}))}
                                                            />
                                                            <label className={styles.slideSwitch} htmlFor="planoGratis">
                                                                <span className={styles.sliderSwitch} />
                                                </label>
                                            </div>
                                                        <p className={styles.sliderText}>Grátis</p>
                                        </div>
                                    </div>
                                                <div className={styles.dataCol2}>
                                            <div className={styles.inputGroup}>
                                                        <label className={styles.label} htmlFor="planoDescricao">
                                                            Descrição
                                                </label>
                                                        <textarea
                                                            id="planoDescArea"
                                                            name="planoDescricao"
                                                            className={styles.inputArea}
                                                            value={newPlano.descricao}
                                                            onChange={(e) => setNewPlano(p => ({...p, descricao: e.target.value}))}
                                                        />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol6}>
                                                    <div className={styles.selectWrapper}>
                                                        <label className={styles.label} htmlFor="formato">
                                                            Primeira Parcela
                                                </label>
                                                        <select className={styles.filterSelect} value={newPlano.primeiraParcela} onChange={(e) => setNewPlano(p => ({...p, primeiraParcela: e.target.value}))}>
                                                            <option value="IGUAL">Igual as demais</option>
                                                            <option value="DIFERENTE">Valor diferente</option>
                                                        </select>
                                                        <FaChevronDown className={styles.selectIcon} />
                                            </div>
                                        </div>
                                                <div className={styles.dataCol8}>
                                            <div className={styles.inputGroup}>
                                                        <label className={styles.label} htmlFor="planoReferencia">
                                                            Recorrência
                                                </label>
                                                        <input
                                                            type="text"
                                                            name="planoReferencia"
                                                            className={styles.input}
                                                            value={newPlano.recorrencia}
                                                            onChange={(e) => setNewPlano(p => ({...p, recorrencia: e.target.value}))}
                                                        />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                        <label className={styles.label} htmlFor="planoSku">
                                                            SKU
                                                </label>
                                                        <input type="text" name="planoSku" className={styles.input} value={newPlano.sku} onChange={(e) => setNewPlano(p => ({...p, sku: e.target.value}))} />
                                            </div>
                                        </div>
                                    </div>
                                            </div>
                                        </div>
                                    <div className={styles.paginationContainer}>
                                        <div className={styles.paginationControls}>
                                            <button className={`${styles.paginationBtn} ${styles.btnCancel}`} onClick={() => setShowPlanoForm(false)}>Cancelar</button>
                                            <button className={`${styles.paginationBtn} ${styles.btnSave}`} onClick={handleSavePlano} style={{ backgroundColor: "#0070E1", color: "#fff" }}>Salvar Plano</button>
                                            </div>
                                        </div>
                                    </div>
                            ) : (
                                <div id="planoTableView">
                                    <div className={styles.contentCard}>
                                        <div className={styles.contentCardHeaderPlano}>
                                            <button className={styles.paginationBtn2} onClick={() => {
                                                setEditingPlanoIndex(null);
                                                setNewPlano(initialPlanoState);
                                                setShowPlanoForm(true);
                                            }}>Novo Plano</button>
                                    </div>
                                    <div className={styles.dataSection}>
                                            <div className={styles.tableContainer}>
                                                <div className={styles.tableResponsive}>
                                                    <table className={styles.reportTable}>
                                                        <thead>
                                                            <tr>
                                                                <th className={styles.sortable}>Nome</th>
                                                                <th className={styles.sortable}>Periodicidade</th>
                                                                <th className={styles.sortable}>URL Checkout</th>
                                                                <th className={styles.sortable}>Ativo</th>
                                                                <th className={styles.sortable}>Privado</th>
                                                                <th className={`${styles.sortable} ${styles['text-center']}`}>Ações</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {produtoData.planos.map((plano, index) => (
                                                            <React.Fragment key={plano.id || index}>
                                                            <tr>
                                                                <td>
                                                                        <button className={styles.btnExpand} onClick={() => toggleRowExpansion(String(index))}>
                                                                            {expandedRows[String(index)] ? <FaMinus /> : <FaPlus />}
                                                                    </button>
                                                                        {plano.nome}
                                                                </td>
                                                                    <td>{plano.peridiocidade}</td>
                                                                <td>
                                                                    <div className={styles.urlCheckoutContainer}>
                                                                            <input
                                                                                id={`urlCheckout${index}`}
                                                                                type="text"
                                                                                className={styles.urlCheckoutInput}
                                                                                value={plano.id ? `${window.location.origin}/checkout/${produtoId}/${plano.id}` : 'URL disponível após salvar'}
                                                                                readOnly
                                                                            />
                                                                            <button
                                                                                className={`${styles.btnCopyUrl} ${copiedUrlStatuses[`urlCheckout${index}`] ? styles.copied : ''}`}
                                                                                title="Copiar URL"
                                                                                onClick={() => handleCopyUrl(`urlCheckout${index}`)}
                                                                                disabled={!plano.id}
                                                                            >
                                                                                {copiedUrlStatuses[`urlCheckout${index}`] ? <FaCheck /> : <FaCopy />}
                                                                            </button>
                                                                    </div>
                                                                </td>
                                                                <td style={{ width: 51 }}>
                                                                    <div className={styles.switchContainer}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className={styles.slideCheckbox}
                                                                            id="planoAtivo1"
                                                                        />
                                                                        <label
                                                                            className={styles.slideSwitch}
                                                                            htmlFor="planoAtivo1"
                                                                        >
                                                                            <span className={styles.sliderSwitch} />
                                                </label>
                                            </div>
                                                                </td>
                                                                <td style={{ width: 51 }}>
                                                                    <div className={styles.switchContainer}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className={styles.slideCheckbox}
                                                                            id="planoPrivado1"
                                                                        />
                                                                        <label
                                                                            className={styles.slideSwitch}
                                                                            htmlFor="planoPrivado1"
                                                                        >
                                                                            <span className={styles.sliderSwitch} />
                                                </label>
                                            </div>
                                                                </td>
                                                                <td className={`${styles['text-center']}`}>
                                                                    <div className={styles.btnActions}>
                                                                        <button className={`${styles.btnAction} ${styles.btnCopy}`}><FaCopy /></button>
                                                                        <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={() => handleEditPlano(index)}><FaPencilAlt /></button>
                                                                            <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => handleRemovePlano(index)}><FaTrashAlt /></button>
                                        </div>
                                                                </td>
                                                            </tr>
                                                                {expandedRows[String(index)] && (
                                                                <tr className={styles.expandedRow} id={`expandedContent${index}`}>
                                                                    <td colSpan={6}>
                                                                        <div className={styles.expandedContent}>
                                                                            <div className={styles.expandedInfo}>
                                                                                <div className={styles.infoLabels}>
                                                                                    <span className={styles.infoLabel}>Preço</span>
                                                                                    <span className={styles.infoLabel}>
                                                                                        Primeira Parcela
                                                                                    </span>
                                                                                    <span className={styles.infoLabel}>
                                                                                        Máximo Recorrência
                                                                                    </span>
                                                                                    <span className={styles.infoLabel}>
                                                                                        Aceita parcelar adesão
                                                                                    </span>
                                                                                    <span className={styles.infoLabel}>Referência</span>
                                                                                    <span className={styles.infoLabel}>SKU</span>
                                                                                    <span className={styles.infoLabel}>Descrição</span>
                                            </div>
                                                                                <div className={styles.infoValues}>
                                                                                    <span className={styles.infoValue}>R$ {plano.preco}</span>
                                                                                    <span className={styles.infoValue}>
                                                                                        {plano.primeiraParcela}
                                                                                    </span>
                                                                                    <span className={styles.infoValue}>0</span>
                                                                                    <span className={styles.infoValue}>Não</span>
                                                                                    <span className={styles.infoValue}>{plano.recorrencia}</span>
                                                                                    <span className={styles.infoValue}>{plano.sku}</span>
                                                                                    <span className={styles.infoValue}>
                                                                                       {plano.descricao}
                                                                                    </span>
                                        </div>
                                    </div>
                                            </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            </React.Fragment>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                        </div>
                                            </div>
                                        </div>
                                    </div>
                                            </div>
                            )}
                            {!showPlanoForm && (
                                <div className={styles.paginationContainer}>
                                    <div className={styles.paginationControls}>
                                        <button className={`${styles.paginationBtn} ${styles.btnCancel}`} onClick={() => navigate('/produtos/')}>Cancelar</button>
                                        <button className={`${styles.paginationBtn} ${styles.btnSave}`} onClick={handleSave}>Salvar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {activeSection === 'cupom' && (
                        <div className={styles.contentSection} id="cupomSection">
                            {showCupomForm ? (
                                 <div id="cupomFormView">
                                     <div className={styles.contentCard}>
                                        <div className={styles.contentCardHeader}>
                                            <h2 className={styles.contentCardTitle}>Novo Cupom</h2>
                                            </div>
                                         <div className={styles.contentCardBody}>
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol6}>
                                            <div className={styles.inputGroup}>
                                                        <label className={styles.label} htmlFor="cupomCodigo">
                                                            Código do Cupom
                                                </label>
                                                        <input type="text" name="cupomCodigo" className={styles.input} value={newCupom.codigoCupom} onChange={e => setNewCupom(c => ({...c, codigoCupom: e.target.value}))} />
                                            </div>
                                        </div>
                                                <div className={styles.dataCol}>
                                                    <div className={styles.radioSection}>
                                                        <div className={styles.radioTop}>
                                                            <label className={styles.label}>Tipo de Desconto</label>
                                            </div>
                                                        <div className={styles.radioBody}>
                                                            <label className={styles.radioButton}>
                                                                <input
                                                                    type="radio"
                                                                    name="tipoDesconto"
                                                                    value="VALOR"
                                                                    checked={newCupom.tipoDesconto === 'VALOR'}
                                                                    onChange={e => setNewCupom(c => ({...c, tipoDesconto: e.target.value}))}
                                                                />
                                                                <span className={styles.radio} />
                                                                Valor
                                                </label>
                                                            <label className={styles.radioButton}>
                                                                <input
                                                                    type="radio"
                                                                    name="tipoDesconto"
                                                                    value="PERCENTUAL"
                                                                    checked={newCupom.tipoDesconto === 'PERCENTUAL'}
                                                                    onChange={e => setNewCupom(c => ({...c, tipoDesconto: e.target.value}))}
                                                                />
                                                                <span className={styles.radio} />
                                                                Percentual
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                                <div className={styles.dataCol7}>
                                            <div className={styles.inputGroup}>
                                                        <label className={styles.label} htmlFor="precoValor">
                                                            Valor
                                                </label>
                                                        <input type="number" name="precoValor" className={styles.input} value={newCupom.valor} onChange={e => setNewCupom(c => ({...c, valor: parseFloat(e.target.value)}))} />
                                            </div>
                                        </div>
                                                <div className={styles.dataCol5}>
                                            <div className={styles.inputGroup}>
                                                        <label className={styles.label} htmlFor="url">
                                                            URL
                                                </label>
                                                        <input type="text" name="url" className={styles.input} value={newCupom.url} onChange={e => setNewCupom(c => ({...c, url: e.target.value}))} />
                                            </div>
                                        </div>
                                    </div>
                                            </div>
                                        </div>
                                    <div className={styles.paginationContainer}>
                                        <div className={styles.paginationControls}>
                                            <button className={`${styles.paginationBtn} ${styles.btnCancel}`} onClick={() => setShowCupomForm(false)}>Cancelar</button>
                                            <button className={`${styles.paginationBtn} ${styles.btnSave}`} onClick={handleSaveCupom} style={{ backgroundColor: "#0070E1", color: "#fff" }}>Salvar Cupom</button>
                                            </div>
                                        </div>
                                    </div>
                            ) : (
                                <div id="cupomTableView">
                                    <div className={styles.contentCard}>
                                        <div className={styles.contentCardHeaderCupom}>
                                            <div className={styles.filterContainer}>
                                                <input 
                                                    type="text" 
                                                    placeholder="Cupom" 
                                                    className={styles.filterInput} 
                                                    value={cupomFilter}
                                                    onChange={e => setCupomFilter(e.target.value)}
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Código/Referência" 
                                                    className={styles.filterInput}
                                                    value={codigoRefFilter}
                                                    onChange={e => setCodigoRefFilter(e.target.value)}
                                                />
                                            </div>
                                            <button className={styles.paginationBtn2} onClick={() => {
                                                setEditingCupomIndex(null);
                                                setNewCupom(initialCupomState);
                                                setShowCupomForm(true);
                                            }}>Novo Cupom</button>
                                    </div>
                                    <div className={styles.dataSection}>
                                            <div className={styles.tableContainer}>
                                                <div className={styles.tableResponsive}>
                                                    <table className={styles.reportTable}>
                                                        <thead>
                                                            <tr>
                                                                <th className={styles.sortable}>Cupom</th>
                                                                <th className={styles.sortable}>URL</th>
                                                                <th className={styles.sortable}>Preço</th>
                                                                <th className={styles.sortable}>Cliques</th>
                                                                <th className={styles.sortable}>Vendas</th>
                                                                <th className={styles.sortable}>CTR</th>
                                                                <th className={styles.sortable}>Ativo</th>
                                                                <th className={styles.sortable}>Ações</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredCupons.map((cupom, index) => {
                                                                const originalIndex = produtoData.cupom.findIndex(c => c === cupom);
                                                                return (
                                                                <tr key={cupom.id || originalIndex}>
                                                                    <td>{cupom.codigoCupom}</td>
                                                                <td>
                                                                    <a
                                                                            href={cupom.url}
                                                                        target="_blank"
                                                                        className={styles.urlText}
                                                                    >
                                                                            {cupom.url}
                                                                    </a>
                                                                </td>
                                                                    <td>R$ {cupom.valor}</td>
                                                                <td>99</td>
                                                                <td>99</td>
                                                                <td>99%</td>
                                                                <td style={{ width: 51 }}>
                                                                    <div className={styles.switchContainer}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className={styles.slideCheckbox}
                                                                            id={`cupomAtivo${originalIndex}`}
                                                                            checked={cupom.ativo}
                                                                            onChange={() => handleToggleCupomAtivo(originalIndex)}
                                                                        />
                                                                        <label
                                                                            className={styles.slideSwitch}
                                                                            htmlFor={`cupomAtivo${originalIndex}`}
                                                                        >
                                                                            <span className={styles.sliderSwitch} />
                                                                        </label>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className={styles.btnActions}>
                                                                        <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={() => handleEditCupom(originalIndex)}>
                                                                        <FaPencilAlt />
                                                                    </button>
                                                                            <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => handleRemoveCupom(originalIndex)}>
                                                                        <FaTrashAlt />
                                                                    </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            )})}
                                                        </tbody>
                                                    </table>
                                            </div>
                                        </div>
                                    </div>
                                            </div>
                                        </div>
                            )}
                            {!showCupomForm && (
                                <div className={styles.paginationContainer}>
                                    <div className={styles.paginationControls}>
                                        <button className={`${styles.paginationBtn} ${styles.btnCancel}`} onClick={() => navigate('/produtos/')}>Cancelar</button>
                                        <button className={`${styles.paginationBtn} ${styles.btnSave}`} onClick={handleSave}>Salvar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default EditarProduto; 