import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { AppBar, IconButton, List, ListItem, Sidebar } from 'react-toolbox';
import { Layout, NavDrawer, Panel, Card, CardTitle, Input, Button } from 'react-toolbox';

import { Accounts } from 'meteor/accounts-base'

// App component - represents the whole app
export default class Register extends Component {

    constructor(props) {
        super(props);

        this.state = {
            fullName: '',
            usernameOrEmail: '',
            password: '',
            loading: false
        }
    }

    onChange (val, e) {
        this.setState({[e.target.name]: val});
    }

    onSubmit(event){
        event.preventDefault();

        const {usernameOrEmail, password} = this.state;
        let user;
        if (typeof usernameOrEmail === 'string')
            if (usernameOrEmail.indexOf('@') === -1)
                user = {username: usernameOrEmail};
            else
                user = {email: usernameOrEmail};

        Meteor.loginWithPassword(user, password, (err) => {
            if(err){
                console.log(err);
            }else{
                this.props.history.push('/app/dashboard');
            }
        });
        //this.setState({loading: true})
    }

    render() {
        return (
            <form onSubmit={this.onSubmit.bind(this)} className="login">
                <Input type='text' label='Username or Email'
                       name='usernameOrEmail'
                       maxLength={ 30 }
                       value={this.state.usernameOrEmail}
                       onChange={this.onChange.bind(this)}
                       required
                    />
                <Input type='password' label='Password'
                       name='password'
                       maxLength={ 20 }
                       value={this.state.password}
                       onChange={this.onChange.bind(this)}
                       required
                    />
                <Button icon='lock_open' label='Login' raised primary />
            </form>
        );
    }
}