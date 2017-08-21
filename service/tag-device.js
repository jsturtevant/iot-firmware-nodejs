'use strict';
var iothub = require('azure-iothub');

const connString = process.argv[2] || process.env.connectionString;
const deviceToUpdate = process.argv[3];
const region = process.argv[4];


var registry = iothub.Registry.fromConnectionString(connString);

registry.getTwin(deviceToUpdate, function (err, twin) {
    if (err) {
        console.error(err.constructor.name + ': ' + err.message);
    } else {
        var patch = {
            tags: {
                location: {
                    region: region
                }
            }
        };

        twin.update(patch, function (err) {
            if (err) {
                console.error('Could not update twin: ' + err.constructor.name + ': ' + err.message);
            } else {
                console.log(twin.deviceId + ' twin updated successfully');
            }
        });
    }
});