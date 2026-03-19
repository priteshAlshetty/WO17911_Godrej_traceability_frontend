import Chart from "react-apexcharts";
import './MeterChart.css';

export default function MeterChart({ title, x, series, yTitle }) {

  // ✅ Convert series values to numbers to avoid NaN errors
  const safeSeries = series?.map(s => ({
    ...s,
    data: s.data?.map(v => Number(v))
  }));

  // ✅ Ensure x-axis dates are valid
  const safeX = x?.map(d => new Date(d).getTime());

  const options = {

    chart: {
      type: "area",
      height: 350,
      stacked: false,
      animations: { enabled: false }, // prevents SVG path animation errors

      zoom: {
        type: "x",
        enabled: true,
        autoScaleYaxis: true
      },

      toolbar: {
        show: true,
        autoSelected: "zoom"
      }
    },

    dataLabels: {
      enabled: false
    },

    markers: {
      size: 0
    },

    title: {
      text: title,
      align: "left"
    },

    stroke: {
      curve: "straight",
      width: 3
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100]
      }
    },

    xaxis: {
      type: "datetime",
      categories: safeX
    },

    yaxis: {
      title: {
        text: yTitle
      }
    },

    tooltip: {
      shared: true,
      y: {
        formatter: function(value) {
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
        type="area"
        height={300}
      />

    </div>
  );
}