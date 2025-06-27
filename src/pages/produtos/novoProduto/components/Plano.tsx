import React from 'react';

const Plano = () => {
    return (
        <div className="contentSection" id="planoSection">
            <div className="contentCard">
                <div className="contentCardHeaderPlano">
                    <div className="filterContainer">
                        <div className="searchWrapper">
                            <i className="fas fa-search searchIcon"></i>
                            <input type="text" className="searchInput" placeholder="Pesquisar" />
                        </div>
                        <div className="selectWrapper orderByWrapper">
                            <span className="orderByLabel">Ordenar por :</span>
                            <span className="orderByValue"></span>
                            <i className="fas fa-chevron-down selectIcon"></i>
                            <select className="filterSelect" aria-label="Ordenar por">
                                <option value="data" selected>Novos</option>
                                <option value="valor">Mais Caros</option>
                                <option value="cliente">Mais Baratos</option>
                            </select>
                        </div>
                    </div>
                    <button className="paginationBtn2">Adicionar Plano</button>
                </div>
                <div className="contentCardBody">
                    <div className="tableContainer">
                        <div className="tableResponsive">
                            <table className="reportTable">
                                <thead>
                                    <tr>
                                        <th>Nome do Plano</th>
                                        <th>Preço</th>
                                        <th>Tipo</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* table rows */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Plano; 