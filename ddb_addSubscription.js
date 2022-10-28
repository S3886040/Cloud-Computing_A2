
var AWS = require('aws-sdk');
const config = require('./config.js');
AWS.config.update(config.aws_remote_config);

var docClient = new AWS.DynamoDB.DocumentClient()
var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

module.exports.addSubscription = (sub, userName) => {
    const promise = new Promise((resolve, reject) => {
        checkSubscription(sub.Title, userName).then(found => {
            if (!found) {
                let params = {
                    TableName: 'login',
                    Key: { user_name: userName },
                    UpdateExpression: 'SET #subs = list_append(if_not_exists(#subs, :empty_list), :object)',
                    ExpressionAttributeNames: {
                        '#subs': 'subscriptions'
                    },
                    ExpressionAttributeValues: {
                        ':object': [sub],
                        ':empty_list': []
                    }
                };
                docClient.update(params, function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            }
        });
    })
    return promise
};

checkSubscription = (title, userName) => {
    const promise = new Promise((resolve, reject) => {
        let found = false;
        let params = {
            ExpressionAttributeValues: {
                ':u': { S: userName },
            },
            KeyConditionExpression: 'user_name = :u',
            ProjectionExpression: 'user_name, subscriptions',
            TableName: 'login'
        };

        ddb.query(params, function (err, data) {
            if (err) {
                console.log("Error in check sub", err);
                reject(err);
            } else {
                data.Items.forEach(function (element) {
                    element.subscriptions.L.forEach(item => {
                        if (item.M.Title.S === title) {
                            found = true;
                        }
                    });
                });
                resolve(found);
            }
        });
    })
    return promise
};

