const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const config = require('./config.js');
if (config.NODE_ENV == 'development') {
    AWS.config.update({
        region: "us-east-1",
        endpoint: 'http://localhost:8000'
    });
} else if (config.NODE_ENV == 'production') {
    AWS.config.update({
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        region: "us-east-1"
    });
};

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


