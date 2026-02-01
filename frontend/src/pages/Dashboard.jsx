import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

export default function Dashboard() {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/')
    }

    return (
        <div style={{ padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Dashboard</h1>
                <button className="btn-pill" onClick={handleLogout}>Logout</button>
            </header>
            <div style={{ marginTop: '2rem' }}>
                <p>Welcome to your dashboard!</p>
                {/* File upload and history will go here */}
            </div>
        </div>
    )
}
