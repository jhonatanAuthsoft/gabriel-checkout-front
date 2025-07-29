import React, { useState } from 'react';
import { FaChevronDown, FaWhatsapp, FaPhone } from 'react-icons/fa';
import styles from './styles.module.css';

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

interface FaqProps {
    imagens: Imagem[];
    mostrarTelefoneSuporte?: boolean;
    mostrarWhatsappSuporte?: boolean;
    telefoneSuporte?: number;
    whatsappSuporte?: number;
    perguntas: Pergunta[];
}



const Faq: React.FC<FaqProps> = ({
    imagens,
    mostrarTelefoneSuporte,
    mostrarWhatsappSuporte,
    telefoneSuporte,
    whatsappSuporte,
    perguntas,
}) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const selos = imagens.filter(img => img.tipoImagem === 'SELO');

    return (
        <div className={styles.downSection}>
            <div className={styles.guaranteeSection}>
                <div className={styles.guaranteeBadge}>
                    {selos.map(selo => (
                        <img key={selo.id} src={selo.signedUrl} alt={selo.nomeImagem} />
                    ))}
                </div>
                <div className={styles.guaranteeInfo}>
                    {perguntas.map((faq, index) => (
                        <div key={faq.id || index} className={styles.faqItem}>
                            <div className={styles.guaranteeQuestion} onClick={() => toggleFaq(index)}>
                                <span>{faq.pergunta}</span>
                                <FaChevronDown className={`${styles.arrow} ${openIndex === index ? styles.open : ''}`} />
                            </div>
                            {openIndex === index && (
                                <div className={styles.guaranteeAnswer}>
                                    <p>{faq.resposta}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.contactSection}>
                <p>Para mais informações ou suporte, entre em contato</p>
                {mostrarWhatsappSuporte && whatsappSuporte && <a href={`https://wa.me/${whatsappSuporte}`} target="_blank" rel="noopener noreferrer" className={styles.whatsappIcon}><FaWhatsapp /></a>}
                {mostrarTelefoneSuporte && telefoneSuporte && <a href={`tel:${telefoneSuporte}`} className={styles.telefoneIcon}><FaPhone /></a>}
            </div>
        </div>
    );
};

export default Faq;