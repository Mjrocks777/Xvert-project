
import os
import sys
import shutil
import subprocess
import tempfile
import asyncio
from fastapi import UploadFile
from pdf2docx import Converter
from pypdf import PdfWriter
import fitz  # PyMuPDF
from PIL import Image

# ---------------------------------------------------------------------------
# LibreOffice headless helper — cross-platform DOCX → PDF
# ---------------------------------------------------------------------------
def _libreoffice_convert_to_pdf(input_path: str, output_dir: str) -> str:
    """
    Convert a DOCX (or any LibreOffice-supported format) to PDF using the
    LibreOffice headless CLI. Works on Linux (Docker/Render) and macOS.
    Falls back to a helpful error on Windows if LibreOffice is not installed.

    Args:
        input_path:  Absolute path to the source DOCX file.
        output_dir:  Directory where LibreOffice will write the output PDF.

    Returns:
        Absolute path to the generated PDF file.

    Raises:
        RuntimeError if LibreOffice is not found or conversion fails.
    """
    # Locate the LibreOffice executable
    lo_cmd = shutil.which("libreoffice") or shutil.which("soffice")
    if lo_cmd is None:
        if sys.platform == "win32":
            # Common Windows install locations
            candidates = [
                r"C:\Program Files\LibreOffice\program\soffice.exe",
                r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
            ]
            for c in candidates:
                if os.path.isfile(c):
                    lo_cmd = c
                    break
        if lo_cmd is None:
            raise RuntimeError(
                "LibreOffice is not installed or not found in PATH.\n"
                "  Linux/Docker: confirmed installed via apt-get in Dockerfile.\n"
                "  Windows (local dev): install from https://www.libreoffice.org/download/"
            )

    result = subprocess.run(
        [
            lo_cmd,
            "--headless",
            "--norestore",
            "--convert-to", "pdf",
            "--outdir", output_dir,
            input_path,
        ],
        capture_output=True,
        text=True,
        timeout=120,  # 2-minute safety timeout
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"LibreOffice conversion failed (exit {result.returncode}).\n"
            f"stderr: {result.stderr.strip()}"
        )

    # LibreOffice writes <basename>.pdf into output_dir
    base = os.path.splitext(os.path.basename(input_path))[0]
    pdf_path = os.path.join(output_dir, f"{base}.pdf")
    if not os.path.isfile(pdf_path):
        raise RuntimeError(
            f"LibreOffice reported success but output PDF not found at: {pdf_path}"
        )
    return pdf_path

# All temp/output files go into the system temp directory
_TEMP_DIR = tempfile.gettempdir()


async def convert_document(file: UploadFile, source_format: str, target_format: str) -> str:
    # 1. Save input file to temp dir
    temp_filename = os.path.join(_TEMP_DIR, f"xvert_temp_{file.filename}")
    with open(temp_filename, "wb") as buffer:
        buffer.write(await file.read())

    base_name = os.path.splitext(file.filename)[0]
    output_filename = os.path.join(_TEMP_DIR, f"converted_{base_name}.{target_format}")

    def run_conversion():
        try:
            # --- LOGIC: PDF to Word ---
            if source_format == "pdf" and target_format == "docx":
                cv = Converter(temp_filename)
                cv.convert(output_filename, start=0, end=None)
                cv.close()

            # --- LOGIC: Word to PDF (via LibreOffice headless) ---
            elif source_format in ["docx", "doc"] and target_format == "pdf":
                abs_temp = os.path.abspath(temp_filename)
                out_dir   = os.path.dirname(os.path.abspath(output_filename))
                pdf_path  = _libreoffice_convert_to_pdf(abs_temp, out_dir)
                # LibreOffice names the file <basename>.pdf; rename to match expected output_filename
                if os.path.abspath(pdf_path) != os.path.abspath(output_filename):
                    os.replace(pdf_path, output_filename)

            # --- LOGIC: Image to PDF ---
            elif source_format in ["jpg", "jpeg", "png", "image"] and target_format == "pdf":
                image = Image.open(temp_filename)
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                image.save(output_filename, "PDF", resolution=100.0)

            # --- LOGIC: PDF to Image (First Page Only) ---
            elif source_format == "pdf" and target_format in ["jpg", "png"]:
                doc = fitz.open(temp_filename)
                page = doc.load_page(0)
                pix = page.get_pixmap()
                pix.save(output_filename)
                doc.close()
                
            else:
                raise ValueError(f"Conversion from {source_format} to {target_format} not supported in this module.")
        except Exception as e:
            print(f"DEBUG: Run conversion error: {e}")
            raise e

    try:
        await asyncio.to_thread(run_conversion)
    finally:
        # Cleanup input file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

    return output_filename


async def merge_pdfs(files: list[UploadFile]) -> str:
    temp_files = [] 

    try:
        for file in files:
            temp_name = os.path.join(_TEMP_DIR, f"xvert_temp_{file.filename}")
            with open(temp_name, "wb") as f:
                f.write(await file.read())
            temp_files.append(temp_name)

        def merge_sync():
            merger = PdfWriter()
            for temp_name in temp_files:
                merger.append(temp_name)
            output_filename = os.path.join(_TEMP_DIR, "merged_document.pdf")
            merger.write(output_filename)
            merger.close()
            return output_filename

        output_filename = await asyncio.to_thread(merge_sync)
    
    finally:
        for f in temp_files:
            if os.path.exists(f):
                os.remove(f)

    return output_filename