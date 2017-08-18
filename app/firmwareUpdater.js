const url = require('url');

module.exports = {
    isConnectionValid: function (fwPackageUri = "") {
        const fwPackageUriObj = url.parse(fwPackageUri);

        // Ensure that the url is to a secure url
        // TODO: could also check cert was valid via public key pinning
        if (fwPackageUriObj.protocol !== 'https:') {
            return false;
        }

        return true;
    },
    initiateFirmwareUpdateFlow: function (fwPackageUri, callback) {
        console.log("firmware upgrade started")

        // async.waterfall([
        //     function (callback) {
        //         downloadImage(fwPackageUri, callback);
        //     },
        //     applyImage
        // ], function (err) {
        //     if (err) {
        //         console.error('Error : ' + err.message);
        //     }
        //     callback(err);
        // });
    }
}

// Function that implements the 'downloadImage' phase of the 
// firmware update process.
function downloadImage(fwPackageUriVal, callback) {
  var imageResult = '[Fake firmware image data]';
  
  async.waterfall([
    function (callback) {
      reportFWUpdateThroughTwin ({ 
        status: 'downloading',
        startedDownloadingTime: new Date().toISOString()
      }, 
      callback);
    },
    function (callback) {
      console.log("Downloading image from URI: " + fwPackageUriVal);
      
      // Replace this line with the code to download the image.  Delay used to simulate the download.
      setTimeout(function() { 
        callback(null); 
      }, 4000);
    },
    function (callback) {
      reportFWUpdateThroughTwin ({ 
        status: 'download complete',
        downloadCompleteTime : new Date().toISOString()
      }, 
      callback);
    },
  ],
  function(err) {
    if (err) {
      reportFWUpdateThroughTwin( { status : 'Download image failed' }, function(err) {
        callback(err);  
      })
    } else {
      callback(null, imageResult);
    }
  });
}

// Implementation for the apply phase, which reports status after 
// completing the image apply.
function applyImage(imageData, callback) {
  async.waterfall([
    function(callback) {
      reportFWUpdateThroughTwin ({ 
        status: 'applying',
        startedApplyingImage: new Date().toISOString()
      }, 
      callback);
    },
    function (callback) {
      console.log("Applying firmware image"); 

      // Replace this line with the code to download the image.  Delay used to simulate the download.
      setTimeout(function() { 
        callback(null);
      }, 4000);      
    },
    function (callback) {
      reportFWUpdateThroughTwin ({ 
        status: 'apply firmware image complete',
        lastFirmwareUpdate: new Date().toISOString()
      }, 
      callback);
    },
  ], 
  function (err) {
    if (err) {
      reportFWUpdateThroughTwin({ status : 'Apply image failed' }, function(err) {
        callback(err);  
      })
    }
    callback(null);
  })
}

// Helper function to update the twin reported properties.
// Used by every phase of the firmware update.
function reportFWUpdateThroughTwin(firmwareUpdateValue, callback) {
  var patch = {
      iothubDM : {
        firmwareUpdate : firmwareUpdateValue
      }
  };
  console.log(JSON.stringify(patch, null, 2));
  client.getTwin(function(err, twin) {
    if (!err) {
      twin.properties.reported.update(patch, function(err) {
        callback(err);
      });      
    } else {
      callback(err);
    }
  });
};