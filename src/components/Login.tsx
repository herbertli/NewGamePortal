import * as React from 'react';

import { ourFirebase } from '../services/firebase';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import AutoComplete from 'material-ui/AutoComplete';
// import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
// import ContentClear from 'material-ui/svg-icons/content/clear';
import { History } from 'history';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { StoreState } from '../types/index';
import { checkPhoneNumber } from '../globals';

const data = require('../countrycode.json');

interface Country {
  name: string;
  code: string;
  callingCode: string;
  emojiCode: string;
}

interface Props {
  myUserId: string;
  history: History;
  countries: Country[];
  countryNames: string[];
}

interface DataSourceNode {
  text: string;
  value: object;
}

enum loadingType {
  loading = 'loading',
  hide = 'hide'
}

enum visibilityType {
  visible = 'visible',
  hidden = 'hidden'
}

const style: React.CSSProperties = {
  margin: 20
  // padding: 10
};

const defaultSearchText = 'United States(+1)';
const defaultText = 'United States(+1)';
const defaultCode = 'US';

class Login extends React.Component<Props, {}> {
  confirmationResult: any = null;

  state = {
    displayName: '',
    selectField: { value: '', label: '' },
    code: defaultCode,
    phoneNum: '',
    veriCode: '',
    errorText: '',
    veriErrorText: '',
    confirmationResult: null,
    veriDisabled: true,
    clearVisibility: visibilityType.visible,
    loginOnce: false
  };

  handleClickOutsideSelect = () => {
    if (this.props.countryNames.indexOf(defaultSearchText)) {
      this.setState({
        searchText: defaultText,
        code: defaultCode
      });
    }
  };

  handleUpdateInput = (searchText: string) => {
    if (searchText.length > 0) {
      this.setState({
        clearVisibility: visibilityType.visible
      });
    } else {
      this.setState({
        clearVisibility: visibilityType.hidden
      });
    }
    this.setState({
      searchText: searchText
    });
  };

  handleNewRequest = (chosenRequest: DataSourceNode) => {
    if (chosenRequest.text && chosenRequest.text.indexOf('-') !== -1) {
      let searchWords = chosenRequest.text.split('-');
      console.log(searchWords);
      if (this.props.countryNames.indexOf(searchWords[1]) !== -1) {
        this.setState({
          searchText: searchWords[1],
          defaultText: searchWords[1],
          code: searchWords[0],
          defaultCode: searchWords[0]
        });
      } else {
        this.setState({
          searchText: defaultText,
          code: defaultCode
        });
      }
    } else {
      this.setState({
        searchText: defaultText,
        code: defaultCode
      });
    }
  };

  displayNameChanged = (event: any) => {
    this.setState({ displayName: event.target.value || '' });
  };

  handleInput = (event: any) => {
    if (!event.target.value) {
      this.setState({
        phoneNum: event.target.value,
        errorText: 'This field is required'
      });
    } else {
      this.setState({ phoneNum: event.target.value, errorText: '' });
    }
  };

  handleCodeInput = (event: any) => {
    if (!event.target.value) {
      this.setState({
        veriCode: event.target.value,
        veriErrorText: 'This field is required'
      });
    } else {
      this.setState({
        veriCode: event.target.value,
        phoneNum: event.target.value,
        veriErrorText: ''
      });
    }
  };

  onLogin = () => {
    let result = checkPhoneNumber(this.state.phoneNum, this.state.code);
    console.log(result);
    if (result && result.isValidNumber) {
      this.setState({ loginOnce: true, veriDisabled: false });
      let phoneNumber = result.internationalFormat;
      if (!this.state.loginOnce) {
        ourFirebase
          .signInWithPhoneNumber(phoneNumber, this.state.code, this.state.displayName)
          .then((_confirmationResult: any) => {
            this.confirmationResult = _confirmationResult;
          });
      }
    } else {
      this.setState({ errorText: 'invalid phone number' });
    }
  };

  sendCode = () => {
    this.confirmationResult
      .confirm(this.state.veriCode)
      .then((result: any) => {
        console.log('User signed in successfully: ', result.user);
        this.goToMainPage();
      })
      .catch((error: any) => {
        // User couldn't sign in (bad verification code?)
        // ...
        console.log(error);
      });
    this.setState({ status: loadingType.loading });
  };

  goToMainPage = () => {
    this.props.history.push('/');
  };

  render() {
    if (this.props.myUserId) {
      return <Redirect to="/" />;
    }
    return (
      <div>
        <div style={style}>
          <div id="recaptcha-container" />
          <br />
          <TextField
            id="displayName"
            floatingLabelText="Your name"
            hintText="Enter your name"
            onChange={this.displayNameChanged}
          />
          <br />
          <div>
            <AutoComplete
              listStyle={{ maxHeight: 200, overflow: 'auto' }}
              floatingLabelText="Country"
              hintText="Select Country"
              searchText={defaultSearchText}
              onUpdateInput={this.handleUpdateInput}
              onNewRequest={this.handleNewRequest}
              dataSource={this.props.countries.map((country: Country) => ({
                text: country.code + '-' + country.name + '(+' + country.callingCode + ')',
                value: (
                  <MenuItem
                    primaryText={country.name + ' (+' + country.callingCode + ')'}
                    secondaryText={country.emojiCode}
                  />
                )
              }))}
              fullWidth={true}
              filter={AutoComplete.fuzzyFilter}
              openOnFocus={true}
            />
          </div>
          <div onClick={this.handleClickOutsideSelect}>
            <br />
            <TextField
              id="phoneNum"
              type="number"
              floatingLabelText="Phone Number"
              hintText="Enter your phone number"
              errorText={this.state.errorText}
              onChange={this.handleInput}
            />
            <br />
            <br />
            <RaisedButton label="get verification code" primary={true} onClick={this.onLogin} />
            <br />
            <br />
            <TextField
              id="veriCode"
              type="number"
              floatingLabelText="Verification Code"
              hintText="Enter your verification code"
              errorText={this.state.veriErrorText}
              onChange={this.handleCodeInput}
              disabled={this.state.veriDisabled}
            />
            <br />
            <br />
            <RaisedButton
              label="Login"
              primary={true}
              onClick={this.sendCode}
              disabled={this.state.veriDisabled}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  const countries: Country[] = [];
  const countryNames: string[] = [];
  for (let country of data) {
    const l = country.code.codePointAt(0);
    const r = country.code.codePointAt(1);
    const emoji = String.fromCodePoint(l + 127397) + String.fromCodePoint(r + 127397);
    countries.push({
      code: country.code,
      name: country.name,
      callingCode: country.callingCode,
      emojiCode: emoji
    });
    countryNames.push(country.name + '(+' + country.callingCode + ')');
  }
  return {
    myUserId: state.myUser.myUserId,
    countries,
    countryNames
  };
};
export default connect(mapStateToProps)(Login);
