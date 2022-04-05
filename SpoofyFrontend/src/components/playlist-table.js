import React from 'react';
import { Row, Col } from 'react-bootstrap';
import * as spoofy from '../spoofy-api';
import PlaylistCard from './playlist-card';

export default class PlaylistTable extends React.Component {
    render() {
        const authenticated = spoofy.isUserAuthenticated();
        
        if (!authenticated) {
            return (<></>);
        } else {
            /** @type {{id: string, name: string, description: string, playlistUrl: string, imageUrl: string, tracks: string[]}[]} */
            const playlists = spoofy.getPlaylists();

            const playlistRows = playlists.filter(pl => !pl.name.includes("Weebery")).map(pl => (
                <Col key={pl.id}>
                    <PlaylistCard playlist={pl} shuffleMode={this.props.shuffleMode}/>
                </Col>
            ));

            return <>
                <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                    {playlistRows}
                </Row>
            </>
        }
    }
}