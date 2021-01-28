class Helper {

    static getUserProfile(host, index, user_id,
        handleResults, handleErrors) {
        fetch(host + '/' + index + '/_doc/' + user_id)
            .then(res => res.json())
            .then(handleResults, handleErrors);
    }

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

    static advancedQuery(host, index, query, profileQuery,
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
                                            query: query
                                        }
                                    }
                                },
                                {
                                    match: {
                                        full_text: {
                                            query: profileQuery
                                        }
                                    }
                                }
                            ]
                        }
                    }
                })
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
                                        query: corpus
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
                }
            })
        };

        fetch(host + '/' + index + "/_search", requestOptions)
            .then(res => res.json())
            .then(handleResults, handleErrors);
    }
}

export default Helper;