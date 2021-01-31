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

const theme = {
  spacing: 4,
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      queryResults: [],
      profile_query: null,
      basic: true,
    };
    this.handleResults = this.handleResults.bind(this);
    this.setProfileQuery = this.setProfileQuery.bind(this);
    this.clearResults = this.clearResults.bind(this);
    this.basicAdvancedSwitch = this.basicAdvancedSwitch.bind(this);

    this.search = React.createRef();
  }

  setProfileQuery(query, callback) {
    this.setState({
      profile_query: query,
    },
    callback);
  }

  clearResults(res) {
    this.setState({
      queryResults: []
    });
  }

  handleResults(res) {
    const hits = res['hits']['hits'];
    const results = hits.map((hit, idx) => {
      return (
        <li key={hit['_id']}>
          <Tweet value={hit} />
        </li>);
    });

    this.setState({
      queryResults: results,
    });
  }

  basicAdvancedSwitch() {
    this.setState({
      basic: !this.state.basic,
    },
    this.search.current.search);
  }

  render() {

    let results = this.state.queryResults.length === 0 ?
      (
        <Paper>
          <Box m={2} className="noresults">
            Your query didn't produce any results :(
          </Box>
        </Paper>
      ) :
      (
        <Results value={this.state.queryResults} />
      );

    return (
      <Grid container spacing={1}>
        <Grid item xs={10}>
          <Search
            ref={this.search}
            onResults={this.handleResults}
            profileQuery={this.state.profile_query}
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
              setProfileQuery={this.setProfileQuery}
              clearResults={this.clearResults}
              search={this.search.current.search}
            />
          </Grid>
        }



      </Grid>
    );
  }
}

export default App;
