import {
    BsFileEarmarkPdfFill,
    BsFileEarmarkWordFill,
    BsFileEarmarkImageFill,
    BsFiletypeCsv,
    BsFiletypeJson,
    BsFiletypeXml,
    BsFileEarmarkSpreadsheetFill,
    BsFileEarmarkCodeFill,
    BsArrowRightShort,
    BsFileEarmarkFill,
    BsFiletypeJpg,
    BsFiletypePng,
    BsFiletypeGif
} from 'react-icons/bs'

import { FaFileCsv, FaFileExcel, FaFileImage, FaFilePdf, FaFileWord, FaFileCode } from 'react-icons/fa'
import { PiFileCsvFill, PiFilePdfFill, PiFileDocFill, PiFileXlsFill, PiFileJpgFill, PiFilePngFill } from "react-icons/pi";

// Helper to get icon component and color
const getIconConfig = (type) => {
    switch (type) {
        case 'pdf': return { Icon: BsFileEarmarkPdfFill, color: '#FF5252' } // Red
        case 'docx':
        case 'doc': return { Icon: BsFileEarmarkWordFill, color: '#448AFF' } // Blue
        case 'image': return { Icon: BsFileEarmarkImageFill, color: '#AB47BC' } // Purple Generic
        case 'jpg':
        case 'jpeg': return { Icon: BsFiletypeJpg, color: '#E91E63' } // Pink/Reddish
        case 'png': return { Icon: BsFiletypePng, color: '#00BCD4' } // Cyan
        case 'gif': return { Icon: BsFiletypeGif, color: '#673AB7' } // Deep Purple
        case 'csv': return { Icon: BsFiletypeCsv, color: '#009688' } // Teal
        case 'xlsx':
        case 'xls':
        case 'excel': return { Icon: BsFileEarmarkSpreadsheetFill, color: '#4CAF50' } // Green
        case 'json': return { Icon: BsFiletypeJson, color: '#FFC107' } // Amber
        case 'xml': return { Icon: BsFiletypeXml, color: '#FF9800' } // Orange
        default: return { Icon: BsFileEarmarkFill, color: '#607D8B' } // Grey
    }
}

const ToolIcon = ({ tool, simple = false, iconSize = 42 }) => {
    // Determine Source and Target types
    let sourceType = tool.type
    let targetType = tool.target

    // Refine source types based on ID/Name if generic
    if (tool.id === 'merge-pdf') {
        sourceType = 'pdf'
    } else if (tool.id?.includes('-to-')) {
        // Smart detection: "json-to-csv" -> source=json
        const parts = tool.id.split('-to-')
        sourceType = parts[0]
    } else {
        // Fallback for other naming conventions
        if (tool.id?.includes('json')) sourceType = 'json'
        else if (tool.id?.includes('csv')) sourceType = 'csv'
        else if (tool.id?.includes('excel')) sourceType = 'xlsx'
        else if (tool.id?.includes('xml')) sourceType = 'xml'
    }

    // Single Icon Mode (Clean & Simple)
    if (simple) {
        const config = getIconConfig(sourceType || targetType)
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))'
            }}>
                <config.Icon size={iconSize} color={config.color} />
            </div>
        )
    }

    // Configs
    const sourceConfig = getIconConfig(sourceType)
    const targetConfig = getIconConfig(targetType)

    // Special case for Merge PDF (Clean Stack)
    if (tool.id === 'merge-pdf') {
        const Icon = sourceConfig.Icon;
        return (
            <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                {/* Back File */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 8,
                    zIndex: 1,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}>
                    <Icon size={40} color={sourceConfig.color} />
                </div>

                {/* Middle File */}
                <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 16,
                    zIndex: 2,
                    border: '2px solid white',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={40} color={sourceConfig.color} />
                </div>

                {/* Front File */}
                <div style={{
                    position: 'absolute',
                    top: 16,
                    left: 24,
                    zIndex: 3,
                    border: '2px solid white',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={40} color={sourceConfig.color} />
                </div>
            </div>
        )
    }

    return (
        <div style={{ position: 'relative', width: '64px', height: '64px' }}>
            {/* Background: Source Format (Larger, faded slightly, top-left) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                zIndex: 1
            }}>
                <sourceConfig.Icon size={42} color={sourceConfig.color} />
            </div>

            {/* Foreground: Target Format (Bottom-right, prominent with thick border) */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2px', // Inner spacing 
                border: '3px solid white', // Thick white border to separate from background
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <targetConfig.Icon size={32} color={targetConfig.color} />
            </div>

            {/* Transitional Arrow (Circle overlay) */}
            <div style={{
                position: 'absolute',
                top: '45%',
                left: '45%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                zIndex: 3,
                border: '2px solid white'
            }}>
                <BsArrowRightShort size={14} color="#333" strokeWidth={0.5} />
            </div>
        </div>
    )
}

export default ToolIcon
