import { useState } from 'react'
import { supabase } from '../services/supabase'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            navigate('/dashboard')
        }
        setLoading(false)
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(0,0,0,0.4)',
            color: '#fff',
            fontFamily: "'Inter', sans-serif"
        }}>
            <Navbar />

            <main style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    backgroundColor: '#242424',
                    padding: '3rem',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '400px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <h2 style={{
                        marginTop: 0,
                        marginBottom: '0.5rem',
                        fontSize: '2rem',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>Welcome Back</h2>
                    <p style={{
                        textAlign: 'center',
                        color: '#888',
                        marginBottom: '2rem',
                        marginTop: 0
                    }}>Enter your credentials to access your account</p>

                    {error && (
                        <div style={{
                            backgroundColor: 'rgba(255, 82, 82, 0.1)',
                            color: '#ff5252',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #444',
                                    backgroundColor: '#333',
                                    color: 'white',
                                    fontSize: '1rem',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                                placeholder="name@company.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #444',
                                    backgroundColor: '#333',
                                    color: 'white',
                                    fontSize: '1rem',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '1rem',
                                padding: '0.8rem',
                                backgroundColor: '#646cff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                transition: 'background-color 0.2s'
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#888' }}>
                        Don't have an account? <Link to="/signup" style={{ color: '#646cff', textDecoration: 'none' }}>Sign up</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
