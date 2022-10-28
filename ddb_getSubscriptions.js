var AWS = require('aws-sdk');
const config = require('./config.js');
AWS.config.update(config.aws_remote_config);

var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

module.exports.getSubscriptions = (userName) => {
    const promise = new Promise((resolve, reject) => {
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
                reject(err);
            } else {
                let res = [];
                let count = 0;
                if (typeof data.Items[0].subscriptions != 'undefined') {
                    if (data.Items[0].subscriptions.L.length != 0) {
                        data.Items[0].subscriptions.L.forEach(element => {
                            getURL(element.M.Title.S).then(url => {
                                count += 1;
                                element.M['url'] = url;
                                res.push(element.M);
                                // Will resolve when all items complete
                                // counter-acts async behaviour
                                if (count === data.Items.length) {
                                    resolve(res);
                                }
                            });
                        });
                    } else {
                        resolve(res);
                    }
                } else {
                    resolve(res);
                }


            }
        });
    })
    return promise
};