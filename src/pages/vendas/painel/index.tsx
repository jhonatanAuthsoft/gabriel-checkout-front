import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import Chart from 'chart.js/auto';
import type { Chart as ChartType } from 'chart.js';
import { FaShoppingBag, FaBox, FaCog, FaBars, FaChevronDown, FaChartBar, FaDollarSign, FaUserSlash, FaShoppingCart, FaArrowUp, FaArrowDown, FaExpandAlt } from 'react-icons/fa';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import logoImage from '../../../assets/img/df.png';

const VendasPainel = () => {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState(['Vendas']);
    const [activePeriod, setActivePeriod] = useState('Hoje');
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

    const chartData = {
        'Últimos 6 Meses': {
            labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
            datasets: [
                { label: 'Total', data: [20000, 21000, 25000, 17000, 17000, 8000], backgroundColor: '#007bff', },
                { label: 'Campanha', data: [13000, 12000, 7000, 8000, 12000, 5000], backgroundColor: '#212529', },
                { label: 'Link', data: [7000, 7000, 16000, 7000, 4000, 4000], backgroundColor: '#dee2e6', }
            ]
        },
        'Último Ano': {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [
                { label: 'Total', data: [15000, 18000, 20000, 22000, 24000, 26000, 28000, 25000, 22000, 20000, 18000, 22000], backgroundColor: '#007bff', },
                { label: 'Campanha', data: [8000, 10000, 12000, 14000, 15000, 16000, 17000, 15000, 13000, 12000, 10000, 12000], backgroundColor: '#212529', },
                { label: 'Link', data: [7000, 8000, 8000, 8000, 9000, 10000, 11000, 10000, 9000, 8000, 8000, 10000], backgroundColor: '#dee2e6', }
            ]
        },
        'Últimos 3 Meses': {
            labels: ['Abril', 'Maio', 'Junho'],
            datasets: [
                { label: 'Total', data: [17000, 17000, 8000], backgroundColor: '#007bff', },
                { label: 'Campanha', data: [8000, 12000, 5000], backgroundColor: '#212529', },
                { label: 'Link', data: [7000, 4000, 4000], backgroundColor: '#dee2e6', }
            ]
        }
    };

    useEffect(() => {
        if (canvasRef.current) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                chartRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                      ...chartData['Últimos 6 Meses'],
                      datasets: chartData['Últimos 6 Meses'].datasets.map(ds => ({
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
                                            label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(context.parsed.y);
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
    }, []);

    const handleChartPeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const period = e.target.value as keyof typeof chartData;
        if (chartRef.current && chartData[period]) {
            const { labels, datasets } = chartData[period];
            chartRef.current.data.labels = labels;
            chartRef.current.data.datasets.forEach((d, i) => {
                d.data = datasets[i].data;
            });
            chartRef.current.update();
        }
    };

    const chargebackDataSets = {
        'Últimos 6 Meses': [
            { month: 'Janeiro', value: 170 }, { month: 'Fevereiro', value: 90 }, { month: 'Março', value: 200 },
            { month: 'Abril', value: 47 }, { month: 'Maio', value: 25 }, { month: 'Junho', value: 49 },
        ],
        'Últimos 3 Meses': [
            { month: 'Abril', value: 47 }, { month: 'Maio', value: 25 }, { month: 'Junho', value: 49 },
        ],
        'Último Ano': [
            { month: 'Jan', value: 170 }, { month: 'Fev', value: 90 }, { month: 'Mar', value: 200 },
            { month: 'Abr', value: 47 }, { month: 'Mai', value: 25 }, { month: 'Jun', value: 49 },
            { month: 'Jul', value: 150 }, { month: 'Ago', value: 120 }, { month: 'Set', value: 180 },
            { month: 'Out', value: 100 }, { month: 'Nov', value: 70 }, { month: 'Dez', value: 110 },
        ]
    };

    const [chargebackDisplayData, setChargebackDisplayData] = useState(chargebackDataSets['Últimos 6 Meses']);
    const maxChargeback = Math.max(...chargebackDisplayData.map(d => d.value));
    const totalChargeback = chargebackDisplayData.reduce((sum, item) => sum + item.value, 0);

    const handleChargebackPeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const period = e.target.value as keyof typeof chargebackDataSets;
        if (chargebackDataSets[period]) {
            setChargebackDisplayData(chargebackDataSets[period]);
        }
    };

    const reembolsosData = [
        { id: '9999', produto: 'Designerflix Mensal V.2', data: 'dd/mm/aaaa' },
        { id: '9999', produto: 'Designerflix Mensal V.2', data: 'dd/mm/aaaa' },
        { id: '9999', produto: 'Designerflix Mensal V.2', data: 'dd/mm/aaaa' },
        { id: '9999', produto: 'Designerflix Mensal V.2', data: 'dd/mm/aaaa' },
        { id: '9999', produto: 'Designerflix Mensal V.2', data: 'dd/mm/aaaa' },
    ];

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
                <div className={styles.cardValue}>2.999.999,00</div>
                <div className={styles.cardSubContent}>
                    <div className={styles.cardSubvalue}>1450</div>
                    <div className={`${styles.cardTrend} ${styles.positive}`}>
                    <p>
                        <span className={styles.cardTrendText}>
                        <FaArrowUp /> 15%{" "}
                        </span>
                        este mês
                    </p>
                    </div>
                </div>
                </div>
            </div>
            <div className={styles.statsCard}>
                <div className={`${styles.cardIcon} ${styles.ticketIcon}`}>
                <FaDollarSign />
                </div>
                <div className={styles.cardContent}>
                <div className={styles.cardLabel}>Ticket Médio</div>
                <div className={styles.cardValue}>75,00</div>
                <div className={styles.cardSubContent}>
                    <div className={`${styles.cardTrend} ${styles.negative}`}>
                    <p>
                        <span className={styles.cardTrendText}>
                        <FaArrowUp /> 1%{" "}
                        </span>
                        este mês
                    </p>
                    </div>
                </div>
                </div>
            </div>
            <div className={styles.statsCard}>
                <div className={`${styles.cardIcon} ${styles.churnIcon}`}>
                <FaUserSlash />
                </div>
                <div className={styles.cardContent}>
                <div className={styles.cardLabel}>Churn</div>
                <div className={styles.cardValue}>10%</div>
                <div className={styles.cardSubContent}>
                    <div className={`${styles.cardTrend} ${styles.semi}`}>
                    <p>
                        <span className={styles.cardTrendText}>
                        <FaArrowDown /> 5%{" "}
                        </span>
                        este mês
                    </p>
                    </div>
                </div>
                </div>
            </div>
            <div className={styles.statsCard}>
                <div className={`${styles.cardIcon} ${styles.upsellIcon}`}>
                <FaShoppingCart />
                </div>
                <div className={styles.cardContent}>
                <div className={styles.cardLabel}>Upsell</div>
                <div className={styles.cardValue}>25%</div>
                <div className={styles.cardSubContent}>
                    <div className={`${styles.cardTrend} ${styles.positive}`}>
                    <p>
                        <span className={styles.cardTrendText}>
                        <FaArrowUp /> 10%{" "}
                        </span>
                        este mês
                    </p>
                    </div>
                </div>
                </div>
            </div>
            </div>
            <div className={styles.dataSection}>
                <div className={styles.chartSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Total de Vendas por Período</h3>
                        <div className={styles.sectionActions}>
                            <select
                            className={styles.periodSelect}
                            onChange={handleChartPeriodChange}
                            >
                            <option>Últimos 6 Meses</option>
                            <option>Último Ano</option>
                            <option>Últimos 3 Meses</option>
                            </select>
                            <button className={`${styles.goButton} ${styles.goBtn1}`}>
                            <FaArrowRightFromBracket />
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
                        <tr>
                            <td>01</td>
                            <td>Designerflix Mensal V.2</td>
                            <td>
                            <span className={styles.salesCount}>495</span> /{" "}
                            <span className={styles.salesPercentage}>45%</span>
                            </td>
                        </tr>
                        <tr>
                            <td>01</td>
                            <td>Designerflix Mensal V.2</td>
                            <td>
                            <span className={styles.salesCount}>495</span> /{" "}
                            <span className={styles.salesPercentage}>45%</span>
                            </td>
                        </tr>
                        <tr>
                            <td>01</td>
                            <td>Designerflix Mensal V.2</td>
                            <td>
                            <span className={styles.salesCount}>495</span> /{" "}
                            <span className={styles.salesPercentage}>45%</span>
                            </td>
                        </tr>
                        <tr>
                            <td>01</td>
                            <td>Designerflix Mensal V.2</td>
                            <td>
                            <span className={styles.salesCount}>495</span> /{" "}
                            <span className={styles.salesPercentage}>45%</span>
                            </td>
                        </tr>
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
                        <div className={styles.selectWrapper}>
                            <select className={styles.periodSelect} onChange={handleChargebackPeriodChange}>
                                <option value="Últimos 6 Meses">Últimos 6 meses</option>
                                <option value="Últimos 3 Meses">Últimos 3 meses</option>
                                <option value="Último Ano">Último ano</option>
                            </select>
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
                                        style={{ width: `${(item.value / maxChargeback) * 100}%` }}
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
                            <span className={styles.cardTotalLabel}>TOTAL </span><strong className={styles.cardTotalValue}>50</strong>
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
                                {reembolsosData.map((item, index) => (
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
