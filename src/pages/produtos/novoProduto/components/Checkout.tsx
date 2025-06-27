import React from 'react';

const Checkout = () => {
    return (
        <div className="contentSection" id="checkoutSection">
            <div className="contentCard">
                <div className="contentCardHeader">
                    <h2 className="contentCardTitle">Aparência do Checkout</h2>
                </div>
                <div className="contentCardBody">
                    <div className="dataSection">
                        <div className="dataCol6">
                            <div className="inputGroup">
                                <label className="label">Imagem</label>
                                <div className="file-input-container">
                                    <input type="file" id="fileInput" className="file-input" accept="image/png, image/jpeg" />
                                    <label htmlFor="fileInput" className="file-input-label">
                                        <i className="fas fa-cloud-arrow-up"></i>
                                        <p>Arraste uma imagem ou <span className="browse-text">busque aqui</span></p>
                                        <span className="file-info">PNG ou JPG de até 100kb</span>
                                    </label>
                                </div>
                            </div>
                            <div className="inputGroup">
                                <label className="label">Selo de Segurança</label>
                                <div className="stampGroupBody">
                                    <div className="stamp active">
                                        <div className="stampImg">
                                            <img src="../../assets/img/stamp1.png" />
                                        </div>
                                        <div className="stampBody">
                                            <h3>Selo 1</h3>
                                            <p>+ Conversão</p>
                                        </div>
                                    </div>
                                    <div className="stamp">
                                        <div className="stampImg">
                                            <img src="../../assets/img/stamp2.png" />
                                        </div>
                                        <div className="stampBody">
                                            <h3>Selo 2</h3>
                                            <p>+ Conversão</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="contentCard">
                <div className="contentCardHeader">
                    <h2 className="contentCardTitle">Opções do Checkout</h2>
                </div>
                <div className="contentCardBody">
                    <div className="dataSection">
                        <div className="dataCol7">
                            <div className="checkboxWrapper">
                                <input type="checkbox" className="checkboxInput" id="campoCpf" />
                                <label className="checkbox" htmlFor="campoCpf">
                                    <span><i className="fas fa-check"></i></span>
                                    <span>Habilitar campo de CPF</span>
                                </label>
                            </div>
                            <div className="checkboxWrapper">
                                <input type="checkbox" className="checkboxInput" id="campoEndereco" />
                                <label className="checkbox" htmlFor="campoEndereco">
                                    <span><i className="fas fa-check"></i></span>
                                    <span>Habilitar campo de Endereço</span>
                                </label>
                            </div>
                            <div className="checkboxWrapper">
                                <input type="checkbox" className="checkboxInput" id="campoCupom" />
                                <label className="checkbox" htmlFor="campoCupom">
                                    <span><i className="fas fa-check"></i></span>
                                    <span>Habilitar campo de Cupom</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="contentCard">
                <div className="contentCardHeader">
                    <h2 className="contentCardTitle">Pixel de Rastreamento</h2>
                </div>
                <div className="contentCardBody">
                    <div className="dataSection">
                        <div className="dataCol8">
                            <div className="inputGroup">
                                <label className="label">Google Analytics</label>
                                <input type="text" className="input" />
                            </div>
                            <div className="inputGroup">
                                <label className="label">Facebook Pixel</label>
                                <input type="text" className="input" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="contentCard">
                <div className="contentCardHeader">
                    <h2 className="contentCardTitle">Order Bump</h2>
                </div>
                <div className="contentCardBody">
                    <div className="dataSection">
                        <p>Crie uma oferta especial de um produto complementar ao que seu cliente está comprando.</p>
                    </div>
                </div>
            </div>
            <div className="contentCard">
                <div className="contentCardHeader">
                    <h2 className="contentCardTitle">Configurações de E-mail</h2>
                </div>
                <div className="contentCardBody">
                    <div className="dataSection">
                        <p>Personalize os e-mails que seus clientes receberão após a compra.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout; 