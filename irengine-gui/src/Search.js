import Helper from './Helper.js';
import { Component } from 'react';
import {
    TextField,
    Button,
    Grid,
    Box
} from '@material-ui/core';
import config from './Config';

class Search extends Component {

    constructor(props) {
        super(props);
        this.state = {
            corpus: '',
            hashtag: '',
            basic: true,
        }
        this.handleCorpus = this.handleCorpus.bind(this);
        this.handleHashtags = this.handleHashtags.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        if (this.state.basic) {
            Helper.basicQuery(
                config.ELASTICSEARCH_URL,
                config.ELASTICSEARCH_RETRIEVAL_INDEX,
                this.state.corpus,
                this.state.hashtag,
                this.props.onResults,
                (error) => { console.log(error) }
            );
        } else {
            Helper.advancedQuery(
                config.ELASTICSEARCH_URL,
                config.ELASTICSEARCH_RETRIEVAL_INDEX,
                this.state.corpus,
                this.props.profileQuery,
                this.props.onResults,
                (error) => { console.log(error) }
            );
        }

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

        const basic = this.state.basic ? "contained" : "outlined";
        const advanced = this.state.basic ? "outlined" : "contained";

        return (
            <Grid container spacing={1}>
                <Grid item xs={2} spacing={3}>
                    <Grid item xs={6} spacing={3}>
                        <Button
                            onClick={() => {
                                this.setState({ basic: true });
                                this.props.clearResults()
                            }
                            }
                            color="primary"
                            variant={basic}
                            fullWidth
                        >
                            Basic
                        </Button>
                    </Grid>
                    <Grid item xs={6} spacing={3}>
                        <Button
                            onClick={() => {
                                this.setState({ basic: false });
                                this.props.clearResults()
                            }
                            }
                            color="primary"
                            variant={advanced}
                            fullWidth
                        >
                            Advanced
                        </Button>
                    </Grid>
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
                        {this.state.basic &&
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