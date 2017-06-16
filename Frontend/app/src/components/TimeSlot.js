import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { store, addTimeslot, removeTimeslot, addConfirmationTimeslot, removeConfirmationTimeslot } from '../state';

/**
 * Checkbox with associated date and time
 */
class TimeSlot extends React.Component {
    toggleTimeslot(event) {
        if (event.target.checked) {
            store.dispatch(this.props.isConfirmation
                ? addConfirmationTimeslot(this.props.date, this.props.time)
                : addTimeslot(this.props.date, this.props.time));
        } else {
            store.dispatch(this.props.isConfirmation
                ? removeConfirmationTimeslot(this.props.date, this.props.time)
                : removeTimeslot(this.props.date, this.props.time));
        }
    }

    getLabelText() {
        return this.props.showDate
            ? `${this.props.date.format('ddd, MMM D')} ${this.props.time}`
            : `${this.props.time}`;
    }

    render() {
        return (
            <div className="panel-body pretty primary timeslot">
                <input type="checkbox" onChange={this.toggleTimeslot.bind(this)} />
                <label className="cb-lbl"><i className="fa fa-check"></i>&nbsp;&nbsp;{this.getLabelText()}</label>
            </div>
        );
    }
}

TimeSlot.propTypes = {
    date: PropTypes.instanceOf(moment),
    time: PropTypes.string
};

export default TimeSlot