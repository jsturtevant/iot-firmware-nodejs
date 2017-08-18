const metaData = require('./device-meta');

exports.twinHandler = function (err, twin) {
    if (err) {
        console.error('could not get twin');
    } else {
        console.log('twin created');

        // send initial twin reported
        var patch = metaData.deviceMetaData(deviceId);
        twin.properties.reported.update(patch, function (err) {
            if (err) throw err;
            console.log('twin state reported');
        });
    }
}