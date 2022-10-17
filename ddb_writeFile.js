const AWS = require('aws-sdk');
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
}

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
                "artist": { "S": song.artist },
                "year": { "N": song.year },
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



