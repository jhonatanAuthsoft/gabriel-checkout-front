import React from 'react';
import { FaChartBar, FaDollarSign, FaUserSlash, FaShoppingCart, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StatsSection = () => {
    return (
        <div className="statsCards">
            <div className="statsCard">
                <div className="cardIcon totalIcon">
                    <FaChartBar />
                </div>
                <div className="cardContent">
                    <div className="cardLabel">Total de Vendas</div>
                    <div className="cardValue">2.999.999,00</div>
                    <div className="cardSubContent">
                        <div className="cardSubvalue">1450</div>
                        <div className="cardTrend positive">
                            <FaArrowUp />
                            <p><span className="cardTrendText">15% </span>este mês</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="statsCard">
                <div className="cardIcon ticketIcon">
                    <FaDollarSign />
                </div>
                <div className="cardContent">
                    <div className="cardLabel">Ticket Médio</div>
                    <div className="cardValue">75,00</div>
                    <div className="cardSubContent">
                        <div className="cardTrend negative">
                            <FaArrowUp />
                            <p><span className="cardTrendText">1% </span>este mês</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="statsCard">
                <div className="cardIcon churnIcon">
                    <FaUserSlash />
                </div>
                <div className="cardContent">
                    <div className="cardLabel">Churn</div>
                    <div className="cardValue">10%</div>
                    <div className="cardSubContent">
                        <div className="cardTrend semi">
                            <FaArrowDown />
                            <p><span className="cardTrendText">5% </span>este mês</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="statsCard">
                <div className="cardIcon upsellIcon">
                    <FaShoppingCart />
                </div>
                <div className="cardContent">
                    <div className="cardLabel">Upsell</div>
                    <div className="cardValue">25%</div>
                    <div className="cardSubContent">
                        <div className="cardTrend positive">
                            <FaArrowUp />
                            <p><span className="cardTrendText">10% </span>este mês</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsSection; 