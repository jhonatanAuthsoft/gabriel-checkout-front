import React from 'react';
import styles from './styles.module.css';
import productImg from '../../assets/img/dfCirculo.png';
import Faq from '../../components/faq';

interface Imagem {
    id: number;
    nomeImagem: string;
    signedUrl: string;
    tipoImagem: 'PRODUTO' | 'BANNER' | 'SELO';
}

interface Pergunta {
    id: number;
    pergunta: string;
    resposta: string;
}

interface Upsell {
    produto: {
        id: string;
        dadosProduto: {
            dadosGerais: {
                nome: string;
            }
        }
    };
    plano: {
        id: number;
        nome: string;
        preco: number;
    };
}

interface OrderSummaryProps {
    imagens: Imagem[];
    productName?: string;
    planName?: string;
    price: number;
    couponCode: string;
    onCouponChange: (value: string) => void;
    onApplyCoupon: () => void;
    discount: number;
    finalPrice: number;
    mostrarTelefoneSuporte?: boolean;
    mostrarWhatsappSuporte?: boolean;
    telefoneSuporte?: number;
    whatsappSuporte?: number;
    quantity: number;
    onQuantityChange: (quantity: number) => void;
    perguntas: Pergunta[];
    selectedUpsells?: {[key: string]: boolean};
    upsellsPrice?: number;
    upsellsData?: Upsell[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
    imagens,
    productName,
    planName,
    price,
    couponCode,
    onCouponChange,
    onApplyCoupon,
    discount,
    finalPrice,
    mostrarTelefoneSuporte,
    mostrarWhatsappSuporte,
    telefoneSuporte,
    whatsappSuporte,
    quantity,
    onQuantityChange,
    perguntas,
    selectedUpsells = {},
    upsellsPrice = 0,
    upsellsData = [],
}) => {
    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className={styles.orderSummary}>
            <div className={styles.orderSummaryInside}>
                <h2>Resumo do Pedido</h2>
                
                <div className={styles.productInfo}>
                    <div className={styles.productImage}>
                        <img src={productImg} alt={productName} />
                    </div>
                    <div className={styles.details}>
                        <div className={styles.productDetails}>
                            <div className={styles.detailsLeft}>
                                <h3>{productName}</h3>
                                <p className={styles.divisor}>-</p>
                                <p>{planName}</p>
                            </div>
                            <div className={styles.productPrice}>{formatCurrency(price)}</div>
                        </div>
                                                <div className={styles.productQuantity}>
                            <button className={styles.qtyBtn} onClick={() => onQuantityChange(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button className={styles.qtyBtn} onClick={() => onQuantityChange(quantity + 1)}>+</button>
                        </div>
                    </div>
                </div>
                
                {/* Seção de Upsells Selecionados */}
                {Object.keys(selectedUpsells).some(key => selectedUpsells[key]) && (
                    <div className={styles.upsellsSection}>
                        <h4>Produtos Adicionais</h4>
                        {upsellsData.map((upsell) => {
                            const upsellKey = `${upsell.produto.id}-${upsell.plano.id}`;
                            if (selectedUpsells[upsellKey]) {
                                return (
                                    <div key={upsellKey} className={styles.upsellItem}>
                                        <div className={styles.upsellDetails}>
                                            <span className={styles.upsellName}>
                                                {upsell.produto.dadosProduto.dadosGerais.nome}
                                            </span>
                                            <span className={styles.upsellPlan}>
                                                {upsell.plano.nome}
                                            </span>
                                        </div>
                                        <span className={styles.upsellPrice}>
                                            {formatCurrency(upsell.plano.preco)}
                                        </span>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                )}
                
                <div className={styles.couponSection}>
                    <label>Cupom de Desconto</label>
                    <div className={styles.couponInput}>
                        <input 
                            type="text" 
                            placeholder="Insira seu cupom" 
                            value={couponCode}
                            onChange={(e) => onCouponChange(e.target.value)}
                        />
                        <button className={styles.btnApply} onClick={onApplyCoupon}>Aplicar</button>
                    </div>
                </div>
                
                <div className={styles.orderDetails}>
                    <div className={styles.orderRow}>
                        <span>Subtotal</span>
                        <span>{formatCurrency(price)}</span>
                    </div>
                    {upsellsPrice > 0 && (
                        <div className={styles.orderRow}>
                            <span>Produtos Adicionais</span>
                            <span>{formatCurrency(upsellsPrice)}</span>
                        </div>
                    )}
                    <div className={styles.orderRow}>
                        <span>Entrega</span>
                        <span className={styles.deliveryInfo}>A entrega é realizada de forma  instantânea no seu e-mail após a compra</span>
                    </div>
                    {discount > 0 && (
                    <div className={styles.orderRow}>
                            <span>Descontos</span>
                            <span>- {formatCurrency(discount)}</span>
                    </div>
                    )}
                    <div className={styles.orderTotal}>
                        <h3>Total</h3>
                        <div className={styles.totalPrice}>{formatCurrency(finalPrice)}</div>
                    </div>
                </div>
            </div>
            <Faq 
                imagens={imagens}
                mostrarTelefoneSuporte={mostrarTelefoneSuporte}
                mostrarWhatsappSuporte={mostrarWhatsappSuporte}
                telefoneSuporte={telefoneSuporte}
                whatsappSuporte={whatsappSuporte}
                perguntas={perguntas}
            />
        </div>
    );
};

export default OrderSummary;