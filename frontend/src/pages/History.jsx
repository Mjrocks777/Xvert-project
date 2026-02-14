import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import authService from '../services/AuthService'
import historyService from '../services/HistoryService'
import ToolIcon from '../components/ToolIcon' // Reuse for consistent look

export default function History() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [historyFiles, setHistoryFiles] = useState([])

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
            setHistoryFiles(data.files || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const getDownloadUrl = (filename) => {
        return `http://localhost:8000/api/convert/history/${filename}`
    }

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString()
    }

    // Helper to mock a tool object for ToolIcon based on filename extension
    const getMockTool = (filename) => {
        const ext = filename.split('.').pop().toLowerCase()
        // Guess source from name if possible, otherwise generic
        // e.g. "converted_document.pdf" -> type="pdf", target="pdf"
        return {
            id: 'history-file',
            type: 'file',
            target: ext
        }
    }

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F5F0', fontFamily: '"Nunito", sans-serif' }}>Loading...</div>
    }

    if (!session) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F5F0', fontFamily: '"Nunito", sans-serif', flexDirection: 'column', gap: '1rem' }}>
                <h2>Please log in to view your history.</h2>
                <Link to="/login" style={{ backgroundColor: '#B0D8F5', color: '#1a1a1a', padding: '0.8rem 2rem', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F0', fontFamily: '"Nunito", sans-serif', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#457B9D', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>← Back to Home</Link>

                <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '3rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h1 style={{ fontFamily: '"Outfit", sans-serif', color: '#1D3557', marginBottom: '2rem' }}>Conversion History</h1>

                    {historyFiles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#F8F9FA', borderRadius: '12px', border: '2px dashed #e0e0e0' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                            <h3 style={{ color: '#555', marginBottom: '0.5rem' }}>No history found</h3>
                            <p style={{ color: '#888' }}>Your recent file conversions will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {historyFiles.map((file, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    backgroundColor: '#fff',
                                    border: '1px solid #eee',
                                    borderRadius: '8px',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ transform: 'scale(0.8)' }}>
                                            <ToolIcon tool={getMockTool(file.name)} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.25rem' }}>{file.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                                {(file.size / 1024).toFixed(1)} KB • {formatDate(file.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        href={getDownloadUrl(file.name)}
                                        download
                                        style={{
                                            backgroundColor: '#E8D5B5',
                                            color: '#2d3e50',
                                            padding: '0.5rem 1.5rem',
                                            borderRadius: '20px',
                                            textDecoration: 'none',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
