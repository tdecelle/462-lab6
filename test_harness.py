import json
import requests

manager_eci = "84WrQKhXSQTEkqTnA3xeAC"
event_base = "http://localhost:8080/sky/event/"
query_base = "http://localhost:8080/sky/cloud/"

create_end = "/5/sensor/new_sensor"
new_temperature_end = "/5/wovyn/heartbeat"
delete_end = "/5/sensor/unneeded_sensor"
all_temperature_end = "/manage_sensors/getAllTemperatures"

sensor_id_param = '?sensor_id='

sensor_id = 'test'
sensor_id_2 = 'test2'
genericThing = {'typeId':'2.1.2','typeName':'generic.simple.temperature','healthPercent':74.33,'heartbeatSeconds':5,'data':{'temperature':[{'name':'enclosure temperature','transducerGUID':'28D643230A00005D','units':'degrees','temperatureF':67.89,'temperatureC':19.94}]}}

create_result = requests.get(url = event_base + manager_eci + create_end + sensor_id_param + sensor_id)
create_result = requests.get(url = event_base + manager_eci + create_end + sensor_id_param + sensor_id_2)

eci = create_result.json()['directives'][0]['options']['pico']['eci']


temperature_add_result = requests.get(url = event_base + eci + new_temperature_end, json = {"genericThing": genericThing})


get_all_temperatures_result = requests.get(url = query_base + manager_eci + all_temperature_end)

print("Create 2 picos and getAllTemperatures test: " + str(len(get_all_temperatures_result.json()['test2']) == 1))

delete_result = requests.get(url = event_base + manager_eci + delete_end + sensor_id_param + sensor_id)
delete_result = requests.get(url = event_base + manager_eci + delete_end + sensor_id_param + sensor_id_2)
