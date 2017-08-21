const url = require('url');
const async = require('async');

module.exports = class FirmwareUpdater {
    constructor(client) {
        this.client = client;
    }

    isConnectionValid(fwPackageUri = "") {
        const fwPackageUriObj = url.parse(fwPackageUri);

        // Ensure that the url is to a secure url
        // TODO: could also check cert was valid via public key pinning
        if (fwPackageUriObj.protocol !== 'https:') {
            return false;
        }

        return true;
    }

    initiateFirmwareUpdateFlow(fwPackageUri, callback) {
        console.log("firmware upgrade started")

        async.waterfall([
            async.apply(this.resetFirmware.bind(this), fwPackageUri),
            this.downloadImage.bind(this),
            this.applyImage.bind(this)
        ], function (err) {
            callback(err);
        });
    }

    resetFirmware(fwPackageUri, callback) {
        this.reportFWUpdateThroughTwin(null, function(){
            callback(null, fwPackageUri)
        });
    }

    // Function that implements the 'downloadImage' phase of the 
    // firmware update process.
    downloadImage(fwPackageUriVal, callback) {
        var imageResult = '[Fake firmware image data]';
        const self = this;

        async.waterfall([
            (callback) => {
                console.log("starting download...");

                self.reportFWUpdateThroughTwin({
                    status: 'downloading',
                    startedDownloadingTime: new Date().toISOString()
                },
                    callback);
            },
            callback => {
                console.log("Downloading image from URI: " + fwPackageUriVal);

                // Replace this line with the code to download the image.  Delay used to simulate the download.
                setTimeout(function () {
                    callback(null);
                }, 4000);
            },
            callback => {
                console.log("downloaded");

                self.reportFWUpdateThroughTwin({
                    status: 'download complete',
                    downloadCompleteTime: new Date().toISOString()
                },
                    callback);
            },
        ],
            err => {
                if (err) {
                    self.reportFWUpdateThroughTwin({ status: 'Download image failed' }, function (err) {
                        callback(err);
                    })
                } else {
                    callback(null, imageResult);
                }
            });
    }

    // Implementation for the apply phase, which reports status after 
    // completing the image apply.
    applyImage(imageResult, callback) {
        const self = this;

        async.waterfall([
            callback => {
                console.log("starting apply image...");

                self.reportFWUpdateThroughTwin({
                    status: 'applying',
                    startedApplyingImage: new Date().toISOString()
                },
                    callback);
            },
            callback => {
                console.log("Applying firmware image");

                // Replace this line with the code to apply image
                setTimeout(function () {
                    callback(null);
                    console.log("Applied.");
                }, 4000);
            },
            callback => {
                self.reportFWUpdateThroughTwin({
                    status: 'apply firmware image complete',
                    lastFirmwareUpdate: new Date().toISOString()
                },
                    callback);
            },
        ],
            err => {
                if (err) {
                    thiselfs.reportFWUpdateThroughTwin({ status: 'Apply image failed' }, function (err) {
                        callback(err);
                    })
                }
                callback(null);
            })
    }

    // Helper function to update the twin reported properties.
    // Used by every phase of the firmware update.
    reportFWUpdateThroughTwin(firmwareUpdateValue, callback) {
        var patch = {
            iothubDM: {
                firmwareUpdate: firmwareUpdateValue
            }
        };

        //console.log("sending patch: " + JSON.stringify(patch, null, 2));
        this.client.getTwin(function (err, twin) {
            if (!err) {
                twin.properties.reported.update(patch, function (err) {
                    callback(err);
                });
            } else {
                callback(null);
            }
        });
    }
}

