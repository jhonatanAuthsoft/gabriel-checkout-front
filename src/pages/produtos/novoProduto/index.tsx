import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { FaShoppingBag, FaCog, FaPlus, FaMinus, FaCheck, FaCopy, FaCheckCircle, FaPencilAlt, FaTrashAlt, FaSearch } from 'react-icons/fa';
import { FaBars, FaArrowRightFromBracket, FaChevronDown, FaBox, FaArrowUpFromBracket } from 'react-icons/fa6';
import logoImg from '../../../assets/img/df.png';
import seloGarantiaImg from '../../../assets/img/seloGarantia.png';

const NovoProduto: React.FC = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [activeSubMenus, setActiveSubMenus] = useState<string[]>(['Produtos']);
    const [activeSection, setActiveSection] = useState('dados');
    const [description, setDescription] = useState('');
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
    const [showPlanoForm, setShowPlanoForm] = useState(false);
    const [showCupomForm, setShowCupomForm] = useState(false);
    const [copiedUrlStatuses, setCopiedUrlStatuses] = useState<{ [key: string]: boolean }>({});


    const overlayRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const fotosFileInputRef = useRef<HTMLInputElement>(null);
    const bannerFileInputRef = useRef<HTMLInputElement>(null);

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
        setDescription(e.target.value);
    };

    const handleFileButtonClick = (ref: React.RefObject<HTMLInputElement | null>) => {
        ref.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, inputName: string) => {
        if (event.target.files && event.target.files.length > 0) {
            console.log(`${inputName} - Arquivo selecionado: `, event.target.files[0].name);
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
                            <div className={styles.subMenuItem}>Meus Produtos</div>
                        </a>
                        <a href="#">
                            <div className={`${styles.subMenuItem} ${styles.active}`}>Novo Produto</div>
                        </a>
                    </div>
                    <div className={styles.navItem} onClick={() => toggleSubMenu('Configurações')}>
                        <FaCog />
                        <span>Configurações</span>
                        <FaChevronDown className={`${styles.expandIcon} ${activeSubMenus.includes('Configurações') ? styles.rotate : ''}`} />
                    </div>
                    <div className={styles.subMenu} style={{ display: activeSubMenus.includes('Configurações') ? 'block' : 'none' }}>
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
                    <h2 className={styles.pageTitle}>Novo Produto</h2>
                </div>
                <div className={styles.pageContent}>
                    <div className={styles.pageHeader}>
                        <div className={styles.pageSelector}>
                            <button className={`${styles.selectorBtn} ${activeSection === 'dados' ? styles.active : ''}`} onClick={() => handleSectionChange('dados')}>Dados</button>
                            <button className={`${styles.selectorBtn} ${activeSection === 'checkout' ? styles.active : ''}`} onClick={() => handleSectionChange('checkout')}>Checkout</button>
                            <button className={`${styles.selectorBtn} ${activeSection === 'plano' ? styles.active : ''}`} onClick={() => handleSectionChange('plano')}>Plano</button>
                            <button className={`${styles.selectorBtn} ${activeSection === 'links' ? styles.active : ''}`} onClick={() => handleSectionChange('links')}>Links</button>
                            <button className={`${styles.selectorBtn} ${activeSection === 'cupom' ? styles.active : ''}`} onClick={() => handleSectionChange('cupom')}>Cupom</button>
                        </div>
                    </div>

                    {activeSection === 'dados' && (
                        <div className={styles.contentSection} id="dadosSection">
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Dados Gerais</h2>
                                    <FaCheckCircle className={styles.checkIcon} />
                                </div>
                                <div className={styles.contentCardBody}>
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol1}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="codigo">Código</label>
                                                <input type="text" name="codigo" className={styles.input} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="chave">Chave</label>
                                                <input type="text" name="chave" className={styles.input} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol2}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="nome">Nome</label>
                                                <input type="text" name="nome" className={styles.input} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="sku">Código SKU</label>
                                                <input type="text" name="sku" className={styles.input} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="descricao">Descrição</label>
                                                <textarea
                                                    id="descArea"
                                                    name="descricao"
                                                    className={styles.inputArea}
                                                    maxLength={1000}
                                                    value={description}
                                                    onChange={handleDescriptionChange}
                                                />
                                                <p className={styles.textCount}>
                                                    <span>{description.length}</span>/1000
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>
                                </div>
                            </div>
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Formato e Categoria</h2>
                                </div>
                                <div className={`${styles.contentCardBody} ${styles.missing}`}>
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol3}>
                                            <div className={styles.selectWrapper}>
                                                <label className={styles.label} htmlFor="formato">
                                                    Formato
                                                </label>
                                                <select className={styles.filterSelect}>
                                                    <option value="" />
                                                    <option value="fisico">Físico</option>
                                                    <option value="digital">Digital</option>
                                                </select>
                                                <FaChevronDown className={styles.selectIcon} />
                                            </div>
                                            <div className={styles.selectWrapper}>
                                                <label className={styles.label} htmlFor="categoria">
                                                    Categoria
                                                </label>
                                                <select className={styles.filterSelect}>
                                                    <option value="" />
                                                    <option value="eletronicos">Eletrônicos</option>
                                                    <option value="casa">Casa</option>
                                                    <option value="moda">Moda</option>
                                                    <option value="saude">Saúde</option>
                                                    <option value="alimentos">Alimentos</option>
                                                    <option value="esporte">Esporte</option>
                                                    <option value="lazer">Lazer</option>
                                                    <option value="arte">Arte</option>
                                                    <option value="cursos">Cursos</option>
                                                    <option value="colecionaveis">Colecionáveis</option>
                                                    <option value="servicos">Serviços</option>
                                                </select>
                                                <FaChevronDown className={styles.selectIcon} />
                                            </div>
                                        </div>
                                    </div>
                                    <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>
                                </div>
                            </div>
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Cobrança</h2>
                                    <FaCheckCircle className={styles.checkIcon} />
                                </div>
                                <div className={styles.contentCardBody}>
                                    <div className={styles.dataSection} style={{ height: 300 }}></div>
                                    <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>
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
                                                            name="disponibilidade"
                                                            defaultValue="sim"
                                                        />
                                                        <span className={styles.radio} />
                                                        Sim
                                                    </label>
                                                    <label className={styles.radioButton}>
                                                        <input
                                                            type="radio"
                                                            name="disponibilidade"
                                                            defaultValue="nao"
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
                                                <input type="text" name="maxima" className={styles.input} />
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
                                </div>
                                <div className={styles.contentCardBody}>
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol5}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="email">
                                                    E-mail Suporte
                                                </label>
                                                <input type="text" name="email" className={styles.input} />
                                            </div>
                                        </div>
                                        <div className={styles.dataCol4}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.label} htmlFor="telefone">
                                                    Telefone de Suporte
                                                </label>
                                                <input type="text" name="telefone" className={styles.input} />
                                            </div>
                                            <div className={styles.checkboxWrapper}>
                                                <input
                                                    type="checkbox"
                                                    id="checkboxTelefone"
                                                    className={styles.checkboxInput}
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
                                                <input type="text" name="whatsapp" className={styles.input} />
                                            </div>
                                            <div className={styles.checkboxWrapper}>
                                                <input
                                                    type="checkbox"
                                                    id="checkboxWhatsapp"
                                                    className={styles.checkboxInput}
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
                                    <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>
                                </div>
                            </div>
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>URL's Personalizadas</h2>
                                </div>
                                <div className={styles.contentCardBody}>
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
                                                            name="paginaVenda"
                                                            defaultValue="proprio"
                                                        />
                                                        <span className={styles.radio} />
                                                        Meu próprio site
                                                    </label>
                                                    <label className={styles.radioButton}>
                                                        <input
                                                            type="radio"
                                                            name="paginaVenda"
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
                                                <input type="text" name="email" className={styles.input} />
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
                                                <input type="text" name="email" className={styles.input} />
                                            </div>
                                        </div>
                                    </div>
                                    <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>
                                </div>
                            </div>
                            <div className={styles.contentCard}>
                                <div className={styles.contentCardHeader}>
                                    <h2 className={styles.contentCardTitle}>Fotos</h2>
                                </div>
                                <div className={styles.contentCardBody}>
                                    <div className={styles.selectDocs}>
                                        <button className={styles.fileBtn} onClick={() => handleFileButtonClick(fotosFileInputRef)}>
                                            <FaArrowUpFromBracket /> Selecionar Arquivos
                                        </button>
                                        <input
                                            type="file"
                                            ref={fotosFileInputRef}
                                            onChange={(e) => handleFileChange(e, 'fotos')}
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
                                    <button id="btnCancel" className={styles.paginationBtn}>Cancelar</button>
                                    <button id="btnSave" className={styles.paginationBtn}>Salvar</button>
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
                                    <div className={styles.dataSection}>
                                        <div className={styles.dataCol}>
                                            <div className={styles.sliderGroup}>
                                                <div className={styles.switchContainer}>
                                                    <input
                                                        type="checkbox"
                                                        className={styles.slideCheckbox}
                                                        id="imagemProduto"
                                                    />
                                                    <label className={styles.slideSwitch} htmlFor="imagemProduto">
                                                        <span className={styles.sliderSwitch} />
                                                    </label>
                                                </div>
                                                <p className={styles.sliderText}>Imagem do Produto</p>
                                            </div>
                                        </div>
                                        <div className={styles.dataCol}>
                                            <div className={styles.sliderGroup}>
                                                <div className={styles.switchContainer}>
                                                    <input
                                                        type="checkbox"
                                                        className={styles.slideCheckbox}
                                                        id="faq"
                                                    />
                                                    <label className={styles.slideSwitch} htmlFor="faq">
                                                        <span className={styles.sliderSwitch} />
                                                    </label>
                                                </div>
                                                <p className={styles.sliderText}>FAQ</p>
                                            </div>
                                        </div>
                                        <div className={styles.dataCol}>
                                            <div className={styles.sliderGroup}>
                                                <div className={styles.switchContainer}>
                                                    <input
                                                        type="checkbox"
                                                        className={styles.slideCheckbox}
                                                        id="seloGarantia"
                                                    />
                                                    <label className={styles.slideSwitch} htmlFor="seloGarantia">
                                                        <span className={styles.sliderSwitch} />
                                                    </label>
                                                </div>
                                                <p className={styles.sliderText}>Selo de Garantia</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className={styles.missingText}>Campos obrigatórios não preenchidos</p>
                                </div>
                            </div>
                            <div className={styles.paginationContainer}>
                                <div className={styles.paginationControls}>
                                    <button id="btnCancel" className={styles.paginationBtn}>Cancelar</button>
                                    <button id="btnSave" className={styles.paginationBtn}>Salvar</button>
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
                                                        <input type="text" name="planoNome" className={styles.input} />
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
                                                                    defaultValue="mensal"
                                                                />
                                                                <span className={styles.radio} />
                                                                Mensal
                                                            </label>
                                                            <label className={styles.radioButton}>
                                                                <input
                                                                    type="radio"
                                                                    name="periodicidade"
                                                                    defaultValue="trimestral"
                                                                />
                                                                <span className={styles.radio} />
                                                                Trimestral
                                                            </label>
                                                            <label className={styles.radioButton}>
                                                                <input
                                                                    type="radio"
                                                                    name="periodicidade"
                                                                    defaultValue="semestral"
                                                                />
                                                                <span className={styles.radio} />
                                                                Semestral
                                                            </label>
                                                            <label className={styles.radioButton}>
                                                                <input
                                                                    type="radio"
                                                                    name="periodicidade"
                                                                    defaultValue="anual"
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
                                                        <input type="text" name="preco" className={styles.input} />
                                                    </div>
                                                    <div className={styles.sliderGroup}>
                                                        <div className={styles.switchContainer}>
                                                            <input
                                                                type="checkbox"
                                                                className={styles.slideCheckbox}
                                                                id="planoGratis"
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
                                                            defaultValue={""}
                                                        />
                                                    </div>
                                                </div>
                                                <div className={styles.dataCol6}>
                                                    <div className={styles.selectWrapper}>
                                                        <label className={styles.label} htmlFor="formato">
                                                            Primeira Parcela
                                                        </label>
                                                        <select className={styles.filterSelect}>
                                                            <option value="" />
                                                            <option value="fisico">Hoje</option>
                                                            <option value="digital">Primeiro dia do mês</option>
                                                            <option value="digital">Último dia do mês</option>
                                                            <option value="digital">Dias específicos</option>
                                                        </select>
                                                        <FaChevronDown className={styles.selectIcon} />
                                                    </div>
                                                </div>
                                                <div className={styles.dataCol8}>
                                                    <div className={styles.inputGroup}>
                                                        <label className={styles.label} htmlFor="planoReferencia">
                                                            Referência
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="planoReferencia"
                                                            className={styles.input}
                                                        />
                                                    </div>
                                                    <div className={styles.inputGroup}>
                                                        <label className={styles.label} htmlFor="planoSku">
                                                            SKU
                                                        </label>
                                                        <input type="text" name="planoSku" className={styles.input} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.paginationContainer}>
                                        <div className={styles.paginationControls}>
                                            <button className={styles.paginationBtn} onClick={() => setShowPlanoForm(false)}>Cancelar</button>
                                            <button className={styles.paginationBtn} style={{ backgroundColor: "#0070E1", color: "#fff" }}>Salvar</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div id="planoTableView">
                                    <div className={styles.contentCard}>
                                        <div className={styles.contentCardHeaderPlano}>
                                            <button className={styles.paginationBtn2} onClick={() => setShowPlanoForm(true)}>Novo Plano</button>
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
                                                            <tr>
                                                                <td>
                                                                    <button className={styles.btnExpand} onClick={() => toggleRowExpansion('1')}>
                                                                        {expandedRows['1'] ? <FaMinus /> : <FaPlus />}
                                                                    </button>
                                                                    DESIGNERFLIX
                                                                </td>
                                                                <td>Mensal</td>
                                                                <td>
                                                                    <div className={styles.urlCheckoutContainer}>
                                                                        <input id="urlCheckout1" type="text" className={styles.urlCheckoutInput} defaultValue="http://checkout.url/1" />
                                                                        <button className={`${styles.btnCopyUrl} ${copiedUrlStatuses['urlCheckout1'] ? styles.copied : ''}`} title="Copiar URL" onClick={() => handleCopyUrl('urlCheckout1')}>
                                                                            {copiedUrlStatuses['urlCheckout1'] ? <FaCheck /> : <FaCopy />}
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
                                                                        <button className={`${styles.btnAction} ${styles.btnEdit}`}><FaPencilAlt /></button>
                                                                        <button className={`${styles.btnAction} ${styles.btnDelete}`}><FaTrashAlt /></button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {expandedRows['1'] && (
                                                                <tr className={styles.expandedRow} id="expandedContent1">
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
                                                                                    <span className={styles.infoValue}>R$ 0,00</span>
                                                                                    <span className={styles.infoValue}>
                                                                                        Igual as demais
                                                                                    </span>
                                                                                    <span className={styles.infoValue}>0</span>
                                                                                    <span className={styles.infoValue}>Não</span>
                                                                                    <span className={styles.infoValue}>xxxxx</span>
                                                                                    <span className={styles.infoValue}>xxxxx</span>
                                                                                    <span className={styles.infoValue}>
                                                                                        Lorem ipsum is simply dummy text of the
                                                                                        printing and typesetting industry. Lorem
                                                                                        ipsum has been the industry's standard dummy
                                                                                        text ever since the 1500s, when an unknown
                                                                                        printer took
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            <tr>
                                                                <td>
                                                                    <button className={styles.btnExpand} onClick={() => toggleRowExpansion('2')}>
                                                                        {expandedRows['2'] ? <FaMinus /> : <FaPlus />}
                                                                    </button>
                                                                    DESIGNERFLIX
                                                                </td>
                                                                <td>Mensal</td>
                                                                <td>
                                                                    <div className={styles.urlCheckoutContainer}>
                                                                        <input id="urlCheckout2" type="text" className={styles.urlCheckoutInput} defaultValue="http://checkout.url/2" />
                                                                        <button className={`${styles.btnCopyUrl} ${copiedUrlStatuses['urlCheckout2'] ? styles.copied : ''}`} title="Copiar URL" onClick={() => handleCopyUrl('urlCheckout2')}>
                                                                            {copiedUrlStatuses['urlCheckout2'] ? <FaCheck /> : <FaCopy />}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className={styles.switchContainer}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className={styles.slideCheckbox}
                                                                            id="planoAtivo2"
                                                                        />
                                                                        <label
                                                                            className={styles.slideSwitch}
                                                                            htmlFor="planoAtivo2"
                                                                        >
                                                                            <span className={styles.sliderSwitch} />
                                                                        </label>
                                                                    </div>
                                                                </td>
                                                                <td className={styles['text-center']}>
                                                                    <div className={styles.switchContainer}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className={styles.slideCheckbox}
                                                                            id="planoPrivado2"
                                                                        />
                                                                        <label
                                                                            className={styles.slideSwitch}
                                                                            htmlFor="planoPrivado2"
                                                                        >
                                                                            <span className={styles.sliderSwitch} />
                                                                        </label>
                                                                    </div>
                                                                </td>
                                                                <td className={`${styles['text-center']}`}>
                                                                    <div className={styles.btnActions}>
                                                                        <button className={`${styles.btnAction} ${styles.btnCopy}`}><FaCopy /></button>
                                                                        <button className={`${styles.btnAction} ${styles.btnEdit}`}><FaPencilAlt /></button>
                                                                        <button className={`${styles.btnAction} ${styles.btnDelete}`}><FaTrashAlt /></button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {expandedRows['2'] && (
                                                                <tr className={styles.expandedRow} id="expandedContent2">
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
                                                                                    <span className={styles.infoValue}>R$ 0,00</span>
                                                                                    <span className={styles.infoValue}>
                                                                                        Igual as demais
                                                                                    </span>
                                                                                    <span className={styles.infoValue}>0</span>
                                                                                    <span className={styles.infoValue}>Não</span>
                                                                                    <span className={styles.infoValue}>xxxxx</span>
                                                                                    <span className={styles.infoValue}>xxxxx</span>
                                                                                    <span className={styles.infoValue}>
                                                                                        Lorem ipsum is simply dummy text of the
                                                                                        printing and typesetting industry. Lorem
                                                                                        ipsum has been the industry's standard dummy
                                                                                        text ever since the 1500s, when an unknown
                                                                                        printer took
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
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
                                                        <input type="text" name="cupomCodigo" className={styles.input} />
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
                                                                    name="periodicidade"
                                                                    defaultValue="valor"
                                                                />
                                                                <span className={styles.radio} />
                                                                Valor
                                                            </label>
                                                            <label className={styles.radioButton}>
                                                                <input
                                                                    type="radio"
                                                                    name="periodicidade"
                                                                    defaultValue="percentual"
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
                                                        <input type="text" name="precoValor" className={styles.input} />
                                                    </div>
                                                </div>
                                                <div className={styles.dataCol5}>
                                                    <div className={styles.inputGroup}>
                                                        <label className={styles.label} htmlFor="url">
                                                            Preço
                                                        </label>
                                                        <input type="text" name="url" className={styles.input} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.paginationContainer}>
                                        <div className={styles.paginationControls}>
                                            <button className={styles.paginationBtn} onClick={() => setShowCupomForm(false)}>Cancelar</button>
                                            <button className={styles.paginationBtn} style={{ backgroundColor: "#0070E1", color: "#fff" }}>Salvar</button>
                                        </div>
                                    </div>
                                 </div>
                            ) : (
                                <div id="cupomTableView">
                                    <div className={styles.contentCard}>
                                        <div className={styles.contentCardHeaderCupom}>
                                            <div className={styles.filterContainer}>
                                                <input type="text" placeholder="Cupom" className={styles.filterInput} />
                                                <input type="text" placeholder="Código/Referência" className={styles.filterInput} />
                                                <button className={styles.filterInputBtn}>
                                                    <FaSearch /> Filtrar
                                                </button>
                                            </div>
                                            <button className={styles.paginationBtn2} onClick={() => setShowCupomForm(true)}>Novo Cupom</button>
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
                                                            <tr>
                                                                <td>CODCUPOM</td>
                                                                <td>
                                                                    <a
                                                                        href="http://www.url.com"
                                                                        target="_blank"
                                                                        className={styles.urlText}
                                                                    >
                                                                        http://www.url.com
                                                                    </a>
                                                                </td>
                                                                <td>R$ 0,00</td>
                                                                <td>99</td>
                                                                <td>99</td>
                                                                <td>99%</td>
                                                                <td style={{ width: 51 }}>
                                                                    <div className={styles.switchContainer}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className={styles.slideCheckbox}
                                                                            id="cupomAtivo1"
                                                                        />
                                                                        <label
                                                                            className={styles.slideSwitch}
                                                                            htmlFor="cupomAtivo1"
                                                                        >
                                                                            <span className={styles.sliderSwitch} />
                                                                        </label>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className={styles.btnActions}>
                                                                        <button className={`${styles.btnAction} ${styles.btnEdit}`}>
                                                                        <FaPencilAlt />
                                                                    </button>
                                                                        <button className={`${styles.btnAction} ${styles.btnDelete}`}>
                                                                        <FaTrashAlt />
                                                                    </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>CODCUPOM</td>
                                                                <td>
                                                                    <a
                                                                        href="http://www.url.com"
                                                                        target="_blank"
                                                                        className={styles.urlText}
                                                                    >
                                                                        http://www.url.com
                                                                    </a>
                                                                </td>
                                                                <td>R$ 0,00</td>
                                                                <td>99</td>
                                                                <td>99</td>
                                                                <td>99%</td>
                                                                <td style={{ width: 51 }}>
                                                                    <div className={styles.switchContainer}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className={styles.slideCheckbox}
                                                                            id="cupomAtivo2"
                                                                        />
                                                                        <label
                                                                            className={styles.slideSwitch}
                                                                            htmlFor="cupomAtivo2"
                                                                        >
                                                                            <span className={styles.sliderSwitch} />
                                                                        </label>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className={styles.btnActions}>
                                                                        <button className={`${styles.btnAction} ${styles.btnEdit}`}>
                                                                        <FaPencilAlt />
                                                                    </button>
                                                                        <button className={`${styles.btnAction} ${styles.btnDelete}`}>
                                                                        <FaTrashAlt />
                                                                    </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>CODCUPOM</td>
                                                                <td>
                                                                    <a
                                                                        href="http://www.url.com"
                                                                        target="_blank"
                                                                        className={styles.urlText}
                                                                    >
                                                                        http://www.url.com
                                                                    </a>
                                                                </td>
                                                                <td>R$ 0,00</td>
                                                                <td>99</td>
                                                                <td>99</td>
                                                                <td>99%</td>
                                                                <td style={{ width: 51 }}>
                                                                    <div className={styles.switchContainer}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className={styles.slideCheckbox}
                                                                            id="cupomAtivo3"
                                                                        />
                                                                        <label
                                                                            className={styles.slideSwitch}
                                                                            htmlFor="cupomAtivo3"
                                                                        >
                                                                            <span className={styles.sliderSwitch} />
                                                                        </label>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className={styles.btnActions}>
                                                                        <button className={`${styles.btnAction} ${styles.btnEdit}`}>
                                                                        <FaPencilAlt />
                                                                    </button>
                                                                        <button className={`${styles.btnAction} ${styles.btnDelete}`}>
                                                                        <FaTrashAlt />
                                                                    </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>CODCUPOM</td>
                                                                <td>
                                                                    <a
                                                                        href="http://www.url.com"
                                                                        target="_blank"
                                                                        className={styles.urlText}
                                                                    >
                                                                        http://www.url.com
                                                                    </a>
                                                                </td>
                                                                <td>R$ 0,00</td>
                                                                <td>99</td>
                                                                <td>99</td>
                                                                <td>99%</td>
                                                                <td style={{ width: 51 }}>
                                                                    <div className={styles.switchContainer}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className={styles.slideCheckbox}
                                                                            id="cupomAtivo4"
                                                                        />
                                                                        <label
                                                                            className={styles.slideSwitch}
                                                                            htmlFor="cupomAtivo4"
                                                                        >
                                                                            <span className={styles.sliderSwitch} />
                                                                        </label>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className={styles.btnActions}>
                                                                        <button className={`${styles.btnAction} ${styles.btnEdit}`}>
                                                                        <FaPencilAlt />
                                                                    </button>
                                                                        <button className={`${styles.btnAction} ${styles.btnDelete}`}>
                                                                        <FaTrashAlt />
                                                                    </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
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

export default NovoProduto; 