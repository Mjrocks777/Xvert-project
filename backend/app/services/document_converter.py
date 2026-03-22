import os
import asyncio
import tempfile
import traceback
import sys
from pdf2docx import Converter
from pypdf import PdfWriter
import fitz  # PyMuPDF
from PIL import Image
try:
    import pythoncom
except ImportError:
    pythoncom = None

async def convert_document(file_content: bytes, filename: str, source_format: str, target_format: str) -> str:
    """
    Converts document bytes to target format and returns the ABSOLUTE path to the result.
    """
    # Use a secure temporary directory for all operations
    temp_dir = tempfile.gettempdir()
    
    # Input file
    suffix = f".{source_format}"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir=temp_dir) as tmp_in:
        tmp_in.write(file_content)
        input_path = tmp_in.name

    # Output file
    output_path = os.path.join(temp_dir, f"converted_{os.path.basename(input_path)}.{target_format}")

    def run_conversion():
        try:
            # --- PDF to Word ---
            if source_format == "pdf" and target_format == "docx":
                cv = Converter(input_path)
                cv.convert(output_path, start=0, end=None)
                cv.close()

            # --- Word to PDF ---
            elif source_format in ["docx", "doc"] and target_format == "pdf":
                try:
                    from docx2pdf import convert as docx2pdf_convert
                except ImportError:
                    raise ImportError("docx2pdf module not installed. Please run: pip install docx2pdf pywin32")

                if pythoncom:
                    pythoncom.CoInitialize()
                try:
                    docx2pdf_convert(input_path, output_path)
                finally:
                    if pythoncom:
                        pythoncom.CoUninitialize()

            # --- Image to PDF ---
            elif source_format.lower() in ["jpg", "jpeg", "png", "image"] and target_format == "pdf":
                with Image.open(input_path) as img:
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    img.save(output_path, "PDF", resolution=100.0)

            # --- PDF to Image ---
            elif source_format == "pdf" and target_format.lower() in ["jpg", "png", "jpeg"]:
                doc = fitz.open(input_path)
                page = doc.load_page(0)
                pix = page.get_pixmap()
                pix.save(output_path)
                doc.close()
                
            else:
                raise ValueError(f"Conversion from {source_format} to {target_format} not supported.")
                
            # Final check: did we actually create the file?
            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                raise Exception(f"Conversion failed: Output file missing or empty at {output_path}")

        except Exception as e:
            print(f"DEBUG: run_conversion error: {e}", file=sys.stderr)
            traceback.print_exc()
            raise e

    try:
        await asyncio.to_thread(run_conversion)
    except Exception as e:
        # Log to file for deep debugging
        try:
            with open(os.path.join(temp_dir, "xvert_conversion_error.log"), "a") as f:
                f.write(f"\n--- ERROR {filename} ---\n{traceback.format_exc()}\n")
        except: pass
        raise e
    finally:
        # Cleanup input file
        if os.path.exists(input_path):
            os.remove(input_path)

    return output_path

async def merge_pdfs(files) -> str:
    """
    Merges multiple PDFs (can be UploadFile objects or a list of dicts with 'content'/'name').
    """
    temp_dir = tempfile.gettempdir()
    temp_files = [] 

    try:
        for i, f in enumerate(files):
            # Handle both UploadFile (async) and simple objects (sync bytes)
            content = await f.read() if hasattr(f, 'read') else (f.get('content') if isinstance(f, dict) else None)
            if content is None: continue
            
            t = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf", dir=temp_dir)
            t.write(content)
            t.close()
            temp_files.append(t.name)

        def merge_sync():
            merger = PdfWriter()
            for tf in temp_files:
                merger.append(tf)
            out_path = os.path.join(temp_dir, f"merged_{os.urandom(4).hex()}.pdf")
            merger.write(out_path)
            merger.close()
            return out_path

        output_path = await asyncio.to_thread(merge_sync)
        return output_path
    
    finally:
        for tf in temp_files:
            if os.path.exists(tf):
                os.remove(tf)