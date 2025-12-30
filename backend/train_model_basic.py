import pandas as pd
import re
import string
import joblib
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Download NLTK resources
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('omw-1.4')

def clean_text(text):
    lemmatizer = WordNetLemmatizer()
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Remove stopwords and lemmatize
    stop_words = set(stopwords.words('english'))
    # Specific to this dataset: Remove common bias words that might lead to overfitting
    # - "reuters", "said", "reporting": Reuters specific style
    # - "mr": Found as top indicator for Fake news (likely due to style guide diffs)
    # - "washington": Top indicator for Real news
    # - DAYS: Real news (Reuters) mentions days often at start
    words_to_remove = [
        'reuters', 'said', 'reporting', 'via', 'image', 'mr', 'washington', 
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
        'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
        'best'
    ]
    
    text = " ".join([lemmatizer.lemmatize(word) for word in text.split() if word not in stop_words and word not in words_to_remove])
    
    return text

def train_and_save():
    print("Loading data...")
    try:
        # Assuming files are in the same directory or passed as arguments
        # For simplicity, we expect them in the current directory or parent
        fake = pd.read_csv("Fake.csv")
        true = pd.read_csv("True.csv")
    except FileNotFoundError:
        print("Error: Fake.csv or True.csv not found. Please ensure they are in the 'backend' folder.")
        return

    print("Data loaded. Preprocessing...")
    fake['label'] = 1  # FAKE
    true['label'] = 0  # REAL (Note: User wanted Real/Fake classification, usually Fake=1, Real=0 or vice versa. Let's stick to standard and map later)
    # Wait, user prompt said: "Returns: { 'label': 'FAKE', ... }"
    
    df = pd.concat([fake, true], axis=0)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    df['content'] = df['text'].apply(clean_text)
    
    x = df['content']
    y = df['label']

    print("Splitting data...")
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

    print("Vectorizing...")
    # Define stop words list again to force exclusion in Vectorizer
    # This guarantees 'best' and others are not in vocab even if preprocessing misses them
    forced_stop_words = [
        'reuters', 'said', 'reporting', 'via', 'image', 'mr', 'washington', 
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
        'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
        'best', 'pm', 'am', 'night'
    ]
    # We also add standard english stop words to be safe
    forced_stop_words.extend(list(stopwords.words('english')))
    
    tfidf = TfidfVectorizer(max_features=25000, stop_words=forced_stop_words) 
    x_train_tfidf = tfidf.fit_transform(x_train)
    
    print("Training LinearSVC (with Calibration)...")
    # LinearSVC with balanced class weights, wrapped for probability output
    base_model = LinearSVC(class_weight='balanced', random_state=42)
    model = CalibratedClassifierCV(base_model)
    model.fit(x_train_tfidf, y_train)

    print("Acc: ", model.score(tfidf.transform(x_test), y_test))

    print("Saving artifacts...")
    joblib.dump(model, 'model.pkl')
    joblib.dump(tfidf, 'tfidf.pkl')
    print("Done.")

if __name__ == "__main__":
    train_and_save()
