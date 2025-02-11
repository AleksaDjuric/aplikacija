// frontend/src/components/Modal.js
import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button onClick={onClose} style={styles.closeButton}>X</button>
                {children}
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
        width: '90%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '20px',
        position: 'absolute',
        top: '10px',
        right: '10px',
    },
};

export default Modal;