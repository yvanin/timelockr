import React from 'react';
import { store, addCustomTimeslot, removeCustomTimeslots } from '../state';

/**
 * Textbox where user can enter comma-delimited times
 */
class CustomTimeSlot extends React.Component {
    constructor() {
        super();
        this.state = {
            valid: true,
            timeslots: []
        };
    }

    validate(event) {
        let valid = /^(?:\d{1,2}:\d{2},? *)*$/.test(event.target.value);
        
        var newTimeslots = [];
        if (valid && event.target.value.length > 0) {
            event.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0).forEach(time => {
                newTimeslots.push(time);
                store.dispatch(addCustomTimeslot(this.props.date, time));
            });
        } 
        else if (this.state.timeslots.length > 0) {
            store.dispatch(removeCustomTimeslots(this.props.date));
        }

        this.setState({
            valid: valid,
            timeslots: newTimeslots
        });
    }

    render() {
        let txtClass = 'form-control custom-time';
        if (!this.state.valid) {
            txtClass += ' error';
        }

        return (
            <li className="list-group-item time">
                <div className="panel-body">
                    <input type="text" className={txtClass} onChange={this.validate.bind(this)} placeholder="8:45, 16:50 etc." />
                    <span className="help-block">You can enter other times separated by commas</span>
                </div>
            </li>
        );
    }
}

export default CustomTimeSlot