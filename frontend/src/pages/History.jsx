import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import authService from '../services/AuthService'
import historyService from '../services/HistoryService'
import ToolIcon from '../components/ToolIcon'
import AntiGravityBackground from '../components/AntiGravityBackground'
import SkeletonLoader from '../components/SkeletonLoader'
import { ArrowLeft, Download, Trash2, FileCheck, AlertCircle, Clock } from 'lucide-react'

const springBounce = { type: 'spring', stiffness: 400, damping: 20 }

export default function History() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [conversions, setConversions] = useState([])
    const [downloadingId, setDownloadingId] = useState(null)
    const [deletingId, setDeletingId] = useState(null)

    useEffect(() => {
        authService.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session) {
                fetchHistory()
            } else {
                setLoading(false)
            }
        })
    }, [])

    const fetchHistory = async () => {
        try {
            const data = await historyService.getHistory()
            setConversions(data)
        } catch (error) {
            console.error('Failed to fetch history:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async (conversion) => {
        setDownloadingId(conversion.id)
        try {
            const { download_url, filename } = await historyService.getDownloadUrl(conversion.id)
            // Trigger browser download
            const link = document.createElement('a')
            link.href = download_url
            link.download = `${conversion.original_filename?.split('.')[0] || 'converted'}.${conversion.converted_format}`
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Download failed:', error)
        } finally {
            setDownloadingId(null)
        }
    }

    const handleDelete = async (conversionId) => {
        setDeletingId(conversionId)
        try {
            await historyService.deleteConversion(conversionId)
            setConversions(prev => prev.filter(c => c.id !== conversionId))
        } catch (error) {
            console.error('Delete failed:', error)
        } finally {
            setDeletingId(null)
        }
    }

    const formatDate = (isoString) => {
        if (!isoString) return '—'
        return new Date(isoString).toLocaleString()
    }

    const formatSize = (bytes) => {
        if (!bytes) return '—'
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed':
                return { icon: FileCheck, color: '#22c55e', label: 'Completed' }
            case 'failed':
                return { icon: AlertCircle, color: '#ef4444', label: 'Failed' }
            case 'purged':
                return { icon: Trash2, color: '#6b7280', label: 'Expired' }
            default:
                return { icon: Clock, color: '#f59e0b', label: 'Pending' }
        }
    }


    const getExpiryLabel = (createdAt) => {
        const PURGE_AFTER_MS = 30 * 60 * 1000  // 30 minutes in ms
        const elapsed = Date.now() - new Date(createdAt).getTime()
        const remainingMs = PURGE_AFTER_MS - elapsed
        const remainingMin = Math.floor(remainingMs / 60000)

        // Already expired — purge scheduler hasn't run yet but file is gone
        if (remainingMin <= 0) return { label: 'Expiring soon', color: '#ef4444' }

        // Snap to nearest threshold bucket
        if (remainingMin <= 1) return { label: 'Expires in 1 min', color: '#ef4444' }
        if (remainingMin <= 2) return { label: 'Expires in 2 min', color: '#ef4444' }
        if (remainingMin <= 3) return { label: 'Expires in 3 min', color: '#f97316' }
        if (remainingMin <= 5) return { label: 'Expires in 5 min', color: '#f97316' }
        if (remainingMin <= 10) return { label: 'Expires in 10 min', color: '#f59e0b' }
        if (remainingMin <= 20) return { label: 'Expires in 20 min', color: '#f59e0b' }
        return { label: 'Expires in 30 min', color: '#6b7280' }
    }

    const getMockTool = (record) => {
        return { id: 'history-file', type: 'file', target: record.converted_format }
    }

    // Loading skeleton
    if (loading) {
        return (
            <AntiGravityBackground>
                <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '700px' }}>
                        <SkeletonLoader width="150px" height="1.2rem" style={{ marginBottom: '2rem' }} />
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <SkeletonLoader width="250px" height="1.8rem" style={{ marginBottom: '2rem' }} />
                            {[1, 2, 3].map(i => (
                                <SkeletonLoader key={i} width="100%" height="4rem" borderRadius="12px" style={{ marginBottom: '1rem' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </AntiGravityBackground>
        )
    }

    // Not logged in
    if (!session) {
        return (
            <AntiGravityBackground>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel"
                        style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px' }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                        <h2 style={{ color: 'var(--ag-text)', fontFamily: '"Outfit", sans-serif', marginBottom: '1rem' }}>
                            Login Required
                        </h2>
                        <p style={{ color: 'var(--ag-text-secondary)', marginBottom: '1.5rem' }}>
                            Please sign in to view your conversion history
                        </p>
                        <Link to="/login">
                            <motion.button
                                className="ag-btn-primary"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                transition={springBounce}
                            >Sign In</motion.button>
                        </Link>
                    </motion.div>
                </div>
            </AntiGravityBackground>
        )
    }

    return (
        <AntiGravityBackground>
            <div style={{
                flex: 1,
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <div style={{ width: '100%', maxWidth: '700px' }}>
                    {/* Back link */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ marginBottom: '2rem' }}
                    >
                        <Link to="/" style={{
                            color: 'var(--ag-accent)',
                            textDecoration: 'none',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                        }}>
                            <ArrowLeft size={18} /> Back to Home
                        </Link>
                    </motion.div>

                    {/* History Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="glass-panel"
                        style={{ padding: '2.5rem' }}
                    >
                        <h1 style={{
                            fontFamily: '"Outfit", sans-serif',
                            color: 'var(--ag-text)',
                            marginBottom: '2rem',
                            fontSize: '1.6rem',
                        }}>Conversion History</h1>

                        {conversions.length === 0 ? (
                            /* Empty State */
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    textAlign: 'center',
                                    padding: '3rem 2rem',
                                    borderRadius: '16px',
                                    background: 'var(--ag-input-bg)',
                                    border: '2px dashed var(--ag-glass-border)',
                                }}
                            >
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        width: '160px', height: '160px', margin: '0 auto',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <img
                                        src="/illustrations/emty_history.png"
                                        alt="No history yet"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </motion.div>
                                <h3 style={{
                                    color: 'var(--ag-text)',
                                    marginTop: '1rem',
                                    marginBottom: '0.5rem',
                                    fontFamily: '"Outfit", sans-serif',
                                }}>No history yet</h3>
                                <p style={{ color: 'var(--ag-text-secondary)', fontSize: '0.9rem' }}>
                                    Your recent file conversions will appear here
                                </p>
                            </motion.div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <AnimatePresence>
                                    {conversions.map((record, index) => {
                                        const statusConfig = getStatusConfig(record.status)
                                        const StatusIcon = statusConfig.icon
                                        const expiry = record.status === 'completed' ? getExpiryLabel(record.created_at) : null

                                        return (
                                            <motion.div
                                                key={record.id}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{
                                                    y: -2,
                                                    boxShadow: '0 8px 25px var(--ag-glass-shadow)',
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '1rem 1.2rem',
                                                    // Purged cards get a subtle dimmed background
                                                    backgroundColor: record.status === 'purged'
                                                        ? 'var(--ag-input-bg)'
                                                        : 'var(--ag-card-bg)',
                                                    border: '1px solid var(--ag-card-border)',
                                                    borderRadius: '14px',
                                                    backdropFilter: 'blur(8px)',
                                                    transition: 'box-shadow 0.3s',
                                                    gap: '1rem',
                                                    // Purged cards slightly faded
                                                    opacity: record.status === 'purged' ? 0.6 : 1,
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                                                    <div style={{ transform: 'scale(0.75)', flexShrink: 0 }}>
                                                        <ToolIcon tool={getMockTool(record)} />
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{
                                                            fontWeight: 700,
                                                            color: 'var(--ag-text)',
                                                            marginBottom: '0.2rem',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {record.original_filename}
                                                        </div>

                                                        {/* ── Metadata row ── */}
                                                        <div style={{
                                                            fontSize: '0.8rem',
                                                            color: 'var(--ag-text-secondary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            flexWrap: 'wrap',
                                                        }}>
                                                            <span style={{
                                                                background: 'var(--ag-input-bg)',
                                                                padding: '0.1rem 0.4rem',
                                                                borderRadius: '6px',
                                                                fontWeight: 600,
                                                                textTransform: 'uppercase',
                                                                fontSize: '0.7rem',
                                                            }}>
                                                                {record.original_format} → {record.converted_format}
                                                            </span>

                                                            <span>{formatSize(record.file_size_original)}</span>
                                                            <span>•</span>
                                                            <span>{formatDate(record.created_at)}</span>

                                                            {/* Status icon */}
                                                            <StatusIcon size={13} color={statusConfig.color} />

                                                            {/* Expiry label — only on completed, snaps to buckets */}
                                                            {expiry && (
                                                                <span style={{
                                                                    fontSize: '0.68rem',
                                                                    fontWeight: 600,
                                                                    color: expiry.color,
                                                                    background: `${expiry.color}18`,  // 10% opacity bg
                                                                    padding: '0.1rem 0.45rem',
                                                                    borderRadius: '6px',
                                                                    letterSpacing: '0.01em',
                                                                }}>
                                                                    {expiry.label}
                                                                </span>
                                                            )}

                                                            {/* Purged label replaces expiry */}
                                                            {record.status === 'purged' && (
                                                                <span style={{
                                                                    fontSize: '0.68rem',
                                                                    fontWeight: 600,
                                                                    color: '#6b7280',
                                                                    background: '#6b728018',
                                                                    padding: '0.1rem 0.45rem',
                                                                    borderRadius: '6px',
                                                                }}>
                                                                    File deleted
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* ── Action buttons ── */}
                                                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                    {record.status === 'completed' && (
                                                        <motion.button
                                                            onClick={() => handleDownload(record)}
                                                            disabled={downloadingId === record.id}
                                                            whileHover={{ scale: 1.08 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            transition={springBounce}
                                                            style={{
                                                                background: 'var(--ag-btn-primary)',
                                                                color: '#fff',
                                                                padding: '0.5rem 1rem',
                                                                borderRadius: '10px',
                                                                border: 'none',
                                                                fontWeight: 700,
                                                                fontSize: '0.85rem',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.4rem',
                                                                cursor: downloadingId === record.id ? 'wait' : 'pointer',
                                                                opacity: downloadingId === record.id ? 0.7 : 1,
                                                            }}
                                                        >
                                                            <Download size={14} />
                                                            {downloadingId === record.id ? '...' : 'Download'}
                                                        </motion.button>
                                                    )}

                                                    {/* Purged — no download, show disabled placeholder */}
                                                    {record.status === 'purged' && (
                                                        <div style={{
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '10px',
                                                            border: '1px solid var(--ag-glass-border)',
                                                            fontWeight: 600,
                                                            fontSize: '0.8rem',
                                                            color: '#6b7280',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            cursor: 'not-allowed',
                                                        }}>
                                                            <Trash2 size={13} />
                                                            Deleted
                                                        </div>
                                                    )}

                                                    <motion.button
                                                        onClick={() => handleDelete(record.id)}
                                                        disabled={deletingId === record.id}
                                                        whileHover={{ scale: 1.08 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        transition={springBounce}
                                                        style={{
                                                            background: 'transparent',
                                                            color: 'var(--ag-text-secondary)',
                                                            padding: '0.5rem',
                                                            borderRadius: '10px',
                                                            border: '1px solid var(--ag-glass-border)',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: deletingId === record.id ? 'wait' : 'pointer',
                                                            opacity: deletingId === record.id ? 0.5 : 1,
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </AntiGravityBackground>
    )
}
