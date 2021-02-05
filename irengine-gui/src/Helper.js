class Helper {

    /*
    Gets single user document
    */
    static getUserProfile(host, index, user_id,
        handleResults, handleErrors) {
        fetch(host + '/' + index + '/_doc/' + user_id)
            .then(res => res.json())
            .then(handleResults, handleErrors);
    }

    /*
    Gets all users from users index
    */
    static getUsersProfile(host, index,
        handleResults, handleErrors) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: {
                    match_all: {}
                }
            })
        };

        fetch(host + '/' + index + "/_search", requestOptions)
            .then(res => res.json())
            .then(handleResults, handleErrors);
    }

    /*
    Takes care of user profiles
    */
    static advancedQuery(host, index, query, profile, fuzzy, synonym,
        profileBoost,
        handleResults, handleErrors) {

        let queryObject = {
            query: {
                bool: {}
            },
            highlight: {
                number_of_fragments: 0,
                fields: {
                    full_text: {
                        pre_tags: "<mark class=\"qmatch\">",
                        post_tags: "</mark>"
                    }
                }
            }
        };

        if (query.length > 0) {
            console.log("adding must");
            let must = {
                bool: {
                    should: [
                        {
                            match: {
                                full_text: {
                                    query: query,
                                    analyzer: "english"
                                }
                            }
                        }
                    ]
                }
            };

            if (fuzzy) {
                must.bool.should.push({
                    match: {
                        full_text: {
                            query: query,
                            fuzziness: "AUTO",
                            analyzer: "english"
                        }
                    },
                });
            }

            if (synonym) {
                must.bool.should.push({
                    match: {
                        full_text: {
                            query: query,
                            analyzer: "english_synonym",
                            boost: 0.5
                        }
                    },
                });
            }

            queryObject.query.bool.must = must;
        }

        if (profile) {
            queryObject.query.bool.should = [
                {
                    match: {
                        full_text: {
                            query: profile["top_tfidf"].join(" "),
                            analyzer: "whitespace",
                            boost: profileBoost
                        }
                    }
                },
                {
                    match: {
                        "entities.hashtags.text": {
                            query: profile["top_tfidf_hashtags"].join(" "),
                            boost: profileBoost
                        }
                    }
                }
            ];
        }

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(queryObject)
        };

        fetch(host + '/' + index + "/_search", requestOptions)
            .then(res => res.json())
            .then(handleResults, handleErrors);
    }

    static basicQuery(host, index, corpus, hashtags, fuzzy, synonym,
        handleResults, handleErrors) {

        let corpus_should = [
            {
                match: {
                    full_text: {
                        query: corpus,
                        analyzer: "english"
                    }
                }
            }
        ]

        let hashtags_should = [
            {
                match: {
                    "entities.hashtags.text.raw": {
                        query: hashtags,
                        analyzer: "whitespace"
                    }
                }
            },
            {
                match: {
                    "entities.hashtags.text": {
                        query: hashtags,
                        analyzer: "english"
                    }
                }
            }
        ];

        if (fuzzy) {
            corpus_should.push({
                match: {
                    full_text: {
                        query: corpus,
                        fuzziness: "AUTO",
                        analyzer: "english"
                    }
                },
            });
        }

        if (synonym) {
            corpus_should.push({
                match: {
                    full_text: {
                        query: corpus,
                        analyzer: "english_synonym",
                        boost: 0.5
                    }
                },
            });
        }

        let must = [];

        if (corpus && corpus.length > 0) {
            must.push(
                {
                    bool: {
                        should: corpus_should
                    }
                }
            );
        }

        if (hashtags && hashtags.length > 0) {
            must.push(
                {
                    bool: {
                        should: hashtags_should
                    }
                }
            );
        }

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: {
                    bool: {
                        must: must
                    }
                },
                highlight: {
                    number_of_fragments: 0,
                    fields: {
                        full_text: {
                            pre_tags: "<mark class=\"qmatch\">",
                            post_tags: "</mark>"
                        },
                        "entities.hashtags.text": {
                            pre_tags: "",
                            post_tags: ""
                        },
                    }
                }
            })
        };

        fetch(host + '/' + index + "/_search", requestOptions)
            .then(res => res.json())
            .then(handleResults, handleErrors);
    }
}

export default Helper;