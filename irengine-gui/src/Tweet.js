import { Box } from '@material-ui/core';

function Tweet(props) {
    return (
        <Box>
            {props.value.full_text}
        </Box>
    )
}

export default Tweet;