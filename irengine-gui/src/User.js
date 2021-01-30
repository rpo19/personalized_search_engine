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
        const name_initials = props.source.name.split(" ").map((x) => x.charAt(0)).join("");
        this.state = {
            name_initials: name_initials,
        };
    }

    render() {
        const label = (
            <ul>
                <li key={this.props.source.screen_name + '_name'}>
                    {this.props.source.name}
                </li>
                <li key={this.props.source.screen_name}>
                    {'@' + this.props.source.screen_name}
                </li>
            </ul>
        );

        const avatar = this.props.source.profile_image_url ?
        (
            <img src={this.props.source.profile_image_url}></img>
        )
        :
        (
            <Avatar display="inline">
                {this.state.name_initials}
            </Avatar>
        );

        return (
            <Box m={1}>
                <FormControlLabel
                    onClick={this.props.onClick}
                    control={avatar}
                    label={label}
                />
            </Box>
        );
    }
}

export default User;