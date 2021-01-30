import {
    Box,
    Paper,
    FormControlLabel,
    Grid
} from '@material-ui/core';
import { Component } from 'react';

class Tweet extends Component {

    constructor(props) {
        super(props);
    }

    /*
        process text to highlight hashtags specially matched ones
    */
    process_text(text, highlight) {
        // const firstChar = text.charAt(0);
        // const hashsplit = text.split("#");
        // hashsplit.forEach(element => {
        //     const spaceIdx = element.indexOf(" ");
        //     if(spaceIdx > 0){
        //     const left = element.substr(0, spaceIdx);
        //     const right = element.substr(spaceIdx + 1);
        //     } else {
        //         // no spazi
        //     }
        //     element.split(" ").forEach(inner => {
        //         if (inner
        //     });
        // });

        const regexp = /#[A-Za-z0-9]+/g;

        let array1;

        let text2 = "";

        let i = 0;
        while ((array1 = regexp.exec(text)) !== null) {
            console.log(`Found ${array1[0]}. Next starts at ${regexp.lastIndex}.`);
            text2 += text.substr(i, regexp.lastIndex - array1[0].length - i);
            if (highlight["entities.hashtags.text"] &&
                highlight["entities.hashtags.text"]
                    .includes(array1[0].substr(1))) {
                text2 += "<mark>" + array1[0] + "</mark>";
            } else {
                text2 += "<b>" + array1[0] + "</b>";
            }
            i = regexp.lastIndex;
        }
        text2 += text.substr(i);

        return text2;

    }

    render() {

        const full_text = this.props.value.highlight.full_text ?
            this.props.value.highlight.full_text[0] : this.props.value._source.full_text;

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
                                        full_text, this.props.value.highlight)
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