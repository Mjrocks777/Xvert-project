import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DropboxSaver = ({ downloadUrl, filename }) => {
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!window.Dropbox) {
            console.warn('Dropbox script not loaded yet; dropbox saver may not work until full page load.');
        }
    }, []);

    const handleSave = () => {
        if (!downloadUrl) {
            alert('No file URL available to save. Please finish conversion first.');
            return;
        }

        if (!window.Dropbox || typeof window.Dropbox.save !== 'function') {
            alert('Dropbox Saver script is not loaded. Please check your network or ad blocker.');
            return;
        }

        setIsSaving(true);

        try {
            window.Dropbox.save(downloadUrl, filename || 'converted_file');
            setIsSaving(false);
        } catch (error) {
            console.error('Dropbox save error', error);
            alert('Failed to initiate Dropbox save.');
            setIsSaving(false);
        }
    };

    return (
        <motion.button
            onClick={handleSave}
            disabled={isSaving}
            whileHover={!isSaving ? { scale: 1.06 } : {}}
            whileTap={!isSaving ? { scale: 0.95 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            style={{
                background: '#0061FE',
                color: 'white',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: isSaving ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                minWidth: '200px',
                opacity: isSaving ? 0.7 : 1,
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
            }}
        >
            {isSaving ? 'Saving to Dropbox...' : 'Save to Dropbox'}
        </motion.button>
    );
};

export default DropboxSaver;
