requirejs(["../data/unorderedMapResults"], function () {
  const ctx = document.getElementById("myChart");

const keys = data.map(n => Object.keys(n)[0])
const values = data.map(n => Object.values(n)[0])

  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: keys,
      datasets: [
        {
          label: "Gas Cost",
          data: values,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)"
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)"
          ],
          borderWidth: 1,
          showLine: true,
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
});
