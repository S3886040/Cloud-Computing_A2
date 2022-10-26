const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const fs = require('fs');


const config = require('./config.js');
AWS.config.update(config.aws_remote_config);
const s3 = new AWS.S3({});

let rawdata = fs.readFileSync('a2.json');
let data = JSON.parse(rawdata);

data.songs.forEach(song => {
    fetch(song.img_url)
        .then(res => {
            return s3.upload({
                Bucket: "s3886040-images",
                Key: song.title,
                Body: res.body,
                ContentType: 'image/jpg'
            }).promise();
        }).catch(err => {
            console.log(err, null);
        });
});


