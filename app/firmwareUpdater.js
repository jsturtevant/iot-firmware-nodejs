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
        if (fwPackageUriObj.protocol !== 'https:') {
            return false;
        }

        return true;
    }

    initiateFirmwareUpdateFlow(fwPackageUri, callback) {
        console.log("firmware upgrade started")

        this.resetFirmwareReport()
            .then(_ => this.sendDownloadingReport())
            .then(_ => this.download(fwPackageUri))
            .then(fileLocation => this.sendDownloadedReport())
            .then(_ => this.sendApplyingReport())
            .then(_ => this.applyImage())
            .then(_ => this.sendAppliedReport())
            .then(_ => {
                
                callback();
            })
            .catch(err => {
                console.log(err);
                this.sendErrorReport(err).then(_ => {
                    console.log("error reported.")
                }).catch(err => {
                    // should retry?
                    console.error("Could not send error report.")
                });

                callback(err);
            });
    }

    resetFirmwareReport() {
        // setting to null clears in reported property.
        return this.reportFWUpdateThroughTwin(null);
    }

    sendDownloadingReport() {
        return this.reportFWUpdateThroughTwin({
            status: 'downloading',
            startedDownloadingTime: new Date().toISOString()
        })
    }

    sendDownloadedReport() {
        return this.reportFWUpdateThroughTwin({
            status: 'download complete',
            downloadCompleteTime: new Date().toISOString()
        })
    }

    sendApplyingReport() {
        return this.reportFWUpdateThroughTwin({
            status: 'applying',
            startedApplyingImage: new Date().toISOString()
        })
    }

    sendAppliedReport() {
        return this.reportFWUpdateThroughTwin({
            status: 'apply complete',
            lastFirmwareUpdate: new Date().toISOString()
        });
    }

    sendErrorReport(err) {
        return this.reportFWUpdateThroughTwin({
            status: 'error',
            errorMessage: err,
            errorTime: new Date().toISOString()
        });
    }

    applyImage(fileLocation) {
        return new Promise(function (fulfill, reject) {
            setTimeout(function () {
                console.log("Applied.");
                fulfill();
            }, 4000);
        });
    }

    reportFWUpdateThroughTwin(firmwareUpdateValue) {
        const self = this;
        const patch = {
            iothubDM: {
                firmwareUpdate: firmwareUpdateValue
            }
        };

        return new Promise(function (fulfill, reject) {
            self.client.getTwin(function (err, twin) {
                if (err) {
                    return reject(err);
                }

                twin.properties.reported.update(patch, function (reportingErr) {
                    if (reportingErr) {
                        return reject(reportingErr);
                    }

                    return fulfill();
                });
            });
        });
    }

    // using pattern as described here http://hassansin.github.io/certificate-pinning-in-nodejs
    download(uriToFile) {

        // Embed valid fingerprints in the code
        const FINGERPRINTSET = [
            '49:DC:39:67:1C:5B:8C:C3:08:0F:77:5A:07:C2:BE:A5:B4:D9:DA:1A'
        ];

        const parsedUri = url.parse(uriToFile);

        var options = {
            hostname: parsedUri.hostname,
            port: 443,
            path: parsedUri.path,
            method: 'GET',
            //disable session caching
            agent: new https.Agent({
                maxCachedSessions: 0
            })
        };

        return new Promise(function (fulfill, reject) {

            var req = https.get(options, res => {
                res.on('data', d => {
                    const fileName = 'C:\\temp\\updates\\newfiles.zip';
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


