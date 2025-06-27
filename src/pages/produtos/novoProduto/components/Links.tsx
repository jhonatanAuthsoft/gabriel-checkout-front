import React from 'react';

const Links = () => {
    return (
        <div className="contentSection" id="linksSection">
            <div className="contentCard">
                <div className="contentCardHeader">
                    <h2 className="contentCardTitle">Links de Divulgação</h2>
                </div>
                <div className="contentCardBody">
                    <div className="urlCheckoutContainer">
                        <label>Página de Vendas</label>
                        <div className="urlCheckoutInput">
                            <input type="text" readOnly value="https://pay.designereli.com.br/1" />
                            <button className="btnCopyUrl">
                                <i className="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    <div className="urlCheckoutContainer">
                        <label>Página de Checkout</label>
                        <div className="urlCheckoutInput">
                            <input type="text" readOnly value="https://pay.designereli.com.br/1" />
                            <button className="btnCopyUrl">
                                <i className="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Links; 