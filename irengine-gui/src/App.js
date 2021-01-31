import './App.css';
import { Component } from 'react';
import React from 'react'
import './Tweet.js';
import Tweet from './Tweet.js';
import Results from './Results.js';
import Search from './Search';
import UserList from './UserList';
import {
  Paper,
  Grid,
  Box,
  Container
} from '@material-ui/core';
import Credits from './Credits'

const theme = {
  spacing: 4,
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      queryResults: "Ready to search :)",
      profile: null,
      basic: true,
    };
    this.handleResults = this.handleResults.bind(this);
    this.setProfile = this.setProfile.bind(this);
    this.clearResults = this.clearResults.bind(this);
    this.basicAdvancedSwitch = this.basicAdvancedSwitch.bind(this);

    this.search = React.createRef();
  }

  setProfile(profile, callback) {
    this.setState({
      profile: profile,
    },
      callback);
  }

  clearResults(res) {
    this.setState({
      queryResults: []
    });
  }

  handleResults(res) {
    if ('hits' in res && 'hits' in res['hits']) {
      const hits = res['hits']['hits'];
      const results = hits.map((hit, idx) => {
        return (
          <li key={hit['_id']}>
            <Tweet value={hit} />
          </li>);
      });
      if (results.length > 0) {
        this.setState({
          queryResults: results,
        });
      } else {
        this.setState({
          queryResults: "Your query didn't produce any results :(",
        });
      }
    } else {
      this.setState({
        queryResults: "Ooops, something went wrong :(",
      });
    }
  }

  basicAdvancedSwitch() {
    this.setState({
      basic: !this.state.basic,
    },
      this.search.current.search);
  }

  render() {

    const results = typeof this.state.queryResults == "string" ?
      (
        <Paper>
          <Box m={2} className="noresults">
            {this.state.queryResults}
          </Box>
        </Paper>
      ) :
      (
        <Results value={this.state.queryResults} />
      );

    const credits = typeof this.state.queryResults == "string" ? (
      <Credits />
    ) : 
    (
      <a></a>
    );

    return (
      <Grid container spacing={1}>
        <Grid item xs={10}>
          <Search
            ref={this.search}
            onResults={this.handleResults}
            profile={this.state.profile}
            clearResults={this.clearResults}
            basic={this.state.basic}
            basicAdvancedSwitch={this.basicAdvancedSwitch}
          />

          <Container>
            {results}
          </Container>
        </Grid>

        {!this.state.basic &&
          <Grid item xs={2}>
            <UserList
              setProfile={this.setProfile}
              clearResults={this.clearResults}
              search={this.search.current.search}
            />
          </Grid>
        }

        {credits}

      </Grid>
    );
  }
}

export default App;
