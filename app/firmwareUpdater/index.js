const url = require('url');
const downloader = require('./downloader');

module.exports = class FirmwareUpdater {
    constructor(client, options) {
        this.client = client;
        this.options = options;
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
            .then(_ => downloader.download(fwPackageUri, this.options.downloadOpts))
            .then(fileLocation => this.sendDownloadedReport())
            .then(_ => this.sendApplyingReport())
            .then(_ => this.applyImage())
            .then(_ => this.sendAppliedReport())
            .then(_ => {
                // complete
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

}


