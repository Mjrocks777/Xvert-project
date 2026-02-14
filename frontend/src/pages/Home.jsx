import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase' // Direct supabase usage for immediate auth state check
import authService from '../services/AuthService'
import conversionService from '../services/ConversionService'
import UserAvatar from '../components/UserAvatar'
import ToolIcon from '../components/ToolIcon'
import Navbar from '../components/Navbar'

export default function Home() {
    const navigate = useNavigate()
    const [file, setFile] = useState(null)
    const [selectedTool, setSelectedTool] = useState(null) // null = show grid, 'tool-id' = show specific tool
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [session, setSession] = useState(null)
    const [files, setFiles] = useState([]) // For multiple files (Merge PDF)
    const [progress, setProgress] = useState(0)
    const [downloadUrl, setDownloadUrl] = useState(null)

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
        // Document Tools
        { id: 'pdf-to-word', name: 'PDF to Word', desc: 'Convert your PDF files to editable DOCX documents.', icon: '📄', type: 'pdf', target: 'docx' },
        { id: 'docx-to-pdf', name: 'Word to PDF', desc: 'Convert DOCX files to PDF documents.', icon: '📝', type: 'docx', target: 'pdf' },
        { id: 'image-to-pdf', name: 'Image to PDF', desc: 'Convert JPG, PNG, or GIF images into PDF documents.', icon: '🖼️', type: 'image', target: 'pdf' },
        { id: 'merge-pdf', name: 'Merge PDF', desc: 'Combine multiple PDFs into one unified document.', icon: '🔗', type: 'merge', target: 'pdf' },
        { id: 'pdf-to-jpg', name: 'PDF to JPG', desc: 'Convert PDF pages to JPG images.', icon: 'fz', type: 'pdf', target: 'jpg' },
        { id: 'pdf-to-png', name: 'PDF to PNG', desc: 'Convert PDF pages to PNG images.', icon: 'fz', type: 'pdf', target: 'png' },

        // Image Tools
        { id: 'jpg-to-png', name: 'JPG to PNG', desc: 'Convert JPG images to PNG format.', icon: '📷', type: 'jpg', target: 'png' },
        { id: 'png-to-jpg', name: 'PNG to JPG', desc: 'Convert PNG images to JPG format.', icon: '📸', type: 'png', target: 'jpg' },
        { id: 'jpg-to-gif', name: 'JPG to GIF', desc: 'Convert JPG images to GIF format.', icon: '👾', type: 'jpg', target: 'gif' },
        { id: 'png-to-gif', name: 'PNG to GIF', desc: 'Convert PNG images to GIF format.', icon: '👾', type: 'png', target: 'gif' },

        // Data Tools
        { id: 'json-to-csv', name: 'JSON to CSV', desc: 'Transform JSON data files into CSV spreadsheets.', icon: '📊', type: 'data', target: 'csv' },
        { id: 'csv-to-json', name: 'CSV to JSON', desc: 'Convert CSV spreadsheets into JSON format.', icon: '📋', type: 'data', target: 'json' },
        { id: 'excel-to-csv', name: 'Excel to CSV', desc: 'Convert Excel spreadsheets to CSV format.', icon: 'x', type: 'data', target: 'csv' },
        { id: 'csv-to-excel', name: 'CSV to Excel', desc: 'Convert CSV files to Excel spreadsheets.', icon: 'x', type: 'data', target: 'xlsx' },
        { id: 'excel-to-json', name: 'Excel to JSON', desc: 'Convert Excel spreadsheets to JSON data.', icon: 'x', type: 'data', target: 'json' },
        { id: 'json-to-excel', name: 'JSON to Excel', desc: 'Convert JSON data to Excel spreadsheets.', icon: 'x', type: 'data', target: 'xlsx' },
        { id: 'xml-to-json', name: 'XML to JSON', desc: 'Convert XML data to JSON format.', icon: '📋', type: 'data', target: 'json' },
        { id: 'json-to-xml', name: 'JSON to XML', desc: 'Convert JSON data to XML format.', icon: '🧩', type: 'data', target: 'xml' },
        { id: 'xml-to-csv', name: 'XML to CSV', desc: 'Convert XML data to CSV spreadsheets.', icon: '📊', type: 'data', target: 'csv' },
        { id: 'csv-to-xml', name: 'CSV to XML', desc: 'Convert CSV spreadsheets to XML format.', icon: '🧩', type: 'data', target: 'xml' },
        { id: 'xml-to-excel', name: 'XML to Excel', desc: 'Convert XML data to Excel spreadsheets.', icon: 'x', type: 'data', target: 'xlsx' },
        { id: 'excel-to-xml', name: 'Excel to XML', desc: 'Convert Excel spreadsheets to XML format.', icon: '🧩', type: 'data', target: 'xml' },
    ]

    const getAcceptTypes = (tool) => {
        if (!tool) return '*'
        if (tool.id === 'merge-pdf') return '.pdf'
        if (tool.type === 'pdf') return '.pdf'
        if (tool.type === 'image') return '.jpg,.jpeg,.png,.gif'
        if (tool.type === 'jpg') return '.jpg,.jpeg'
        if (tool.type === 'png') return '.png'
        if (tool.type === 'docx') return '.docx,.doc'
        if (tool.type === 'data') return '.json,.csv,.xlsx,.xls,.xml'
        return '*'
    }

    const handleLogout = async () => {
        await authService.logout()
        // Stay on home page, but session will be null so header updates
    }

    const handleFileChange = (e) => {
        setDownloadUrl(null)
        const selectedFile = e.target.files[0];

        // Basic validation helper
        const isValidFileType = (file, tool) => {
            if (!file) return false
            const ext = '.' + file.name.split('.').pop().toLowerCase()
            const accept = getAcceptTypes(tool)
            return accept === '*' || accept.includes(ext)
        }

        if (selectedTool?.id === 'merge-pdf') {
            const newFiles = Array.from(e.target.files).filter(f => isValidFileType(f, selectedTool))

            if (newFiles.length < e.target.files.length) {
                setMessage('Some files were skipped because they are not PDFs.')
                setTimeout(() => setMessage(''), 3000)
            }

            setFiles(prev => [...prev, ...newFiles])
            setFile(null)
        } else {
            if (isValidFileType(selectedFile, selectedTool)) {
                setFile(selectedFile)
                setMessage('')
            } else {
                setFile(null)
                setMessage(`Invalid file type. Please select a ${selectedTool.type === 'image' ? 'Image' : selectedTool.type.toUpperCase()} file.`)
            }
            setFiles([])
        }
        e.target.value = '' // Reset input to allow selecting same files again if needed
    }

    const handleRemoveFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleToolSelect = (tool) => {
        setSelectedTool(tool)
        setFile(null)
        setMessage('')
    }

    const handleBackToGrid = () => {
        setSelectedTool(null)
        setFile(null)
        setFiles([])
        setMessage('')
        setDownloadUrl(null)
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

        if (selectedTool.id === 'merge-pdf') {
            if (files.length < 2) {
                setMessage('Please select at least 2 PDF files to merge.')
                return
            }
        } else if (!file) {
            setMessage('Please select a file first.')
            return
        }

        setLoading(true)
        setProgress(0)
        setMessage('Converting... (Larger files may take 10-20 seconds)')

        // Simulate progress - faster updates for smoother feel
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev
                return prev + 5
            })
        }, 500)

        const timer = setTimeout(() => {
            setMessage('Still processing... complex files need a moment. Please do not refresh.');
        }, 5000);

        try {
            let resultBlob;

            if (selectedTool.id === 'merge-pdf') {
                resultBlob = await conversionService.mergeDocuments(files);
            } else if (selectedTool.id === 'image-to-pdf') {
                resultBlob = await conversionService.convertDocument(file, 'image', 'pdf');
            } else if (selectedTool.type === 'pdf') {
                // PDF to Word, JPG, PNG
                resultBlob = await conversionService.convertDocument(file, 'pdf', selectedTool.target);
            } else if (selectedTool.type === 'image' || selectedTool.type === 'jpg' || selectedTool.type === 'png') {
                // Image conversions
                resultBlob = await conversionService.convertImage(file, selectedTool.target);
            } else if (selectedTool.type === 'docx') {
                // Word to PDF
                resultBlob = await conversionService.convertDocument(file, 'docx', 'pdf');
            } else if (selectedTool.type === 'data') {
                // JSON/CSV/Excel/XML conversions
                resultBlob = await conversionService.convertData(file, selectedTool.target);
            } else {
                clearInterval(progressInterval);
                clearTimeout(timer);
                setMessage('This tool is currently unavailable.');
                setLoading(false);
                setProgress(0);
                return;
            }

            clearInterval(progressInterval);
            setProgress(100);

            // Small delay to let the user see the bar hit 100%
            setTimeout(() => {
                const url = window.URL.createObjectURL(new Blob([resultBlob]));
                clearTimeout(timer);
                setMessage('Conversion successful!');
                setDownloadUrl(url);
                setLoading(false);
                setTimeout(() => setProgress(0), 1000);
            }, 800);

        } catch (error) {
            console.error(error);
            clearInterval(progressInterval);
            clearTimeout(timer);
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                setMessage('Conversion timed out. The file might be too large or complex.');
            } else {
                setMessage('Conversion failed. Please try again.');
            }
            setProgress(0);
            setLoading(false);
        } finally {
            // Optional: reset progress after a delay if you want
            // setTimeout(() => setProgress(0), 2000)
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
                                    <div style={{ marginBottom: '1rem', height: '70px', display: 'flex', alignItems: 'center' }}>
                                        <ToolIcon tool={tool} />
                                    </div>
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
                        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={handleBackToGrid}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') handleBackToGrid();
                                }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0',
                                    color: '#1D3557', // Darker navy for better contrast
                                    cursor: 'pointer',
                                    fontSize: '1.2rem', // Slightly larger
                                    fontWeight: '800', // Extra bold
                                    transition: 'color 0.2s ease, transform 0.2s ease',
                                    outline: 'none',
                                    border: 'none',
                                    background: 'transparent',
                                    textDecoration: 'none',
                                    userSelect: 'none'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.color = '#457B9D';
                                    e.currentTarget.style.transform = 'translateX(-5px)'; // A little nudge to show interaction
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.color = '#1D3557';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                ← Home
                            </span>
                        </div>

                        <div style={{
                            backgroundColor: '#fff',
                            padding: '3rem',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                <div style={{ transform: 'scale(1.5)' }}>
                                    <ToolIcon tool={selectedTool} />
                                </div>
                            </div>
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
                                padding: '1.5rem',
                                backgroundColor: '#F1FAEE', // Very light mint/beige
                                marginBottom: '2rem',
                                position: 'relative',
                                maxWidth: '400px',
                                margin: '0 auto 2rem'
                            }}>
                                <input
                                    type="file"
                                    accept={getAcceptTypes(selectedTool)}
                                    onChange={handleFileChange}
                                    multiple={selectedTool.id === 'merge-pdf'}
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
                                {selectedTool.id === 'merge-pdf' && files.length > 0 ? (
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', width: '100%', textAlign: 'left', position: 'relative', zIndex: 10, pointerEvents: 'none' }}>
                                        <p style={{ fontWeight: 'bold', color: '#1D3557', textAlign: 'center', marginBottom: '1rem' }}>
                                            {files.length} files selected
                                        </p>
                                        {files.map((f, index) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                backgroundColor: 'white',
                                                padding: '0.5rem',
                                                marginBottom: '0.5rem',
                                                borderRadius: '4px',
                                                border: '1px solid #eee',
                                                pointerEvents: 'auto'
                                            }}>
                                                <span style={{ fontSize: '0.9rem', truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '85%' }}>
                                                    {f.name}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        e.preventDefault()
                                                        handleRemoveFile(index)
                                                    }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#D32F2F',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        padding: '0 0.5rem'
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
                                            Click box to add more files
                                        </div>
                                    </div>
                                ) : file ? (
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
                                            Select {selectedTool.type === 'image' ? 'Image' : selectedTool.id === 'merge-pdf' ? 'PDFs' : 'File'}
                                        </div>
                                        <p style={{ color: '#666' }}>or drop file here</p>
                                    </div>
                                )}
                            </div>

                            {downloadUrl ? (
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = downloadUrl;
                                        link.setAttribute('download', `converted_${selectedTool.target === 'pdf' ? 'document' : (files.length > 0 ? 'merged' : file.name.split('.')[0])}.${selectedTool.target}`);
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                    }}
                                    style={{
                                        display: 'block',
                                        width: 'auto',
                                        minWidth: '200px',
                                        margin: '0 auto',
                                        backgroundColor: '#457B9D',
                                        color: 'white',
                                        padding: '1rem 3rem',
                                        borderRadius: '50px',
                                        border: 'none',
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 6px rgba(69, 123, 157, 0.3)',
                                        transition: 'transform 0.05s',
                                        animation: 'fadeIn 0.5s ease-in-out'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    Download
                                </button>
                            ) : (
                                <button
                                    onClick={handleConvert}
                                    disabled={loading || (!file && files.length < 2)}
                                    style={{
                                        backgroundColor: loading || (!file && files.length < 2) ? '#ccc' : '#E8D5B5', // Beige action button
                                        color: '#2d3e50', // Dark text
                                        padding: '1rem 3rem',
                                        borderRadius: '50px',
                                        border: 'none',
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        cursor: loading || (!file && files.length < 2) ? 'not-allowed' : 'pointer',
                                        transition: 'transform 0.2s',
                                        background: (!file && files.length < 2) ? '#ccc' : '#E8D5B5',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        minWidth: '200px'
                                    }}
                                >
                                    {loading && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            height: '100%',
                                            width: `${progress}%`,
                                            backgroundColor: '#A8DADC',
                                            transition: 'width 0.3s ease-in-out',
                                            zIndex: 0
                                        }} />
                                    )}
                                    <span style={{ position: 'relative', zIndex: 1 }}>
                                        {loading ? 'Converting...' : 'Convert'}
                                    </span>
                                </button>
                            )}

                            {message && (
                                <div style={{
                                    marginTop: '2rem',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    backgroundColor: message.includes('failed') || message.includes('Invalid') ? '#FFE5E5' : '#E0F2F1',
                                    color: message.includes('failed') || message.includes('Invalid') ? '#D32F2F' : '#2E7D32',
                                    fontWeight: '500'
                                }}>
                                    {message}
                                    {message.includes('failed') && (
                                        <button
                                            onClick={handleConvert}
                                            style={{
                                                marginTop: '0.5rem',
                                                backgroundColor: '#D32F2F',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem 1.5rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem',
                                                boxShadow: '0 2px 4px rgba(211, 47, 47, 0.3)',
                                                display: 'block',
                                                marginLeft: 'auto',
                                                marginRight: 'auto'
                                            }}
                                        >
                                            ↻ Retry
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
