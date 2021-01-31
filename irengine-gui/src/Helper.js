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
    static advancedQuery(host, index, query, profileQuery,
        handleResults, handleErrors) {

        let queryObject = {
            query: {
                bool: {
                    must: {
                        match: {
                            full_text: {
                                query: query,
                                fuzziness: "AUTO",
                                boost: 2,
                            }
                        },
                    },
                }
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

        if (profileQuery) {
            queryObject.query.bool.should = {
                match: {
                    full_text: {
                        query: profileQuery,
                        fuzziness: "AUTO:6,12",
                        prefix_length: 2,
                        fuzzy_transpositions: false,
                        boost: 0.4,
                    }
                }
            };
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

    static basicQuery(host, index, corpus, hastags,
        handleResults, handleErrors) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: {
                    bool: {
                        should: [
                            {
                                match: {
                                    full_text: {
                                        query: corpus,
										fuzziness: "AUTO"
                                    }
                                }
                            },
                            {
                                match: {
                                    "entities.hashtags.text": {
                                        query: hastags
                                    }
                                }
                            }
                        ]
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