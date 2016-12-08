import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import moment from 'moment';

import { Card, CardTitle, Button, DatePicker, FontIcon, Autocomplete, Dropdown } from 'react-toolbox';
import { Link } from 'react-router'

import { Meteor } from 'meteor/meteor';
import { Accounts } from '../../../api/accounts/accounts.js';

class DashboardPage extends Component {

    constructor(props) {
        super(props);

        let datetime = new Date();

        this.state = {
            index: 0,
            totalIncomes: 0,
            totalExpenses: 0,
            availableBalance: 0,
            multiple: [],
            filterBy: 'month',
            dateFrom: datetime,
            dateTo: datetime
        };
    }

    formatNumber(num){
        return new Intl.NumberFormat().format(num);
    }

    filterByDate(filter, range){

        console.log('filter : ', filter);
        console.log('this.state.filterBy : ', this.state.filterBy);

        let date = {};
        if(filter == 'months'){
            date.start = moment().subtract(1, 'months').startOf('month').format();
            date.end = moment().subtract(1, 'months').endOf('month').format();
        }
        else if(filter == 'range'){
            console.log('range :', range);
            console.log('this.state.dateFrom :', this.state.dateFrom);
            console.log('this.state.dateTo :', this.state.dateTo);

            date.start = moment(range.dateFrom || this.state.dateFrom).startOf('day').format();
            date.end = moment(range.dateTo || this.state.dateTo).endOf('day').format();
        }
        else{
            date.start = moment().startOf(filter).format();
            date.end = moment().endOf(filter).format();
        }

        console.log('date :', date);
        return date
    }

    toggleSidebar(event){
        this.props.toggleSidebar(false);
    }


    componentWillReceiveProps (p){
        this.setDefaultAccounts(p);
    }

    componentWillMount(){
        this.toggleSidebar();
        this.setDefaultAccounts(this.props);
    }

    setDefaultAccounts (props){
        let multiple = [];
        props.accounts.forEach((account) => {
            multiple.push(account._id);
        });
        this.setState({multiple});
        this.updateByAccount(multiple)
    }

    updateByAccount(accounts){
        this.getAvailableBalance(accounts);
        this.getTotalIncomesAndExpenses(accounts);
    }

    getAvailableBalance (accounts){
        Meteor.call('statistics.availableBalance', {accounts}, (err, ab) => {
            if(ab){
                this.setState({
                    availableBalance: ab
                })
            }else{
                this.setState({
                    active: true,
                    barMessage: err.reason,
                    barIcon: 'error_outline',
                    barType: 'cancel'
                });
            }
        });
    }

    getTotalIncomesAndExpenses (accounts, filterBy, range){
        let date = this.filterByDate(filterBy || this.state.filterBy, range);
        Meteor.call('statistics.totalIncomesAndExpenses', {accounts, date}, (err, totals) => {
            if(totals){
                this.setState({
                    totalIncomes: totals.incomes,
                    totalExpenses: totals.expenses
                })
            }else{
                this.setState({
                    active: true,
                    barMessage: err.reason,
                    barIcon: 'error_outline',
                    barType: 'cancel'
                });
            }
        });
    }

    handleMultipleChange (value) {
        this.setState({multiple: value});
        this.updateByAccount(value)
    }

    filterItem (account) {
        const containerStyle = {
            display: 'flex',
            flexDirection: 'row'
        };

        const contentStyle = {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 2
        };

        return (
            <div style={containerStyle}>
                <div style={contentStyle}>
                    <strong>{account.name}</strong>
                </div>
            </div>
        );
    }

    onChange (val, e) {
        this.setState({[e.target.name]: val});
        this.getTotalIncomesAndExpenses(this.state.multiple, e.target.name == 'filterBy' ? val : null, {[e.target.name]: val});
    }

    accounts(){
        let accounts = {};
        this.props.accounts.forEach((account) => {
            accounts[account._id] = account.name;
        });
        return accounts;
    }

    filters(){
        return [
            {
                name: 'Today',
                value: 'day'
            },
            {
                name: 'This Week',
                value: 'week'
            },
            {
                name: 'This Month',
                value: 'month'
            },
            {
                name: 'Last Month',
                value: 'months'
            },
            {
                name: 'This Year',
                value: 'year'
            },
            {
                name: 'Date Range',
                value: 'range'
            }
        ];
    }

    generatePdf(report){

        let params = {
            multiple : this.state.multiple,
            filterBy : this.state.filterBy,
            date : this.filterByDate(this.state.filterBy, {}),
            report : report
        };

        Meteor.call('statistics.generateReport', {params } , function(err, res){
            if (err) {
                console.error(err);
            } else if (res) {
                window.open("data:application/pdf;base64, " + res);
            }
        })
    }

    renderDateRange(){
        let dropDowns = (
            <div className='dashboard-dropdown'>
                <DatePicker
                    label='Date From'
                    name='dateFrom'
                    onChange={this.onChange.bind(this)}
                    value={this.state.dateFrom}
                    />

                <DatePicker
                    label='Date To'
                    name='dateTo'
                    onChange={this.onChange.bind(this)}
                    value={this.state.dateTo}
                    />
            </div>
        );
        return (
            this.state.filterBy == 'range' ?  dropDowns : null
        )
    }
    render() {
        return (
            <div style={{ flex: 1, padding: '0 1.8rem 1.8rem 0', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Autocomplete
                        className='dashboard-autocomplete'
                        direction='down'
                        name='multiple'
                        onChange={this.handleMultipleChange.bind(this)}
                        label='Filter By Account'
                        source={this.accounts()}
                        value={this.state.multiple}
                        />
                    <Card className='dashboard-card'>
                        <CardTitle
                            title={'' + this.formatNumber(this.state.availableBalance)}
                            subtitle='Available Balance'
                            />
                    </Card>
                    <Dropdown
                        className='dashboard-dropdown'
                        auto={false}
                        source={this.filters()}
                        name='filterBy'
                        onChange={this.onChange.bind(this)}
                        label='Filter By'
                        value={this.state.filterBy}
                        template={this.filterItem}
                        required
                        />

                    {this.renderDateRange()}

                    <div className='dashboard-card-group'>
                        <Card className='card'>
                            <CardTitle
                                title={'' + this.formatNumber(this.state.totalIncomes)}
                                subtitle='Total Incomes'
                                />
                        </Card>
                        <Card className='card'>
                            <CardTitle
                                title={'' + this.formatNumber(this.state.totalExpenses)}
                                subtitle='Total Expenses'
                                />
                        </Card>
                        <Card className='card'>
                            <CardTitle
                                title={'' + this.formatNumber(this.state.totalIncomes  - this.state.totalExpenses)}
                                subtitle='Remaining Amount'
                                />
                        </Card>
                    </div>
                    <div className='pdf-generator'>
                        {(!this.state.totalIncomes ||
                            <div className='report-btn' onClick={this.generatePdf.bind(this, 'incomes')}>
                                <Button icon='add' label='Income Report' raised primary />
                            </div>
                        )}
                        {(!this.state.totalExpenses ||
                            <div className='report-btn' onClick={this.generatePdf.bind(this, 'expenses')}>
                                <Button icon='add' label='Expences Report' raised primary />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

DashboardPage.propTypes = {
    accounts: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('accounts');

    return {
        accounts: Accounts.find({}).fetch()
    };
}, DashboardPage);
