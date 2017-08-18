exports.deviceMetaData = (deviceId, params) => {
  const deviceMetaData = {
    DeviceInfo: {
        'DeviceID': deviceId,
        'HubEnabledState': 1,
        'IsSimulatedDevice': 1,
        'CreatedTime': '2015-09-21T20:28:55.5448990Z',
        'DeviceState': 'normal',
        'UpdatedTime': null,
        'Manufacturer': 'Contoso Inc.',
        'ModelNumber': 'MD-909',
        'SerialNumber': 'SER9090',
        'FirmwareVersion': '1.10',
        'Platform': 'node.js',
        'Processor': 'ARM',
        'InstalledRAM': '64 MB',
        'Latitude': 47.617025,
        'Longitude': -122.191285
    }
  };

  return Object.assign({}, deviceMetaData, params || {})
}