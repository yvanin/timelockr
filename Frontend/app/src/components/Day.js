import React from 'react';
import TimeSlot from './TimeSlot'
import CustomTimeSlot from './CustomTimeSlot'
import { store, addDate, removeDate } from '../state';

const totalTimeslots = 20;
const timeslotsInCol = 5;
const startHour = 8;

/**
 * Collection of the time slots plus a textbox for custom times
 */
class Day extends React.Component {
    constructor(props) {
        super(props);

        let timeslots = [...Array(totalTimeslots).keys()].map(i => {
            return i % 2 === 0 ? `${parseInt(startHour + i / 2, 10)}:00` : `${parseInt(startHour + i / 2, 10)}:30`;
        });

        let timeslotRows = [];
        for (let i = 0; i < timeslotsInCol; i++) {
            let group = [];
            for (let j = 0; j < timeslotsInCol - 1; j++) {
                group.push(timeslots[i + timeslotsInCol * j]);
            }
            timeslotRows.push(group);
        }

        this.state = {
            timeslotRows: timeslotRows
        }
    }

    toggleDay(event) {
        $(`#clDay${this.props.day.key}`).collapse('toggle');

        if (event.target.checked) {
            store.dispatch(addDate(this.props.day.date));
        } else {
            store.dispatch(removeDate(this.props.day.date));
        }
    }

    render() {
        let key = this.props.day.key;
        let dayOfWeek = this.props.day.date.day();
        let isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        let panelHeadingClass = isWeekend ? 'panel-heading weekend' : 'panel-heading';
        return (
            <div id={`day${key}`} className="panel panel-default">
                <div className={panelHeadingClass} role="tab" id={`hdDay${key}`}>
                    <div className="panel-body pretty primary">
                        <input type="checkbox" onChange={this.toggleDay.bind(this)} />
                        <label className="cb-lbl"><i className="fa fa-check"></i>&nbsp;&nbsp;{this.props.day.date.format('ddd, MMM D')}</label>
                    </div>
                </div>
                <div id={`clDay${key}`} className="panel-collapse collapse" role="tabpanel" aria-labelledby={`hdDay${key}`}>
                    <div className="list-group">

                        {this.state.timeslotRows.map((row, i) => {
                            return (
                                <li key={`${key}-row-${i}`} className="list-group-item timeslot-row">
                                    <div className="row">
                                        {row.map(timeslot => {
                                            return (
                                                <div key={timeslot} className="col-md-2">
                                                    <TimeSlot date={this.props.day.date} time={timeslot} />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </li>
                            )
                        })}

                        <CustomTimeSlot date={this.props.day.date} />
                    </div>
                </div>
            </div>
        );
    }
}

export default Day