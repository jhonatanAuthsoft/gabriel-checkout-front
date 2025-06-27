import React from 'react';
import styles from './styles.module.css';
import productImg from '../../assets/img/dfCirculo.png';

const OrderSummary: React.FC = () => {
    return (
        <div className={styles.orderSummary}>
            <h2>Resumo do Pedido</h2>
            
            <div className={styles.productInfo}>
                <div className={styles.productImage}>
                    <img src={productImg} alt="Designerflix" />
                </div>
                
                <div className={styles.productDetails}>
                    <div className={styles.detailsLeft}>
                        <h3>DESIGNERFLIX - SEMESTRAL</h3>
                        <div className={styles.productPrice}>R$ 270,00</div>
                    </div>
                    <div className={styles.productQuantity}>
                        <button className={`${styles.qtyBtn} ${styles.decrease}`}>-</button>
                        <span className={styles.qtyValue}>1</span>
                        <button className={`${styles.qtyBtn} ${styles.increase}`}>+</button>
                    </div>
                </div>
            </div>
            
            <div className={styles.couponSection}>
                <label>Cupom de Desconto</label>
                <div className={styles.couponInput}>
                    <input type="text" placeholder="" />
                    <button className={styles.btnApply}>Aplicar</button>
                </div>
            </div>
            
            <div className={styles.orderDetails}>
                <div className={styles.orderRow}>
                    <span>Subtotal</span>
                    <span>R$ 270,00</span>
                </div>
                <div className={styles.orderRow}>
                    <span>Taxas</span>
                    <span>R$ 0,00</span>
                </div>
                <div className={styles.orderRow}>
                    <span>Envio</span>
                    <span className={styles.deliveryInfo}>A entrega é realizada de forma instantânea no seu e-mail após a compra</span>
                </div>
            </div>
            
            <div className={styles.orderTotal}>
                <h3>Total</h3>
                <div className={styles.totalPrice}>R$ 270,00</div>
            </div>
        </div>
    );
};

export default OrderSummary; 