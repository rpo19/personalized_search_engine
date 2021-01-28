class Helper {
    static basicQuery(host, index, corpus, hastags,
        handleResults, handleErrors, event) {
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
        event.preventDefault();
    }
}

export default Helper;