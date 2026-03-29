import React from 'react'
import { getDashboardData } from '../assets/api_integration/dashboard_homescreen_api_data'
// import { color } from 'echarts';

const Dashboard_homepage = () => {

  const [dashboardData, setDashboardData] = React.useState(null);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      const data = await getDashboardData({ data: {} });
      setDashboardData(data);
    };

    fetchDashboardData();
  }, []);

  const formatLabel = (key) => key.replaceAll("_", " ");

  const groups = [
  
    {
      title: "Cathode Cuts",
      color: "rgb(13 71 161 / 82%)",
      keys: [
        "Cathode_Total_Cut_Count",
        "Cathode_Accepted_Cut_Count",
        "Cathode_Rejected_Cut_Count"
      ]
    },
    {
      title: "Anode Cuts",
      color: "#3fb954",
      keys: [
        "Anode_Total_Cut_Count",
        "Anode_Accepted_Cut_Count",
        "Anode_Rejected_Cut_Count"
      ]
    },
    {
      title: "Oven Temps",
      color: "rgb(13 71 161 / 82%)",
      keys: [
        "Anode_Oven_Z1_Temp",
        "Anode_Oven_Z2_Temp",
        "Cathode_Oven_Z1_Temp",
        "Cathode_Oven_Z2_Temp"
      ]
    },
    {
      title: "Production",
      color: "rgb(227 79 68 / 80%)",
      keys: ["Winding_Machine_Production"]
    },
    {
      title: "Weighing",
      color: "rgb(13 71 161 / 82%)",
      keys: [
        "Anode_Weighing_Accepted_Count",
        "Anode_Weighing_Rejected_Count",
        "Cathode_Weighing_Accepted_Count",
        "Cathode_Weighing_Rejected_Count"
      ]
    },
    {
      title: "Final Stations",
      color: "#3fb954",
      keys: [
        "Tab_to_terminal_Station_Production",
        "Canister_Station_Production",
        "Filling_Station_Production_Qty"
      ]
    }
  ];

  return (<>
  <div className="base-info" style={{display:"flex", gap:"40px", padding:"20px"}}>
    <div style={{ padding: "10px", borderRadius: "5px",boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}><span style={{ fontWeight: "bold" }}>Anode Mixer Batch ID: </span>{dashboardData?.Anode_Mixer_Batch_ID}</div>
    <div style={{ padding: "10px", borderRadius: "5px",boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}><span style={{ fontWeight: "bold" }}>Cathode Mixer Batch ID: </span>{dashboardData?.Cathoode_Mixer_Batch_ID}</div>
  </div>
  <hr />
    <div style={{ padding: "20px 0px",backgroundColor:"#e3e0e0;" }}>
      {dashboardData ? (
        <div style={styles.container}>
          {groups.map((group, index) => (
            <div
              key={index}
              style={{ ...styles.card, background: group.color }}
            >
             <h3
  style={{
    fontSize: "30px",
   
    backgroundColor:
    group.title === "Production" ? "rgb(227 79 68)" :
      group.title === "Anode Cuts" ||
      group.title === "Final Stations"
        ? "rgb(25 159 48)"
        : "#0d47a1",
    // width: "100%",
    padding: "10px 0",
    paddingLeft: "16px",
    margin: "0"
  }}
>
  {group.title}
</h3>

              {group.keys.map((key) => (
                <div key={key} style={styles.row}>
                  <span>{formatLabel(key)}</span>
                  <strong>{dashboardData[key]}</strong>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div></>
    
  )
}

export default Dashboard_homepage;

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
    gap: "16px",
    color: "#ffffff",
   
  },
  card: {
    // borderRadius: "10px",
    padding: "0",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
     border:" 5px solid rgb(255, 255, 255)",
    
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "25px",
    padding: "6px 16px",
    borderBottom: "1px solid rgba(0,0,0,0.1)"
  }
};