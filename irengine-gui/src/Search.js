import Helper from './Helper.js';
import { Component } from 'react';
import {
    TextField,
    Button,
    Grid,
    Box,
    Switch,
    FormControlLabel
} from '@material-ui/core';
import config from './Config';

class Search extends Component {

    constructor(props) {
        super(props);
        this.state = {
            corpus: '',
            hashtag: '',
        }
        this.handleCorpus = this.handleCorpus.bind(this);
        this.handleHashtags = this.handleHashtags.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.search = this.search.bind(this);
    }

    handleSubmit(event) {
        this.search();
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

    search() {
        if (this.props.basic) {
            Helper.basicQuery(
                config.ELASTICSEARCH_URL,
                config.ELASTICSEARCH_RETRIEVAL_INDEX,
                this.state.corpus,
                this.state.hashtag,
                this.props.onResults,
                (error) => {
                    console.log("Error:Search/handleSubmit/basicQuery");
                    console.log(error);
                }
            );
        } else {
            Helper.advancedQuery(
                config.ELASTICSEARCH_URL,
                config.ELASTICSEARCH_RETRIEVAL_INDEX,
                this.state.corpus,
                this.props.profileQuery,
                this.props.onResults,
                (error) => {
                    console.log("Error:Search/handleSubmit/advancedQuery");
                    console.log(error);
                }
            );
        }
    }

    render() {

        return (
            <Grid container spacing={1}>
                <Grid item xs={2}>
                    <FormControlLabel
                        value="top"
                        control={
                            <Switch color="primary" onClick={() => {
                                this.props.basicAdvancedSwitch();
                                this.props.clearResults();
                            }}
                            />
                        }
                        label="Advanced"
                        labelPlacement="bottom"
                    />
                </Grid>
                <Grid item xs={9}>
                    <form onSubmit={this.handleSubmit}>
                        <Box m={2} display="block">
                            <TextField variant="outlined" type="text"
                                value={this.state.corpus}
                                onChange={this.handleCorpus} placeholder="Corpus"
                                fullWidth
                            />
                        </Box>
                        {this.props.basic &&
                            <Box m={2} display="block">
                                <TextField variant="outlined" type="text"
                                    value={this.state.hashtag}
                                    onChange={this.handleHashtags} placeholder="Hashtags"
                                    fullWidth
                                />
                            </Box>
                        }
                        <Box m={2} display="block" textAlign='center'>
                            <Button type="submit" variant="outlined" color="primary">
                                Search
                    </Button>
                        </Box>
                    </form>
                </Grid>
            </Grid >
        );
    }

}

export default Search;