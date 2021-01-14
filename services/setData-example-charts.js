require.config({
  paths: {
    tree_map: "../results/example-results/set-data/add_tree_map_results",
    lookup_map: "../results/example-results/set-data/add_lookup_map_results",
    unordered_map: "../results/example-results/set-data/add_unordered_map_results",
  },
});


function renderChart(chartName, chartData) {
  const ctx = document.getElementById(chartName).getContext("2d");
  const keys = chartData.map((item) => item.key);
  const contractCallCost = 5.769;
  const values = chartData.map((item) => item.gas_burnt - contractCallCost);
  const gasBurnt = chartData.reduce((acc, curr) => acc + (curr.gas_burnt - contractCallCost), 0);
  const avgGasBurnt = (gasBurnt / chartData.length).toFixed(2)

  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: keys, 
      datasets: [
        {
          label: "Calls made: " + chartData.length.toString(),
          data: values,
          backgroundColor: ["rgba(255, 178, 91, .7)"],
          borderColor: ["rgba(0, 0, 0, .25)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: chartName,
        fontFamily: 'Source Code Pro',
        fontSize: 16,
        fontColor: '#333'
      },
      legend: {
        display: true,
        labels: {
          fontFamily: 'Source Code Pro',
        }
      },
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              fontColor: '#333',
              fontSize: 16,
              fontFamily: 'Source Code Pro',
              labelString: avgGasBurnt + " average TGas burnt",
            },
            ticks: {
              fontSize: 8,
              fontFamily: 'Source Code Pro',
            }
          },
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              fontFamily: 'Source Code Pro',
              labelString: "TGas Burnt (10^12)",
            },
            ticks: {
              fontFamily: 'Source Code Pro',
              fontSize: 12,
              suggestedMin: 0,
              suggestedMax: 3,
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
