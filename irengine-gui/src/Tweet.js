import {
    Box,
    Paper,
    FormControlLabel,
    Grid
} from '@material-ui/core';
import { Component } from 'react';

class Tweet extends Component {
    /*
        process text to highlight hashtags specially matched ones
    */
    process_text(value) {

        var text = ('highlight' in value && 'full_text' in value.highlight) ?
            value.highlight.full_text.join(" ") : value._source.full_text;

        const hashtags = value._source.entities.hashtags;

        if (hashtags.length > 0) {
            let i = 0;
            for (; i < hashtags.length; i++) {
                if ('highlight' in value && 'entities.hashtags.text' in value.highlight &&
                    value.highlight["entities.hashtags.text"]
                        .includes(hashtags[i]['text'])) {
                    text = text.replace(
                        new RegExp("#" + hashtags[i]['text'], "g"),
                        "<mark class=\"qmatch\">#" + hashtags[i]['text'] + "</mark>"
                    );
                } else {
                    text = text.replace(
                        new RegExp("#" + hashtags[i]['text'], "g"),
                        "<mark class=\"hashtag\">#" + hashtags[i]['text'] + "</mark>"
                    );
                }
            }
        }

        return text;

    }

    render() {

        return (
            <Box m={2}>
                <Paper>
                    <Grid container spacing={1}>
                        <Grid item xs={5}>
                            <Box ml={2} >
                                <FormControlLabel
                                    control={
                                        <img className="icon"
                                            alt=""
                                            src={this.props.value._source.user.profile_image_url_https}>
                                        </img>
                                    }
                                    label={<Box m={2}>
                                        {"@" + this.props.value._source.user.screen_name}
                                        <br></br>
                                        {this.props.value._source.user.name}
                                    </Box>}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box mt={2} >
                                {this.props.value._source.created_at}
                            </Box>
                        </Grid>
                        <Grid item xs={2}>
                            <Box mt={2} mr={1}>
                                Score: {this.props.value._score}
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box mb={2} mr={2} ml={4} >
                                <div dangerouslySetInnerHTML={{
                                    __html: this.process_text(
                                        this.props.value)
                                }} />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        );
    }
}

export default Tweet;