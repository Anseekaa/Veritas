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

# Global lazy loader
model_pipeline = None

def get_model():
    global model_pipeline
    if model_pipeline is None:
        try:
            # Initialize NLTK first
            from features import ensure_nltk_resources
            ensure_nltk_resources()
            
            # Load model
            print("Loading model pipeline...")
            model_path = os.path.join(os.path.dirname(__file__), "model_pipeline.pkl")
            model_pipeline = joblib.load(model_path)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"CRITICAL ERROR loading model: {e}")
            return None
    return model_pipeline

@app.on_event("startup")
async def startup_event():
    # Only print, do not perform heavy lifting here to avoid deployment timeouts
    print("Application starting up...")

class UrlRequest(BaseModel):
    url: str

class TextRequest(BaseModel):
    text: str

@app.post("/predict")
async def predict(request: TextRequest):
    import traceback
    try:
        pipeline = get_model()
        if pipeline is None:
            # Re-attempt import checks to give better error
            error_msg = "Model failed to load. "
            try:
                import sklearn
                error_msg += f"Sklearn version: {sklearn.__version__}. "
            except ImportError:
                error_msg += "Sklearn MISSING. "
            try:
                import numpy
                error_msg += f"Numpy version: {numpy.__version__}. "
            except ImportError:
                error_msg += "Numpy MISSING. "
                
            raise HTTPException(status_code=500, detail=error_msg)
        
        # Predict directly on raw text
        prediction_cls = pipeline.predict([request.text])[0]
        
        # Get probability if available
        try:
            prediction_prob = pipeline.predict_proba([request.text])[0]
            confidence = float(max(prediction_prob))
        except:
            confidence = 1.0
            
        label = "FAKE" if prediction_cls == 1 else "REAL"
        
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

