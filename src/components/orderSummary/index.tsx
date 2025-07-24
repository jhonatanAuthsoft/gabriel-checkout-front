import React from 'react';
import styles from './styles.module.css';
import productImg from '../../assets/img/dfCirculo.png';
import Faq from '../../components/faq';

interface OrderSummaryProps {
    productName?: string;
    planName?: string;
    price: number;
    couponCode: string;
    onCouponChange: (value: string) => void;
    onApplyCoupon: () => void;
    discount: number;
    finalPrice: number;
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
                    
                    <div className={styles.productDetails}>
                        <div className={styles.detailsLeft}>
                            <h3>{productName}</h3>
                            <p>- {planName}</p>
                            <div className={styles.productPrice}>{formatCurrency(price)}</div>
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
                
                <div className={styles.deliveryInfo}>
                    <span>ENTREGA</span>
                    <span>Imediata, via E-mail</span>
                </div>
            </div>
            <Faq />
        </div>
    );
};

export default OrderSummary; 