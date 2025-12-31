import pandas as pd
import numpy as np
import re
import string
import joblib
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import contractions

from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.compose import ColumnTransformer
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import MinMaxScaler, FunctionTransformer

# Import custom feature extractor and cleaning functions
from features import TextFeatureExtractor, preprocess_for_tfidf

# Ensure NLTK resources (Backup check)
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('omw-1.4')

def train_and_save():
    print("Loading data...")
    try:
        fake = pd.read_csv("Fake.csv")
        true = pd.read_csv("True.csv")
    except FileNotFoundError:
        print("Error: Files not found.")
        return

    fake['label'] = 1
    true['label'] = 0
    fake.drop_duplicates(subset=['text'], inplace=True)
    true.drop_duplicates(subset=['text'], inplace=True)
    
    df = pd.concat([fake, true], axis=0)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    # We pass RAW text to the pipeline
    # The pipeline splits: one branch cleans it for TF-IDF, the other uses raw for features
    x = df['text']
    y = df['label']
    
    print("Splitting...")
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Building Pipeline...")
    
    # Branch 1: Bag of Words (TF-IDF)
    # We need a FunctionTransformer to apply clean_text BEFORE TfidfVectorizer
    tfidf_pipe = Pipeline([
        ('cleaner', FunctionTransformer(preprocess_for_tfidf)), # Clean text
        ('tfidf', TfidfVectorizer(max_features=50000, ngram_range=(1, 2), sublinear_tf=True, min_df=5, max_df=0.9))
    ])
    
    # Branch 2: Custom Features (works on Raw Text)
    features_pipe = Pipeline([
        ('extractor', TextFeatureExtractor()),
        ('scaler', MinMaxScaler()) # Normalize numeric features
    ])
    
    # Combine Branches
    preprocessor = FeatureUnion([
        ('tfidf_branch', tfidf_pipe),
        ('features_branch', features_pipe)
    ])
    
    # Full Pipeline
    # LinearSVC does not support predict_proba, but CalibratedClassifierCV does.
    # However, CalibratedClassifierCV needs an estimator. 
    # We can fit a GridSearchCV on the *preprocessed* data to find best C, 
    # then build the final calibrated pipeline.
    
    # To save time in this iteration, we keep the previously found best params (C=1, squared_hinge)
    # and just train the calibrated model in the pipeline.
    
    linear_svc = LinearSVC(C=1, loss='squared_hinge', class_weight='balanced', random_state=42, dual='auto')
    
    # Note: CalibratedClassifierCV cannot be easily Pickled inside a Pipeline if it's not the final step?
    # Actually it's fine.
    calibrated_svc = CalibratedClassifierCV(linear_svc, cv=5, method='sigmoid')
    
    final_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', calibrated_svc)
    ])
    
    print("Training Model (Pipeline)...")
    final_pipeline.fit(x_train, y_train)
    
    print("Evaluating...")
    y_pred = final_pipeline.predict(x_test)
    print(classification_report(y_test, y_pred))
    
    print("Saving Pipeline...")
    # Dictionary to save everything needed
    # Actually, saving the pipeline is enough! usage: pipeline.predict(["text"])
    joblib.dump(final_pipeline, 'model_pipeline.pkl')
    print("Done.")

if __name__ == "__main__":
    train_and_save()
