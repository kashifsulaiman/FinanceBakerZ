import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { createContainer } from 'meteor/react-meteor-data';
import { routeHelpers }  from '../../../helpers/routeHelpers'

import { List, ListItem, Button, IconButton, ListSubHeader, Dropdown, Card, Checkbox, Dialog, ProgressBar, Input, Snackbar } from 'react-toolbox';
import { Slingshot } from 'meteor/edgee:slingshot'

import { Meteor } from 'meteor/meteor';
import { Categories } from '../../../api/categories/categories.js';

import theme from './theme';
import cardTheme from './cardTheme';
import checkboxTheme from './checkboxTheme';
import buttonTheme from './buttonTheme';
import dialogTheme from './dialogTheme';
import { Accounts } from 'meteor/accounts-base';

import currencyIcon from '/imports/ui/currencyIcon.js';
import {FormattedMessage, intlShape, injectIntl, defineMessages} from 'react-intl';

const il8n = defineMessages({
    TITLE: {
        id: 'SETTINGS.TITLE'
    },
    PERSONAL_INFORMATION: {
        id: 'SETTINGS.PERSONAL_INFORMATION'
    },
    ACCOUNT_SETTINGS: {
        id: 'SETTINGS.ACCOUNT_SETTINGS'
    },
    CHANGE_PASSWORD: {
        id: 'SETTINGS.CHANGE_PASSWORD'
    },
    REMOVE_ACCOUNT: {
        id: 'SETTINGS.REMOVE_ACCOUNT'
    },
    INFORM_MESSAGE: {
        id: 'SETTINGS.INFORM_MESSAGE'
    },
    CONFIRMATION_MESSAGE: {
        id: 'SETTINGS.CONFIRMATION_MESSAGE'
    },
    BACK_BUTTON: {
        id: 'SETTINGS.BACK_BUTTON'
    },
    REMOVE_BUTTON: {
        id: 'SETTINGS.REMOVE_BUTTON'
    },
    SELECT_CURRENCY:{
        id: 'SETTINGS.SELECT_CURRENCY'
    },
    SELECT_LANGUAGE:{
        id: 'SETTINGS.SELECT_LANGUAGE'
    },
    UPDATE_BUTTON:{
        id: 'SETTINGS.UPDATE_BUTTON'
    },
    NAME:{
        id: 'SETTINGS.NAME'
    },
    CONTACT_NUMBER:{
        id: 'SETTINGS.CONTACT_NUMBER'
    },
    USER:{
        id: 'SETTINGS.USER_NAME'
    },
    EMAIL:{
        id: 'SETTINGS.EMAIL'
    },
    ADDRESS:{
        id: 'SETTINGS.ADDRESS'
    },
    EDIT_INFO:{
        id: 'SETTINGS.EDIT_INFO'
    },
    CURRENCY:{
        id: 'SETTINGS.CURRENCY'
    },
    LANGUAGE:{
        id: 'SETTINGS.LANGUAGE'
    },
    EMAIL_NOTIFICATION:{
        id: 'SETTINGS.EMAIL_NOTIFICATION'
    },
    REMOVE_ACCOUNT_BUTTON:{
        id: 'SETTINGS.REMOVE_ACCOUNT_BUTTON'
    },
    PASSWORD:{
        id: 'SETTINGS.PASSWORD'
    },
    USER_NAME:{
        id: 'SETTINGS.USERNAME'
    },
    USER_CONTACT_NUMBER:{
        id: 'SETTINGS.USER_CONTACT_NUMBER'
    },
    USER_USER_NAME:{
        id: 'SETTINGS.USER_USER_NAME'
    },
    USER_EMAIL:{
        id: 'SETTINGS.USER_EMAIL'
    },
    USER_ADDRESS:{
        id: 'SETTINGS.USER_ADDRESS'
    },
    EDIT_PERSONAL_INFO:{
        id: 'SETTINGS.EDIT_PERSONAL_INFO'
    },
    EDIT_ACCOUNT_SETTINGS:{
        id: 'SETTINGS.EDIT_ACCOUNT_SETTINGS'
    },
    CHANGE_USER_PASSWORD:{
        id: 'SETTINGS.CHANGE_USER_PASSWORD'
    },
    CURRENT_PASSWORD:{
        id: 'SETTINGS.CURRENT_PASSWORD'
    },
    NEW_PASSWORD:{
        id: 'SETTINGS.NEW_PASSWORD'
    },
    REPEAT_NEW_PASSWORD:{
        id: 'SETTINGS.REPEAT_NEW_PASSWORD'
    },
    SAVE_BUTTON:{
        id: 'SETTINGS.SAVE_BUTTON'
    },
    EDIT_IMAGE_BUTTON:{
        id: 'SETTINGS.EDIT_IMAGE_BUTTON'
    },
    EDIT_ACCOUNT_SETTINGS_BUTTON:{
        id: 'SETTINGS.EDIT_ACCOUNT_SETTINGS_BUTTON'
    }
});


