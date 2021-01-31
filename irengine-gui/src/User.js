import {
    Avatar,
    Box,
    FormControlLabel,
    Button
} from '@material-ui/core';
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
                <img className="icon"
                    alt=""
                    src={this.props.source.profile_image_url}></img>
            )
            :
            (
                <Avatar display="inline">
                    {this.state.name_initials}
                </Avatar>
            );

        const extended = this.props.extended ?
            (
                <ul>
                    <li>
                        <Box>
                            <b>Location:</b><br></br>
                            <span>
                                {this.props.source['location']}
                            </span>
                        </Box>
                    </li>
                    <li>
                        <Box>
                            <b>Description:</b><br></br>
                            <span>
                                {this.props.source['description']}
                            </span>
                        </Box>
                    </li>
                    <li>
                        <Box>
                            <b>Top words:</b><br></br>
                            <span>
                                {this.props.source['top_tfidf'].join(" ")}
                            </span>
                        </Box>
                    </li>
                    <li>
                        <Box>
                            <b>Top hashtags:</b><br></br>
                            <span>
                                {this.props.source['top_tfidf_hashtags'].map(
                                    (x) => { return '#' + x }).join(" ")}
                            </span>
                        </Box>
                    </li>
                    <li>
                        <Box>
                            <b>Top emoji:</b><br></br>
                            <span>
                                {this.props.source['emoji'].join(" ")}
                            </span>
                        </Box>
                    </li>
                    <li>
                        <Button p={2} variant="outlined"
                            color="secondary"
                            onClick={this.props.onClick}
                        >
                            Logout
                        </Button>
                    </li>
                </ul>
            )
            :
            (
                <a></a>
            );

        return (
            <div>
                <Box m={1} display="block">
                    <FormControlLabel
                        onClick={this.props.onClick}
                        control={avatar}
                        label={label}
                    />
                </Box>
                {extended}
            </div>
        );
    }
}

export default User;