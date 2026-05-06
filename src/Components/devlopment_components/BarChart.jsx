import Chart from "react-apexcharts";
// import "./BarChart.css";

export default function BarChart({ title, x, series, yTitle }) {

  // Convert values to numbers - always return array
  const safeSeries = series?.map(s => ({
    ...s,
    data: s.data?.map(v => Number(v)) || []
  })) || [];

  // Convert x-axis to timestamps - always return array
  const safeX = x?.map(d => new Date(d).getTime()) || [];

  const options = {
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      animations: { enabled: false },

      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true
      },
      pan: {
        enabled: true,
        type: "x"
      },

      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4
      }
    },

    dataLabels: {
      enabled: false
    },

    title: {
      text: title,
      align: "left"
    },

    xaxis: {
      type: "datetime",
      categories: safeX,
      title: {
        text: "Time"
      },
      labels: {
        rotate: -45,
        rotateAlways: true,
        datetimeUTC: false
      }
    },

    yaxis: {
      title: {
        text: yTitle
      }
    },

    tooltip: {
      y: {
        formatter: function (value) {
          return Number(value).toFixed(2);
        }
      }
    }

  };

  return (
    <div className="chart-container">

      <h3>{title}</h3>

      <Chart
        options={options}
        series={safeSeries}
        type="bar"
        height={300}
      />

    </div>
  );
}