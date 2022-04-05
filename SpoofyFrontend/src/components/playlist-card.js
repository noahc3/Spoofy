import React from 'react';
import { Button, CardImg, Card, ButtonGroup } from 'react-bootstrap';
import * as spoofy from '../spoofy-api';

export default class PlaylistCard extends React.Component {
    doShuffle() {
        spoofy.shuffle(this.props.playlist.id, this.props.shuffleMode);
    }

    previewShuffle() {
        spoofy.previewShuffle(this.props.playlist.id, this.props.shuffleMode);
    }

    render() {
        const authenticated = spoofy.isUserAuthenticated();
        
        if (!authenticated) {
            return (<></>);
        } else {
            /** @type {{id: string, name: string, description: string, playlistUrl: string, imageUrl: string, tracks: string[]}[]} */
            const playlist = this.props.playlist;

            return (
                <Card className='playlist-card full-height'>
                    <CardImg src={playlist.imageUrl} />
                    <Card.Body>
                        <a className='nostyle' href={playlist.playlistUrl}>
                            <Card.Title >
                                {playlist.name}
                            </Card.Title>
                        </a>
                    </Card.Body>
                    <Card.Footer>
                        <ButtonGroup size="sm" className='btn-group-wide'  vertical>
                            <Button variant="success" onClick={() => this.doShuffle()}>Shuffle</Button>
                            <Button onClick={() => this.previewShuffle()}>Preview Shuffle</Button>
                        </ButtonGroup>
                    </Card.Footer>
                </Card>
            );
        }
    }
}