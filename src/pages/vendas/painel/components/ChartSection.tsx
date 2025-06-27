import React from 'react';
import { FaArrowRightFromBracket } from 'react-icons/fa';

const ChartSection = () => {
    return (
        <div className="chartSection">
            <div className="sectionHeader">
                <h3 className="sectionTitle">Total de Vendas por Período</h3>
                <div className="sectionActions">
                    <select className="periodSelect">
                        <option>Últimos 6 Meses</option>
                        <option>Último Ano</option>
                        <option>Últimos 3 Meses</option>
                    </select>
                    <button className="goButton goBtn1"><FaArrowRightFromBracket /></button>
                </div>
            </div>
            <div className="chartContainer">
                <canvas id="vendasChart"></canvas>
            </div>
        </div>
    );
};

export default ChartSection; 