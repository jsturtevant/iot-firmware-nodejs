var uuid = require('uuid');
var JobClient = require('azure-iothub').JobClient;
var Registry = require('azure-iothub').Registry;

const connString = process.argv[2] || process.env.connectionString;
var jobId = process.argv[3];

var jobClient = JobClient.fromConnectionString(connString);


jobClient.getJob(jobId, function (err, result) {
    if (err) {
        console.error('Could not get job status: ' + err.message);
    } else {
        console.log('Job: ' + jobId + ' - status: ' + result.status);
        console.log(JSON.stringify(result, null, 2));
    }
});