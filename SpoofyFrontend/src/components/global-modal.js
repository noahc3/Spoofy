import React from 'react';
import { Button, ButtonGroup, Modal, Spinner } from 'react-bootstrap';

import * as spoofy from '../spoofy-api';

export default class GlobalModal extends React.Component {
    constructor(props) {
        super(props);

        /** @type {State} */
        this.state = {
            show: false,
            display: "previewGenerating",
            previewData: []
        }

        spoofy.setShufflePreviewGeneratingHandler(() => this.handlePreviewGenerating());
        spoofy.setShufflePreviewDisplayHandler((previewData) => this.handlePreviewDisplay(previewData));
        spoofy.setShuffleApplyingHandler(() => this.handleShuffleApplying());
        spoofy.setShuffleCompleteHandler(() => this.handleShuffleComplete());
    }

    handlePreviewGenerating() {
        this.setState({ show: true, display: "previewGenerating" });
    }

    handlePreviewDisplay(previewData) {
        this.setState({ show: true, display: "previewDisplay", previewData: previewData });
    }

    handleShuffleApplying() {
        this.setState({ show: true, display: "shuffleApplying" });
    }

    handleShuffleComplete() {
        this.setState({ show: true, display: "shuffleComplete" });
        setTimeout(() => this.closeModal(), 600);
    }

    closeModal() {
        this.setState({show: false});
    }

    applyShuffle() {
        spoofy.applyShuffle(this.state.previewData);
    }

    render() {
        const show = this.state.show;
        const display = this.state.display;
        let modalContents;

        if (display === "previewGenerating") {
            modalContents = this.renderPreviewGenerating();
        } else if (display === "previewDisplay") {
            modalContents = this.renderPreviewDisplay();
        } else if (display === "shuffleApplying") {
            modalContents = this.renderShuffleApplying();
        } else if (display === "shuffleComplete") {
            modalContents = this.renderShuffleComplete();
        } else modalContents = null;

        return (
            <Modal 
            show={show} 
            centered
            className='global-modal'>
                {modalContents}
            </Modal>
        );
    }

    renderPreviewGenerating() {
        return (
            <div>
                <Modal.Header>
                    <Modal.Title>Shuffle Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="center">
                        <Spinner animation="border" />
                    </div>
                </Modal.Body>
            </div>
        );
    }

    renderShuffleApplying() {
        return (
            <div>
                <Modal.Header>
                    <Modal.Title>Shuffling your Playlist...</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="center">
                        <Spinner animation="border" />
                    </div>
                </Modal.Body>
            </div>
        );
    }

    renderPreviewDisplay() {
        const previewData = this.state.previewData.shuffledTracks;
        const numDigits = previewData.length.toString().length;
        const previewRows = previewData.map(track => {
            const index = previewData.indexOf(track).toString().padStart(numDigits, '0');
            return (
                <div key={index} className="flexbox">
                    <div className='flexcol-min'>
                        {index}
                    </div>
                    <div className='flexcol-min'>
                        {<img className='cover-thumbnail' alt="Track Cover" src={track.imageUrl}/>}
                    </div>
                    <div className='flexcol'>
                        <div>{track.title}</div>
                        <div className="muted">{track.artist}</div>
                    </div>
                </div>
            );
        })

        return (
            <div>
                <Modal.Header>
                    <Modal.Title>Shuffle Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="">
                        <p>Here's what your playlist will look like after shuffling:</p>
                        <div className='tracklist'>
                            {previewRows}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonGroup size="sm" className='btn-group-wide' vertical>
                        <Button variant="success" onClick={() => this.applyShuffle()}>Apply Shuffle</Button>
                        <Button variant="danger" onClick={() => this.closeModal()}>Cancel</Button>
                    </ButtonGroup>
                </Modal.Footer>
            </div>
        );
    }

    renderShuffleComplete() {
        return (
            <div>
                <Modal.Header>
                    <Modal.Title className='center'>Shuffle Complete</Modal.Title>
                </Modal.Header>
            </div>
        );
    }
}