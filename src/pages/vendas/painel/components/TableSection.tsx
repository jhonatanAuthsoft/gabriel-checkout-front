import React from 'react';
import { FaArrowRightFromBracket } from 'react-icons/fa';

const TableSection = () => {
    return (
        <div className="tableSection">
            <div className="sectionHeader">
                <h3 className="sectionTitle">Produtos Mais Vendidos</h3>
                <div className="sectionActions">
                    <button className="goButton"><FaArrowRightFromBracket /></button>
                </div>
            </div>
            <div className="tableContainer">
                <table className="dataTable">
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
                            <td><span className="salesCount">495</span> / <span className="salesPercentage">45%</span></td>
                        </tr>
                        <tr>
                            <td>01</td>
                            <td>Designerflix Mensal V.2</td>
                            <td><span className="salesCount">495</span> / <span className="salesPercentage">45%</span></td>
                        </tr>
                        <tr>
                            <td>01</td>
                            <td>Designerflix Mensal V.2</td>
                            <td><span className="salesCount">495</span> / <span className="salesPercentage">45%</span></td>
                        </tr>
                        <tr>
                            <td>01</td>
                            <td>Designerflix Mensal V.2</td>
                            <td><span className="salesCount">495</span> / <span className="salesPercentage">45%</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableSection; 