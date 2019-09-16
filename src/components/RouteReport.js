import React, { Component } from "react"
import { FormErrors } from './FormErrors';
import TextInput from "react-autocomplete-input"
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Route';

class RouteReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            formErrors: { routeName: '' },
            friendlyNames: { routeName: 'Pole nazwa drogi' },
            routeNameValid: '',
            options: ["dom", "wakacje", "praca", "inne", "Cactus"]
        }

        this.localTimeout = 'undefined';
        this.start = 100;
        this.startReverse = 100;

        //Working long press:
        //https://codesandbox.io/s/6jm33jz08z

        this.onMouseDown = this.onMouseDown.bind(this);
        this.repeat = this.repeat.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseUpReverse = this.onMouseUpReverse.bind(this);
        this.repeatReverse = this.repeatReverse.bind(this);
        this.onMouseDownReverse = this.onMouseDownReverse.bind(this);
    }

    onMouseDown() {
        this.repeat();
    }

    repeat() {
        this.props.increment()
        this.t = setTimeout(this.repeat, this.start);
        this.start = this.start / 2;
    }

    onMouseDownReverse() {
        this.repeatReverse()
    }

    repeatReverse() {
        if (this.props.count > 0) {
            this.props.decrement();
            this.tReverse = setTimeout(this.repeatReverse, this.startReverse);
            this.startReverse = this.startReverse / 2;
        }
    }

    onMouseUpReverse() {
        clearTimeout(this.tReverse);
        this.startReverse = 100;
    }

    onMouseUp() {
        clearTimeout(this.t);
        this.start = 100;
    }

    //#region Funkcje walidacyjne
    setEventState(e, value = '') {
        const name = e.target.name;
        this.setState(
            { [name]: value },
            () => { this.validateField(name, value) });
    }

    blurUserInput(e) {
        if (e.target.value.length > 0) {
            return;
        }
        this.setEventState(e);
    }

    handleAutosuggestTextInput(textValue) {
        this.setState(
            { 'routeName': textValue },
            () => { this.validateField('routeName', textValue) });
    }

    handleUserInput(e) {
        this.setEventState(e, e.target.value);
    }

    // stringLengthValidation(value, minLength, maxLength) {
    //     var str = new String(value);
    //     routeNameValid = str.length > minLength
    //     var isempty = str.length === 0
    //     if (isempty) {
    //         routeNameValid = ''
    //         fieldValidationErrors.routeName = ''

    //     }
    //     fieldValidationErrors.routeName = routeNameValid ? '' : 'jest za krótkie (przynajmniej 3 znaki)!';
    // }

    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let routeNameValid = this.state.routeNameValid;

        switch (fieldName) {
            case 'routeName':
                var str = new String(value);
                routeNameValid = str.length > 3
                var isempty = str.length === 0
                if (isempty) {
                    routeNameValid = ''
                    fieldValidationErrors.routeName = ''
                    break;
                }
                fieldValidationErrors.routeName = routeNameValid ? '' : 'jest za krótkie (przynajmniej 3 znaki)!';
                break;
            case 'clean':
                routeNameValid = false
                fieldValidationErrors.routeNameValid = ''
                break;
            default:
                break;
        }

        this.setState({
            formErrors: fieldValidationErrors,
            routeNameValid: routeNameValid
        }, this.validateForm);
    }

    validateForm() {
        this.setState(
            { formValid: this.state.routeNameValid });
    }

    errorFuelTypeClass(error) {
        if (typeof error === 'string' || typeof error === 'undefined') {
            return '';
        }
        return (error ? 'is-valid' : 'is-invalid');//Bootstrap v4
    }
    //#endregion

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm">
                        <FormErrors formErrors={this.state.formErrors} friendlyNames={this.state.friendlyNames} />
                        <TextInput
                            name="routeName"
                            className={`form-control ${this.errorFuelTypeClass(this.state.routeNameValid)}`}
                            ref={(a) => this._inputElementRouteName = a}
                            placeholder="Moja droga @Cactusem do domu"
                            onChange={(event) => this.handleAutosuggestTextInput(event)}
                            onBlur={(event) => this.handleAutosuggestTextInput(event)}
                            options={this.state.options}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm">
                        Wprowadź ilość kilometrów:
                    </div>
                    <div className="col-sm">
                        <button
                            className="buttons"
                            onMouseUp={this.onMouseUp}
                            onMouseLeave={this.onMouseUp}
                            onMouseDown={this.onMouseDown}
                        >+</button>
                        {this.props.count} [KM]
                        <button className="buttons"
                            onMouseUp={this.onMouseUpReverse} // To się tyczy tylko mouse up'a nad tym określonym buttonem
                            onMouseLeave={this.onMouseUpReverse}
                            onMouseDown={this.onMouseDownReverse}
                        >-</button>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(
    state => state.kmCounter,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(RouteReport);