## Demo
Run three devices to show how jobs can be used to run a firmware upgrade on a subset of devices and report status through Device Twins.  Assumes you have already created a [Azure IoT Hub](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-create-using-cli).

### Pre-requisites
1. install `npm i -g iothub-explorer`
2. [Azure Cli 2.0](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

If on Windows use [Bash for Windows](https://msdn.microsoft.com/en-us/commandline/wsl/install_guide) or [Git Bash](https://git-for-windows.github.io/) to run the commands.

### 1. Create devices 

1. `. ./utils/login.sh <iothubowner-constring>`
2. `. ./utils/create-policy.sh <iothubname>`
3. `. ./utils/create-device.sh ds1`
4. `. ./utils/create-device.sh ds2`
5. `. ./utils/create-device.sh ds3`

### 2. Assign tags to devices 

1. `node service\tag-device.js <connstring for jobs permissions> ds1 US`
2. `node service\tag-device.js <connstring for jobs permissions> ds1 US`
3. `node service\tag-device.js <connstring for jobs permissions> ds1 Canada`

### 3. Start Devices

1. `node app\device.js <connstring ds1> nt`
2. `node app\device.js <connstring ds2> nt`
3. `node app\device.js <connstring ds3> nt`

### 4. Schedule a job 

1. `node service\job-schedule.js <connstring for jobs permissions> US`

# 5. Check the job status

1. `node service\job-status.js <connstring for jobs permissions>`
or
`node service\get-job.js <connstring for jobs permissions> <jobid>`

 
## credits
Source code has been adapted from samples at https://github.com/Azure/azure-iot-sdk-node/tree/master/device/samples under [MIT license](https://github.com/Azure/azure-iot-sdk-node/blob/master/LICENSE)