ruleset manage_sensors {

	meta {
		use module io.picolabs.wrangler alias wrangler
		shares __testing, sensors, getAllTemperatures
		provides getAllTemperatures, sensors
	}

	global {
		default_location = "pandora"
		default_sms = "19134019979"
		default_threshold = 80

		getAllTemperatures = function() {
			ent:sensors.map(function(eci, sensor_id) {
				eci = eci.klog("getAllTemperatures eci").head()
				sensor_id = sensor_id.klog("sensor_id").head()
				wrangler:skyQuery(eci, "temperature_store", "temperatures", {})
			})
		}

		getChildren = function() {
			wrangler:children()
		}

		nameFromID = function(name) {
			"Sensor " + name + " Pico"
		}

		sensors = function() {
			ent:sensors
		}

		__testing = { 	"queries": [
							{"name": "getAllTemperatures", "args": []}
						],
						"events": [ 
									{ "domain": "sensor", "type": "new_sensor", "attrs": [ "sensor_id" ] }, 
									{ "domain": "sensor", "type": "unneeded_sensor", "attrs": ["sensor_id"] } 
								] 
		}
	}

	rule create_sensor {
		select when sensor new_sensor

		pre {
			sensor_id = event:attr("sensor_id")
			exists = ent:sensors.keys() >< sensor_id
			eci = meta:eci
		}
		
		if exists then
			send_directive("sensor_ready", {"sensor_id":sensor_id})
		notfired {
			ent:sensors := ent:sensors.defaultsTo({}).put([sensor_id], eci)
			raise wrangler event "child_creation"
				attributes { "name": nameFromID(sensor_id), "color": "#ffff00", "sensor_id": sensor_id, "rids": ["sensor_profile", "wovyn_base", "temperature_store"] }
		}
	}

	rule initialize_sensor_profile {
		select when wrangler child_initialized

		pre {
			sensor_id = event:attr("sensor_id")
			exists = ent:sensors >< sensor_id
			eci = event:attr("eci").klog("SETTING ECI")
		}

		if exists then
			event:send(
				{
					"eci": eci, "eid": "initialize-sensor-profile",
					"domain": "sensor", "type": "profile_updated",
					"attrs": { "location": default_location, "name": section_id, "sms": default_sms, "high_temperature": default_threshold }
				})
		fired {
			ent:sensors := ent:sensors.defaultsTo({}).put([sensor_id], eci)
		}
	}

	rule delete_sensor {
		select when sensor unneeded_sensor
		
		pre {
			sensor_id = event:attr("sensor_id").klog("sensor_id").head()
			exists = ent:sensors.keys() >< sensor_id
			child_to_delete = nameFromID(sensor_id)
		}

		if exists then
			send_directive("deleting_sensor", {"sensor_id":sensor_id})
		fired {
			raise wrangler event "child_deletion"
				attributes {"name": child_to_delete}
			ent:sensors := ent:sensors.delete([sensor_id])
		}
	}
}
