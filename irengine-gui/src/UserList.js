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
            sources: {},
            current_user: null,
        };
        this.handleClick = this.handleClick.bind(this);
        this.setUsers = this.setUsers.bind(this);
        this.handleUserClick = this.handleUserClick.bind(this);
    }

    handleUserClick(screen_name) {
        this.setState({
            current_user: screen_name,
            showList: !this.state.showList
        });

        this.props.setProfile(
            this.state.sources[screen_name],
            this.props.search);
        // get data of current user

        // Helper.getUserProfile(
        //     config.ELASTICSEARCH_URL,
        //     config.ELASTICSEARCH_USERS_INDEX,
        //     screen_name,
        //     this.onUserProfileReceived,
        //     (error) => console.log(error)
        // )

        // this.props.clearResults();
        // this.props.search();
    }

    setUsers(results) {
        const hits = results['hits']['hits'];

        const entries = hits.map((x) => {
            return ([
                x['_source']['screen_name'],
                x['_source'],
            ]);
        });

        const sources = Object.fromEntries(entries);

        const users = hits.map((x) => {
            const source = x['_source'];
            const screen_name = x['_source']['screen_name'];

            return (
                <li key={screen_name}>
                    <User source={source}
                        onClick={() => this.handleUserClick(screen_name)} />
                </li>
            );
        });

        this.setState({
            sources: sources,
            users: users,
        });
    }

    handleClick() {
        if (this.state.users.length === 0) {
            // get all users profiles
            Helper.getUsersProfile(
                config.ELASTICSEARCH_URL,
                config.ELASTICSEARCH_USERS_INDEX,
                this.setUsers,
                (error) => {
                    console.log("Error:UserList/handleClick");
                    console.log(error);
                }
            )
        }
        this.setState({ showList: !this.state.showList });


        // this.props.clearResults();
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
                <Paper>
                    <Box m={1}>
                        <User
                            source={this.state.sources[this.state.current_user]}
                            onClick={() => {
                                this.setState({ current_user: null },
                                    () => {
                                        this.props.setProfile(null,
                                            this.props.search);
                                    });
                            }
                            }
                            extended={true}
                        />
                    </Box>
                </Paper>
            );
        } else {
            to_show = (
                <Paper onClick={this.handleClick}>
                    <Box m={1} display="inline">
                        <Fab>
                            <AccountCircleIcon />
                        </Fab>
                    </Box>
                    <Box m={1} display="inline">
                        Click to login
                    </Box>
                </Paper>
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