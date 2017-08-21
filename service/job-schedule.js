var uuid = require('uuid');
var JobClient = require('azure-iothub').JobClient;

var deviceToUpdate = process.argv[2];
const connString = process.argv[3] || process.env.connectionString;

var jobClient = JobClient.fromConnectionString(connString);

var queryCondition = `deviceId IN ['${deviceToUpdate}']`;
var startTime = addMinutes(new Date(), 5);
var maxExecutionTimeInSeconds = 60;

var methodParams = {
    methodName: 'firmwareUpdate',
    payload: {
        fwPackageUri: 'https://secureurl'
    },
    responseTimeoutInSeconds: 15 // Timeout after 15 seconds if device is unable to process method
};

var methodJobId = uuid.v4();
console.log('scheduling Device Method job with id: ' + methodJobId);
jobClient.scheduleDeviceMethod(methodJobId,
    queryCondition,
    methodParams,
    startTime,
    maxExecutionTimeInSeconds,
    function (err) {
        if (err) {
            console.error('Could not schedule device method job: ' + err.message);
        } else {
            console.error('Scheduled device method job: ' + methodParams.methodName);
        }
    }
);

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}