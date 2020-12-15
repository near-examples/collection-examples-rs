require.config({
  paths: {
    tree_map: "../chart-data/add_tree_map_results",
    lookup_map: "../chart-data/add_lookup_map_results",
    unordered_map: "../chart-data/add_unordered_map_results",
  },
});

function renderChart(chartName, chartData) {
  const ctx = document.getElementById(chartName).getContext("2d");
  const keys = chartData.map((n) => Object.keys(n)[0]);
  const values = chartData.map((n) => Object.values(n)[0]);

  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: keys,
      datasets: [
        {
          label: chartName,
          data: values,
          backgroundColor: ["rgba(255, 99, 132, 0.2)"],
          borderColor: ["rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      elements: {
        line: {
          borderJoinStyle: "round",
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: false,
            },
          },
        ],
      },
    },
  });
  return myChart;
}

requirejs(["tree_map"], function () {
  return renderChart("tree_map", add_tree_map_data);
});

requirejs(["lookup_map"], function () {
  return renderChart("lookup_map", add_lookup_map_data);
});

requirejs(["unordered_map"], function () {
  return renderChart("unordered_map", add_unordered_map_data);
});
