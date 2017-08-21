var Registry = require('azure-iothub').Registry;

const connString = process.argv[2] || process.env.connectionString;
var registry = Registry.fromConnectionString(connString);


var query = registry.createQuery("SELECT * FROM devices.jobs WHERE devices.jobs.deviceId = 'ds1' and devices.jobs.status = 'scheduled'", 100);
var onResults = function (err, results) {
    if (err) {
        console.error('Failed to fetch the results: ' + err.message);
    } else {
        if (results && results.length) {
            // Do something with the results
            results.forEach(function (job) {
                console.log(job.deviceId);
                console.log(job.status);
                console.log(job.startTimeUtc)
            });
        }else{
            console.log("no scheduled jobs");
        }

        if (query.hasMoreResults) {
            query.nextAsTwin(onResults);
        }
    }
};

query.nextAsTwin(onResults);