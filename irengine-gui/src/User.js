import {
    Grid,
    Fab,
    Avatar,
    Box,
    FormControlLabel
} from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { Component } from 'react';

class User extends Component {

    constructor(props) {
        super(props);
        const name_initials = props.name.split(" ").map((x) => x.charAt(0)).join("");
        this.state = {
            name_initials: name_initials,
        };
    }

    render() {
        const label = (
            <ul>
                <li key={this.props.screen_name + '_name'}>
                    {this.props.name}
                </li>
                <li key={this.props.screen_name}>
                {'@'+this.props.screen_name}
                </li>
            </ul>
        );
        return (
            <Box m={1}>
                <FormControlLabel
                    onClick={this.props.onClick}
                    control={
                        <Avatar display="inline">
                            {this.state.name_initials}
                        </Avatar>
                    }
                    label={label}
                />
            </Box>
        );
    }
}

export default User;