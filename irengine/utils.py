import tweepy
import nltk
import string
from nltk.tokenize import word_tokenize
from collections import Counter
import re
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from nltk.tokenize import TweetTokenizer
import emoji
from nltk.stem.porter import PorterStemmer

PREPROCESS_FILTER_PATTERN = '^(https?.*|rt|[^A-Za-z0-9]+)$'
FILTER_PATTERN = re.compile(PREPROCESS_FILTER_PATTERN)

def getTweetsFromUser(api, username, count=200, start_date=None, tweet_mode='extended'):
    """
    for tweet in getTweetsFromUser(
        api,
        'username',
        count=10,
        start_date=datetime.datetime.today() - datetime.timedelta(days=5)
        )

        # stuff
    """

    cursorArgs = [api.user_timeline]
    if username:
        cursorArgs.append(username)
    cursorKwArgs = {'tweet_mode': tweet_mode}
    itemsArgs = [count] if count else []

    cursor = tweepy.Cursor(*cursorArgs, **cursorKwArgs).items(*itemsArgs)

    if start_date:
        def toBreak(tweet):
            return tweet.created_at < start_date
    else:
        def toBreak(tweet):
            return False

    for tweet in cursor:
        if toBreak(tweet):
            break

        yield tweet

def preprocess_text(text):

    stop_words = nltk.corpus.stopwords.words('english')
    punctuation = string.punctuation

    # Elasticsearch uses porter stemmer
    stemmer = PorterStemmer()

    tweetTokenizer = TweetTokenizer()       
    def helper(text):
        list_emoji = []
        list_word = []
        for word in tweetTokenizer.tokenize(text):
            # lowercase
            word = word.lower()

            is_hashtag = False
            if word[0] == "#":
                is_hashtag = True

            # removing punctiuation
            word = word.translate(str.maketrans('', '', string.punctuation))

            # todo: check if noun? NER

            check = not is_hashtag \
                and len(word) > 2 \
                and not word.isnumeric() \
                and word not in stop_words \
                and not FILTER_PATTERN.match(word) \
                and word not in emoji.UNICODE_EMOJI['en']

            if check:
                list_word.append(stemmer.stem(word))
            elif word in emoji.UNICODE_EMOJI['en']:
                list_emoji.append(word)
        return list_word, list_emoji
    
    words, lemoji = helper(text)
    ret1 = list(words)
    ret2 = list(lemoji)
    return ret1, ret2


def top_words(text_tokens, n=30):
    counts = Counter(text_tokens).most_common(n)
    return [k for k, v in counts]

def flat_list(l):
    return [item for sublist in l for item in sublist]

def top_tfidf(doc, corpus, n=30, vectorizer=None):
    if not vectorizer:
        vectorizer = TfidfVectorizer(max_df=0.95)
        vectorizer.fit(corpus)

    tfidf_array = vectorizer.transform([doc])
    featarr = np.array(vectorizer.get_feature_names())
    tfidf_sorting = np.argsort(tfidf_array.toarray()).flatten()[::-1]

    top_tfidf_ = featarr[tfidf_sorting][:n]

    return top_tfidf_, vectorizer