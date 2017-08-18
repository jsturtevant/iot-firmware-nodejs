
const helpers = require('./helpers');
const Message = require('azure-iot-device').Message;

// Sensors data
let temperature = 50;
let humidity = 50;
let externalTemperature = 55;


exports.send = function (client) {
    return function () {
        temperature += generateRandomIncrement();
        externalTemperature += generateRandomIncrement();
        humidity += generateRandomIncrement();

        var data = JSON.stringify({
            'DeviceID': deviceId,
            'Temperature': temperature,
            'Humidity': humidity,
            'ExternalTemperature': externalTemperature
        });

        console.log('Sending device event data:\n' + data);
        client.sendEvent(new Message(data), helpers.printErrorFor('send event'));
    }
}

function generateRandomIncrement() {
    return ((Math.random() * 2) - 1);
}