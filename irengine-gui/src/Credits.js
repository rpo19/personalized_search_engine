import { Container } from '@material-ui/core';

function Credits(props) {
    return (
        <Container className="credits">
        Credits to:
        <ul>
            <li>
                <b>WordNet</b><br></br>
                George A. Miller (1995). WordNet: A Lexical Database for English.
                Communications of the ACM Vol. 38, No. 11: 39-41.
                <br></br><br></br>
                Christiane Fellbaum (1998, ed.) WordNet: An Electronic Lexical Database. Cambridge, MA: MIT Press.
            </li>
        </ul>
</Container>
    );
}

export default Credits;