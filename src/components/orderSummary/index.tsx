import React from 'react';
import styles from './styles.module.css';
import productImg from '../../assets/img/dfCirculo.png';
import Faq from '../../components/faq';

interface OrderSummaryProps {
    productName: string;
    planName: string;
    totalPrice: number;
    discount: number;
    finalPrice: number;
    couponCode: string;
    setCouponCode: (code: string) => void;
    onApplyCoupon: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
    productName,
    planName,
    totalPrice,
    discount,
    finalPrice,
    couponCode,
    setCouponCode,
    onApplyCoupon
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
                            <h3>{productName} - {planName}</h3>
                            <div className={styles.productPrice}>{formatCurrency(totalPrice)}</div>
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
                            onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <button className={styles.btnApply} onClick={onApplyCoupon}>Aplicar</button>
                    </div>
                </div>
                
                <div className={styles.orderDetails}>
                    <div className={styles.orderRow}>
                        <span>Subtotal</span>
                        <span>{formatCurrency(totalPrice)}</span>
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