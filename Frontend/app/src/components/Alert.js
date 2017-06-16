import React from 'react';

/**
 * Modal popup with information
 */
class Alert extends React.Component {
    componentDidUpdate() {
        if (this.props.show) {
            $(this.refs.modal).modal('show');
        }
    }

    dismiss() {
        if (this.props.onDismiss) {
            this.props.onDismiss();
        }
    }

    getDialogClassName() {
        return "modal-dialog alert";
    }

    renderBody() {
        return (
            <div className="modal-body">
                <p>{this.props.text}</p>
            </div>
        );
    }

    render() {
        return (
            <div ref="modal" className="modal fade" tabIndex="-1" role="dialog">
                <div className={this.getDialogClassName()} role="document">
                    <div className="modal-content">
                        {this.renderBody()}
                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.dismiss.bind(this)}>OK</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    };
}

export default Alert