import joblib
import pandas as pd
import numpy as np

def inspect_model():
    print("Loading model and vectorizer...")
    try:
        model = joblib.load('model.pkl')
        tfidf = joblib.load('tfidf.pkl')
    except Exception as e:
        print(f"Error loading: {e}")
        return

    # Get feature names
    feature_names = tfidf.get_feature_names_out()
    
    # Get coefficients
    coefs = model.coef_[0]
    
    # Sort coefficients
    sorted_indices = np.argsort(coefs)
    
    # Top 20 words for Class 0 (Real - Negative coefficients)
    top_real = [feature_names[i] for i in sorted_indices[:20]]
    
    # Top 20 words for Class 1 (Fake - Positive coefficients)
    top_fake = [feature_names[i] for i in sorted_indices[-20:][::-1]]
    
    print("\n--- Top 20 Indicators for REAL News (Class 0) ---")
    print(", ".join(top_real))
    
    print("\n--- Top 20 Indicators for FAKE News (Class 1) ---")
    print(", ".join(top_fake))

if __name__ == "__main__":
    inspect_model()
