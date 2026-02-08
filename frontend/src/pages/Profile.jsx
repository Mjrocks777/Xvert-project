import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import authService from '../services/AuthService'

export default function Profile() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [imgError, setImgError] = useState(false)

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
                <h2>Please log in to view your profile.</h2>
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

    const { user } = session
    const avatarUrl = user.user_metadata.avatar_url
    const fullName = user.user_metadata.full_name || user.email.split('@')[0]

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
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2rem'
                }}>
                    <h1 style={{ fontFamily: '"Outfit", sans-serif', color: '#1D3557', margin: 0 }}>My Profile</h1>

                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '4px solid #E8D5B5',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f5f5f5',
                        fontSize: '3rem',
                        color: '#666'
                    }}>
                        {avatarUrl && !imgError ? (
                            <img
                                src={avatarUrl}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <span>{fullName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>

                    <div style={{ width: '100%', maxWidth: '500px' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Full Name</label>
                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#F8F9FA',
                                borderRadius: '8px',
                                color: '#333',
                                fontWeight: '600',
                                border: '1px solid #eee'
                            }}>{fullName}</div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Email Address</label>
                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#F8F9FA',
                                borderRadius: '8px',
                                color: '#333',
                                fontWeight: '600',
                                border: '1px solid #eee'
                            }}>{user.email}</div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Last Sign In</label>
                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#F8F9FA',
                                borderRadius: '8px',
                                color: '#333',
                                border: '1px solid #eee'
                            }}>{new Date(user.last_sign_in_at).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
