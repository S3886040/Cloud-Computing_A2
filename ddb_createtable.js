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

const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

var params = {
	AttributeDefinitions: [
		{
			AttributeName: 'Title',
			AttributeType: 'S'
		}
	],
	KeySchema: [
		{
			AttributeName: 'Title',
			KeyType: 'HASH'
		}
	],
	ProvisionedThroughput: {
		ReadCapacityUnits: 1,
		WriteCapacityUnits: 10000
	},
	TableName: 'Music',
	StreamSpecification: {
		StreamEnabled: false
	}
};

ddb.createTable(params, function (err, data) {
	console.log("creating");
	if (err) {
		console.log("Error", err);
	} else {
		console.log("Table Created", data);
	}
});