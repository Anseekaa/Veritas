import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('omw-1.4')

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

words_to_remove = [
    'reuters', 'said', 'reporting', 'via', 'image', 'mr', 'washington', 
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
    'best'
]

def clean_text(text):
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\s+', ' ', text).strip()
    
    words = text.split()
    print(f"Split words: {words}")
    
    cleaned = [word for word in words if word not in stop_words and word not in words_to_remove]
    print(f"Filtered words: {cleaned}")
    
    final = " ".join([lemmatizer.lemmatize(word) for word in cleaned])
    return final

test = "The BEST bus company."
print(f"Result: {clean_text(test)}")
