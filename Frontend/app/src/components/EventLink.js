import React from 'react';
import Alert from './Alert';

/**
 * Modal popup with a link for created event
 */
class EventLink extends Alert {
    getDialogClassName() {
        return "modal-dialog";
    }

    renderBody() {
        return (
            <div className="modal-body">
                <p>Event has been created. Pass this link to participants:</p>
                <input type="text" className="event-link" value={this.props.link} />
            </div>
        );
    }
}

export default EventLink