class SettingsPage extends Component {

    constructor(props) {
        super(props);
          let userInfo = Meteor.user();
        this.state = {
            openDialog: false,
            disableButton: false,
            currency: userInfo.profile.currency || '',
            language: userInfo.profile.language || '',
            check1: userInfo.profile.emailNotification,
            check2: !userInfo.profile.emailNotification,
            name: userInfo.profile.fullName,
            active: false,
            loading: false,
            number: userInfo.profile.contactNumber || '' ,
            username: userInfo.username || '',
            email: userInfo.emails ? userInfo.emails[0].address : '',
            address: userInfo.profile.address || '',
            imageUrl: ''
        };

        this.languages = [
            { label: 'English', value: 'en', direction: 'ltr' },
            { label: 'Urdu', value: 'ur', direction: 'rtl' }
        ]
    }
    handleChange (field, value) {
        if(field === 'check1') this.setState({'check2': false});
        else this.setState({'check1': false});
        this.setState({[field]: value});
        this.emailNotify();
    }

    emailNotify(){
        const {check2} = this.state;
        let useraccount = {account: {check2, owner: Meteor.user()._id}};
        Meteor.call('emailNotificaton', useraccount, (err) => {
            if(err){
                console.log(err);
            }
        });
    }


    onChange (val, e) {
        this.setState({[e.target.name]: val});
        e.target.name === 'currency' && this.setCurrency(val)
    }


    userRemove () {
        if(!Meteor.userId()) return;
        let user = {account: {owner: Meteor.userId()}};
        Meteor.call('userRemove', user, (err, res) => {
            if(err) {

            }
             else {
                routeHelpers.changeRoute('/login');
            }
        });

    }

    setCurrency(currency){
        currencyItem = _.findWhere(currencyIcon, {value: currency});
        this.setState({currency: currencyItem});
    }

    currencyItem (currency) {
        return (
            <div className={theme.currencyIcons}>
                <i className= {currency.value}></i>
                <div>
                    <strong>{currency.label}</strong>
                </div>
            </div>
        );
    }

    setLanguage (value){
        const language = _.findWhere(this.languages, {value: value});
        this.setState({language});
    }

    languageItem (language) {
        return (
            <div>
                <strong>{language.label}</strong>
            </div>
        );
    }


    popupTemplate(){
        return(
            <Dialog theme={dialogTheme}
                type='fullscreen'
                active={this.state.openDialog}
                onEscKeyDown={this.closePopup.bind(this)}
                onOverlayClick={this.closePopup.bind(this)}
                >
                {this.switchPopupTemplate()}
            </Dialog>
        )
    }


    changePassword(event){
        event.preventDefault();
        const {oldPassword, newPassword, alterPassword} = this.state;
        if(newPassword !== alterPassword){
            this.setState({
                active: true,
                barMessage: 'Passwords do not match',
                barIcon: 'error_outline',
                barType: 'cancel'
            });
        }
        else{
            Accounts.changePassword(oldPassword, newPassword, (err)=> {
                    if(!err){
                        this.setState({oldPassword: '', newPassword: '', alterPassword: ''});
                            this.setState({
                                active: true,
                                barMessage: 'Password changed successfully',
                                barIcon: 'done',
                                barType: 'accept'
                            });
                        this.setState({loading: false});
                        this.closePopup();
                    }
                    else{
                        this.setState({
                            active: true,
                            barMessage: err.reason,
                            barIcon: 'done',
                            barType: 'accept'
                        });
                    }
                }
            )
        }

    }



    updateProfile (event) {
        event.preventDefault();
        const {name, number, email, address, username, imageUrl} = this.state;
        let info = {users: {name, number, email, address, username, imageUrl}};
        Meteor.call('settings.updateProfile', info, (err) => {
            if(err){
                this.setState({
                    active: true,
                    barMessage: err.reason,
                    barIcon: 'error_outline',
                    barType: 'cancel'
                });
            }
            else{
                this.setState({
                    active: true,
                    barMessage: 'Profile updated successfully',
                    barIcon: 'done',
                    barType: 'accept'
                });
                this.closePopup();
            }
            this.setState({loading: false});
        });
    }

