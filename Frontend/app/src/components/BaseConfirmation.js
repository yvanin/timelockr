import React from 'react';
import { store, setEmail } from '../state';

class BaseConfirmation extends React.Component {
    validateEmail(event) {
        let storeState = store.getState();

        let valid = /^.+@.+\..+$/.test(event.target.value);
        this.setState({
            validEmail: valid,
            showAlert: false
        });

        let newEmail = valid ? event.target.value : null;
        if (typeof storeState === 'undefined' || storeState.email !== newEmail) {
            store.dispatch(setEmail(newEmail));
        }
    }

    dismissAlert() {
        this.setState({
            showAlert: false
        })
    }
}

export default BaseConfirmation