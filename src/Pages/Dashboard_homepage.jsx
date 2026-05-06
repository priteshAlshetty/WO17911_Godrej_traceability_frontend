import React from 'react'
import { getDashboardData } from '../assets/api_integration/dashboard_homescreen_api_data'
// import { color } from 'echarts';
import './Dashboard_homepage.css';
import Chart from "react-apexcharts";

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

  
// ✅ Guard (important)
if (!dashboardData) return <div>Loading...</div>;

const comparisonBar = {
  series: [
    {
      name: "Anode",
      data: [
        dashboardData.Anode_Total_Cut_Count,
        dashboardData.Anode_Accepted_Cut_Count,
        dashboardData.Anode_Rejected_Cut_Count,
        dashboardData.Anode_Oven_Z1_Temp,
        dashboardData.Anode_Oven_Z2_Temp,
        dashboardData.Anode_Weighing_Accepted_Count,
        dashboardData.Anode_Weighing_Rejected_Count
      ]
    },
    {
      name: "Cathode",
      data: [
        dashboardData.Cathode_Total_Cut_Count,
        dashboardData.Cathode_Accepted_Cut_Count,
        dashboardData.Cathode_Rejected_Cut_Count,
        dashboardData.Cathode_Oven_Z1_Temp,
        dashboardData.Cathode_Oven_Z2_Temp,
        dashboardData.Cathode_Weighing_Accepted_Count,
        dashboardData.Cathode_Weighing_Rejected_Count
      ]
    }
  ],
  options: {
    chart: {
      type: "bar"
    },
    plotOptions: { 
      bar: {
        horizontal: false,
        columnWidth: "50%             "
      }
    },
    colors: ["#007bff", "#17cc3e"],
    xaxis: {
      categories: [
        "Total Cuts",
        "Accepted Cuts",
        "Rejected Cuts",
        "Weighing Accepted",
        "Weighing Rejected"
      ]
    },
    title: {
      text: "Anode vs Cathode Comparison"
    },
    dataLabels: {
      enabled: false  
    }
  }
};

// 🔹 Temperature Line Chart
const temperatureChart = {
  series: [
    {
      name: "Anode",
      data: [
        dashboardData.Anode_Oven_Z1_Temp,
        dashboardData.Anode_Oven_Z2_Temp
      ]
    },
    {
      name: "Cathode",
      data: [
        dashboardData.Cathode_Oven_Z1_Temp,
        dashboardData.Cathode_Oven_Z2_Temp
      ]
    }
  ],
  options: {
    chart: {
      type: "line"
    },
    stroke: {
      curve: "smooth"
    },
    xaxis: {
      categories: ["Zone 1", "Zone 2"]
    },
    title: {
      text: "Oven Temperature"
    }
  }
};

// 🔹 Efficiency Gauge
const cathodeEff =
  (dashboardData.Cathode_Accepted_Cut_Count /
    dashboardData.Cathode_Total_Cut_Count) *
  100;

const anodeEff =
  (dashboardData.Anode_Accepted_Cut_Count /
    dashboardData.Anode_Total_Cut_Count) *
  100;

const radialChart = {
  series: [
    parseFloat(cathodeEff.toFixed(2)),
    parseFloat(anodeEff.toFixed(2))
  ],
  options: {
    chart: {
      type: "radialBar"
    },
    labels: ["Cathode", "Anode"],
    plotOptions: {
      radialBar: {
        dataLabels: {
          value: {
            formatter: (val) => val + "%"
          }
        }
      }
    },
    title: {
      text: "Efficiency (%)"
    }
  }
};

return (
  <>
    <div className="anode-cathode-container">
      
      {/* Anode Section */}
      <div className="anode-container">
        
        <div className="anode-cuts">
          <h3>Anode Cuts</h3>
          <p>Total Cut Count: <span>{dashboardData?.Anode_Total_Cut_Count}</span></p>
          <p>Accepted Cut Count: <span>{dashboardData?.Anode_Accepted_Cut_Count}</span></p>
          <p>Rejected Cut Count: <span>{dashboardData?.Anode_Rejected_Cut_Count}</span></p>
        </div>

        <div className="oven-temp">
          <h3>Oven Temps</h3>
          <p>Anode Oven Z1 Temp: <span>{dashboardData?.Anode_Oven_Z1_Temp}</span></p>
          <p>Anode Oven Z2 Temp: <span>{dashboardData?.Anode_Oven_Z2_Temp}</span></p>
        </div>

        <div className="weighing">
          <h3>Weighing</h3>
          <p>Anode Accepted Count: <span>{dashboardData?.Anode_Weighing_Accepted_Count}</span></p>
          <p>Anode Rejected Count: <span>{dashboardData?.Anode_Weighing_Rejected_Count}</span></p>
        </div>

      </div>

      {/* Cathode Section */}
      <div className="cathode-container">

        <div className="cathode-cuts">
          <h3>Cathode Cuts</h3>
          <p>Total Cut Count: <span>{dashboardData?.Cathode_Total_Cut_Count}</span></p>
          <p>Accepted Cut Count: <span>{dashboardData?.Cathode_Accepted_Cut_Count}</span></p>
          <p>Rejected Cut Count: <span>{dashboardData?.Cathode_Rejected_Cut_Count}</span></p>
        </div>

        <div className="oven-temp">
          <h3>Oven Temps</h3>
          <p>Cathode Oven Z1 Temp: <span>{dashboardData?.Cathode_Oven_Z1_Temp}</span></p>
          <p>Cathode Oven Z2 Temp: <span>{dashboardData?.Cathode_Oven_Z2_Temp}</span></p>
        </div>

        <div className="weighing">
          <h3>Weighing</h3>
          <p>Cathode Accepted Count: <span>{dashboardData?.Cathode_Weighing_Accepted_Count}</span></p>
          <p>Cathode Rejected Count: <span>{dashboardData?.Cathode_Weighing_Rejected_Count}</span></p>
        </div>

      </div>

      <div className="other-container">
        <div className="others">
           <h3>Other</h3>
       < p>Winding Machine Production: <span>{dashboardData?.Winding_Machine_Production}</span></p>
        <p>Tab to Terminal Station Production: <span>{dashboardData?.Tab_to_terminal_Station_Production}</span></p>
        <p>Canister Station Production: <span>{dashboardData?.Canister_Station_Production}</span></p>
        <p>Filling Station Production Qty: <span>{dashboardData?.Filling_Station_Production_Qty}</span></p>
        </div>
       
      </div>

    </div>

    <div className="graph-section">
  <div style={{ display: "grid", gap: "20px" }}>
    
    <Chart
  options={comparisonBar.options}
  series={comparisonBar.series}
  type="bar"
  height={350}
/>


  </div>
</div>
  </>
);
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