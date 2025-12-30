import joblib

tfidf = joblib.load('tfidf.pkl')
features = tfidf.get_feature_names_out()
if 'best' in features:
    print("'best' IS in vocabulary!")
else:
    print("'best' is NOT in vocabulary.")
