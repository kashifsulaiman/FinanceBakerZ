import { Meteor } from 'meteor/meteor';
import { Incomes } from '../../incomes/incomes.js';
import { Expenses } from '../../expences/expenses.js';

Meteor.publish('transactions', function(options) {
    let query = {owner: this.userId};
    options.accounts.length && (query['account'] = {$in: options.accounts});
    if(options.dateFilter){
        let dateQuery = {$gte: new Date(options.dateFilter.start), $lte: new Date(options.dateFilter.end)};
        query.$or = [{receivedAt: dateQuery}, {spentAt: dateQuery}];
    }
    let limits,
    incomes = Incomes.find(query, {sort: {receivedAt: -1}, limit: options.limit}).fetch(),
    expenses = Expenses.find(query, {sort: {spentAt: -1}, limit: options.limit}).fetch(),
    transactions = _.sortBy(incomes.concat(expenses), function(obj){return obj.receivedAt || obj.spentAt;}).reverse();
    transactions.length = options.limit;
    limits = _.countBy(transactions, function(obj) {return obj.receivedAt ? 'incomes': 'expenses';});
    return [
        Incomes.find(query, {sort: {receivedAt: -1}, limit: limits.incomes}),
        Expenses.find(query, {sort: {spentAt: -1}, limit: limits.expenses})
    ]
});