import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import Chart from 'chart.js/auto';
import type { Chart as ChartType } from 'chart.js';
import { FaShoppingBag, FaBox, FaCog, FaBars, FaChevronDown, FaChartBar, FaDollarSign, FaUserSlash, FaShoppingCart, FaArrowUp, FaArrowDown, FaExpandAlt } from 'react-icons/fa';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import logoImage from '../../../assets/img/df.png';

interface DashboardData {
    periodoCalculadoInicio: string;
    periodoCalculadoFim: string;
    totalVendas: {
        valorVendido: number;
        totalVendasAtual: number;
        percentualPeriodoAnterior: number;
    };
    ticketMedio: {
        ticketMedio: number;
        percentualPeriodoAnterior: number;
    };
    churn: {
        percentualChurnPeriodoAtual: number;
        percentualPeriodoAnterior: number;
    };
    produtosMaisVendidos: {
        idProduto: number;
        nome: string;
        totalVendas: number;
        percentualDasVendas: number;
    }[];
    reembolsos30Dias: {
        totalReembolsos: number;
        reembolsos: {
            id: string;
            produto: string;
            data: string;
        }[];
    };
    upsell: {
        percentualUpsellPeriodoAtual: number;
        percentualPeriodoAnterior: number;
    };
    chargebackDTO: {
        totalChargeback: number;
        periodoCalculadoInicio: string;
        periodoCalculadoFim: string;
        mesAmes: {
            mes: string;
            valor: number;
        }[];
    };
    totalVendasPorPeriodoDTO: {
        periodoCalculadoInicio: string;
        periodoCalculadoFim: string;
        mesAmes: {
            mes: string;
            totalVenda: number;
            totalCampanha: number;
            totalLink: number;
        }[];
    };
}

