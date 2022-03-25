import React from 'react';
import { Card, Container } from 'react-bootstrap';
import logo from '../img/logo.png'
import * as spoofy from '../spoofy-api';

export default class Callback extends React.Component {
    constructor() {
        super();
        spoofy.doTokenLogin();
    }

    render() {
        return (
            <Container>
                <header><img className="logo" src={logo} alt="Logo"/></header>
                <div className="home">
                
                <Card className="login-card">
                        <Card.Body>
                            <Card.Title>Please wait to be redirected...</Card.Title>
                        </Card.Body>
                    </Card>
            </div>
            </Container>
            
        );
    }
}