
import React from 'react';

/**
 * ToolCategory Class (OOP: Encapsulation)
 * Represents a category of tools.
 */
class ToolCategory {
    constructor(title, icon) {
        this.title = title;
        this.icon = icon;
        this.tools = [];
    }

    addTool(tool) {
        this.tools.push(tool);
    }
}

/**
 * MegaMenu Component
 * Renders the categorized list of tools based on active menu.
 */
export default function MegaMenu({ tools, activeMenu, onToolSelect, onClose }) {

    // Helper to organize tools for "ALL TOOLS" view
    const OrganizeAllTools = () => {
        const categories = {
            pdf: new ToolCategory('PDF Tools', '📄'),
            image: new ToolCategory('Image Tools', '🖼️'),
            data: new ToolCategory('Data Tools', '📊'),
        };

        tools.forEach(tool => {
            if (tool.id.includes('pdf') && !tool.id.includes('image')) {
                categories.pdf.addTool(tool);
            } else if (tool.id.includes('image')) {
                categories.image.addTool(tool);
            } else if (tool.id.includes('csv') || tool.id.includes('json')) {
                categories.data.addTool(tool);
            }
        });
        return Object.values(categories);
    };

    // Helper to organize tools for "CONVERT PDF" view
    const OrganizePDFTools = () => {
        const categories = {
            convertTo: new ToolCategory('Convert TO PDF', '📥'),
            convertFrom: new ToolCategory('Convert FROM PDF', '📤'),
            organize: new ToolCategory('Organize PDF', '📁'),
        };

        tools.forEach(tool => {
            if (tool.id === 'image-to-pdf') {
                categories.convertTo.addTool(tool);
            } else if (tool.id === 'pdf-to-word') {
                categories.convertFrom.addTool(tool);
            } else if (tool.id === 'merge-pdf') {
                categories.organize.addTool(tool);
            }
        });

        // Filter out empty categories if needed, or keep for spacing
        return Object.values(categories).filter(c => c.tools.length > 0);
    };

    const categoryList = activeMenu === 'convert-pdf' ? OrganizePDFTools() : OrganizeAllTools();

    return (
        <div
            style={{
                position: 'absolute',
                top: '100%', // Directly below navbar
                left: 0,
                width: '100%',
                backgroundColor: '#fff',
                borderBottom: '1px solid #e0e0e0',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                padding: '2rem 4rem',
                zIndex: 99,
                display: 'flex',
                justifyContent: 'center',
                gap: '4rem'
            }}
            onMouseLeave={onClose}
        >
            {categoryList.map((category, index) => (
                <div key={index} style={{ minWidth: '200px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        color: '#E63946', // Red accent for headers
                        fontWeight: '700',
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: '1rem',
                        letterSpacing: '0.5px'
                    }}>
                        <span>{category.icon}</span>
                        <span>{category.title.toUpperCase()}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {category.tools.map(tool => (
                            <div
                                key={tool.id}
                                onClick={() => {
                                    onToolSelect(tool);
                                    onClose();
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.8rem',
                                    cursor: 'pointer',
                                    color: '#444',
                                    padding: '0.25rem 0',
                                    transition: 'color 0.2s',
                                    fontSize: '0.95rem'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#E63946'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#444'}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{tool.icon}</span>
                                <span>{tool.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