    updateAccountSettings (e) {
        e.preventDefault();
        const {currency, language} = this.state;
           Meteor.call('settings.updateAccount', {
               settings: {currency, language}
           }, (err) => {
               if(err){
                   this.setState({
                       active: true,
                       barMessage: err.reason,
                       barIcon: 'error_outline',
                       barType: 'cancel'
                   });
               }
               else{
                   this.setState({
                       active: true,
                       barMessage: 'Account updated successfully',
                       barIcon: 'done',
                       barType: 'accept'
                   });
                   this.closePopup();
               }
               this.setState({loading: false});
           });
    }

    onSubmit(event){
        event.preventDefault();
        this.props.account ? this.updateAccount() : this.createAccount();
        this.setState({loading: true})
    }

    resetImageUpload(){
        this.setState({
            data_uri: '',
            imageUrl: ''
        });
    }


    userImage(e){
        if(e.target.files.length){

            const reader = new FileReader();
            const file = e.target.files[0];
            this.setState({
                target: e.target.files[0]
            });
            reader.onload = (upload) => {
                this.setState({
                    data_uri: upload.target.result
                });
            };
            reader.readAsDataURL(file);

            if(this.state.target && this.uploadImageName !== this.state.target.name) {
                this.setState({
                    disableButton: true,
                });
                this.uploadImageName = this.state.target.name;

                let userId = Meteor.user()._id;
                let metaContext = {
                    folder: "profiles",
                    uploaderId: userId
                };

                let uploader = new Slingshot.Upload('imageUploader', metaContext);
                uploader.send(this.state.target, (error, downloadUrl) => { // you can use refs if you like
                    this.setState({
                        disableButton: false,
                    });
                    if (error) {
                        // Log service detailed response
                        console.error('Error uploading', uploader.xhr.response);
                        console.log(error); // you may want to fancy this up when you're ready instead of a popup.
                        this.resetImageUpload();
                    }
                    else {
                        console.log(downloadUrl);
                        this.setState({imageUrl: downloadUrl});
                    }
                });
            }

        }
    }

    handleBarClick (event, instance) {
        this.setState({ active: false });
    }

    handleBarTimeout (event, instance) {
        this.setState({ active: false });
    }

    progressBarToggle (){
        return this.state.loading ? 'progress-bar' : 'progress-bar hide';
    }

