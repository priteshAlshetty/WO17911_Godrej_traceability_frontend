export const getDashboardData = async ({data }) => {
  // simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  

  return data = {
    

  "Anode_Mixer_Batch_ID": "AMB-74829",
  "Cathoode_Mixer_Batch_ID": "CMB-59301",
  "Cathode_Total_Cut_Count": 15230,
  "Cathode_Accepted_Cut_Count": 14980,
  "Cathode_Rejected_Cut_Count": 250,
  "Anode_Total_Cut_Count": 14875,
  "Anode_Accepted_Cut_Count": 14620,
  "Anode_Rejected_Cut_Count": 255,
  "Anode_Oven_Z1_Temp": 78.5,
  "Anode_Oven_Z2_Temp": 80.2,
  "Cathode_Oven_Z1_Temp": 76.9,
  "Cathode_Oven_Z2_Temp": 79.4,
  "Winding_Machine_Production": 14200,
  "Anode_Weighing_Accepted_Count": 14500,
  "Anode_Weighing_Rejected_Count": 120,
  "Cathode_Weighing_Accepted_Count": 14780,
  "Cathode_Weighing_Rejected_Count": 140,
  "Tab_to_terminal_Station_Production": 13950,
  "Canister_Station_Production": 13780,
  "Filling_Station_Production_Qty": 13650
}

};