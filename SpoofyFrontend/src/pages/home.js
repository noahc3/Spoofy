import React from 'react';
import { Anchor, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import logo from '../img/logo.png'
import * as spoofy from '../spoofy-api';
import Unauthenticated from '../components/unauthenticated';
import Authenticated from '../components/authenticated';
import Initialized from '../components/initialized';
import Uninitialized from '../components/uninitialized';
import PlaylistTable from '../components/playlist-table';

class Home extends React.Component {
    constructor() {
        super();
        this.state = {
            shuffleMode: 0
        }
    }

    render() {
        const authenticated = spoofy.isUserAuthenticated();
        const profile = authenticated ? spoofy.getProfile() : {};
        const loginUrl = spoofy.getLoginUrl();

        const shuffleModes = [
            {
                name: "Full Random",
                description: "Shuffle all songs in your playlist with no special weighting.",
                index: 0
            },
            {
                name: "Artist Spread",
                description: "Distribute songs by each artist across the playlist, trying not to place multiple songs by the same artist next to each other.",
                index: 1
            }
        ]

        const shuffleModesElems = shuffleModes.map(opt => {
            let checkbox = this.state.shuffleMode === opt.index ? (<>☑</>) : (<>☐</>);
            return (
                <Col key={opt.index}>
                    <Card className='full-height clickable' onClick={() => {this.setState({shuffleMode: opt.index})}}>
                        <Card.Body className='px-0'>
                            <div className='flexbox'>
                                <div className='flexcol-min text-checkbox'>
                                    {checkbox}
                                </div>
                                <div className='flexcol'>
                                    <Card.Subtitle>{opt.name}</Card.Subtitle>
                                    <Card.Text>{opt.description}</Card.Text>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            )
        });

        return (
            <Container>
                <header><img className="logo" src={logo} alt="Logo"/></header>
                <div className="home">
                
                <Card>
                    <Card.Body>
                        <Card.Text>
                            Spoofy is a web app you can use to apply a permanent shuffle to your Spotify playlists.
                            The tool gives you the option to do a fully random shuffle, or to shuffle while spacing apart
                            songs by the same artist.
                        </Card.Text>
                        <Card.Text>
                            By logging into your Spotify account with this tool, you give the application 
                            permission to permanently shuffle the order of your playlists. These shuffle
                            operations cannot be undone!
                        </Card.Text>
                        <Card.Text>
                            Your login credentials are temporarily stored encrypted in your browser. When you 
                            close all tabs for this site, your browser will clear your credentials and you will need 
                            to login again to use the tool. The Spoofy server will never save your login credentials
                            or any other information about your account.
                        </Card.Text>

                        <Card.Text>
                        If you want to revoke access for this tool, go to your Approved Applications in your Spotify profile.
                        Look for Spoofy and click on the Revoke Access button beside it. If you want to reuse the tool after that, 
                        you can login again here and re-grant permission to your Spotify account.
                        </Card.Text>
                    </Card.Body>
                </Card>
                <br/>
                <Uninitialized>
                    <div className='center mt-4'>
                        <Spinner animation="border" />
                    </div>
                </Uninitialized>
                <Initialized>
                    <Unauthenticated>
                        <Card className="center">
                            <Card.Body>
                                <Card.Title>To continue, login to Spotify</Card.Title>
                                <Card.Text>
                                    <Button as={Anchor} href={loginUrl} variant='success'>Login to Spotify</Button>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Unauthenticated>
                    <Authenticated>
                        <Card>
                            <Card.Body>
                                <Card.Title className='center'>Welcome, {profile.displayName}!</Card.Title>
                                <hr/>
                                <Card.Title>Select shuffle mode:</Card.Title>
                                <Row xs={1} md={2} className="g-4">
                                    {shuffleModesElems}
                                </Row>
                            </Card.Body>
                        </Card>
                        <br/>
                        <PlaylistTable shuffleMode={this.state.shuffleMode}/>
                    </Authenticated>
                </Initialized>
            </div>
            </Container>
            
        );
    }
}

export default Home;