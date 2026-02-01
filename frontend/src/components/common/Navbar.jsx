import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000
        }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontSize: '1.2rem', fontWeight: 'bold' }}>
                Xvert
            </Link>
            <div>
                {/* Add more nav links here if needed */}
            </div>
        </nav>
    )
}
