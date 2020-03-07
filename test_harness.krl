ruleset test_harness {
	meta {
		use module manage_sensors
		shares test
		provides test
	}
	global {
		manager_eci = "84WrQKhXSQTEkqTnA3xeAC"
		sensor_id = "test"
		sensor_id2 = "test2"
		
		post_url_start = "http://localhost:8080/sky/cloud/"
		post_url_end = "/wovyn/process_heartbeat"

		get_url_start = "http://localhost:8080/sky/event/"
		

	}
	
	rule test {
		select when test sensor

		pre {
			test = true
		}

		if test then
			send_directive("test", {"sensor_id": "test"})
		fired {
			raise sensor event "new_sensor"
				attributes {"sensor_id":sensor_id}
			raise sensor event "new_sensor"
				attributes {"sensor_id":sensor_id2}
			
			raise test event "sensor_temperature"
				attributes ent:sensors


			ent:allTemperatures := manage_sensors:getAllTemperatures().klog("allTemperatures")

			raise test event "sensor_create"
				attributes {"sensor_id":sensor_id}
			raise test event "sensor_create"
				attributes {"sensor_id":sensor_id2}

			ent:sensors := manage_sensors:sensors()

			raise test event "test_sensor_temperature"
				attributes ent:events

			raise sensor event "unneeded_sensor"
				attributes {"sensor_id":sensor_id}

			raise sensor event "unneeded_sensor"
				attributes {"sensor_id":sensor_id2}
		}

	}

	rule test_create_sensor {
		select when test sensor_create

		pre {
			sensor_id = event:attr("sensor_id")
		}

		http:post(get_url_start + manager_eci + "/sensor/new_sensor", form = {
			"sensor_id":id
		 })	
	}

	rule test_sensor_temperature {
		select when test sensor_temperature

		pre {
			eci = ent:sensors[sensor_id].klog("Temperature ECI")
		}

		http:post(post_url_start + eci + post_url_end, form = {
					"genericThing": {
						"data": {
						"temperature": {
								"temperatureF": 71
							}
						}
					}
				})
		
	}
}
