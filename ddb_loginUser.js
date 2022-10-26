const AWS = require('aws-sdk');
const config = require('./config.js');
AWS.config.update(config.aws_remote_config);

const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

module.exports.getUser = (userName) => {
    const promise = new Promise((resolve, reject) => {
        let params = {
            ExpressionAttributeValues: {
                ':u': { S: userName },
            },
            KeyConditionExpression: 'user_name = :u',
            ProjectionExpression: 'user_name, password, email',
            TableName: 'login'
        };

        ddb.query(params, function (err, data) {
            if (err) {
                console.log("Error", err);
                reject(err);
            } else {
                let res = {};
                data.Items.forEach(function (element, index, array) {
                    res['password'] = element.password.S;
                    res['user_name'] = element.user_name.S;
                    res['email'] = element.email.S;
                });
                resolve(res);
            }
        });
    })
    return promise
};


