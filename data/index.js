'use strict';

const _ = require('lodash'),
    accounts = require('./accounts.json');

const userCount = 30;
const producerCount = accounts.producers.length;
const eosPerUser = parseInt(1000000000 / userCount, 10);
const delegatePerUser = parseInt(eosPerUser * 0.4, 10);
const users = _.slice(accounts.users, 0, userCount);
const ram = 10;
const stake_cpu = 20;
const stake_net = 20;
const create = 10000000000;
const issue = 1000000000 + ram * (userCount + producerCount) + stake_cpu * (userCount + producerCount) + stake_net * (userCount + producerCount);

const systemToken = {
    create : `${create}.0000 EOS`,
    issue : `${issue + 10000000}.0000 EOS`
};

const systemAccounts = [
    {creator : 'eosio', name : 'eosio.bpay', owner : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV', active : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'},
    {creator : 'eosio', name : 'eosio.vpay', owner : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV', active : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'},
    {creator : 'eosio', name : 'eosio.msig', owner : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV', active : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'},
    {creator : 'eosio', name : 'eosio.names', owner : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV', active : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'},
    {creator : 'eosio', name : 'eosio.ram', owner : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV', active : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'},
    {creator : 'eosio', name : 'eosio.ramfee', owner : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV', active : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'},
    {creator : 'eosio', name : 'eosio.saving', owner : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV', active : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'},
    {creator : 'eosio', name : 'eosio.stake', owner : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV', active : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'},
    {creator : 'eosio', name : 'eosio.token', owner : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV', active : 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'},
];

const regProducers = _.map(accounts.producers, (producer) => {
    return {producer : producer.name, producer_key : producer.pub, url : 'https://portal.eoseoul.io', location : 0};
});

const newProdAccounts = _.map(accounts.producers, (producer) => {
    return {creator : 'eosio', name : producer.name, owner : producer.pub, active : producer.pub};
});

const newEosAccounts = _.map(users, (user) => {
    return {creator : 'eosio', name : user.name, owner : user.pub, active : user.pub};
});

const transfers = _.map(users, (user) => {
    return {from : 'eosio', to : user.name, quantity : `${eosPerUser}.0000 EOS`,  memo : 'testnet~'};
});

const buyRams = _.map(users, (user) => {
    return {payer : user.name, receiver : user.name, quant : '50.0000 EOS'};
});

const newAccountBuyRam = {payer : 'eosio', receiver : '', quant : `${ram}.0000 EOS`};
const newAccountDelegate = {from : 'eosio', receiver : '', stake_net_quantity : `${stake_net}.0000 EOS`, stake_cpu_quantity : `${stake_cpu}.0000 EOS`, transfer : 1};

const delegates = _.map(users, (user) => {
    return {from : user.name, receiver : user.name, stake_net_quantity : `${delegatePerUser}.0000 EOS`, stake_cpu_quantity : `${delegatePerUser}.0000 EOS`, transfer : 0};
});

const votes = _.map(users, (user, index) => {
    const producers = _.map(accounts.producers, (producer) => {
        return producer.name;
    });
    const seed = _.random(10);
    return {voter : user.name, proxy : '', producers: _.slice(producers, seed, seed + 20)};
});

function makeAuth(account, permission, parent, controller) {
    return {
        'account': account,
        'permission': permission,
        'parent': parent,
        'auth': {
            'threshold': 1, 'keys': [], 'waits': [],
            'accounts': [{
                'weight': 1,
                'permission': {'actor': controller, 'permission': 'active'}
            }]
        }
    };
}

const authes = (() => {
    const authes = [];
    authes.push(makeAuth('eosio', 'owner', '', 'eosio.prods'));
    authes.push(makeAuth('eosio', 'active', 'owner', 'eosio.prods'));
    _.forEach(systemAccounts, (account) => {
        let ownerAuth = makeAuth(account.name, 'owner', '', 'eosio');
        let activeAuth = makeAuth(account.name, 'active', 'owner', 'eosio');
        authes.push(ownerAuth);
        authes.push(activeAuth);
    });
    return authes;
})();

const committees = [{
    committeeman : 'committeeaaa',
    category : 'emergency',
    is_oversight : 1
}, {
    committeeman : 'committeeaab',
    category : 'watchman',
    is_oversight : 1
}];

const reviewers = [{
    reviewer : 'revieweraaaa',
    committee : 'committeeaaa',
    first_name : 'Thomas',
    last_name : 'Do'
}, {
    reviewer : 'revieweraaab',
    committee : 'committeeaaa',
    first_name : 'Thomas',
    last_name : 'Cox'
}];

const proposers = [{
    account : 'proposeraaaa',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaab',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaac',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaad',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaae',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaaf',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaag',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaah',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaai',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaaj',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaak',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaal',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaam',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaan',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaao',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaap',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}, {
    account : 'proposeraaaq',
    first_name : 'Thomas',
    last_name : 'Do',
    img_url : 'http://www.google.com',
    bio : 'hi~',
    country : 'KR',
    telegram : '@yepp4you',
    website : 'http://www.block.one',
    linkedin : 'thomas-do-01911516a',
}];

const proposals = _.map(proposers, (proposer) => {
    return {
        proposer : proposer.account,
        committee : 'committeeaaa',
        subcategory : 1,
        title : `wps project title ${proposer}`,
        summary : 'wps proejct summary',
        project_img_url : 'http://www.google.com',
        description : 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
        roadmap : 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
        duration : 30,
        members : ['yepp4you1', 'yepp4you2', 'yepp4you3'],
        funding_goal : '10.0000 EOS'
    };
});

module.exports = exports = {
    systemToken,
    accounts,
    systemAccounts,
    regProducers,
    newProdAccounts,
    newEosAccounts,
    transfers,
    buyRams,
    newAccountBuyRam,
    newAccountDelegate,
    delegates,
    votes,
    authes,
    committees,
    reviewers,
    proposers,
    proposals
};
