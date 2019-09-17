const aws = require('aws-sdk');

aws.config.region = 'eu-central-1';
aws.config.accessKeyId = process.env.AMAZON_S3_ACCESS_KEY_ID;
aws.config.secretAccessKey = process.env.AMAZON_S3_SECRET_ACCESS_KEY;
aws.config.apiVersion = '2006-03-01';
