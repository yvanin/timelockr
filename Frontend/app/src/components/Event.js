import React from 'react';
import moment from 'moment';
import BaseConfirmation from './BaseConfirmation';
import Day from './Day';
import Alert from './Alert';
import EventLink from './EventLink';
import { store, setEmail } from '../state';

// how many days are displayed initially and added with every (+) button click
const DAYS_IN_BATCH = 7;

/**
 * UI for creation of a new event (which includes initial confirmation)
 */
class Event extends BaseConfirmation {
    constructor() {
        super();

        let baseDate = moment();
        this.state = {
            days: [...Array(DAYS_IN_BATCH).keys()].map(i => { return this.getDay(baseDate, i); }),
            eventLink: ''
        };
    }

    getDay(baseDate, offset) {
        let date = baseDate.clone().add(offset, 'days');
        return {
            key: date.format('MMDD'),
            date: date
        };
    }

    addAnotherWeek() {
        let lastDate = this.state.days[this.state.days.length - 1].date;

        let days = this.state.days;
        [...Array(DAYS_IN_BATCH).keys()].forEach(i => {
            days.push(this.getDay(lastDate, i + 1));
        });

        this.setState({
            days: days,
            showAlert: false
        });

        let newWeekStart = days[days.length - DAYS_IN_BATCH - 1];
        $('html, body').animate({ scrollTop: $(`#day${newWeekStart.key}`).offset().top }, 1000);
    }

    createEvent() {
        if (this.state.submitting) {
            return;
        }

        let state = store.getState();
        if (typeof state === 'undefined' || !state.email) {
            this.setState({
                showAlert: true,
                alertText: 'Enter an email'
            });
            return;
        }

        if (state.dates.length === 0) {
            this.setState({
                showAlert: true,
                alertText: 'Choose a day and a time slot'
            });
            return;
        }

        let allTimeslots = [];
        state.dates.forEach(date => {
            let slots = state.timeslots.filter(slot => slot.date === date);
            const hasNotBeenAdded = (s) => slots.filter(slot => slot.time === s.time).length === 0;
            slots = slots.concat(state.customTimeslots.filter(slot => slot.date === date && hasNotBeenAdded(slot)));
            allTimeslots = allTimeslots.concat(slots);
        });

        if (allTimeslots.length === 0) {
            this.setState({
                showAlert: true,
                alertText: 'Choose a time slot'
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
                Email: state.email,
                Timeslots: allTimeslots
            })
        })
        .done((data) => {
            this.setState({
                showEventLink: true,
                eventLink: `${window.location.href}confirm?eventId=${data.eventId}`,
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

    dismissEventLink() {
        this.setState({
            showEventLink: false
        });
    }

    render() {
        let emailClass = 'form-control';
        if (!this.state.validEmail) {
            emailClass += ' error';
        }

        return (
            <div className="container">

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
                        <p>Select dates:</p>
                    </div>
                </div>

                <div className="row days">
                    <div className="col-md-10">
                        <div className="panel-group" id="accordionDays" role="tablist" aria-multiselectable="true">

                            {this.state.days.map(day => {
                                return (
                                    <Day key={day.key} day={day} />
                                )
                            })}

                        </div>
                    </div>
                    {!this.state.submitted &&
                        <div className="col-md-2 add-another-week">
                            <button type="button" className="btn btn-default btn-circle btn-add" onClick={this.addAnotherWeek.bind(this)}>
                                <i className="fa fa-plus"></i>
                            </button>
                        </div>
                    }
                </div>

                <div className="row">
                    <div className="col-md-4"></div>
                    <div className="col-md-2">
                        {!this.state.submitted &&
                            <button type="button" className="btn btn-primary action-btn" onClick={this.createEvent.bind(this)}>
                                {this.state.submitting ? (<i className="fa fa-spinner" aria-hidden="true"></i>) : 'Create'}
                            </button>
                        }
                    </div>
                    <div className="col-md-6"></div>
                </div>

                <Alert show={this.state.showAlert} text={this.state.alertText} onDismiss={this.dismissAlert.bind(this)} />
                <EventLink show={this.state.showEventLink} link={this.state.eventLink} onDismiss={this.dismissEventLink.bind(this)} />
            </div>
        );
    }
}

export default Event  