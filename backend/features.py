import numpy as np
import pandas as pd
import re
import string
import textstat
import contractions
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from textblob import TextBlob
from sklearn.base import BaseEstimator, TransformerMixin

# Ensure resources
# Ensure resources
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    import os
    nltk_data_path = "/tmp/nltk_data"
    if not os.path.exists(nltk_data_path):
        os.makedirs(nltk_data_path, exist_ok=True)
    nltk.data.path.append(nltk_data_path)
    nltk.download('stopwords', download_dir=nltk_data_path)
    nltk.download('wordnet', download_dir=nltk_data_path)
    nltk.download('omw-1.4', download_dir=nltk_data_path)

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

custom_stop_words = [
    'reuters', 'said', 'reporting', 'via', 'image', 'mr', 'washington', 
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
    'best', 'pm', 'am', 'night'
]
stop_words.update(custom_stop_words)

def clean_text(text):
    """
    Standard cleaning for TF-IDF vectorization.
    """
    if not isinstance(text, str): return ""
    text = text.lower()
    try:
        text = contractions.fix(text)
    except:
        pass 
    text = text.replace('?', ' _questionmark_ ')
    text = text.replace('!', ' _exclamationmark_ ')
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'\S+@\S+', '', text)
    text = re.sub(r'\d+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'(.)\1{2,}', r'\1\1', text)
    text = re.sub(r'\s+', ' ', text).strip()
    words = text.split()
    final_words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    return " ".join(final_words)

def preprocess_for_tfidf(X):
    """
    Helper for FunctionTransformer
    """
    return [clean_text(text) for text in X]

class TextFeatureExtractor(BaseEstimator, TransformerMixin):
    """
    Extracts linguistic, structural, and sentiment features from text.
    Compatible with Scikit-Learn Pipeline.
    """
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        features = []
        for text in X:
            features.append(self.extract_features(text))
        return np.array(features)

    def extract_features(self, text):
        if not isinstance(text, str) or not text.strip():
            return [0] * 11 

        blob = TextBlob(text)
        
        word_count = len(text.split())
        char_count = len(text)
        avg_word_length = char_count / max(1, word_count)
        
        sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
        sentence_count = len(sentences)
        avg_sentence_length = word_count / max(1, sentence_count)
        
        caps_count = sum(1 for c in text if c.isupper())
        caps_ratio = caps_count / max(1, char_count)
        
        exclamation_count = text.count('!')
        question_count = text.count('?')
        punct_ratio = (exclamation_count + question_count) / max(1, char_count)
        
        try:
            reading_ease = textstat.flesch_reading_ease(text)
        except:
            reading_ease = 50.0 
            
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        sensational_words = {
            'shocking', 'exposed', 'breaking', 'urgent', 'secret', 'banned', 
            'hidden', 'truth', 'hoax', 'conspiracy', 'mainstream', 'media',
            'illegal', 'arrested', 'maga', 'riot', 'mob'
        }
        text_lower = text.lower()
        sensational_count = sum(1 for word in text_lower.split() if word in sensational_words)
        
        return [
            word_count,
            avg_word_length,
            sentence_count,
            avg_sentence_length,
            caps_ratio,
            punct_ratio,
            exclamation_count,
            question_count,
            reading_ease,
            subjectivity,
            sensational_count
        ]

class TextAnalyzer:
    """
    Stand-alone analyzer for rich frontend reports.
    Does not affect model prediction, but provides context.
    """
    
    @staticmethod
    def analyze(text):
        if not text: return {}
        
        blob = TextBlob(text)
        
        # 1. Reading Level
        try:
            score = textstat.flesch_reading_ease(text)
            if score > 80: level = "Very Easy"
            elif score > 60: level = "Standard"
            elif score > 30: level = "Complex"
            else: level = "Very Complex (Academic/Legal)"
        except:
            score = 50
            level = "Standard"
            
        # 2. Sentiment & Objectivity
        polarity = blob.sentiment.polarity # -1 to 1
        subjectivity = blob.sentiment.subjectivity # 0 to 1
        
        if polarity > 0.1: sentiment_label = "Positive"
        elif polarity < -0.1: sentiment_label = "Negative"
        else: sentiment_label = "Neutral"
        
        objectivity_label = "Highly Subjective/Opinionated" if subjectivity > 0.5 else "Mostly Objective/Factual"
        
        # 3. Tone Detection (Heuristic)
        tone = "Neutral"
        lower_text = text.lower()
        
        # Anger/Urgency triggers
        # Anger/Urgency triggers
        angry_words = {'outrage', 'furious', 'betrayal', 'disgusting', 'shame', 'illegal', 'crime'}
        fear_words = {'panic', 'crisis', 'collapse', 'danger', 'threat', 'deadly', 'catastrophe'}

        # Keyword Collection for Highlighting
        flagged_keywords = []
        
        def collect_keywords(word_set, category):
            found = [w for w in word_set if w in lower_text]
            for w in found:
                flagged_keywords.append({"word": w, "category": category})
        
        collect_keywords(angry_words, 'Aggressive')
        collect_keywords(fear_words, 'Fearmongering')
        
        angry_score = sum(1 for w in angry_words if w in lower_text)
        fear_score = sum(1 for w in fear_words if w in lower_text)
        
        if angry_score > 2: tone = "Aggressive / Angry"
        elif fear_score > 2: tone = "Alarmist / Fearful"
        elif subjectivity > 0.6: tone = "Highly Emotional"
        
        # 4. Clickbait Score (0-100)
        clickbait_score = 0
        
        # Factor A: Headline Patterns (Strong Indicators)
        # Listicle: "7 Signs", "10 Things"
        if re.search(r'^\d+\s+(reasons|things|ways|signs|secrets|photos|facts|tricks)', lower_text):
            clickbait_score += 30
        
        # Cliffhangers / Forward Reference: "This is why", "What happen next"
        if re.search(r'(this is why|the reason why|what happened|what occurs|will melt your heart|make you cry)', lower_text):
            clickbait_score += 25

        # Factor B: Strong Trigger Words (Cumulative)
        strong_triggers = {
            'shocking', 'unbelievable', 'exposed', 'miracle', 'secret', 'banned', 
            'mind-blowing', 'life-changing', 'hidden', 'mystery', 'confession',
            'hate', 'won\'t believe', 'proven', 'genius', 'destroy'
        }
        collect_keywords(strong_triggers, 'Clickbait')
        
        trigger_count = sum(1 for w in lower_text.split() if w in strong_triggers)
        clickbait_score += min(35, trigger_count * 15)  # Cap at 35

        # Factor C: Punctuation & Caps Abuse
        if '?!' in text or '!!' in text or text.count('!') > 2:
            clickbait_score += 15
        
        caps_ratio = sum(1 for c in text if c.isupper()) / max(1, len(text))
        if caps_ratio > 0.2:  # Adjusted threshold
            clickbait_score += 15

        # Factor D: Direct Personal Address ("You", "Your")
        if re.search(r'\b(you|your|you\'re|yours)\b', lower_text):
            clickbait_score += 10
        
        # Factor E: Short & Punchy (Typical for clickbait headlines)
        word_count = len(text.split())
        if 5 < word_count < 15:
            clickbait_score += 5

        clickbait_score = min(100, clickbait_score)
        
        # 5. Topic Classification (Keyword based)
        topics = {
            'Politics': ['government', 'president', 'senate', 'law', 'election', 'democrat', 'republican', 'vote'],
            'Health': ['virus', 'doctor', 'hospital', 'cancer', 'diet', 'medicine', 'health', 'study'],
            'Tech': ['apple', 'google', 'ai', 'internet', 'software', 'device', 'phone', 'tech'],
            'Finance': ['stock', 'market', 'money', 'economy', 'inflation', 'bank', 'invest'],
            'Entertainment': ['movie', 'star', 'celebrity', 'film', 'music', 'concert', 'fame']
        }
        
        detected_topics = []
        for topic, keywords in topics.items():
            if any(k in lower_text for k in keywords):
                detected_topics.append(topic)
                
        primary_topic = detected_topics[0] if detected_topics else "General"

        return {
            "reading_level": level,
            "reading_score": round(score, 1),
            "sentiment": sentiment_label,
            "objectivity": objectivity_label,
            "tone": tone,
            "clickbait_score": clickbait_score,
            "topic": primary_topic,
            "flagged_keywords": flagged_keywords
        }
