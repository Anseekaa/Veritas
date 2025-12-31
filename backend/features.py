import re
import math

# --- Pure Python "Lite" NLP Resources ---

# Simple Stopwords List (Top 50 common)
STOP_WORDS = {
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 
    'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 
    'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 
    'which', 'go', 'me'
}

# Simple Lexicon for Sentiment
POSITIVE_WORDS = {
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'love', 'hope',
    'happy', 'success', 'win', 'safe', 'protect', 'cure', 'solution', 'peace',
    'benefit', 'strong', 'healthy', 'innovative', 'reliable', 'trust', 'hero'
}

NEGATIVE_WORDS = {
    'bad', 'terrible', 'awful', 'worst', 'hate', 'fail', 'danger', 'threat',
    'deadly', 'crisis', 'panic', 'fear', 'death', 'kill', 'corrupt', 'lie',
    'scam', 'fraud', 'illegal', 'victim', 'attack', ' disaster', 'harm'
}

SUBJECTIVE_WORDS = {
    'believe', 'think', 'feel', 'opinion', 'seem', 'amazing', 'terrible',
    'shocking', 'absolutely', 'definitely', 'worst', 'best', 'beautiful', 'ugly'
}

def clean_text(text):
    """
    Standard cleaning for text analysis.
    """
    if not isinstance(text, str): return ""
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'\S+@\S+', '', text)
    text = re.sub(r'[^\w\s]', '', text) # Remove punctuation
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def estimate_reading_ease(text):
    """
    Estimate Flesch Reading Ease (Pure Python).
    """
    if not text: return 50.0
    
    words = text.split()
    word_count = len(words)
    if word_count == 0: return 50.0

    sentences = re.split(r'[.!?]+', text)
    sentence_count = len([s for s in sentences if s.strip()])
    if sentence_count == 0: sentence_count = 1

    # Heuristic syllable counting
    def count_syllables(word):
        word = word.lower()
        count = 0
        vowels = "aeiouy"
        if word and word[0] in vowels: count += 1
        for i in range(1, len(word)):
            if word[i] in vowels and word[i - 1] not in vowels:
                count += 1
        if word.endswith("e"): count -= 1
        return max(1, count)

    syllable_count = sum(count_syllables(w) for w in words)
    
    score = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (syllable_count / word_count)
    return score

class TextAnalyzer:
    """
    Zero-Dependency Text Analyzer.
    Replaces TextBlob/NLTK to guarantee server stability.
    """
    
    @staticmethod
    def analyze(text):
        if not text: return {}
        
        words = clean_text(text).split()
        total_words = len(words)
        if total_words == 0: total_words = 1
        
        # 1. Reading Level
        score = estimate_reading_ease(text)
        if score > 80: level = "Very Easy"
        elif score > 60: level = "Standard"
        elif score > 30: level = "Complex"
        else: level = "Very Complex (Academic/Legal)"
            
        # 2. Sentiment (Dictionary Match)
        pos_count = sum(1 for w in words if w in POSITIVE_WORDS)
        neg_count = sum(1 for w in words if w in NEGATIVE_WORDS)
        
        sentiment_score = (pos_count - neg_count) / max(1, pos_count + neg_count) * 1.0 # -1 to 1
        
        if sentiment_score > 0.1: sentiment_label = "Positive"
        elif sentiment_score < -0.1: sentiment_label = "Negative"
        else: sentiment_label = "Neutral"
        
        # 3. Objectivity (Dictionary Match)
        subj_count = sum(1 for w in words if w in SUBJECTIVE_WORDS)
        subj_ratio = subj_count / total_words
        
        objectivity_label = "Highly Subjective/Opinionated" if subj_ratio > 0.05 else "Mostly Objective/Factual"
        
        # 4. Tone Detection (Heuristic)
        tone = "Neutral"
        lower_text = text.lower()
        
        angry_words = {'outrage', 'furious', 'betrayal', 'disgusting', 'shame', 'illegal', 'crime'}
        fear_words = {'panic', 'crisis', 'collapse', 'danger', 'threat', 'deadly', 'catastrophe'}

        angry_score = sum(1 for w in angry_words if w in lower_text)
        fear_score = sum(1 for w in fear_words if w in lower_text)
        
        if angry_score > 0: tone = "Aggressive / Angry"
        elif fear_score > 0: tone = "Alarmist / Fearful"
        elif subj_ratio > 0.1: tone = "Highly Emotional"
        
        # 5. Clickbait Score
        clickbait_score = 0
        if '?!' in text or '!!' in text: clickbait_score += 20
        if re.search(r'\b(shocking|secret|banned|exposed|miracle)\b', lower_text): clickbait_score += 30
        if re.search(r'^\d+\s+(signs|ways|things)', lower_text): clickbait_score += 20
        clickbait_score = min(100, clickbait_score)
        
        # 6. Keywords
        flagged_keywords = []
        for w in angry_words:
            if w in lower_text: flagged_keywords.append({"word": w, "category": "Aggressive"})
        for w in fear_words:
            if w in lower_text: flagged_keywords.append({"word": w, "category": "Fearmongering"})

        return {
            "reading_level": level,
            "reading_score": round(score, 1),
            "sentiment": sentiment_label,
            "objectivity": objectivity_label,
            "tone": tone,
            "clickbait_score": clickbait_score,
            "topic": "General", # Simplification
            "flagged_keywords": flagged_keywords
        }

# Stub for compatibility (Dummy)
class TextFeatureExtractor:
    def fit(self, X, y=None): return self
    def transform(self, X): return [[0]*10 for _ in X]
