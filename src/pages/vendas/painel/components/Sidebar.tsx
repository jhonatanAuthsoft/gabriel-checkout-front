import React from 'react';
import { FaShoppingBag, FaChevronDown, FaBox, FaCog } from 'react-icons/fa';

interface SidebarProps {
    isSidebarActive: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarActive }) => {
    return (
        <aside className={`sidebar ${isSidebarActive ? 'active' : ''}`}>
            <nav className="sidebarNav">
                <div className="navItem">
                    <FaShoppingBag />
                    <span>Vendas</span>
                    <FaChevronDown className="expandIcon rotate" />
                </div>
                <div className="subMenu">
                    <a href="vendas.html"><div className="subMenuItem active">Painel de Vendas</div></a>
                    <a href="../relatorios/relatorios.html"><div className="subMenuItem">Relatórios</div></a>
                </div>
                <div className="navItem">
                    <FaBox />
                    <span>Produtos</span>
                    <FaChevronDown className="expandIcon" />
                </div>
                <div className="subMenu" style={{ display: 'none' }}>
                    <div className="subMenuItem">Meus Produtos</div>
                    <div className="subMenuItem">Novo Produto</div>
                </div>
                <div className="navItem">
                    <FaCog />
                    <span>Configurações</span>
                    <FaChevronDown className="expandIcon" />
                </div>
                <div className="subMenu" style={{ display: 'none' }}>
                    <div className="subMenuItem">Clientes</div>
                    <div className="subMenuItem">Usuários</div>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar; 