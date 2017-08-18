'use strict';

var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;

var connectionString = '';
var registry = Registry.fromConnectionString(connectionString);
var client = Client.fromConnectionString(connectionString);


var deviceToUpdate = process.argv[2];

var queryTwinFWUpdateReported = function() {
    registry.getTwin(deviceToUpdate, function(err, twin){
        if (err) {
          console.error('Could not query twins: ' + err.constructor.name + ': ' + err.message);
        } else {
          console.log((JSON.stringify(twin.properties.reported.iothubDM.firmwareUpdate)) + "\n");
        }
    });
};

var startFirmwareUpdateDevice = function() {
  var params = {
      fwPackageUri: 'https://secureurl'
  };

  var methodName = "firmwareUpdate";
  var payloadData =  JSON.stringify(params);

  var methodParams = {
    methodName: methodName,
    payload: payloadData,
    timeoutInSeconds: 30
  };

  client.invokeDeviceMethod(deviceToUpdate, methodParams, function(err, result) {
    if (err) {
      console.error('Could not start the firmware update on the device: ' + err.message)
    } 
  });
};

startFirmwareUpdateDevice();
setInterval(queryTwinFWUpdateReported, 500);