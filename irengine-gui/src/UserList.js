import { Component } from 'react';
import {
    Fab,
    Box,
    Paper
} from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import User from './User';
import config from './Config';
import Helper from './Helper';

class UserList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showList: false,
            users: [],
            current_user: null,
            current_user_name: null,
        };
        this.handleClick = this.handleClick.bind(this);
        this.setUsers = this.setUsers.bind(this);
        this.handleUserClick = this.handleUserClick.bind(this);
        this.onUserProfileReceived = this.onUserProfileReceived.bind(this);
    }

    onUserProfileReceived(doc) {
        this.props.setProfileQuery(doc['_source']['top_tfidf'].join(" "));
    }

    handleUserClick(screen_name) {
        this.setState({
            current_user: screen_name,
            current_user_name: screen_name,
            showList: !this.state.showList
        });
        // get data of current user
        Helper.getUserProfile(
            config.ELASTICSEARCH_URL,
            config.ELASTICSEARCH_USERS_INDEX,
            screen_name,
            this.onUserProfileReceived,
            (error) => console.log(error)
        )

        this.props.clearResults();
    }

    setUsers(results) {
        const hits = results['hits']['hits'];

        this.setState({
            users: hits.map((x) => {
                const name = x['_source']['name'];
                const screen_name = x['_source']['screen_name'];

                return (
                    <li key={screen_name}>
                        <User name={name} screen_name={screen_name}
                            onClick={() => this.handleUserClick(screen_name)} />
                    </li>
                );
            }),
        });
    }

    handleClick() {
        if (this.state.users.length === 0) {
            Helper.getUsersProfile(
                config.ELASTICSEARCH_URL,
                config.ELASTICSEARCH_USERS_INDEX,
                this.setUsers,
                (error) => console.log(error)
            )
        }
        this.setState({ showList: !this.state.showList });


        this.props.clearResults();
    }

    render() {

        let to_show;
        let users;

        if (this.state.users.length > 0) {
            users = this.state.users;
        } else {
            users = (
                <span>Loading...</span>
            );
        }

        if (this.state.showList) {
            to_show = (
                <Paper>
                    <Box display="block">
                        <ul>
                            {users}
                        </ul>
                    </Box>
                </Paper>
            );
        } else if (this.state.current_user) {
            to_show = (
                <Box display="block">
                    <User
                        name={this.state.current_user_name}
                        screen_name={this.state.current_user}
                        onClick={() => {
                            this.setState({ current_user: null });
                            this.props.clearResults()
                        }
                        }
                    />
                </Box>
            );
        } else {
            to_show = (
                <Box display="block">
                    <Fab onClick={this.handleClick}>
                        <AccountCircleIcon />
                    </Fab>
                </Box>
            );
        }

        return (
            <div>
                {to_show}
            </div>
        );
    }
}

export default UserList;