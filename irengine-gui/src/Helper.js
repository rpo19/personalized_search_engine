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
                            analyzer: "english_synonym"
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
                            analyzer: "english",
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

    static basicQuery(host, index, corpus, hastags, fuzzy, synonym,
        handleResults, handleErrors) {

        let hastags_boost = 0.75;
        if (fuzzy) {
            hastags_boost += 0.75;
        }
        if (synonym) {
            hastags_boost += 0.75;
        }

        let should = [
            {
                match: {
                    full_text: {
                        query: corpus,
                        analyzer: "english"
                    }
                }
            },
            {
                match: {
                    "entities.hashtags.text.raw": {
                        query: hastags,
                        boost: hastags_boost,
                        analyzer: "whitespace"
                    }
                }
            },
            {
                match: {
                    "entities.hashtags.text": {
                        query: hastags,
                        boost: hastags_boost,
                        analyzer: "english"
                    }
                }
            }
        ];

        if (fuzzy) {
            should.push({
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
            should.push({
                match: {
                    full_text: {
                        query: corpus,
                        analyzer: "english_synonym"
                    }
                },
            });
        }

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: {
                    bool: {
                        should: should
                    }
                },
                highlight: {
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