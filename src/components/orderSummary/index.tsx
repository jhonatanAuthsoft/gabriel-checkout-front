import React from 'react';
import styles from './styles.module.css';
import productImg from '../../assets/img/dfCirculo.png';
import Faq from '../../components/faq';

interface Pergunta {
    id: number;
    pergunta: string;
    resposta: string;
}

interface OrderSummaryProps {
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
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
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