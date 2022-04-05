import React from 'react';
import * as spoofy from '../spoofy-api';

export default class Uninitialized extends React.Component {
    render() {
        const initialized = spoofy.isInitialized();
        return initialized ? <></> : this.props.children;
    }
}