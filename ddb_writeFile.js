const AWS = require('aws-sdk');
const config = require('./config.js');
AWS.config.update(config.aws_remote_config);

var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const fs = require('fs');

let rawdata = fs.readFileSync('a2.json');
let data = JSON.parse(rawdata);

var params = {
    RequestItems: {
        "Music": [ ]
    }
};
let count = 0;
data.songs.forEach(song => {
    let obj = {
        PutRequest: {
            Item: {
                "Title": { "S": song.title },
                "Artist": { "S": song.artist },
                "Annual_Time": { "S": song.year },
                "web_url": { "S": song.web_url },
                "img_url": { "S": song.img_url }
            }
        }
    }
    params.RequestItems['Music'].push(obj);
    count += 1;
    if (count >= 25) {
        ddb.batchWriteItem(params, function (err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data);
            }
        });

        params = {
            RequestItems: {
                "Music": []
            }
        }; 
        count = 0;
    }
});



