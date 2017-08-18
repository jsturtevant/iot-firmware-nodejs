'use strict';

const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;
const ConnectionString = require('azure-iot-device').ConnectionString;
const helpers = require('./helpers');
const message = require('./messageHandler');
const telemetry = require('./telemetry');
const twin = require('./twin');
const methods = require('./direct-methods');

const connString = process.argv[2] || process.env.connectionString;
const isTelemetryEnabled = process.argv[3] || '' === 'nt' ? false : true;
global.deviceId = ConnectionString.parse(connString).DeviceId;

// Create IoT Hub client
const client = Client.fromConnectionString(connString, Protocol);

const connect = function (err) {
    if (err) {
        printErrorFor('open')(err);
    } else {
        console.log('client connected.');

        client.getTwin(twin.twinHandler);

        client.on('message', message.messageHandler(client));
        client.onDeviceMethod('turnOn', methods.turnOn);
        client.onDeviceMethod('firmwareUpdate', methods.initiateUpdate);

        // start event data send routing
        if (isTelemetryEnabled) {
            console.log('telemetry enabled')
            var sendInterval = setInterval(telemetry.send(client), 1000);
        }

        // handle disconnect and errors.
        client.on('error', function (err) {
            helpers.printErrorFor('client')(err);
        });

        client.on('disconnect', function () {
            clearInterval(sendInterval);
            client.removeAllListeners();
            client.open(connect);
        });
    }
}

client.open(connect);