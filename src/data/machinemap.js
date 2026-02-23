const MACHINE_MAP = {
  anodeThickness: {
    cell_main: [],
    battery_main: [],
    batch_main: [],
    electrode: ["electrode_id", "moisture", "thickness", "density"]
  },
  cathodeThickness: {
    cell_main: [],
    battery_main: [],
    batch_main: [],
    electrode: ["electrode_id", "moisture", "thickness", "density"]
  },
  phsAnode: {
    cell_main: [],
    battery_main: [],
    batch_main: ["batch_id", "ambient_temp", "Humidity"],
    electrode: []
  },
  anodeOven: {
    cell_main: [],
    battery_main: [],
    batch_main: [],
    electrode: ["electrode_id", "IR_temp_1", "IR_temp_2", "chain_speed", "zone_temp_1", "zone_temp_2", "anode_type"]
  },
  cathodeOven: {
    cell_main: [],
    battery_main: [],
    batch_main: [],
    electrode: ["electrode_id", "IR_temp_1", "IR_temp_2", "IR_temp_3", "chain_speed", "zone_temp_1", "zone_temp_2", "anode_type"]
  },
  powderHandling: {
    cell_main: [],
    battery_main: [],
    batch_main: ["batch_id", "zinc_emd", "BNB90", "zinc_emd", "MX25"],
    electrode: []
  },
  anodeMixer: {
    cell_main: [],
    battery_main: [],
    batch_main: ["batch_id", "mixing_time", "final_paste_temp", "max_current", "max_torque", "batch_size", "paste_moisture", "paste_density", "penetration", "laponite", "graphite_indium", "BNB90", "bismuth"],
    electrode: []
  },
  cathodeMixer: {
    cell_main: [],
    battery_main: [],
    batch_main: ["batch_id", "mixing_time", "final_paste_temp", "max_current", "max_torque", "batch_size", "paste_moisture", "paste_density", "penetration", "bismuth"],
    electrode: []
  },
  liquidHandling: {
    cell_main: [],
    battery_main: [],
    batch_main: ["batch_id", "water", "teflon", "MX25"],
    electrode: []
  },
  plc1: {
    cell_main: [],
    battery_main: [],
    batch_main: [],
    electrode: ["electrode_id", "weight"]
  },
  plc2: {
    cell_main: [],
    battery_main: [],
    batch_main: [],
    electrode: ["electrode_id", "weight"]
  },
  plc3: {
    cell_main: ["cell_id", "filling_datetime", "dry_weight", "filled_weight"],
    battery_main: ["battery_id", "Date_Time", "manufactured_timestamp"],
    batch_main: [],
    electrode: []
  },
  windingMachine: {
    cell_main: [],
    battery_main: [],
    batch_main: [],
    electrode: []
  },
  EOF: {
    cell_main: [],
    battery_main: [],
    batch_main: [],
    electrode: []
  }
};

export default MACHINE_MAP;
