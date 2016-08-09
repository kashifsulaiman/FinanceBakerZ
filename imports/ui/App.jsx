import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { AppBar, IconButton, List, ListItem, Sidebar } from 'react-toolbox';
import { Layout, NavDrawer, Panel, Card, CardTitle, Input } from 'react-toolbox';

import Accounts from './Accounts.jsx';

// App component - represents the whole app
export default class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            drawerActive: false,
            sidebarPinned: true
        }
    }

    toggleDrawerActive() {
        this.setState({
            drawerActive: !this.state.drawerActive
        });
    }

    toggleSidebar () {
        this.setState({
            sidebarPinned: !this.state.sidebarPinned
        });
    };
    render() {
        return (
            <Layout>
                <NavDrawer active={this.state.drawerActive} onOverlayClick={ this.toggleDrawerActive.bind(this) }>
                    <div>
                        <Card style={{width: '350px'}}>
                            <CardTitle
                                avatar="https://placeimg.com/80/80/animals"
                                title="Kamran Masood"
                                subtitle="Crocodile of Manghopir"
                                />
                        </Card>
                        <List selectable ripple>
                            <ListItem caption='Accounts' leftIcon='account_balance' />
                            <ListItem caption='Transactions' leftIcon='loop' />
                            <ListItem caption='Settings' leftIcon='settings' />
                            <ListItem caption='Categories' leftIcon='border_all' />
                        </List>
                    </div>
                </NavDrawer>
                <Panel>
                    <AppBar>
                        <IconButton icon='menu' inverse={ true } onClick={ this.toggleDrawerActive.bind(this) }/>
                    </AppBar>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.8rem' }}>
                        <Accounts></Accounts>
                    </div>
                </Panel>
                <Sidebar pinned={this.state.sidebarPinned} width={ 6 }>
                    <div>
                        <IconButton icon='close' onClick={ this.toggleSidebar.bind(this) }/>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.8rem' }}>
                        <form>
                            <Input type='text' label='Name' name='name' maxLength={16 } />
                        </form>
                    </div>
                </Sidebar>
            </Layout>
        );
    }
}