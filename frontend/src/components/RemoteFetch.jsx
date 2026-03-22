import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from './ToastContext';

const RemoteFetch = ({ onFileFetched, isConverting }) => {
    const [url, setUrl] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [detectedInfo, setDetectedInfo] = useState(null);
    const [selectedTargetFormat, setSelectedTargetFormat] = useState('');
    const { addToast } = useToast();

    const handleDetect = async () => {
        if (!url.trim()) {
            addToast('Please enter a URL', 'error');
            return;
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            addToast('URL must start with http:// or https://', 'error');
            return;
        }

        setIsDetecting(true);
        setDetectedInfo(null);
        setSelectedTargetFormat('');

        try {
            const formData = new FormData();
            formData.append('url', url.trim());

            const response = await fetch('/api/convert/remote-fetch', {
                method: 'POST',
                body: formData,
            });

            let data = null
            const contentType = response.headers.get('content-type') || ''
            if (contentType.includes('application/json')) {
                try {
                    data = await response.json()
                } catch (jsonErr) {
                    data = null
                }
            }

            if (!response.ok) {
                const message = (data && data.detail) ? data.detail : `Failed to detect file (${response.status})`
                throw new Error(message)
            }

            if (data && data.suggested_conversions) {
                // File detected, show conversion options
                setDetectedInfo(data)
            } else if (contentType.includes('application/json')) {
                // fallback (should not happen): unexpected JSON body without suggestions
                throw new Error('Unexpected response from server during detection')
            } else {
                // Server returned file bytes directly (already converted)
                const blob = await response.blob();
                const disposition = response.headers.get('Content-Disposition') || ''
                let filename = 'converted_file'
                const match = disposition.match(/filename="(.+)"/)
                if (match) filename = match[1]

                const file = new File([blob], filename, { type: blob.type })
                onFileFetched(file)
                addToast('File fetched and converted successfully!', 'success')
            }
        } catch (error) {
            console.error('Detection error:', error);
            addToast(error.message || 'Failed to fetch file from URL', 'error');
        } finally {
            setIsDetecting(false);
        }
    };

    const handleConvert = async () => {
        if (!selectedTargetFormat) {
            addToast('Please select a target format', 'error');
            return;
        }

        setIsDetecting(true);

        try {
            const formData = new FormData();
            formData.append('url', url.trim());
            formData.append('target_format', selectedTargetFormat);

            const response = await fetch('/api/convert/remote-fetch', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Conversion failed');
            }

            // Get the converted file
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'converted_file';

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            const file = new File([blob], filename, { type: blob.type });
            onFileFetched(file);

            addToast('File fetched and converted successfully!', 'success');

            // Reset form
            setUrl('');
            setDetectedInfo(null);
            setSelectedTargetFormat('');

        } catch (error) {
            console.error('Conversion error:', error);
            addToast(error.message || 'Conversion failed', 'error');
        } finally {
            setIsDetecting(false);
        }
    };

    const resetForm = () => {
        setUrl('');
        setDetectedInfo(null);
        setSelectedTargetFormat('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="remote-fetch-container"
            style={{
                background: 'var(--ag-card-bg)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--ag-card-border)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
            }}
        >
            <h3 style={{
                color: 'var(--ag-text)',
                marginBottom: '1rem',
                fontSize: '1.1rem',
                fontWeight: '600'
            }}>
                🌐 Remote Fetch
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter file URL (Google Drive, Dropbox, etc.)"
                    disabled={isDetecting || isConverting}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--ag-glass-border)',
                        background: 'var(--ag-input-bg)',
                        color: 'var(--ag-text)',
                        fontSize: '0.9rem',
                    }}
                />
                <motion.button
                    onClick={handleDetect}
                    disabled={isDetecting || isConverting || !url.trim()}
                    whileHover={!isDetecting && !isConverting ? { scale: 1.05 } : {}}
                    whileTap={!isDetecting && !isConverting ? { scale: 0.95 } : {}}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--ag-accent)',
                        color: 'white',
                        fontWeight: '600',
                        cursor: isDetecting || isConverting ? 'not-allowed' : 'pointer',
                        opacity: isDetecting || isConverting ? 0.6 : 1,
                        minWidth: '100px',
                    }}
                >
                    {isDetecting ? 'Detecting...' : 'Detect'}
                </motion.button>
            </div>

            {detectedInfo && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                        background: 'var(--ag-glass-bg)',
                        border: '1px solid var(--ag-glass-border)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem',
                    }}
                >
                    <div style={{ marginBottom: '1rem' }}>
                        <strong style={{ color: 'var(--ag-text)' }}>Detected:</strong>{' '}
                        <span style={{ color: 'var(--ag-accent)' }}>
                            {detectedInfo.detected_format?.toUpperCase()} file
                        </span>
                        <span style={{ color: 'var(--ag-text-secondary)', fontSize: '0.8rem', marginLeft: '1rem' }}>
                            ({(detectedInfo.file_size / 1024).toFixed(1)} KB)
                        </span>
                    </div>

                    {detectedInfo.suggested_conversions?.length > 0 && (
                        <div>
                            <div style={{ marginBottom: '0.5rem', color: 'var(--ag-text)' }}>
                                <strong>Convert to:</strong>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {detectedInfo.suggested_conversions.map(format => (
                                    <motion.button
                                        key={format}
                                        onClick={() => setSelectedTargetFormat(format)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            border: `2px solid ${selectedTargetFormat === format ? 'var(--ag-accent)' : 'var(--ag-glass-border)'}`,
                                            background: selectedTargetFormat === format ? 'var(--ag-accent)' : 'var(--ag-card-bg)',
                                            color: selectedTargetFormat === format ? 'white' : 'var(--ag-text)',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {format.toUpperCase()}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <motion.button
                            onClick={handleConvert}
                            disabled={!selectedTargetFormat || isDetecting}
                            whileHover={selectedTargetFormat && !isDetecting ? { scale: 1.05 } : {}}
                            whileTap={selectedTargetFormat && !isDetecting ? { scale: 0.95 } : {}}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--ag-btn-primary)',
                                color: 'var(--ag-btn-primary-text)',
                                fontWeight: '600',
                                cursor: !selectedTargetFormat || isDetecting ? 'not-allowed' : 'pointer',
                                opacity: !selectedTargetFormat || isDetecting ? 0.6 : 1,
                            }}
                        >
                            {isDetecting ? 'Converting...' : 'Convert & Download'}
                        </motion.button>

                        <motion.button
                            onClick={resetForm}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--ag-glass-border)',
                                background: 'transparent',
                                color: 'var(--ag-text-secondary)',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                            }}
                        >
                            Reset
                        </motion.button>
                    </div>
                </motion.div>
            )}

            <div style={{ fontSize: '0.8rem', color: 'var(--ag-text-secondary)' }}>
                <strong>Supported URLs:</strong> Google Drive file links, Dropbox share links, direct HTTP/HTTPS URLs<br/>
                <strong>Tip:</strong> For Google Drive, use the direct-download format:
                <code style={{ background:'rgba(0,0,0,0.05)', padding:'0 4px' }}>https://drive.google.com/uc?export=download&id=FILE_ID</code>
            </div>
        </motion.div>
    );
};

export default RemoteFetch;