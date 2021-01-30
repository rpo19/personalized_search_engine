import './App.css';
import { Component } from 'react';
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
      profile_query: '',
    };
    this.handleResults = this.handleResults.bind(this);
    this.setProfileQuery = this.setProfileQuery.bind(this);
    this.clearResults = this.clearResults.bind(this);
  }

  setProfileQuery(query) {
    this.setState({
      profile_query: query
    });
  }

  clearResults(res) {
    this.setState({
      queryResults: []
    });
  }

  handleResults(res) {
    console.log(res)
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

  render() {

    let results = this.state.queryResults.length === 0 ?
      (
        <Paper>
          <Box m={2} class="noresults">
            Your query didn't produce any results :(
          </Box>
        </Paper>
      ) :
      (
        <Results value={this.state.queryResults} />
      );

    return (
      <Grid container spacing={1}>
        <Grid item xs={10} spacing={3}>
          <Search
            onResults={this.handleResults}
            profileQuery={this.state.profile_query}
            clearResults={this.clearResults}
          />

          <Container>
            {results}
          </Container>
        </Grid>

        <Grid item xs={2} spacing={3}>
          <UserList
            setProfileQuery={this.setProfileQuery}
            clearResults={this.clearResults}
          />
        </Grid>



      </Grid>
    );
  }
}

export default App;
