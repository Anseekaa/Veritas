import joblib
import pandas as pd
import numpy as np
import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Ensure nltk is ready (simplified for script)
try:
    stop_words = set(stopwords.words('english'))
except:
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('omw-1.4')
    stop_words = set(stopwords.words('english'))

lemmatizer = WordNetLemmatizer()

def clean_text(text):
    # Match the logic in train_model.py exactly
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\s+', ' ', text).strip()
    
    # The same list we used in training
    words_to_remove = [
        'reuters', 'said', 'reporting', 'via', 'image', 'mr', 'washington', 
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
        'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'
    ]
    
    words = text.split()
    cleaned_words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words and word not in words_to_remove]
    return " ".join(cleaned_words)

def explain_prediction(text):
    print(f"Original Text: {text[:50]}...")
    
    cleaned = clean_text(text)
    print(f"Cleaned Text: {cleaned}")
    
    model = joblib.load('model.pkl')
    tfidf = joblib.load('tfidf.pkl')
    
    # Transform
    vectorized = tfidf.transform([cleaned])
    feature_names = tfidf.get_feature_names_out()
    
    # Get vector indices
    indices = vectorized.indices
    data = vectorized.data
    
    # Get model coefficients
    coefs = model.coef_[0]
    intercept = model.intercept_[0]
    
    print(f"\nBase Intercept: {intercept:.4f} (Negative leans Real, Positive leans Fake)")
    
    contributions = []
    for idx, tfidf_freq in zip(indices, data):
        word = feature_names[idx]
        weight = coefs[idx]
        contribution = weight * tfidf_freq
        contributions.append((word, weight, contribution))
    
    # Sort by contribution (Most Positive = Most contributing to FAKE)
    contributions.sort(key=lambda x: x[2], reverse=True)
    
    print("\n--- Word Contributions (Positive = Pushing to FAKE, Negative = Pushing to REAL) ---")
    total_score = intercept
    for word, weight, contrib in contributions:
        print(f"Word: '{word}' | Weight: {weight:.4f} | Contribution: {contrib:.4f}")
        total_score += contrib
        
    prob = 1 / (1 + np.exp(-total_score))
    print(f"\nTotal Logit Score: {total_score:.4f}")
    print(f"Calculated Probability (Fake): {prob:.4f}")

if __name__ == "__main__":
    # The text from the user's screenshot
    test_text = "At least 4 people crushed to death by BEST bus while reversing in MumbaiUpdated on A BEST electric bus accident outside Mumbai's Bhandup railway station resulted in four fatalities and at least 9 injuries on Monday night around 10 pm."
    explain_prediction(test_text)
