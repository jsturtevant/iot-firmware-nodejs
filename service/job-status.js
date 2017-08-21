var uuid = require('uuid');
var JobClient = require('azure-iothub').JobClient;
var Registry = require('azure-iothub').Registry;

const connString = process.argv[2] || process.env.connectionString;
var jobStatus = process.argv[3] || "scheduled"

var jobClient = JobClient.fromConnectionString(connString);



const query = jobClient.createQuery("scheduleDeviceMethod",jobStatus);

var onResults = function (err, results) {
    if (err) {
        console.error('Failed to fetch the results: ' + err.message);
    } else {
        if (results && results.length) {
            // Do something with the results
            results.forEach(function (job) {
                console.log(job.status);
                console.log(job);
            });
        }else{
var jobStatus = process.argv[3] || "scheduled"
            console.log("no jobs of status: " + jobStatus);
        }

        if (query.hasMoreResults) {
            query.next(onResults);
        }
    }
};

 query.next(onResults);