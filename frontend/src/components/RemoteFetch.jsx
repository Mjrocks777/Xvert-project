import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from './ToastContext';

/**
 * RemoteFetch — single-step mode
 *
 * Props:
 *   targetFormat         (string)   — the conversion target, e.g. "png", "docx"  (required)
 *   allowedSourceFormats (string[]) — formats the current tool accepts, e.g. ['jpg','png']
 *   onFileFetched        (fn)       — called with a File object if caller wants to load it
 *   isConverting         (bool)     — disables the button while the parent is busy
 */
const RemoteFetch = ({ onUrlSelected, isConverting, allowedSourceFormats = null, targetFormat = null }) => {
    const [url, setUrl] = useState('');
    const { addToast } = useToast();

    const handleUrlSubmit = () => {
        if (!url.trim()) {
            addToast('Please enter a URL', 'error');
            return;
        }
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            addToast('URL must start with http:// or https://', 'error');
            return;
        }
        
        // Notify parent that a remote URL has been "selected"
        if (onUrlSelected) {
            onUrlSelected({
                name: url.split('/').pop() || 'Remote File',
                url: url.trim(),
                isRemote: true
            });
            setUrl(''); // Clear after selecting
            addToast('Remote URL selected!', 'success');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'var(--ag-card-bg, #fff)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--ag-card-border, #e0e0e0)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
            }}
        >
            <h3 style={{
                color: 'var(--ag-text, #1D3557)',
                marginBottom: '0.85rem',
                fontSize: '1.05rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
            }}>
                🌐 Fetch from URL
                {targetFormat && (
                    <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(168, 218, 220, 0.3)',
                        color: 'var(--ag-accent)',
                        borderRadius: '20px',
                        padding: '0.2rem 0.7rem',
                        fontWeight: '800',
                        border: '1px solid var(--ag-accent)',
                    }}>
                        → {targetFormat.toUpperCase()}
                    </span>
                )}
            </h3>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isConverting && handleUrlSubmit()}
                    placeholder="Paste file URL (Direct link, Drive, Dropbox…)"
                    disabled={isConverting}
                    style={{
                        flex: 1,
                        padding: '0.8rem 1.1rem',
                        borderRadius: '10px',
                        border: '2px solid var(--ag-glass-border, #eee)',
                        background: 'var(--ag-input-bg, #f5f5f5)',
                        color: 'var(--ag-text, #222)',
                        fontSize: '0.92rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--ag-accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--ag-glass-border)'}
                />
                <motion.button
                    onClick={handleUrlSubmit}
                    disabled={isConverting || !url.trim()}
                    whileHover={!isConverting ? { scale: 1.03 } : {}}
                    whileTap={!isConverting ? { scale: 0.97 } : {}}
                    style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: isConverting || !url.trim() ? '#ccc' : 'var(--ag-accent, #457B9D)',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '0.92rem',
                        cursor: isConverting || !url.trim() ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Select
                </motion.button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--ag-text-secondary, #666)', marginTop: '0.8rem', opacity: 0.8 }}>
                <strong>Tip:</strong> Press Enter to select. Any public Google Drive or Dropbox link works.
                {allowedSourceFormats && (
                    <div style={{ marginTop: '0.3rem' }}>
                        Accepted: <strong style={{color: 'var(--ag-accent)'}}>{allowedSourceFormats.map(f => f.toUpperCase()).join(', ')}</strong>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default RemoteFetch;