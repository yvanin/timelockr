import { createStore } from 'redux';

const SET_EMAIL = 'SET_EMAIL';
const ADD_DATE = 'ADD_DATE';
const REMOVE_DATE = 'REMOVE_DATE';
const ADD_TIMESLOT = 'ADD_TIMESLOT';
const REMOVE_TIMESLOT = 'REMOVE_TIMESLOT';
const ADD_CUSTOM_TIMESLOT = 'ADD_CUSTOM_TIMESLOT';
const REMOVE_CUSTOM_TIMESLOTS = 'REMOVE_CUSTOM_TIMESLOTS';
const ADD_CONFIRMATION_TIMESLOT = 'ADD_CONFIRMATION_TIMESLOT';
const REMOVE_CONFIRMATION_TIMESLOT = 'REMOVE_CONFIRMATION_TIMESLOT';

const initialState = {
    email: null,
    dates: [],
    timeslots: [],
    customTimeslots: [],
    confirmationTimeslots: []
}

let reducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_EMAIL: {
            return Object.assign({}, state, {
                email: action.email
            });
        }
        case ADD_DATE: {
            let dates = [...state.dates];
            if (dates.filter(d => d === action.date).length === 0) {
                dates.push(action.date);
            }
            return Object.assign({}, state, {
                dates: dates
            });
        }
        case REMOVE_DATE: {
            let dates = [...state.dates].filter(d => d !== action.date);
            return Object.assign({}, state, {
                dates: dates
            });
        }
        case ADD_TIMESLOT: {
            let timeslots = [...state.timeslots];
            if (timeslots.filter(slot => slot.date === action.date && slot.time === action.time).length === 0) {
                timeslots.push({
                    date: action.date,
                    time: action.time
                });
            }
            return Object.assign({}, state, {
                timeslots: timeslots
            });
        }
        case REMOVE_TIMESLOT: {
            let timeslots = [...state.timeslots].filter(slot => slot.date !== action.date || slot.time !== action.time);
            return Object.assign({}, state, {
                timeslots: timeslots
            });
        }
        case ADD_CUSTOM_TIMESLOT: {
            let customTimeslots = [...state.customTimeslots];
            if (customTimeslots.filter(slot => slot.date === action.date && slot.time === action.time).length === 0) {
                customTimeslots.push({
                    date: action.date,
                    time: action.time
                });
            }
            return Object.assign({}, state, {
                customTimeslots: customTimeslots
            });
        }
        case REMOVE_CUSTOM_TIMESLOTS: {
            let customTimeslots = [...state.customTimeslots].filter(slot => slot.date !== action.date);
            return Object.assign({}, state, {
                customTimeslots: customTimeslots
            });
        }
        case ADD_CONFIRMATION_TIMESLOT: {
            state.confirmationTimeslots.push({
                date: action.date,
                time: action.time
            });
            return Object.assign({}, state, {});
        }
        case REMOVE_CONFIRMATION_TIMESLOT: {
            let confirmationTimeslots = [...state.confirmationTimeslots].filter(slot => slot.date !== action.date || slot.time !== action.time);          
            return Object.assign({}, state, {
                confirmationTimeslots: confirmationTimeslots
            });
        }
        default: {
            return Object.assign({}, state);
        }
    }
}

let store = createStore(reducer);
//let unsubscribe = store.subscribe(() => console.log(store.getState()));

let setEmail = (email) => { return { type: SET_EMAIL, email }; }
let addDate = (date) => { return { type: ADD_DATE, date }; }
let removeDate = (date) => { return { type: REMOVE_DATE, date }; }
let addTimeslot = (date, time) => { return { type: ADD_TIMESLOT, date, time }; }
let removeTimeslot = (date, time) => { return { type: REMOVE_TIMESLOT, date, time }; }
let addCustomTimeslot = (date, time) => { return { type: ADD_CUSTOM_TIMESLOT, date, time }; }
let removeCustomTimeslots = (date) => { return { type: REMOVE_CUSTOM_TIMESLOTS, date }; }
let addConfirmationTimeslot = (date, time) => { return { type: ADD_CONFIRMATION_TIMESLOT, date, time }; }
let removeConfirmationTimeslot = (date, time) => { return { type: REMOVE_CONFIRMATION_TIMESLOT, date, time }; }

export {
    store,
    setEmail,
    addDate,
    removeDate,
    addTimeslot,
    removeTimeslot,
    addCustomTimeslot,
    removeCustomTimeslots,
    addConfirmationTimeslot,
    removeConfirmationTimeslot
}