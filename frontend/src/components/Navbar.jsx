import { Link } from 'react-router-dom';
import { useState } from 'react';
import MegaMenu from './MegaMenu';

/**
 * NavigationItem Class (OOP: Encapsulation of Navigation Data)
 */
class NavigationItem {
    constructor(label, action, id = null) {
        this.label = label;
        this.action = action;
        this.id = id; // tool id or null for 'all tools'
    }
}

/**
 * Navbar Component
 * Encapsulates the top navigation bar logic and rendering.
 */
export default function Navbar({ tools, onToolSelect, onReset, session, UserAvatarComponent }) {

    const [activeMenu, setActiveMenu] = useState(null);

    // Define navigation items
    const navItems = [
        new NavigationItem('ALL TOOLS', () => setActiveMenu(activeMenu === 'all-tools' ? null : 'all-tools')),
        new NavigationItem('CONVERT PDF', () => setActiveMenu(activeMenu === 'convert-pdf' ? null : 'convert-pdf')),
        new NavigationItem('MERGE PDF', () => onToolSelect(tools.find(t => t.id === 'merge-pdf')), 'merge-pdf'),
        new NavigationItem('PDF TO WORD', () => onToolSelect(tools.find(t => t.id === 'pdf-to-word')), 'pdf-to-word'),
        new NavigationItem('IMAGE TO PDF', () => onToolSelect(tools.find(t => t.id === 'image-to-pdf')), 'image-to-pdf'),
    ];

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            backgroundColor: '#fff',
            borderBottom: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* Logo and Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                {/* Logo */}
                <div
                    onClick={onReset}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🔄</span>
                    <h1 style={{
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: '1.5rem',
                        margin: 0,
                        color: '#2d3e50'
                    }}>Xvert</h1>
                </div>

                {/* Navigation Links */}
                <nav style={{ display: 'flex', gap: '2rem' }}>
                    {navItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={item.action}
                            role="button"
                            tabIndex={0}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                color: item.label === 'ALL TOOLS' || item.label === 'CONVERT PDF' ? '#1D3557' : '#1D3557',
                                fontFamily: '"Outfit", sans-serif',
                                textTransform: 'uppercase',
                                padding: '0.5rem 0',
                                borderBottom: '2px solid transparent',
                                transition: 'all 0.2s',
                                letterSpacing: '0.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#457B9D'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#1D3557'}
                            onKeyDown={(e) => e.key === 'Enter' && item.action()}
                        >
                            {item.label}
                            {(item.label === 'ALL TOOLS' || item.label === 'CONVERT PDF') && (
                                <span style={{
                                    fontSize: '0.7em',
                                    transform: (item.label === 'ALL TOOLS' && activeMenu === 'all-tools') || (item.label === 'CONVERT PDF' && activeMenu === 'convert-pdf') ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s'
                                }}>▼</span>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* User Section (Session/Auth) */}
            <div>
                {session ? (
                    UserAvatarComponent
                ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/login" className="nav-btn" style={{
                            textDecoration: 'none',
                            backgroundColor: '#B0D8F5',
                            color: '#1a1a1a',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '30px',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            fontFamily: '"Nunito", sans-serif',
                            transition: 'transform 0.2s'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >Login</Link>
                        <Link to="/signup" className="nav-btn" style={{
                            textDecoration: 'none',
                            backgroundColor: '#B0D8F5',
                            color: '#1a1a1a',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '30px',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            fontFamily: '"Nunito", sans-serif',
                            transition: 'transform 0.2s'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >Sign Up</Link>
                    </div>
                )}
            </div>

            {/* Mega Menu Dropdown */}
            {activeMenu && (
                <MegaMenu
                    tools={tools}
                    activeMenu={activeMenu}
                    onToolSelect={onToolSelect}
                    onClose={() => setActiveMenu(null)}
                />
            )}
        </header>
    );
}