    switchPopupTemplate(){
        const { formatMessage } = this.props.intl;
        let gravatar, user = Meteor.user();
        if(user && user.profile.md5hash) {
            gravatar = Gravatar.imageUrl(user.profile.md5hash, {
                secure: true,
                size: "48",
                d: 'mm',
                rating: 'pg'
            });
        }
        let profileImage = this.state.imageUrl || this.state.data_uri || user.profile.avatar || gravatar || "/assets/images/HQ3YU7n.gif";
            let uploadedImage = <div className='image-group'>
                <div className="fileUpload btn btn-primary">
                    <span> <FormattedMessage {...il8n.EDIT_IMAGE_BUTTON} /> </span>
                    <input type="file"
                           id="input"
                           className="upload"
                           onChange={this.userImage.bind(this)}/>
                </div>
                <img className='user-image' src={profileImage} />
            </div>;


        switch (this.state.action){
            case 'remove':
                return this.renderConfirmationMessage();
                break;
            case 'personalInformation':
                return (
                    <form onSubmit={this.updateProfile.bind(this)} className={theme.addAccount}>
                        <ProgressBar type="linear" mode="indeterminate" multicolor className={this.progressBarToggle()} />
                        <h3 className={theme.titleSetting}> <FormattedMessage {...il8n.EDIT_PERSONAL_INFO} /> </h3>
                        {uploadedImage}
                        <Input type='text' label={formatMessage(il8n.USER_NAME)}
                               name='name'
                               maxLength={ 25 }
                               value={this.state.name}
                               onChange={this.onChange.bind(this)}
                               required
                            />
                        <Input type='text' label={formatMessage(il8n.USER_CONTACT_NUMBER)}
                               name='number'
                               maxLength={ 50 }
                               value={this.state.number}
                               onChange={this.onChange.bind(this)}
                            />
                        {Meteor.user().username ?

                            (<span><Input type='text' label={formatMessage(il8n.USER_USER_NAME)}
                               name='username'
                               value={this.state.username}
                               onChange={this.onChange.bind(this)}
                               required
                            />

                        <Input type='email' label={formatMessage(il8n.USER_EMAIL)}
                               name='email'
                               value={this.state.email}
                               onChange={this.onChange.bind(this)}
                            />
                                </span>
                            )
                            :

                        (<span><Input type='text' label={formatMessage(il8n.USER_USER_NAME)}
                               name='username'
                               value={this.state.username}
                               onChange={this.onChange.bind(this)}
                            />

                        <Input type='email' label={formatMessage(il8n.USER_EMAIL)}
                               name='email'
                               value={this.state.email}
                               onChange={this.onChange.bind(this)}
                               required
                            />
                                </span>
                        )
                        }
                        <Input type='text' label={formatMessage(il8n.USER_ADDRESS)}
                               name='address'
                               value={this.state.address}
                               onChange={this.onChange.bind(this)}
                            />
                        <div className={theme.updateBtn}>
                            <Button type='submit' label={formatMessage(il8n.UPDATE_BUTTON)} raised primary disabled={this.state.disableButton}/>
                        </div>

                    </form>
                );
                break;
            case 'accountSetting':
                return (
                    <form onSubmit={this.updateAccountSettings.bind(this)} className={theme.addAccount}>
                        <ProgressBar type="linear" mode="indeterminate" multicolor className={this.progressBarToggle()} />
                        <h3 className={theme.titleSetting}> <FormattedMessage {...il8n.EDIT_ACCOUNT_SETTINGS} /> </h3>
                        <section>
                            <Dropdown
                                auto={false}
                                source={currencyIcon}
                                name='currency'
                                onChange={this.onChange.bind(this)}
                                label={formatMessage(il8n.SELECT_CURRENCY)}
                                value={this.state.currency.value}
                                template={this.currencyItem}
                                required
                                />
                        </section>

                        <Dropdown
                            source={this.languages}
                            label={formatMessage(il8n.SELECT_LANGUAGE)}
                            onChange={this.setLanguage.bind(this)}
                            value={this.state.language.value}
                            template={this.languageItem}
                            />

                        <div className={theme.updateBtn}>
                            <Button type='submit' label={formatMessage(il8n.EDIT_ACCOUNT_SETTINGS_BUTTON)} raised primary />
                        </div>
                    </form>
                );
                break;
            case 'changePassword':
                return (
                    <form onSubmit={this.changePassword.bind(this)} className={theme.addAccount}>
                        <ProgressBar type="linear" mode="indeterminate" multicolor className={this.progressBarToggle()} />
                        <h3 className={theme.titleSetting}> <FormattedMessage {...il8n.CHANGE_USER_PASSWORD} /> </h3>

                        <Input type='password' label={formatMessage(il8n.CURRENT_PASSWORD)}
                               name='oldPassword'
                               value={this.state.oldPassword}
                               onChange={this.onChange.bind(this)}
                            />

                        <Input type='password' label={formatMessage(il8n.NEW_PASSWORD)}
                               name='newPassword'
                               value={this.state.newPassword}
                               onChange={this.onChange.bind(this)}
                            />

                        <Input type='password' label={formatMessage(il8n.REPEAT_NEW_PASSWORD)}
                               name='alterPassword'
                               value={this.state.alterPassword}
                               onChange={this.onChange.bind(this)}
                            />

                            <div className={theme.saveBtn}>
                                <Button type='submit' label={formatMessage(il8n.SAVE_BUTTON)} raised primary disabled={!(this.state.oldPassword && this.state.newPassword && this.state.alterPassword)}/>
                            </div>
                    </form>
                );
        }
    }
    openPopup (action, account) {
        this.setState({
            openDialog: true,
            action,
            selectedAccount: account || null
        });
    }
    closePopup () {
        this.setState({
            openDialog: false
        });
    }

    editSettings(account){
        routeHelpers.changeRoute(`/app/settings/edit`);
    }
    renderConfirmationMessage(){
        const { formatMessage } = this.props.intl;
        return (
            <div className={theme.dialogSetting}>
                <div className={theme.confirmText}>
                    <h3><FormattedMessage {...il8n.REMOVE_ACCOUNT} /></h3>
                    <p><FormattedMessage {...il8n.INFORM_MESSAGE} /></p>
                    <p><FormattedMessage {...il8n.CONFIRMATION_MESSAGE} /></p>
                </div>

                <div className={theme.buttonBox}>
                    <Button label={formatMessage(il8n.BACK_BUTTON)} raised primary onClick={this.closePopup.bind(this)} />
                    <Button label={formatMessage(il8n.REMOVE_BUTTON)} raised onClick={this.userRemove.bind(this)} theme={buttonTheme}/>
                </div>
            </div>
        )
    }


