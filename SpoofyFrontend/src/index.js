import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Spinner, Container, Button, ButtonGroup, Anchor } from 'react-bootstrap';
import './index.css';
import Home from './pages/home';
import Callback from './pages/callback';

import * as utils from './utils';
import * as spoofy from './spoofy-api';

import failIcon from './img/fail.png'

class App extends React.Component {

    /**
     * @typedef {{
     * ready: boolean,
     * error: ApiError
     * }} State
     */

    constructor(props) {
        super(props);

        spoofy.setDefaultErrorHandler((err) => { this.handlePreInitError(err); });
        spoofy.setForceUpdate(() => {
            this.forceUpdate();
        });
        window.spoofy = spoofy;

        /** @type {State} */
        this.state = {
            ready: false,
            error: undefined
        }

        spoofy.init().then(() => {
            if (!this.state.error) this.setState({ready: true});
        });
    }

    handlePreInitError(err) {
        this.setState({error: err});
    }

    render() {
        if (this.state.error) {
            const err = this.state.error;
            const copyText = "```\n" + JSON.stringify(err,null,4) + "\n```";
            return (
                <main>
                    <div className="loading-splash">
                        <div>
                            <div className="center">
                                <img alt="" className="fail-icon" src={failIcon}/>
                                <h3>Spoofy encountered an error</h3>
                                <p className="muted">Error {err.code}: {err.message}</p>
                                <p>This error was unexpected. If you have the time, please report this error by creating an issue on GitHub, and copy the following text into your report:</p>
                            </div>
                            <div className="error-box">
                                <pre>{copyText}</pre>
                                
                                <ButtonGroup className="btn-group-wide sharp-corners" vertical>
                                    <Button variant="secondary" onClick={() => { utils.copyTextToClipboard(copyText); }}>Copy to Clipboard</Button>
                                    <Button as={Anchor} href="https://github.com/noahc3/spoofy/issues" target="_blank" rel="noopener noreferrer" variant="danger">Go to GitHub</Button>
                                </ButtonGroup>
                            </div>
                        </div>
                    </div>
                </main>
            );
        } else if (!this.state.ready) {
            return (
                <main>
                    <div className="loading-splash">
                        <div className="center">
                            <Spinner animation="border" variant="light" />
                            <h3>Loading</h3>
                        </div>
                    </div>
                </main>
            )
        } else {
            return (
                <main>
                    <Container>
                        <BrowserRouter>
                            <Routes>
                                <Route path='/' exact element={<Home />} />
                                <Route path='/callback' exact element={<Callback />} />
                            </Routes>
                        </BrowserRouter>
                    </Container>
                </main>
            )
        }
    }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);