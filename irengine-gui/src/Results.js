function Results(props) {
    const showNum = Array.isArray(props.value);
    return (
        <ul>
            {showNum &&
                <span className="resultnum">
                    Showing Top 10 results of {props.number}.
                </span>
            }
            {props.value}
        </ul>
    )
}

export default Results;