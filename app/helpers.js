module.exports = {
    // Helper function to print results for an operation
    printErrorFor: function (op) {
        return function printError(err) {
            if (err) console.log(op + ' error: ' + err.toString());
        };
    }
}

