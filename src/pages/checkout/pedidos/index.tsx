import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import { FaBars, FaShoppingBag, FaCog, FaSearch, FaChevronDown, FaEllipsisV } from 'react-icons/fa';
import logo from '../../../assets/img/df.png';
import productImg from '../../../assets/img/dfCirculo.png';

const Pedidos: React.FC = () => {
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleSidebar = () => {
        setIsSidebarActive(!isSidebarActive);
    };

    const toggleActionsMenu = (menuId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setOpenMenuId(prev => (prev === menuId ? null : menuId));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openMenuId && !menuRef.current?.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenuId]);

    useEffect(() => {
        if (isSidebarActive) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }, [isSidebarActive]);


    return (
        <div className="mainContainer">
            <header className="mainHeader">
                <div className="headerLeft">
                    <button id="mobileMenuBtn" className="mobileMenuBtn" onClick={toggleSidebar}>
                        <FaBars />
                    </button>
                    <div id="logo" style={{ backgroundImage: `url(${logo})`}}></div>
                </div>
                <div className="headerActions">
                    <a href="#" className="exitButton"></a>
                </div>
            </header>

            <aside className={`sidebar ${isSidebarActive ? 'active' : ''}`}>
                <nav className="sidebarNav">
                    <div className="navItem">
                        <FaShoppingBag />
                        <span>Meus Pedidos</span>
                    </div>
                    <div className="navItem">
                        <FaCog />
                        <span>Conta</span>
                    </div>
                </nav>
            </aside>

            <div className={`overlay ${isSidebarActive ? 'active' : ''}`} id="overlay" onClick={toggleSidebar}></div>

            <main className="mainContent">
                <div className="contentHeader">
                    <h2 className="pageTitle">Meus Pedidos</h2>

                    <div className="filterActions">
                        <div className="filterActionsLeft">
                            <div className="searchWrapper">
                                <FaSearch className="searchIcon" />
                                <input type="text" className="searchInput" placeholder="Pesquisar" />
                            </div>
                        </div>
                        <div className="filterActionsRight">
                            <span className="orderByText" style={{ display: 'none' }}>Ordenar por:</span>
                            <div className="selectWrapper orderByWrapper">
                                <span className="orderByLabel">Ordenar por :</span>
                                <span className="orderByValue"></span>
                                <FaChevronDown className="selectIcon" />
                                <select className="filterSelect" aria-label="Ordenar por">
                                    <option value="data" selected>Novos</option>
                                    <option value="valor">Mais Caros</option>
                                    <option value="cliente">Mais Baratos</option>
                                    <option value="cliente">Mais Vendidos</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tableContainer">
                    <div className="tableResponsive">
                        <table className="reportTable">
                            <thead>
                                <tr>
                                    <th className="productImageHeader"></th>
                                    <th className="sortable">Produto(s)</th>
                                    <th className="sortable">N ° Pedido</th>
                                    <th className="sortable">Data</th>
                                    <th className="sortable">Valor</th>
                                    <th className="sortable">Forma Pagamento</th>
                                    <th className="sortable text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: 'actions1', status: 'processando' },
                                    { id: 'actions2', status: 'concluido' }
                                ].map(order => (
                                    <tr key={order.id}>
                                        <td className="productImageCell">
                                            <div className="productImage">
                                                <img src={productImg} alt="Produto 1" />
                                            </div>
                                        </td>
                                        <td>Produto 1</td>
                                        <td>99999999</td>
                                        <td>dd/mm/aaaa</td>
                                        <td>R$ 000,00</td>
                                        <td>Cartão de Crédito</td>
                                        <td className="text-center">
                                            <span className={`statusProduto ${order.status}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                                            <div className="actionsContainer" ref={openMenuId === order.id ? menuRef : null}>
                                                <FaEllipsisV id={order.id} className="actionsBtn" onClick={(e) => toggleActionsMenu(order.id, e)} />
                                                <div className={`actionsMenu ${openMenuId === order.id ? 'show' : ''}`} data-menu-for={order.id}>
                                                    <a href="#">Solicitar o reembolso</a>
                                                    <a href="#">Cancelamento da assinatura</a>
                                                    <a href="#">Reportar Problema</a>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Pedidos; 