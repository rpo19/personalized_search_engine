import {
    Box,
    Paper
} from '@material-ui/core';

function Tweet(props) {
    return (
        <Paper>
            <Box m={1} display="inline">
                <img src={props.value._source.user.profile_image_url_https}>
                </img>
            </Box>
            <Box m={1} display="inline">
                <Box display="inline">
                    {"@" + props.value._source.user.screen_name}
                </Box>
                <Box display="inline">
                    {props.value._source.user.name}
                </Box>
            </Box>
            <Box m={1} >
                {props.value._source.created_at}
            </Box>
            <Box m={1} >
                {props.value._source.full_text}
            </Box>
            <Box m={1} >
                {props.value._score}
            </Box>

        </Paper>
    )
}

export default Tweet;