import Helper from './Helper.js';
import { Component } from 'react';
import {
    TextField,
    Button,
    Box
} from '@material-ui/core';

class SearchForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            corpus: '',
            hashtag: '',
        }
        this.handleCorpus = this.handleCorpus.bind(this);
        this.handleHashtags = this.handleHashtags.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        Helper.basicQuery(
            "http://127.0.0.1:9200",
            "usertweets",
            this.state.corpus,
            this.state.hashtag,
            this.props.onResults,
            (error) => { console.log(error) },
            event
        );
        event.preventDefault();
    }

    handleCorpus(event) {
        this.setState({
            corpus: event.target.value
        });
    }

    handleHashtags(event) {
        this.setState({
            hashtag: event.target.value
        });
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <Box m={2} display="block">
                    <TextField variant="outlined" type="text"
                        value={this.state.corpus}
                        onChange={this.handleCorpus} placeholder="Corpus"
                        fullWidth
                    />
                </Box>
                <Box m={2} display="block">
                    <TextField variant="outlined" type="text"
                        value={this.state.hashtag}
                        onChange={this.handleHashtags} placeholder="Hashtags"
                        fullWidth
                    />
                </Box>
                <Box m={2} display="block" textAlign='center'>
                    <Button type="submit" variant="outlined">
                        Search
                    </Button>
                </Box>
            </form>
        );
    }

}

export default SearchForm;