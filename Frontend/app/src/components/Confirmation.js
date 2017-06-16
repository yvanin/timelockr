import React from 'react';
import moment from 'moment';
import BaseConfirmation from './BaseConfirmation';
import TimeSlot from './TimeSlot';
import Alert from './Alert';
import { store, setEmail } from '../state';

/**
 * UI for confirmation of the times for existing event
 */
class Confirmation extends BaseConfirmation {
    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        $.ajax({
            type: 'GET',
            url: `${this.props.api}/event/${this.props.eventId}`,
            dataType: 'json'
        })
        .done((data) => {
            this.setState({
                confirmedEmails: data.email,
                timeslots: data.timeslots
            });
        })
        .fail((jqXHR) => {
            window.lastAjaxError = jqXHR;
            if (jqXHR.status === 500) {
                console.log(`GET /api/event/${this.props.eventId} failed: ${jqXHR.getResponseHeader('errortype')}`);
            }

            this.setState({ eventNotFound: true });
        });        
    }

    confirm() {
        if (this.state.submitting) {
            return;
        }

        let storeState = store.getState();
        if (typeof storeState === 'undefined' || !storeState.email) {
            this.setState({
                showAlert: true,
                alertText: 'Enter an email'
            });
            return;
        }

        if (storeState.confirmationTimeslots.length === 0) {
            this.setState({
                showAlert: true,
                alertText: 'Choose at least one time slot'
            });
            return;
        }

        this.setState({
            showAlert: false,
            submitting: true
        });

        $.ajax({
            type: 'POST',
            url: `${this.props.api}/confirmation`,
            data: JSON.stringify({
                EventId: this.props.eventId,
                Email: storeState.email,
                Timeslots: storeState.confirmationTimeslots
            })
        })
        .done((data) => {
            this.setState({
                showAlert: true,
                alertText: `Thank you for the confirmation! We will notify the participants`,
                submitted: true
            });             
        })
        .fail((jqXHR) => {
            window.lastAjaxError = jqXHR;
            if (jqXHR.status === 500) {
                console.log(`POST /api/confirmation failed: ${jqXHR.getResponseHeader('errortype')}`);
            }
        })
        .always(() => {
            this.setState({ submitting: false });          
        });             
    }

    render() {
        let emailClass = 'form-control';
        if (!this.state.validEmail) {
            emailClass += ' error';
        }

        return (
            <div className="container">
                {this.state.timeslots ? (
                    <div>
                        <div className="row">
                            <div className="col-md-12">
                                <p>Enter your email:</p>
                            </div>
                            <div className="col-md-4">
                                <input type="text" className={emailClass} onChange={this.validateEmail.bind(this)} placeholder="Email" />
                            </div>
                            <div className="col-md-12">&nbsp;</div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <p>Select times when you are available (these times have already been confirmed by {this.state.confirmedEmails}):</p>
                            </div>
                        </div>

                        {this.state.timeslots.map(slot => {
                            return (
                                <div className="row" key={slot.date + slot.time}>
                                    <div className="col-md-12 confirmation-timeslot">
                                        <TimeSlot date={moment(slot.date)} time={slot.time} showDate="true" isConfirmation="true" />
                                    </div>
                                </div>
                            )
                        })}

                        <div className="row">
                            <div className="col-md-4"></div>
                            <div className="col-md-2">
                                {!this.state.submitted &&
                                    <button type="button" className="btn btn-primary action-btn" onClick={this.confirm.bind(this)}>
                                        {this.state.submitting ? (<i className="fa fa-spinner" aria-hidden="true"></i>) : 'Confirm'}
                                    </button>
                                }
                            </div>
                            <div className="col-md-6"></div>
                        </div>                                                    
                    </div>
                ) : (
                    <div className="row">
                        <div className="col-md-12 wait-spinner">
                            {this.state.eventNotFound ? "Event not found" : (<img alt="Loading..." src="images/spin.svg" />)}
                        </div>
                    </div>
                )}

                <Alert show={this.state.showAlert} text={this.state.alertText} onDismiss={this.dismissAlert.bind(this)} />
            </div>
        );
    }
}

export default Confirmation