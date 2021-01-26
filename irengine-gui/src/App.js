import './App.css';
import { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      queryResults: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) { this.setState({ value: event.target.value }); }
  handleSubmit(event) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        { query: { match: { full_text: this.state.value } } })
    };
    fetch("http://127.0.0.1:9200/usertweets/_search", requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          // this.setState({
          //   isLoaded: true,
          //   items: result.items
          // // });
          // console.log(result);
          // console.log(result['hits']['total'].value);

          const hits = result['hits']['hits']

          this.handleResults(hits)

        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log("fetch error!");
        }
      );
    event.preventDefault();
  }

  handleResults(hits) {
    const results = hits.map((hit, idx) => {
      return (
        <li key={hit['_source']['id_str']}>
          <span>
            {hit['_source']['full_text']}
          </span>
        </li>);
    });

    this.setState({
      queryResults: results,
    });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Search:
                <input type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
        <ol> {this.state.queryResults} </ol>
      </div>
    );
  }
}

export default App;
