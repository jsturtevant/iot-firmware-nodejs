const helpers = require('./helpers')

exports.messageHandler = function (client) {
    return function (msg) {
        console.log('receive data: ' + msg.getData());

        try {
            var command = JSON.parse(msg.getData());
            if (command.Name === 'SetTemperature') {
                temperature = command.Parameters.Temperature;
                console.log('New temperature set to :' + temperature + 'F');
            }

            client.complete(msg, helpers.printErrorFor('complete'));
        }
        catch (err) {
            helpers.printErrorFor('parse received message')(err);
        }
    }
}