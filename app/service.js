var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;

const connString = process.argv[2] || process.env.connectionString;
var registry = Registry.fromConnectionString(connString);
var client = Client.fromConnectionString(connString);

var params = {
    fwPackageUri: 'https://secureurl'
};

var methodName = "turnOn";


var methodParams = {
    methodName: methodName,
    payload: params,
    timeoutInSeconds: 30
};

client.invokeDeviceMethod("ds1", methodParams, function (err, result) {
    if (err) {
        console.error('Could not start the firmware update on the device: ' + err.message)
    }

    console.log(result);
});