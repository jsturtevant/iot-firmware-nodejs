az iot hub policy create --hub-name $1 -n devicetwin --permissions RegistryRead ServiceConnect
az iot hub policy create --hub-name $1 -n jobs --permissions RegistryWrite ServiceConnect
