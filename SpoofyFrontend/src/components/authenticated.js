import React from 'react';
import * as spoofy from '../spoofy-api';

export default class Authenticated extends React.Component {
    render() {
        const authenticated = spoofy.isUserAuthenticated();

        return authenticated ? this.props.children : <></>;
    }
}