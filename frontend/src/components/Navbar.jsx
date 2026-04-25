import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import MegaMenu from './MegaMenu'
import SettingsPanel from './SettingsPanel'

const springBounce = { type: 'spring', stiffness: 400, damping: 20 }

class NavigationItem {
    constructor(label, action, id = null) {
        this.label = label
        this.action = action
        this.id = id
    }
}

export default function Navbar({ tools, onToolSelect, onReset, session, UserAvatarComponent }) {
    const [activeMenu, setActiveMenu] = useState(null)
    const [settingsOpen, setSettingsOpen] = useState(false)

    const navItems = [
        new NavigationItem('ALL TOOLS', () => setActiveMenu(activeMenu === 'all-tools' ? null : 'all-tools')),
        new NavigationItem('CONVERT PDF', () => setActiveMenu(activeMenu === 'convert-pdf' ? null : 'convert-pdf')),
        new NavigationItem('MERGE PDF', () => onToolSelect(tools.find(t => t.id === 'merge-pdf')), 'merge-pdf'),
        new NavigationItem('PDF TO WORD', () => onToolSelect(tools.find(t => t.id === 'pdf-to-word')), 'pdf-to-word'),
        new NavigationItem('IMAGE TO PDF', () => onToolSelect(tools.find(t => t.id === 'image-to-pdf')), 'image-to-pdf'),
    ]

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.8rem 2rem',
            background: 'var(--ag-navbar-bg)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid var(--ag-navbar-border)',
            boxShadow: '0 4px 30px var(--ag-glass-shadow)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            transition: 'background 0.35s, border-color 0.35s',
        }}>
            {/* Logo and Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                {/* Logo */}
                <motion.div
                    onClick={onReset}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={springBounce}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <span style={{
                        fontSize: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2.5rem', // Adjust size as needed
                        height: '2.5rem'
                    }}>
                        <img
                            src="/illustrations/logo.png"
                            alt="Logo"
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                    </span>
                    <h1 style={{
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: '1.6rem',
                        margin: 0,
                        color: 'var(--ag-text)',
                        fontWeight: 700,
                    }}>Xvert</h1>
                </motion.div>

                {/* Navigation Links */}
                <nav style={{ display: 'flex', gap: '1.5rem' }}>
                    {navItems.map((item, index) => (
                        <motion.div
                            key={index}
                            onClick={item.action}
                            role="button"
                            tabIndex={0}
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={springBounce}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: 'var(--ag-text)',
                                fontFamily: '"Outfit", sans-serif',
                                textTransform: 'uppercase',
                                padding: '0.5rem 0',
                                letterSpacing: '0.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                transition: 'color 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--ag-accent)'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--ag-text)'}
                            onKeyDown={(e) => e.key === 'Enter' && item.action()}
                        >
                            {item.label}
                            {(item.label === 'ALL TOOLS' || item.label === 'CONVERT PDF') && (
                                <motion.span
                                    animate={{
                                        rotate: (item.label === 'ALL TOOLS' && activeMenu === 'all-tools') ||
                                            (item.label === 'CONVERT PDF' && activeMenu === 'convert-pdf')
                                            ? 180 : 0
                                    }}
                                    transition={springBounce}
                                    style={{ fontSize: '0.65em', display: 'inline-block' }}
                                >
                                    ▼
                                </motion.span>
                            )}
                        </motion.div>
                    ))}
                </nav>
            </div>

            {/* Right section: Settings + Auth */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <SettingsPanel
                    isOpen={settingsOpen}
                    onToggle={() => setSettingsOpen(prev => !prev)}
                />

                {session ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <Link to="/developer" style={{
                            textDecoration: 'none',
                            color: 'var(--ag-text)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            fontFamily: '"Outfit", sans-serif',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transition: 'color 0.2s'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--ag-accent)'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--ag-text)'}
                        >
                            Developers
                        </Link>
                        {UserAvatarComponent}
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={springBounce}>
                            <Link to="/login" style={{
                                textDecoration: 'none',
                                background: 'var(--ag-btn-secondary)',
                                backdropFilter: 'blur(8px)',
                                color: 'var(--ag-text)',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '30px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                fontFamily: '"Nunito", sans-serif',
                                border: '1px solid var(--ag-glass-border)',
                                display: 'inline-block',
                            }}>Login</Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={springBounce}>
                            <Link to="/signup" style={{
                                textDecoration: 'none',
                                background: 'var(--ag-btn-primary)',
                                color: 'var(--ag-btn-primary-text)',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '30px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                fontFamily: '"Nunito", sans-serif',
                                boxShadow: '0 4px 15px var(--ag-accent-glow)',
                                display: 'inline-block',
                            }}>Sign Up</Link>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Mega Menu Dropdown */}

            {activeMenu && (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'var(--ag-card-bg)', 
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            borderRadius: '0 0 16px 16px',
            border: '1px solid var(--ag-glass-border)',
            borderTop: 'none',
            // This is the key: targeting the internal tool container
           padding: '1rem 2rem 2rem 2rem', // Reduced top padding from 3rem to 1rem
            marginTop: '-1px',
        }}
    >
        {/* We use a wrapper div to inject spacing into whatever MegaMenu renders */}
        <div style={{ 
            display: 'block',
            // Force any internal grids to have a large gap
            '--internal-gap': '2rem' 
        }} className="menu-spacing-fix">
            <MegaMenu
                tools={tools}
                activeMenu={activeMenu}
                onToolSelect={onToolSelect}
                onClose={() => setActiveMenu(null)}
            />
        </div>

        {/* Global Style Injection to force spacing between tool items */}
        <style>{`
            .menu-spacing-fix div {
                /* If MegaMenu uses a grid, this forces the gap */
                gap: 1.5rem !important; 
            }
            .menu-spacing-fix a, .menu-spacing-fix button {
                /* If tools are individual links/buttons, this prevents overlap */
                margin-bottom: 0.5rem;
                display: flex;
                align-items: center;
            }
        `}</style>
    </motion.div>
)}
        </header>
    )
}
