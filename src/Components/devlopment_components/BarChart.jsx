import Chart from "react-apexcharts";
// import "./BarChart.css";

export default function BarChart({ title, x, series, yTitle }) {

  // Convert values to numbers
  const safeSeries = series?.map(s => ({
    ...s,
    data: s.data?.map(v => Number(v))
  }));

  const options = {
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      animations: { enabled: false },

      toolbar: {
        show: true
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
      categories: x,   // for bar chart normally categories instead of datetime
      title: {
        text: "Time"
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