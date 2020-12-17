require.config({
  paths: {
    tree_map: "../results/example-results/get-data/get_tree_map_results",
    lookup_map: "../results/example-results/get-data/get_lookup_map_results",
    unordered_map: "../results/example-results/get-data/get_unordered_map_results",
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
          backgroundColor: ["rgba(255, 178, 91, .5)"],
          borderColor: ["rgba(0, 0, 0, .5)"],
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
              suggestedMin: 5500000000000,
              suggestedMax: 5600000000000,
            },
          },
        ],
      },
    },
  });
  return myChart;
}

requirejs(["tree_map"], function () {
  return renderChart("tree_map", get_tree_map_data);
});

requirejs(["lookup_map"], function () {
  return renderChart("lookup_map", get_lookup_map_data);
});

requirejs(["unordered_map"], function () {
  return renderChart("unordered_map", get_unordered_map_data);
});
