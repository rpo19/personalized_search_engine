import { Box } from '@material-ui/core';

function Tweet(props) {
    return (
        <Box>
            {props.value._source.full_text} -- {props.value._score}
        </Box>
    )
}

export default Tweet;