import { Link } from 'react-router-dom'

export default function Home() {
    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>Xvert</h1>
            <p>Convert your files securely and easily.</p>
            <div style={{ marginTop: '2rem' }}>
                <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
                <Link to="/signup">Sign Up</Link>
            </div>
        </div>
    )
}
