import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase' // Direct supabase usage for immediate auth state check
import authService from '../services/AuthService'
import conversionService from '../services/ConversionService'
import UserAvatar from '../components/UserAvatar'
import Navbar from '../components/Navbar'

export default function Home() {
    const navigate = useNavigate()
    const [file, setFile] = useState(null)
    const [selectedTool, setSelectedTool] = useState(null) // null = show grid, 'tool-id' = show specific tool
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [session, setSession] = useState(null)

    useEffect(() => {
        // Check for active session
        authService.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    const tools = [
        { id: 'pdf-to-word', name: 'PDF to Word', desc: 'Convert your PDF files to editable DOCX documents.', icon: '📄', type: 'pdf', target: 'docx' },
        { id: 'image-to-pdf', name: 'Image to PDF', desc: 'Convert JPG or PNG images into PDF documents.', icon: '🖼️', type: 'image', target: 'pdf' },
        { id: 'merge-pdf', name: 'Merge PDF', desc: 'Combine multiple PDFs into one unified document.', icon: '🔗', type: 'merge', target: 'pdf' },
        { id: 'image-to-png', name: 'Image to PNG', desc: 'Convert various image formats to PNG.', icon: '📷', type: 'image', target: 'png' },
        { id: 'image-to-jpg', name: 'Image to JPG', desc: 'Convert images to standard JPG format.', icon: '📸', type: 'image', target: 'jpg' },
        { id: 'json-to-csv', name: 'JSON to CSV', desc: 'Transform JSON data files into CSV spreadsheets.', icon: '📊', type: 'data', target: 'csv' },
        { id: 'csv-to-json', name: 'CSV to JSON', desc: 'Convert CSV spreadsheets into JSON format.', icon: '📋', type: 'data', target: 'json' },
    ]

    const handleLogout = async () => {
        await authService.logout()
        // Stay on home page, but session will be null so header updates
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
        setMessage('')
    }

    const handleToolSelect = (tool) => {
        setSelectedTool(tool)
        setFile(null)
        setMessage('')
    }

    const handleBackToGrid = () => {
        setSelectedTool(null)
        setFile(null)
        setMessage('')
    }

    const handleConvert = async () => {
        if (!session) {
            // Optional: You might want to force login for conversion
            // validation logic here if needed. 
            // For now, allowing all users or showing message.
            // If strict enforcement is needed:
            // setMessage('Please login to convert files.');
            // return;
        }

        if (!file && selectedTool.id !== 'merge-pdf') {
            setMessage('Please select a file first.')
            return
        }

        setLoading(true)
        setMessage('Converting... (Larger files may take 10-20 seconds)')

        const timer = setTimeout(() => {
            setMessage('Still processing... complex files need a moment. Please do not refresh.');
        }, 5000);

        try {
            let resultBlob;

            if (selectedTool.id === 'pdf-to-word') {
                resultBlob = await conversionService.convertDocument(file, 'pdf', 'docx');
            } else if (selectedTool.id === 'image-to-pdf') {
                resultBlob = await conversionService.convertDocument(file, 'image', 'pdf');
            } else if (selectedTool.id === 'image-to-png') {
                resultBlob = await conversionService.convertImage(file, 'png');
            } else if (selectedTool.id === 'image-to-jpg') {
                resultBlob = await conversionService.convertImage(file, 'jpg');
            } else if (selectedTool.id === 'json-to-csv') {
                resultBlob = await conversionService.convertData(file, 'csv');
            } else if (selectedTool.id === 'csv-to-json') {
                resultBlob = await conversionService.convertData(file, 'json');
            } else {
                clearTimeout(timer);
                setMessage('This tool is under maintenance.');
                setLoading(false);
                return;
            }

            // Create download link
            const url = window.URL.createObjectURL(new Blob([resultBlob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `converted_${selectedTool.target === 'pdf' ? 'document' : file.name.split('.')[0]}.${selectedTool.target}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            clearTimeout(timer);
            setMessage('Conversion successful! Download started.');

        } catch (error) {
            console.error(error);
            clearTimeout(timer);
            setMessage('Conversion failed. Please try again.');
        } finally {
            setLoading(false);
        }
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

            <main style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>

                {/* View: Tool Selection Grid */}
                {!selectedTool && (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{
                            fontFamily: '"Outfit", sans-serif',
                            fontSize: '2.2rem',
                            fontWeight: '400',
                            color: '#1D3557', // Navy Blue
                            marginBottom: '1rem',
                            letterSpacing: '-0.5px'
                        }}>
                            {session?.user?.user_metadata?.full_name
                                ? `Hi ${session.user.user_metadata.full_name.split(' ')[0]}, let's get converting`
                                : null
                            }
                        </h2>
                        <p style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: '#1D3557',
                            marginBottom: '3rem',
                            maxWidth: '700px',
                            marginLeft: 'auto',
                            marginRight: 'auto'
                        }}>
                            The only toolkit you’ll ever need to convert, edit, and master any file format—from documents to media—completely free and in just a few clicks.
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1.5rem',
                            padding: '1rem'
                        }}>
                            {tools.map(tool => (
                                <div key={tool.id}
                                    onClick={() => handleToolSelect(tool)}
                                    style={{
                                        backgroundColor: '#fff',
                                        padding: '2rem',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        border: '1px solid transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        textAlign: 'left'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)'
                                        e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)'
                                        e.currentTarget.style.borderColor = '#A8DADC' // Light Blue border
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'
                                        e.currentTarget.style.borderColor = 'transparent'
                                    }}
                                >
                                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{tool.icon}</div>
                                    <h3 style={{
                                        fontFamily: '"Outfit", sans-serif',
                                        color: '#1D3557',
                                        marginBottom: '0.5rem',
                                        fontSize: '1.25rem'
                                    }}>{tool.name}</h3>
                                    <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                        {tool.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* View: Selected Tool Interface */}
                {selectedTool && (
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <button
                            onClick={handleBackToGrid}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#457B9D', // Medium Blue
                                cursor: 'pointer',
                                fontSize: '1rem',
                                marginBottom: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: '600'
                            }}
                        >
                            ← Back to all tools
                        </button>

                        <div style={{
                            backgroundColor: '#fff',
                            padding: '3rem',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{selectedTool.icon}</div>
                            <h2 style={{
                                fontFamily: '"Outfit", sans-serif',
                                fontSize: '2rem',
                                color: '#1D3557',
                                marginBottom: '0.5rem'
                            }}>{selectedTool.name}</h2>
                            <p style={{ color: '#666', marginBottom: '2rem' }}>{selectedTool.desc}</p>

                            <div style={{
                                border: '2px dashed #A8DADC',
                                borderRadius: '12px',
                                padding: '3rem',
                                backgroundColor: '#F1FAEE', // Very light mint/beige
                                marginBottom: '2rem',
                                position: 'relative'
                            }}>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                                {file ? (
                                    <div>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                                        <p style={{ fontWeight: 'bold', color: '#1D3557' }}>{file.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#666' }}>Click to change file</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{
                                            backgroundColor: '#457B9D',
                                            color: 'white',
                                            padding: '1rem 2rem',
                                            borderRadius: '50px',
                                            display: 'inline-block',
                                            fontWeight: 'bold',
                                            marginBottom: '1rem',
                                            boxShadow: '0 4px 6px rgba(69, 123, 157, 0.3)'
                                        }}>
                                            Select {selectedTool.type === 'image' ? 'Image' : 'File'}
                                        </div>
                                        <p style={{ color: '#666' }}>or drop file here</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleConvert}
                                disabled={loading || !file}
                                style={{
                                    backgroundColor: loading || !file ? '#ccc' : '#E8D5B5', // Beige action button
                                    color: '#2d3e50', // Dark text
                                    padding: '1rem 3rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    cursor: loading || !file ? 'not-allowed' : 'pointer',
                                    boxShadow: loading || !file ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                {loading ? 'Converting...' : `Convert to ${selectedTool.target.toUpperCase()}`}
                            </button>

                            {message && (
                                <div style={{
                                    marginTop: '2rem',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    backgroundColor: message.includes('failed') ? '#FFE5E5' : '#E0F2F1',
                                    color: message.includes('failed') ? '#D32F2F' : '#2E7D32',
                                    fontWeight: '500'
                                }}>
                                    {message}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
