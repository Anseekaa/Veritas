# Fake News Detector Web App

Full-stack application to detect fake news using Logistic Regression (backend) and React (frontend).

## Prerequisites
- Node.js & npm
- Python 3.8+
- Supabase Account (optional, for logging)

## Setup Instructions

### 1. Backend Setup
Navigate to the `backend` folder:
```bash
cd backend
```

**Create and Activate Virtual Environment (Recommended):**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

**Data Required:**
- Place `Fake.csv` and `True.csv` inside the `backend` folder.

**Environment Variables:**
Create a `.env` file in `backend/` with your Supabase credentials (optional):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

**Train Model:**
```bash
python train_model.py
```

**Start Server:**
```bash
uvicorn main:app --reload
```
API will run at `http://localhost:8000`.

### 2. Frontend Setup
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
```

Install dependencies (if not already done):
```bash
npm install
```

**Start Frontend:**
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

## Usage
1. Copy news text into the text area.
2. Click "Check Authenticity".
3. See the result (REAL/FAKE) and confidence score.
