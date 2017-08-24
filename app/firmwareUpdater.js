const url = require('url');
const async = require('async');
const https = require('https');
const fs = require('fs');

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
        this.reportFWUpdateThroughTwin(null, function () {
            callback(null, fwPackageUri)
        });
    }

    // Function that implements the 'downloadImage' phase of the 
    // firmware update process.
    downloadImage(fwPackageUriVal, callback) {
        var fileDownloadLocation = '';
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

                const fwPackageUriObj = url.parse(fwPackageUriVal);
                self.download(fwPackageUriObj).then(fileLocation => {
                    console.log("file: " + fileLocation);
                    fileDownloadLocation = fileLocation;
                    callback(null);
                }).catch(err => {

                    callback(err);
                });
            },
            callback => {
                self.reportFWUpdateThroughTwin({
                    status: 'download complete',
                    downloadCompleteTime: new Date().toISOString()
                },
                    callback);
            },
        ],
            err => {
                if (err) {
                    console.log("Download image failed");
                    callback(err);
                    self.reportFWUpdateThroughTwin({ status: 'Download image failed' }, function (reportErr) {
                       if (reportErr) {
                            //TODO retry so we can report to the backend
                            console.log("was unable to report error");
                        }

                        console.log("reported");
                    });
                } else {
                    callback(null, fileDownloadLocation);
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
                    status: 'apply complete',
                    lastFirmwareUpdate: new Date().toISOString()
                },
                    callback);
            },
        ],
            err => {
                if (err) {
                    console.log("Apply image failed");
                    callback(err);
                    self.reportFWUpdateThroughTwin({ status: 'Apply image failed' }, function (reportErr) {
                        if (reportErr) {
                            //TODO retry so we can report to the backend
                            console.log("was unable to report error");
                        }

                        console.log("reported");
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

    download(url) {

        // Embed valid fingerprints in the code
        const FINGERPRINTSET = [
            '49:DC:39:67:1C:5B:8C:C3:08:0F:77:5A:07:C2:BE:A5:B4:D9:DA:1A'
        ];

        var options = {
            hostname: url.hostname,
            port: 443,
            path: url.path,
            method: 'GET',
            //disable session caching
            agent: new https.Agent({
                maxCachedSessions: 0
            })
        };

        return new Promise(function (fulfill, reject) {

            var req = https.get(options, res => {
                res.on('data', d => {
                    const fileName = process.env.HOME + 'newfile.js';
                    fs.writeFile(fileName, d, function (err) {
                        if (err) {
                            console.log("writefile: " + err);
                            return reject(err);
                        }

                        console.log("The file was saved!");
                        fulfill(fileName);
                    });
                });
            }).on('error', e => {
                console.error(e);
                reject(e);
            });

            req.on('socket', socket => {
                socket.on('secureConnect', () => {
                    var fingerprint = socket.getPeerCertificate().fingerprint;

                    // Check if certificate is valid
                    if (socket.authorized === false) {
                        req.emit('error', new Error(socket.authorizationError));
                        req.abort();
                        return reject(e);
                    }

                    // Match the fingerprint with our saved fingerprints
                    if (FINGERPRINTSET.indexOf(fingerprint) === -1) {
                        const err = new Error('Fingerprint does not match');
                        // Abort request, optionally emit an error event
                        req.emit('error', err);
                        req.abort();
                        return reject(err);
                    }
                });
            });

            req.end();
        });

    }
}


