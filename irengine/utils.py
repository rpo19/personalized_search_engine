import tweepy

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