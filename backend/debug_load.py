import joblib
import sys
import os

# Ensure cwd is backend so imports work
sys.path.append(os.getcwd())

try:
    from features import TextFeatureExtractor, preprocess_for_tfidf
    print("Imports successful.")
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

try:
    model = joblib.load("model_pipeline.pkl")
    print("Model loaded successfully.")
    print("Prediction test:")
    print(model.predict_proba(["Test news"]))
except Exception as e:
    print(f"Load Error: {e}")
