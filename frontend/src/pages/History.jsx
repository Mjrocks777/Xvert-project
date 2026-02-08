import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import authService from '../services/AuthService'

export default function History() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        authService.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })
    }, [])

    if (loading) {
        return <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F7F5F0',
            fontFamily: '"Nunito", sans-serif'
        }}>Loading...</div>
    }

    if (!session) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#F7F5F0',
                fontFamily: '"Nunito", sans-serif',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <h2>Please log in to view your history.</h2>
                <Link to="/login" style={{
                    backgroundColor: '#B0D8F5',
                    color: '#1a1a1a',
                    padding: '0.8rem 2rem',
                    borderRadius: '30px',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                }}>Login</Link>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#F7F5F0',
            fontFamily: '"Nunito", sans-serif',
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{
                    textDecoration: 'none',
                    color: '#457B9D',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '2rem'
                }}>
                    ← Back to Home
                </Link>

                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '3rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontFamily: '"Outfit", sans-serif', color: '#1D3557', margin: 0 }}>Conversion History</h1>
                    </div>

                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        backgroundColor: '#F8F9FA',
                        borderRadius: '12px',
                        border: '2px dashed #e0e0e0'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                        <h3 style={{ color: '#555', marginBottom: '0.5rem' }}>No history found</h3>
                        <p style={{ color: '#888' }}>Your recent file conversions will appear here.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
