# FileForge Project

This project consists of a React frontend and a FastAPI backend.

## Prerequisites

- [Node.js](https://nodejs.org/) (for frontend)
- [Python](https://www.python.org/) (for backend)
- **Tesseract OCR Engine** (Required for OCR conversion features)
  - **Windows**: Download and install the [Tesseract installer here](https://github.com/UB-Mannheim/tesseract/wiki). Make sure to add it to your system PATH.
  - **macOS**: `brew install tesseract`
  - **Linux (Ubuntu/Debian)**: `sudo apt install tesseract-ocr`

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Environment Variables

The backend uses `python-dotenv` to load environment variables. You may need to create a `.env` file in the `backend` directory if configured.
