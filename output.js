module.exports = {
  "rid": "test_harness",
  "meta": {
    "use": [{
        "kind": "module",
        "rid": "manage_sensors",
        "alias": "manage_sensors"
      }],
    "shares": ["test"],
    "provides": ["test"]
  },
  "global": async function (ctx) {
    ctx.scope.set("manager_eci", "84WrQKhXSQTEkqTnA3xeAC");
    ctx.scope.set("sensor_id", "test");
    ctx.scope.set("sensor_id2", "test2");
    ctx.scope.set("post_url_start", "http://localhost:8080/sky/cloud/");
    ctx.scope.set("post_url_end", "/wovyn/process_heartbeat");
    ctx.scope.set("get_url_start", "http://localhost:8080/sky/event/");
    ctx.scope.set("create_sensor", ctx.mkFunction(["id"], async function (ctx, args) {
      ctx.scope.set("id", args["id"]);
      return await ctx.applyFn(await ctx.modules.get(ctx, "http", "post"), ctx, {
        "0": await ctx.applyFn(ctx.scope.get("+"), ctx, [
          await ctx.applyFn(ctx.scope.get("+"), ctx, [
            ctx.scope.get("get_url_start"),
            ctx.scope.get("manager_eci")
          ]),
          "/sensor/new_sensor"
        ]),
        "form": { "sensor_id": ctx.scope.get("id") }
      });
    }));
  },
  "rules": {
    "test": {
      "name": "test",
      "select": {
        "graph": { "test": { "sensor": { "expr_0": true } } },
        "state_machine": {
          "start": [[
              "expr_0",
              "end"
            ]]
        }
      },
      "body": async function (ctx, runAction, toPairs) {
        ctx.scope.set("test", true);
        var fired = ctx.scope.get("test");
        if (fired) {
          await runAction(ctx, void 0, "send_directive", [
            "test",
            { "sensor_id": "test" }
          ], []);
        }
        if (fired)
          ctx.emit("debug", "fired");
        else
          ctx.emit("debug", "not fired");
        if (fired) {
          await ctx.raiseEvent({
            "domain": "sensor",
            "type": "new_sensor",
            "attributes": { "sensor_id": ctx.scope.get("sensor_id") },
            "for_rid": undefined
          });
          await ctx.raiseEvent({
            "domain": "sensor",
            "type": "new_sensor",
            "attributes": { "sensor_id": ctx.scope.get("sensor_id2") },
            "for_rid": undefined
          });
          await ctx.raiseEvent({
            "domain": "test",
            "type": "sensor_temperature",
            "attributes": await ctx.modules.get(ctx, "ent", "sensors"),
            "for_rid": undefined
          });
          await ctx.modules.set(ctx, "ent", "allTemperatures", await ctx.applyFn(ctx.scope.get("klog"), ctx, [
            await ctx.applyFn(await ctx.modules.get(ctx, "manage_sensors", "getAllTemperatures"), ctx, []),
            "allTemperatures"
          ]));
          await ctx.raiseEvent({
            "domain": "test",
            "type": "sensor_create",
            "attributes": { "sensor_id": ctx.scope.get("sensor_id") },
            "for_rid": undefined
          });
          await ctx.raiseEvent({
            "domain": "test",
            "type": "sensor_create",
            "attributes": { "sensor_id": ctx.scope.get("sensor_id2") },
            "for_rid": undefined
          });
          await ctx.modules.set(ctx, "ent", "sensors", await ctx.applyFn(await ctx.modules.get(ctx, "manage_sensors", "sensors"), ctx, []));
          await ctx.raiseEvent({
            "domain": "test",
            "type": "test_sensor_temperature",
            "attributes": await ctx.modules.get(ctx, "ent", "events"),
            "for_rid": undefined
          });
          await ctx.raiseEvent({
            "domain": "sensor",
            "type": "unneeded_sensor",
            "attributes": { "sensor_id": ctx.scope.get("sensor_id") },
            "for_rid": undefined
          });
          await ctx.raiseEvent({
            "domain": "sensor",
            "type": "unneeded_sensor",
            "attributes": { "sensor_id": ctx.scope.get("sensor_id2") },
            "for_rid": undefined
          });
        }
      }
    },
    "test_create_sensor": {
      "name": "test_create_sensor",
      "select": {
        "graph": { "test": { "sensor_create": { "expr_0": true } } },
        "state_machine": {
          "start": [[
              "expr_0",
              "end"
            ]]
        }
      },
      "body": async function (ctx, runAction, toPairs) {
        ctx.scope.set("sensor_id", await ctx.applyFn(await ctx.modules.get(ctx, "event", "attr"), ctx, ["sensor_id"]));
        var fired = true;
        if (fired) {
          await runAction(ctx, void 0, "create_sensor", [ctx.scope.get("sensor_id2")], []);
        }
        if (fired)
          ctx.emit("debug", "fired");
        else
          ctx.emit("debug", "not fired");
      }
    },
    "test_sensor_temperature": {
      "name": "test_sensor_temperature",
      "select": {
        "graph": { "test": { "sensor_temperature": { "expr_0": true } } },
        "state_machine": {
          "start": [[
              "expr_0",
              "end"
            ]]
        }
      },
      "body": async function (ctx, runAction, toPairs) {
        ctx.scope.set("eci", await ctx.applyFn(ctx.scope.get("klog"), ctx, [
          await ctx.applyFn(ctx.scope.get("get"), ctx, [
            await ctx.modules.get(ctx, "ent", "sensors"),
            [ctx.scope.get("sensor_id")]
          ]),
          "Temperature ECI"
        ]));
        var fired = true;
        if (fired) {
          await runAction(ctx, "http", "post", {
            "0": await ctx.applyFn(ctx.scope.get("+"), ctx, [
              await ctx.applyFn(ctx.scope.get("+"), ctx, [
                ctx.scope.get("post_url_start"),
                ctx.scope.get("eci")
              ]),
              ctx.scope.get("post_url_end")
            ]),
            "form": { "genericThing": { "data": { "temperature": { "temperatureF": 71 } } } }
          }, []);
        }
        if (fired)
          ctx.emit("debug", "fired");
        else
          ctx.emit("debug", "not fired");
      }
    }
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXNDb250ZW50IjpbXX0=
