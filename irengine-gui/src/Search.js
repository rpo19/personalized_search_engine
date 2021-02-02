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
            fuzzy: false,
            synonmym: false,
            profileBoost: 1,
            showProfileBoost: false,
        }
        this.handleCorpus = this.handleCorpus.bind(this);
        this.handleHashtags = this.handleHashtags.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.search = this.search.bind(this);
        this.handleProfileBoost = this.handleProfileBoost.bind(this);
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

    handleProfileBoost(event) {
        this.setState({
            profileBoost: event.target.value
        });
    }

    search() {
        if (this.props.basic) {
            if (this.state.corpus.length > 0 || this.state.hashtag.length > 0) {
                Helper.basicQuery(
                    config.ELASTICSEARCH_URL,
                    config.ELASTICSEARCH_RETRIEVAL_INDEX,
                    this.state.corpus,
                    this.state.hashtag,
                    this.state.fuzzy,
                    this.state.synonmym,
                    this.props.onResults,
                    (error) => {
                        console.log("Error:Search/handleSubmit/basicQuery");
                        console.log(error);
                    }
                );
            } else {
                this.props.onResults("Ready to search :)");
            }
        } else {
            if (this.state.corpus.length > 0 || this.props.profile) {
                Helper.advancedQuery(
                    config.ELASTICSEARCH_URL,
                    config.ELASTICSEARCH_RETRIEVAL_INDEX,
                    this.state.corpus,
                    this.props.profile,
                    this.state.fuzzy,
                    this.state.synonmym,
                    this.state.profileBoost,
                    this.props.onResults,
                    (error) => {
                        console.log("Error:Search/handleSubmit/advancedQuery");
                        console.log(error);
                    }
                );
            } else {
                this.props.onResults("Ready to search :)");
            }
        }
    }

    render() {

        return (
            <Grid container spacing={1}>
                <Grid item xs={2}>
                    <ul>
                        <li>
                            <FormControlLabel display="block"
                                control={
                                    <Switch color="primary" onClick={() => {
                                        this.props.basicAdvancedSwitch();
                                    }}
                                    />
                                }
                                label="Advanced"
                                labelPlacement="bottom"
                            />
                        </li>
                        <li>
                            <FormControlLabel display="block"
                                control={
                                    <Switch color="primary" onClick={() => {
                                        this.setState({
                                            fuzzy: !this.state.fuzzy
                                        },
                                            this.search);
                                    }}
                                    />
                                }
                                label="Fuzzy"
                                labelPlacement="bottom"
                            />
                        </li>
                        <li>
                            <FormControlLabel display="block"
                                control={
                                    <Switch color="primary" onClick={() => {
                                        this.setState({
                                            synonmym: !this.state.synonmym
                                        },
                                            this.search);
                                    }}
                                    />
                                }
                                label="Synonyms"
                                labelPlacement="bottom"
                            />
                        </li>
                    </ul>
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
                            {this.state.showProfileBoost &&
                                <Box m={2} display="block">
                                    <TextField variant="outlined" type="text"
                                        value={this.state.profileBoost}
                                        onChange={this.handleProfileBoost} placeholder="ProfileBoost"
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