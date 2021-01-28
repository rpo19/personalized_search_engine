import './App.css';
import { Component } from 'react';
import './Tweet.js';
import Tweet from './Tweet.js';
import Results from './Results.js';
import SearchForm from './SearchForm';
import {
  Container,
  Paper
} from '@material-ui/core';

const theme = {
  spacing: 4,
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      queryResults: [],
    };
    this.handleResults = this.handleResults.bind(this);
  }

  handleResults(res) {
    console.log(res)
    const hits = res['hits']['hits'];
    const results = hits.map((hit, idx) => {
      return (
        <li key={hit['_source']['id_str']}>
          <Tweet value={hit['_source']} />
        </li>);
    });

    this.setState({
      queryResults: results,
    });
  }

  render() {
    return (
      <Container>
        <Container maxWidth="md">
          <SearchForm
            onResults={this.handleResults}
          />
        </Container>

        <Paper>
          <Results value={this.state.queryResults} />
        </Paper>

      </Container>
    );
  }
}

export default App;
