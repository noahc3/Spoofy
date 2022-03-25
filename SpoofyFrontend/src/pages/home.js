import React from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Button, Card, CardGroup, Container } from 'react-bootstrap';
import logo from '../img/logo.png'
import * as spoofy from '../spoofy-api';
import Unauthenticated from '../components/unauthenticated';
import Authenticated from '../components/authenticated';

class Home extends React.Component {
    render() {
        const authenticated = spoofy.isUserAuthenticated();
        const profile = authenticated ? spoofy.getProfile() : {};
        const loginUrl = spoofy.getLoginUrl();


        return (
            <Container>
                <header><img className="logo" src={logo} alt="Logo"/></header>
                <div className="home">
                
                <Card>
                    <Card.Body>
                        <Card.Text>
                            Spoofy is a web app you can use to properly shuffle your Spotify playlists.
                        </Card.Text>
                        <Card.Text>
                            By logging into your Spotify account with this tool, you give the application 
                            permission to permanently shuffle the order of your playlists. These shuffle
                            operations cannot be undone!
                        </Card.Text>
                        <Card.Text>
                            Your login credentials are temporarily stored encrypted in your browser. When you 
                            close your browser, the credentials are deleted and you will need to login again
                            to use the tool. The Spoofy server will never save your login credentials.
                        </Card.Text>
                    </Card.Body>
                </Card>
                <br/>
                <Unauthenticated>
                    <Card className="login-card">
                        <Card.Body>
                            <Card.Title>To continue, login to Spotify</Card.Title>
                            <Card.Text>
                                <Button as={Anchor} href={loginUrl} variant='success'>Login to Spotify</Button>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Unauthenticated>
                <Authenticated>
                    <Card className="login-card">
                        <Card.Body>
                            <Card.Title>Welcome, {profile.displayName}!</Card.Title>
                            <Card.Text>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Authenticated>
            </div>
            </Container>
            
        );
    }
}

export default Home;