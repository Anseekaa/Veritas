from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import os
from features import TextAnalyzer
from supabase import create_client, Client
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup

load_dotenv()

app = FastAPI()

# CORS Setup
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load Model Pipeline
model_pipeline = None

@app.on_event("startup")
def load_artifacts():
    global model_pipeline
    try:
        # Load the full pipeline (includes preprocessing + features + classifier)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, "model_pipeline.pkl")
        model_pipeline = joblib.load(model_path)
        print(f"Model Pipeline loaded successfully from {model_path}")
    except Exception as e:
        print(f"Error loading model pipeline: {e}")

    except Exception as e:
        print(f"Error loading model pipeline: {e}")

class UrlRequest(BaseModel):
    url: str

class NewsRequest(BaseModel):
    text: str

@app.post("/predict")
async def predict_news(request: NewsRequest):
    if not model_pipeline:
        raise HTTPException(status_code=503, detail="Model pipeline not loaded")
    
    # Predict directly on raw text!
    # The pipeline handles cleaning, tfidf, and custom feature extraction.
    try:
        # predict_proba expects a list/iterable of strings
        prediction_prob = model_pipeline.predict_proba([request.text])[0]
        prediction_cls = model_pipeline.predict([request.text])[0]
        
        # 0 = Real, 1 = Fake (based on training mapping)
        label = "FAKE" if prediction_cls == 1 else "REAL"
        confidence = float(max(prediction_prob))
        
        # Advanced Analysis
        analysis = TextAnalyzer.analyze(request.text)
        
        # Log to Supabase
        if supabase:
            try:
                supabase.table("predictions").insert({
                    "text": request.text[:500],
                    "prediction": label,
                    "confidence": confidence,
                    # "analysis": analysis # optional: store analysis if DB supports it
                }).execute()
            except Exception as e:
                print(f"Supabase logging error: {e}")

        return {
            "label": label,
            "confidence": round(confidence * 100, 1),
            "analysis": analysis
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scan-url")
async def scan_url(request: UrlRequest):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(request.url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
            script.decompose()
            
        # Get text
        text = soup.get_text()
        
        # Break into lines and remove leading/trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Limit text length to avoid token limits or huge payloads
        text = text[:10000] 
        
        return {"text": text, "title": soup.title.string if soup.title else ""}
    except Exception as e:
        print(f"URL Scan Error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Fake News Detector API (Advanced features) is running"}