const VendasPainel = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState(['Vendas']);
    const [activePeriod, setActivePeriod] = useState('Mês');
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const chartRef = useRef<ChartType | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const toggleMobileMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setSidebarActive(prev => !prev);
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

    const toggleSubMenu = (menuName: string) => {
        setOpenSubMenus(prev =>
            prev.includes(menuName)
                ? prev.filter(m => m !== menuName)
                : [...prev, menuName]
        );
    };

    const handlePeriodClick = (period: string) => {
        setActivePeriod(period);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("Token não encontrado.");
                return;
            }

            const today = new Date();
            let dataInicial = new Date();
            const dataFim = today.toISOString().split('T')[0];

            switch(activePeriod) {
                case 'Hoje':
                    dataInicial = new Date(today.setHours(0, 0, 0, 0));
                    break;
                case 'Semana':
                    const firstDayOfWeek = today.getDate() - today.getDay();
                    dataInicial = new Date(today.setDate(firstDayOfWeek));
                    dataInicial.setHours(0, 0, 0, 0);
                    break;
                case 'Mês':
                    dataInicial = new Date(today.getFullYear(), today.getMonth(), 1);
                    break;
                case 'Ano':
                    dataInicial = new Date(today.getFullYear(), 0, 1);
                    break;
                default:
                    dataInicial = new Date(today.getFullYear(), today.getMonth(), 1);
                    break;
            }

            const dataInicialStr = dataInicial.toISOString().split('T')[0];
            const apiUrl = import.meta.env.VITE_API_URL;
            
            try {
                const response = await fetch(`${apiUrl}dashboard?dataInicial=${dataInicialStr}&dataFim=${dataFim}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Falha ao buscar dados do dashboard.');
                }

                const data: DashboardData = await response.json();
                setDashboardData(data);
            } catch (error) {
                console.error("Erro ao buscar dados do dashboard:", error);
                setDashboardData(null);
            }
        };

        fetchDashboardData();
    }, [activePeriod]);

    useEffect(() => {
        if (canvasRef.current && dashboardData?.totalVendasPorPeriodoDTO) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            
            const { mesAmes } = dashboardData.totalVendasPorPeriodoDTO;
            const labels = mesAmes.map(item => item.mes);
            const totalVendaData = mesAmes.map(item => item.totalVenda);
            const totalCampanhaData = mesAmes.map(item => item.totalCampanha);
            const totalLinkData = mesAmes.map(item => item.totalLink);

            const datasets = [
                { label: 'Total', data: totalVendaData, backgroundColor: '#007bff' },
                { label: 'Campanha', data: totalCampanhaData, backgroundColor: '#212529' },
                { label: 'Link', data: totalLinkData, backgroundColor: '#dee2e6' }
            ];

            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                chartRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                      labels: labels,
                      datasets: datasets.map(ds => ({
                        ...ds,
                        borderWidth: 0,
                        borderRadius: 4,
                        maxBarThickness: 40,
                        categoryPercentage: 0.7,
                        barPercentage: 0.8
                      }))
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                align: 'center',
                                labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, padding: 30, font: { family: "'Poppins Regular', sans-serif", size: 12 } }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)', titleColor: '#333', bodyColor: '#333', borderColor: '#ddd', borderWidth: 1, padding: 10, boxPadding: 5, usePointStyle: true,
                                callbacks: {
                                    label: function (context) {
                                        let label = context.dataset.label || '';
                                        if (label) { label += ': '; }
                                        if (context.parsed.y !== null) {
                                            label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: { color: '#f0f0f0', lineWidth: 1 },
                                ticks: {
                                    callback: function (value) {
                                        if (typeof value === 'number' && value >= 1000) { return value / 1000 + 'k'; }
                                        return value;
                                    },
                                    font: { family: "'Poppins Regular', sans-serif", size: 11 }, color: '#96A5B8', padding: 10, stepSize: 5000
                                },
                                border: { display: false }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { font: { family: "'Poppins Regular', sans-serif", size: 11 }, color: '#96A5B8' },
                                border: { display: false }
                            }
                        },
                        layout: { padding: { left: 0, right: 0, top: 20, bottom: 0 } }
                    }
                });
            }
        }
        
        const handleResize = () => {
            if (chartRef.current) {
                if (window.innerWidth <= 768) {
                    if (chartRef.current.options?.plugins?.legend) {
                        chartRef.current.options.plugins.legend.position = 'bottom';
                    }
                    if (chartRef.current.options?.plugins?.legend?.labels) {
                        chartRef.current.options.plugins.legend.labels.padding = 10;
                        chartRef.current.options.plugins.legend.labels.boxWidth = 6;
                        if(chartRef.current.options.plugins.legend.labels.font) {
                           (chartRef.current.options.plugins.legend.labels.font as any).size = 10;
                        }
                    }
                }
                chartRef.current.update();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [dashboardData]);

    const chargebackDisplayData = dashboardData?.chargebackDTO.mesAmes.map(item => ({ month: item.mes, value: item.valor })) || [];
    const maxChargeback = Math.max(...chargebackDisplayData.map(d => d.value), 0);
    const totalChargeback = dashboardData?.chargebackDTO.totalChargeback || 0;
    
    const formatCurrency = (value: number | undefined) => {
        if (value === undefined) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const Trend = ({ value }: { value: number | undefined }) => {
        if (value === undefined) return null;
        const isPositive = value >= 0;
        const colorClass = isPositive ? styles.positive : styles.negative;
        const Icon = isPositive ? FaArrowUp : FaArrowDown;

        return (
            <div className={`${styles.cardTrend} ${colorClass}`}>
                <p className={styles.textSpacing}>
                    <span className={styles.cardTrendText}>
                        <Icon /> {Math.abs(value).toFixed(0)}%
                    </span>
                    este mês
                </p>
            </div>
        );
    };

    return (
        <div className={styles.mainContainer}>
        <header className={styles.mainHeader}>
            <div className={styles.headerLeft}>
            <button
                id="mobileMenuBtn"
                className={styles.mobileMenuBtn}
                onClick={toggleMobileMenu}
            >
                <FaBars />
            </button>
            <div
                className={styles.logo}
                style={{ backgroundImage: `url(${logoImage})` }}
            />
            </div>
            <div className={styles.headerActions}>
            <a href="#" className={styles.exitButton}>
                <FaArrowRightFromBracket />
            </a>
            </div>
        </header>
        <aside
            className={`${styles.sidebar} ${isSidebarActive ? styles.active : ""}`}
        >
            <nav className={styles.sidebarNav}>
            <div className={styles.navItem} onClick={() => toggleSubMenu("Vendas")}>
                <FaShoppingBag />
                <span>Vendas</span>
                <FaChevronDown
                className={`${styles.expandIcon} ${openSubMenus.includes("Vendas") ? styles.rotate : ""}`}
                />
            </div>
            <div
                className={styles.subMenu}
                style={{ display: openSubMenus.includes("Vendas") ? "block" : "none" }}
            >
                <a href="#">
                <div className={`${styles.subMenuItem} ${styles.active}`}>
                    Painel de Vendas
                </div>
                </a>
                <a href="/relatorios">
                <div className={styles.subMenuItem}>Relatórios</div>
                </a>
            </div>
            <div className={styles.navItem} onClick={() => toggleSubMenu("Produtos")}>
                <FaBox />
                <span>Produtos</span>
                <FaChevronDown
                className={`${styles.expandIcon} ${openSubMenus.includes("Produtos") ? styles.rotate : ""}`}
                />
            </div>
            <div
                className={styles.subMenu}
                style={{
                display: openSubMenus.includes("Produtos") ? "block" : "none",
                }}
            >
                <a href="/produtos">
                <div className={styles.subMenuItem}>Meus Produtos</div>
                </a>
                <a href="/produtos/novo">
                <div className={styles.subMenuItem}>Novo Produto</div>
                </a>
            </div>
            <div
                className={styles.navItem}
                onClick={() => toggleSubMenu("Configurações")}
            >
                <FaCog />
                <span>Configurações</span>
                <FaChevronDown
                className={`${styles.expandIcon} ${openSubMenus.includes("Configurações") ? styles.rotate : ""}`}
                />
            </div>
            <div
                className={styles.subMenu}
                style={{
                display: openSubMenus.includes("Configurações") ? "block" : "none",
                }}
            >
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
        <div
            className={`${styles.overlay} ${isSidebarActive ? styles.active : ""}`}
            id="overlay"
            ref={overlayRef}
            onClick={toggleMobileMenu}
        />
        <main className={styles.mainContent}>
            <div className={styles.contentHeader}>
            <h2 className={styles.pageTitle}>Painel de Vendas</h2>
            <div className={styles.periodFilters}>
                {["Hoje", "Semana", "Mês", "Ano"].map((period) => (
                <button
                    key={period}
                    className={`${styles.periodButton} ${activePeriod === period ? styles.active : ""}`}
                    onClick={() => handlePeriodClick(period)}
                >
                    {period}
                </button>
                ))}
            </div>
            </div>
            <div className={styles.statsCards}>
            <div className={styles.statsCard}>
                <div className={`${styles.cardIcon} ${styles.totalIcon}`}>
                <FaChartBar />
                </div>
                <div className={styles.cardContent}>
                <div className={styles.cardLabel}>Total de Vendas</div>
                <div className={styles.cardValue}>{formatCurrency(dashboardData?.totalVendas.valorVendido)}</div>
                <div className={styles.cardSubContent}>
                    <div className={styles.cardSubvalue}>{dashboardData?.totalVendas.totalVendasAtual || 0}</div>
                    <Trend value={dashboardData?.totalVendas.percentualPeriodoAnterior} />
                </div>
                </div>
            </div>
            <div className={styles.statsCard}>
                <div className={`${styles.cardIcon} ${styles.ticketIcon}`}>
                <FaDollarSign />
                </div>
                <div className={styles.cardContent}>
                <div className={styles.cardLabel}>Ticket Médio</div>
                <div className={styles.cardValue}>{formatCurrency(dashboardData?.ticketMedio.ticketMedio)}</div>
                <div className={styles.cardSubContent}>
                    <Trend value={dashboardData?.ticketMedio.percentualPeriodoAnterior} />
                </div>
                </div>
            </div>
            <div className={styles.statsCard}>
                <div className={`${styles.cardIcon} ${styles.churnIcon}`}>
                <FaUserSlash />
                </div>
                <div className={styles.cardContent}>
                <div className={styles.cardLabel}>Churn</div>
                <div className={styles.cardValue}>{dashboardData?.churn.percentualChurnPeriodoAtual.toFixed(2) || '0.00'}%</div>
                <div className={styles.cardSubContent}>
                     <Trend value={dashboardData?.churn.percentualPeriodoAnterior} />
                </div>
                </div>
            </div>
            <div className={styles.statsCard}>
                <div className={`${styles.cardIcon} ${styles.upsellIcon}`}>
                <FaShoppingCart />
                </div>
                <div className={styles.cardContent}>
                <div className={styles.cardLabel}>Upsell</div>
                <div className={styles.cardValue}>{dashboardData?.upsell.percentualUpsellPeriodoAtual.toFixed(2) || '0.00'}%</div>
                <div className={styles.cardSubContent}>
                    <Trend value={dashboardData?.upsell.percentualPeriodoAnterior} />
                </div>
                </div>
            </div>
            </div>
            <div className={styles.dataSection}>
                <div className={styles.chartSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Total de Vendas por Período</h3>
                        <div className={styles.sectionActions}>
                            <select className={styles.periodSelect}>
                            <option>Últimos 6 Meses</option>
                            <option>Último Ano</option>
                            <option>Últimos 3 Meses</option>
                            </select>
                            <button className={`${styles.goButton} ${styles.goBtn1}`}>
                                <FaExpandAlt />
                            </button>
                        </div>
                    </div>
                    <div className={styles.chartContainer}>
                    <canvas ref={canvasRef} />
                    </div>
                </div>
                <div className={styles.tableSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Produtos Mais Vendidos</h3>
                        <div className={styles.sectionActions}>
                            <button className={styles.goButton}>
                            <FaArrowRightFromBracket />
                            </button>
                        </div>
                    </div>
                    <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Nome</th>
                            <th>Número de Vendas / %</th>
                        </tr>
                        </thead>
                        <tbody>
                        {dashboardData?.produtosMaisVendidos.map((produto, index) => (
                            <tr key={produto.idProduto}>
                                <td>{String(index + 1).padStart(2, '0')}</td>
                                <td>{produto.nome}</td>
                            <td>
                                    <span className={styles.salesCount}>{produto.totalVendas}</span> /{" "}
                                    <span className={styles.salesPercentage}>{produto.percentualDasVendas.toFixed(2)}%</span>
                            </td>
                        </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
            <div className={styles.dataSection}>
                <div className={styles.chartSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>ChargeBack</h3>
                        <div className={styles.cardTotal}>
                            <span className={styles.cardTotalLabel}>TOTAL </span><strong className={styles.cardTotalValue}>{totalChargeback}</strong>
                        </div>
                        <div className={styles.sectionActions}>
                            <button className={styles.goButton}>
                            <FaArrowRightFromBracket />
                            </button>
                        </div>
                    </div>
                    <div className={styles.chargebackChart}>
                        {chargebackDisplayData.map(item => (
                            <div className={styles.chargebackItem} key={item.month}>
                                <span className={styles.chargebackLabel}>{item.month}</span>
                                <div className={styles.chargebackBarContainer}>
                                    <div 
                                        className={styles.chargebackBar}
                                        style={{ width: `${maxChargeback > 0 ? (item.value / maxChargeback) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <span className={styles.chargebackValue}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                     <div className={styles.chartLegend}>
                        <div className={styles.legendItem}>
                            <span className={`${styles.legendMarker}`} style={{ backgroundColor: '#007bff' }}></span>
                            Total por mês
                        </div>
                    </div>
                </div>
                <div className={styles.tableSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Reembolsos Últimos 30 dias</h3>
                        <div className={styles.cardTotal}>
                            <span className={styles.cardTotalLabel}>TOTAL </span><strong className={styles.cardTotalValue}>{dashboardData?.reembolsos30Dias.totalReembolsos || 0}</strong>
                        </div>
                        <div className={styles.sectionActions}>
                            <button className={styles.goButton}>
                            <FaArrowRightFromBracket />
                            </button>
                        </div>
                    </div>
                    <div className={styles.listContainer}>
                        <table className={styles.reembolsosTable}>
                            <thead>
                                <tr>
                                    <th>Nº Pedido</th>
                                    <th>Produto</th>
                                    <th>Data Solicitação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData?.reembolsos30Dias.reembolsos.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.id}</td>
                                        <td>{item.produto}</td>
                                        <td>{item.data}</td>
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

export default VendasPainel; 
