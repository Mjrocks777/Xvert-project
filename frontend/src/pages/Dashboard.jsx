import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import authService from '../services/AuthService'
import UserAvatar from '../components/UserAvatar'
import ToolIcon from '../components/ToolIcon'
import Navbar from '../components/Navbar'
import BatchUploader from '../components/BatchUploader'
import '../styles/index.css'

export default function Dashboard() {
    const navigate = useNavigate()
    const [selectedTool, setSelectedTool] = useState(null)
    const [session, setSession] = useState(null)

    useEffect(() => {
        authService.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (!session) {
                navigate('/login') // Redirect if not logged in, since this IS the dashboard
            }
        })
    }, [navigate])

    const tools = [
        // Document Tools
        { id: 'pdf-to-word', name: 'PDF to Word', desc: 'Convert PDFs to editable DOCX.', icon: '📄', type: 'pdf', target: 'docx' },
        { id: 'docx-to-pdf', name: 'Word to PDF', desc: 'Convert DOCX files to PDF.', icon: '📝', type: 'docx', target: 'pdf' },
        { id: 'image-to-pdf', name: 'Image to PDF', desc: 'JPG, PNG, GIF to PDF.', icon: '🖼️', type: 'image', target: 'pdf' },
        { id: 'merge-pdf', name: 'Merge PDF', desc: 'Combine multiple PDFs into one.', icon: '🔗', type: 'merge', target: 'pdf' },
        { id: 'pdf-to-jpg', name: 'PDF to JPG', desc: 'Extract PDF pages as JPGs.', icon: 'fz', type: 'pdf', target: 'jpg' },
        { id: 'pdf-to-png', name: 'PDF to PNG', desc: 'Extract PDF pages as PNGs.', icon: 'fz', type: 'pdf', target: 'png' },

        // Image Tools
        { id: 'jpg-to-png', name: 'JPG to PNG', desc: 'Convert JPG to transparent PNG.', icon: '📷', type: 'jpg', target: 'png' },
        { id: 'png-to-jpg', name: 'PNG to JPG', desc: 'Convert PNG to standard JPG.', icon: '📸', type: 'png', target: 'jpg' },
        { id: 'jpg-to-gif', name: 'JPG to GIF', desc: 'Animated GIF from JPGs.', icon: '👾', type: 'jpg', target: 'gif' },
        { id: 'png-to-gif', name: 'PNG to GIF', desc: 'Animated GIF from PNGs.', icon: '👾', type: 'png', target: 'gif' },
        { id: 'gif-to-jpg', name: 'GIF to JPG', desc: 'Static JPG from GIF.', icon: '📸', type: 'gif', target: 'jpg' },
        { id: 'gif-to-png', name: 'GIF to PNG', desc: 'Static PNG from GIF.', icon: '📷', type: 'gif', target: 'png' },

        // Data Tools
        { id: 'json-to-csv', name: 'JSON to CSV', desc: 'Convert JSON data to CSV.', icon: '📊', type: 'data', target: 'csv' },
        { id: 'csv-to-json', name: 'CSV to JSON', desc: 'Convert CSV rows to JSON.', icon: '📋', type: 'data', target: 'json' },
        { id: 'excel-to-csv', name: 'Excel to CSV', desc: 'Convert XLSX sheets to CSV.', icon: 'x', type: 'data', target: 'csv' },
        { id: 'csv-to-excel', name: 'CSV to Excel', desc: 'Convert CSV to Excel XLSX.', icon: 'x', type: 'data', target: 'xlsx' },
        { id: 'excel-to-json', name: 'Excel to JSON', desc: 'Convert Excel to JSON data.', icon: 'x', type: 'data', target: 'json' },
        { id: 'json-to-excel', name: 'JSON to Excel', desc: 'Convert JSON to Excel XLSX.', icon: 'x', type: 'data', target: 'xlsx' },
        { id: 'xml-to-json', name: 'XML to JSON', desc: 'Convert XML to JSON format.', icon: '📋', type: 'data', target: 'json' },
        { id: 'json-to-xml', name: 'JSON to XML', desc: 'Convert JSON to XML format.', icon: '🧩', type: 'data', target: 'xml' },
        { id: 'xml-to-csv', name: 'XML to CSV', desc: 'Convert XML to CSV format.', icon: '📊', type: 'data', target: 'csv' },
        { id: 'csv-to-xml', name: 'CSV to XML', desc: 'Convert CSV to XML format.', icon: '🧩', type: 'data', target: 'xml' },
        { id: 'xml-to-excel', name: 'XML to Excel', desc: 'Convert XML to Excel XLSX.', icon: 'x', type: 'data', target: 'xlsx' },
        { id: 'excel-to-xml', name: 'Excel to XML', desc: 'Convert Excel to XML format.', icon: '🧩', type: 'data', target: 'xml' },
    ]

    const getAcceptTypes = (tool) => {
        if (!tool) return '*'
        if (tool.id === 'merge-pdf') return '.pdf'
        if (tool.type === 'pdf') return '.pdf'
        if (tool.type === 'image') return '.jpg,.jpeg,.png,.gif'
        if (tool.type === 'jpg') return '.jpg,.jpeg'
        if (tool.type === 'png') return '.png'
        if (tool.type === 'gif') return '.gif'
        if (tool.type === 'docx') return '.docx,.doc'
        if (tool.type === 'data') return '.json,.csv,.xlsx,.xls,.xml'
        return '*'
    }

    const handleLogout = async () => {
        await authService.logout()
        navigate('/')
    }

    const handleToolSelect = (tool) => {
        setSelectedTool(tool)
    }

    const handleBackToGrid = () => {
        setSelectedTool(null)
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#F7F5F0', // Beige background
            fontFamily: '"Nunito", sans-serif',
            color: '#333'
        }}>
            {/* Navbar */}
            <Navbar
                tools={tools}
                onToolSelect={handleToolSelect}
                onReset={handleBackToGrid}
                session={session}
                UserAvatarComponent={
                    <UserAvatar session={session} onLogout={handleLogout} />
                }
            />

            {!selectedTool && (
                <>
                    {/* Hero Section (Reverted to Simple Style) */}
                    <div style={{
                        padding: '4rem 2rem 2rem',
                        textAlign: 'center',
                    }}>
                        <h1 style={{
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            color: '#1D3557',
                            marginBottom: '0.5rem'
                        }}>
                            My Dashboard
                        </h1>
                        <p style={{
                            fontSize: '1.2rem',
                            color: '#666',
                        }}>
                            Access your favorite tools and manage your files.
                        </p>
                    </div>


                    {/* Main Content Area */}
                    <main style={{ padding: '0 2rem', maxWidth: '1400px', margin: '0 auto 4rem' }}>

                        {/* Card Grid (Reverted to Simple Style) */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '2rem',
                        }}>
                            {tools.map(tool => (
                                <div key={tool.id}
                                    onClick={() => handleToolSelect(tool)}
                                    style={{
                                        backgroundColor: '#fff',
                                        padding: '2rem',
                                        borderRadius: '15px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                        transition: 'all 0.3s ease',
                                        textAlign: 'center',
                                        border: '1px solid #eee'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)'
                                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                                        <ToolIcon tool={tool} />
                                    </div>
                                    <h3 style={{ color: '#1D3557', margin: '0 0 0.5rem 0' }}>{tool.name}</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>{tool.desc}</p>
                                </div>
                            ))}
                        </div>
                    </main>
                </>
            )}

            {/* View: Selected Tool — Batch Uploader */}
            {selectedTool && (
                <main style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <BatchUploader tool={selectedTool} accept={getAcceptTypes(selectedTool)} onBack={handleBackToGrid} />
                </main>
            )}
        </div>
    )
}
