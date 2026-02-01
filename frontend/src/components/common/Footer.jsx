export default function Footer() {
    return (
        <footer style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: 'transparent',
            color: '#888',
            fontSize: '0.8rem',
            position: 'absolute',
            bottom: 0,
            width: '100%'
        }}>
            <p>&copy; {new Date().getFullYear()} Xvert. All rights reserved.</p>
        </footer>
    )
}
