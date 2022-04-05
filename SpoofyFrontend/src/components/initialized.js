import React from 'react';
import * as spoofy from '../spoofy-api';

export default class Initialized extends React.Component {
    render() {
        const initialized = spoofy.isInitialized();
        return initialized ? this.props.children : <></>;
    }
}