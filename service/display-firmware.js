var Registry = require('azure-iothub').Registry;

const device = process.argv[2] || "ds1";
const connString = process.argv[3] || process.env.connectionString;
var registry = Registry.fromConnectionString(connString);


function displayFirmwareUpdateStatus() {
  registry.getTwin(device, function(err, twin){
    if (err) {
      console.log("error: " + err)
    } else {
      // Output the value of twin reported properties, which includes the firmwareUpdate details
      console.log(twin.properties.reported.iothubDM.firmwareUpdate);
    }
  });
}

setInterval(displayFirmwareUpdateStatus, 500);