    render() {
        const { formatMessage } = this.props.intl;
        return (
            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                <div style={{ flex: 1, padding: '1.8rem', overflowY: 'auto' }}>
                    <div className={theme.settingContent}>
                        <div className={theme.settingTitle}>
                            <h3> <FormattedMessage {...il8n.TITLE} /> </h3>
                            <Snackbar
                                action='Dismiss'
                                active={this.state.active}
                                icon={this.state.barIcon}
                                label={this.state.barMessage}
                                timeout={2000}
                                onClick={this.handleBarClick.bind(this)}
                                onTimeout={this.handleBarTimeout.bind(this)}
                                type={this.state.barType}
                                />
                        </div>
                        <Card theme={cardTheme}>
                            <div className={theme.cardTitle}>
                                <h5><FormattedMessage {...il8n.PERSONAL_INFORMATION} /></h5>
                            </div>
                            <div className={theme.cardContent}>
                                <h6> <FormattedMessage {...il8n.NAME} />  <span>{Meteor.user().profile.fullName || 'Not Available'}</span></h6>
                                <h6> <FormattedMessage {...il8n.CONTACT_NUMBER} />  <span> {Meteor.user().profile.contactNumber || 'Not Available'}</span></h6>
                                <h6> <FormattedMessage {...il8n.USER} /> <span> { Meteor.user().username ? Meteor.user().username :'Not Available'} </span> </h6>
                                <h6> <FormattedMessage {...il8n.EMAIL} /> <span> {Meteor.user().emails ? Meteor.user().emails[0].address :'Not Available'}</span></h6>
                                <h6> <FormattedMessage {...il8n.ADDRESS} /> <span> {Meteor.user().profile.address || 'Not Available'}</span></h6>
                            </div>
                        </Card>
                        <Card theme={cardTheme}>
                            <div className={theme.cardTitle}>
                                <h5> <FormattedMessage {...il8n.ACCOUNT_SETTINGS} /> </h5>
                            </div>
                            <div className={theme.cardContent}>
                                <h6><FormattedMessage {...il8n.CURRENCY} /> <span>{Meteor.user().profile.currency.label || 'Not Available'} </span></h6>
                                <h6><FormattedMessage {...il8n.LANGUAGE} /> <span> {Meteor.user().profile.language.label || 'Not Available'}</span></h6>
                                <h6>
                                    <FormattedMessage {...il8n.EMAIL_NOTIFICATION} />
                                    <span>
                                        <Checkbox theme={checkboxTheme}
                                            checked={this.state.check1}
                                            label="On"
                                            onChange={this.handleChange.bind(this, 'check1')}
                                            />
                                         <Checkbox theme={checkboxTheme}
                                             checked={this.state.check2}
                                             label="Off"
                                             onChange={this.handleChange.bind(this, 'check2')}
                                             />
                                    </span>
                                </h6>
                            </div>
                        </Card>

                        <Card theme={cardTheme}>
                            <div className={theme.cardTitle}>
                                <h5> <FormattedMessage {...il8n.CHANGE_PASSWORD} /> </h5>
                            </div>
                            <div className={theme.cardContent}>
                                <h6> <FormattedMessage {...il8n.PASSWORD} />  <span>*********</span></h6>
                                <div className={theme.editBtn}>
                                </div>
                            </div>
                        </Card>

                        <div className={theme.buttonSite}>

                            <Button
                                label={formatMessage(il8n.EDIT_INFO)}
                                onClick={this.editSettings.bind(this)}
                                icon=''
                                raised
                                primary
                                theme={buttonTheme} />
                            <Button style={{marginLeft: '10px'}}
                                label={formatMessage(il8n.REMOVE_ACCOUNT_BUTTON)}
                                onClick={this.openPopup.bind(this, 'remove')}
                                icon=''
                                raised
                                theme={buttonTheme} />
                        </div>
                    </div>
                        {this.popupTemplate()}
                </div>
            </div>
        );
    }
}

SettingsPage.propTypes = {
    categories: PropTypes.array.isRequired,
    intl: intlShape.isRequired
};

SettingsPage = createContainer(() => {
    Meteor.subscribe('categories');

    return {
        categories: Categories.find({}).fetch()
    };
}, SettingsPage);

export default injectIntl(SettingsPage);
