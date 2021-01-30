import {
    Box,
    Paper,
    FormControlLabel,
    Grid
} from '@material-ui/core';

function Tweet(props) {
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
                                        src={props.value._source.user.profile_image_url_https}>
                                    </img>
                                }
                                label={<Box m={2}>
                                    {"@" + props.value._source.user.screen_name}
                                    <br></br>
                                    {props.value._source.user.name}
                                </Box>}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={5}>
                        <Box mt={2} >
                            {props.value._source.created_at}
                        </Box>
                    </Grid>
                    <Grid item xs={2}>
                        <Box mt={2} >
                            Score: {props.value._score}
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box mb={2} ml={4}>
                            {props.value._source.full_text}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    )
}

export default Tweet;