const AWS = require('aws-sdk');
const config = require('./config.js');
AWS.config.update(config.aws_remote_config);

const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const s3 = new AWS.S3({});

module.exports.queryMusicTable = (artist, title, year) => {
    const promise = new Promise((resolve, reject) => {
        let params = {
            ExpressionAttributeValues: {
                ':a': { S: artist },
                ':t': { S: title },
                ':y': { S: year }
            },
            ProjectionExpression: 'Title, Artist, Annual_Time',
            FilterExpression: 'contains (Artist, :a) AND contains (Title, :t) AND contains (Annual_Time, :y)',
            TableName: 'Music'
        };
        ddb.scan(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                let res = [];
                let count = 0;
                if (data.Items.length != 0) {
                    data.Items.forEach(element => {
                        getURL(element.Title.S).then(url => {
                            count += 1;
                            element['url'] = url;
                            res.push(element);
                            if (count === data.Items.length) {
                                resolve(res);
                            }
                        });

                    });
                } else {
                    resolve(res);
                }
            }
        });
    })
    return promise
};

getURL = (title) => {
    const promise = new Promise((resolve, reject) => {
        var params = { Bucket: 's3886040-images', Key: 'images/' + title };
        s3.getSignedUrlPromise('getObject', params).then(url => {
            resolve(url);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    })
    return promise;
};