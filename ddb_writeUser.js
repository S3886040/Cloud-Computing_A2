const AWS = require('aws-sdk');
const config = require('./config.js');
AWS.config.update(config.aws_remote_config);

var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });


module.exports.addUser = (userName, email, password) => {
    const promise = new Promise((resolve, reject) => {
        var params = {
            TableName: 'login',
            Item: {
                'user_name': { S: userName },
                'email': { S: email },
                'password': { S: password }
            }
        };

        ddb.putItem(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    })
    return promise

}
