import React from 'react';
import { FaChevronDown, FaCircleCheck } from 'react-icons/fa6';

const DadosGerais = () => {
    return (
        <div className="contentSection" id="dadosSection">
            <div className="contentCard">
                <div className="contentCardHeader">
                    <h2 className="contentCardTitle">Dados Gerais</h2><FaCircleCheck className="checkIcon" />
                </div>
                <div className="contentCardBody">
                    <div className="dataSection">
                        <div className="dataCol1">
                            <div className="inputGroup"><label className="label" htmlFor="codigo">Código</label><input type="text" name="codigo" className="input" /></div>
                            <div className="inputGroup"><label className="label" htmlFor="chave">Chave</label><input type="text" name="chave" className="input" /></div>
                        </div>
                        <div className="dataCol2">
                            <div className="inputGroup"><label className="label" htmlFor="nome">Nome</label><input type="text" name="nome" className="input" /></div>
                            <div className="inputGroup"><label className="label" htmlFor="sku">Código SKU</label><input type="text" name="sku" className="input" /></div>
                        </div>
                        <div className="dataCol">
                            <div className="inputGroup">
                                <label className="label" htmlFor="descricao">Descrição</label>
                                <textarea id="descArea" name="descricao" className="inputArea" maxLength={1000}></textarea>
                                <p className="textCount"><span id="countNumber">0</span>/1000</p>
                            </div>
                        </div>
                    </div>
                    <p className="missingText">Campos obrigatórios não preenchidos</p>
                </div>
            </div>
            <div className="contentCard">
                <div className="contentCardHeader">
                    <h2 className="contentCardTitle">Formato e Categoria</h2>
                </div>
                <div className="contentCardBody missing">
                    <div className="dataSection">
                        <div className="dataCol3">
                            <div className="selectWrapper">
                                <label className="label" htmlFor="formato">Formato</label>
                                <select className="filterSelect">
                                    <option value="" selected disabled></option>
                                    <option value="fisico">Físico</option>
                                    <option value="digital">Digital</option>
                                </select>
                                <FaChevronDown className="selectIcon" />
                            </div>
                            <div className="selectWrapper">
                                <label className="label" htmlFor="categoria">Categoria</label>
                                <select className="filterSelect">
                                    <option value="" selected disabled></option>
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
                                <FaChevronDown className="selectIcon" />
                            </div>
                        </div>
                    </div>
                    <p className="missingText">Campos obrigatórios não preenchidos</p>
                </div>
            </div>

            <div className="contentCard">
                <div className="contentCardHeader">
                    <h2 className="contentCardTitle">Cobrança</h2><FaCircleCheck className="checkIcon" />
                </div>
                <div className="contentCardBody">
                    <div className="dataSection" style={{ height: '300px' }}></div>
                    <p className="missingText">Campos obrigatórios não preenchidos</p>
                </div>
            </div>

            <div className="contentCard">
                <div className="contentCardHeader">
                    <h2 className="contentCardTitle">Disponibilidade</h2>
                </div>
                <div className="contentCardBody">
                    <div className="dataSection">
                        <div className="dataCol4">
                            <div className="radioSection">
                                <div className="radioTop"><label className="label" htmlFor="maxima">Disponível para Venda</label></div>
                                <div className="radioBody">
                                    <label className="radioButton"><input type="radio" name="disponibilidade" value="sim" /><span className="radio"></span>Sim</label>
                                    <label className="radioButton"><input type="radio" name="disponibilidade" value="nao" /><span className="radio"></span>Não</label>
                                </div>
                            </div>
                            <div className="inputGroup"><label className="label" htmlFor="maxima">Quantidade Máxima</label><input type="text" name="maxima" className="input" /></div>
                        </div>
                    </div>
                    <p className="missingText">Campos obrigatórios não preenchidos</p>
                </div>
            </div>

            <div className="contentCard">
                <div className="contentCardHeader">
                    <h2 className="contentCardTitle">Score do Produto</h2>
                </div>
                <div className="contentCardBody">
                    <div className="dataSection">
                        <div className="dataCol">
                            <div className="radioSection">
                                <div className="radioTop"><label className="label" htmlFor="maxima">Score do produto disponível na vitrine de afiliação:</label></div>
                                <div className="radioBody">
                                    <label className="radioButton"><input type="radio" name="score" value="sim" /><span className="radio"></span>Sim</label>
                                    <label className="radioButton"><input type="radio" name="score" value="nao" /><span className="radio"></span>Não</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="missingText">Campos obrigatórios não preenchidos</p>
                </div>
            </div>

            <div className="contentCard">
                <div className="contentCardHeader">
                    <h2 className="contentCardTitle">Suporte e Garantia</h2>
                </div>
                <div className="contentCardBody">
                    <div className="dataSection">
                        <div className="dataCol5">
                            <div className="inputGroup"><label className="label" htmlFor="email">E-mail Suporte</label><input type="text" name="email" className="input" /></div>
                        </div>
                    </div>
                    <p className="missingText">Campos obrigatórios não preenchidos</p>
                </div>
            </div>
        </div>
    )
}

export default DadosGerais; 