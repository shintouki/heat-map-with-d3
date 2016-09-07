let jsonUrl = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let formatMonths = function(d) {
  return months[d - 1];
};

let margin = {
  top: 30,
  right: 50,
  bottom: 145,
  left: 95
};
let width = 1250 - margin.left - margin.right;
let height = 650 - margin.top - margin.bottom;

let numColors = 20;
let colors = ["#3967D9", "#3885D9", "#36A4D9", "#35C3D9", "#33D9CE", "#32D9AE", "#30D98D", "#2ED96B", "#2DD949", "#30D92B", "#51D92A", "#72D928", "#93D927", "#B5D925", "#D8D923", "#D9B622", "#D99220", "#D96D1F", "#D9481D", "#D9231C"];

// x axis scale
let x = d3.scale.linear()
  .range([0, width]);

// y axis scale
let y = d3.scale.linear()
  .range([height, 0]);

let xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .ticks(20)
  .tickFormat(d3.format("d"));

let yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .tickFormat(formatMonths);

let chart = d3.select(".chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get json data
d3.json(jsonUrl, function(error, json) {
  let baseTemp = json.baseTemperature;
  let data = json.monthlyVariance;
  let firstYear = data[0].year;
  let boxWidth = width / (data.length / 12);
  let boxHeight = height / 12;
  let legendSideLength = boxHeight / 2;

  x.domain([data[0].year, data[data.length - 1].year]);
  y.domain([1, 12]);
    
  // Color scale for different temperatures
  let colorScale = d3.scale.quantile()
    .domain([0, d3.max(data, function(d) {
      return d.variance + baseTemp;
    })])
    .range(colors);

  // Div for tooltip box
  let tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0);

  // x axis
  chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width / 2)
    .attr("y", 45)
    .style("text-anchor", "end")
    .text("Year");

  // y axis
  chart.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("x", (-1 * height / 2))
    .attr("y", -80)
    .style("text-anchor", "end")
    .text("Month");

  // Draw boxes
  chart.selectAll(".box")
    .data(data)
    .enter().append("rect")
    .attr("class", "box")
    .attr("x", function(d) {
      return (d.year - firstYear) * boxWidth;
    })
    .attr("y", function(d) {
      return (d.month - 1) * boxHeight;
    })
    .attr("width", boxWidth)
    .attr("height", boxHeight)
    .style("fill", function(d) {
      return colorScale(d.variance + baseTemp);
    })
    .on("mouseover", function(d) {
      // Tooltip
      let date = months[d.month - 1] + ", " + d.year;
      let degreeSign = String.fromCharCode(176);
      let varianceTemp = d.variance.toFixed(3) + " " + degreeSign + "C";
      let actualTemp = (d.variance + baseTemp).toFixed(3) + " " + degreeSign + "C";
      // Tooltip effects
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html(date + "<br/>" + "Actual Temp: " + actualTemp + "<br/>" + "Variance: " + varianceTemp)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 70) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  let legend = chart.selectAll(".legend")
    .data([0].concat(colorScale.quantiles()), function(d) {
      return d;
    })
    .enter().append("g")
    .attr("class", "legend")

  legend.append("rect")
    .attr("x", function(d, i) {
      return legendSideLength * i * 2;
    })
    .attr("y", height + 60)
    .attr("width", legendSideLength * 2)
    .attr("height", legendSideLength)
    .style("fill", function(d, i) {
      return colors[i];
    });

  legend.append("text")
    .attr("class", "mono")
    .text(function(d) {
      return d.toFixed(1);
    })
    .attr("x", function(d, i) {
      return legendSideLength * i * 2;
    })
    .attr("y", height + 75 + legendSideLength)
    .attr("dx", 10);
});

// Title
d3.select(".title")
  .append("text")
  .style("text-anchor", "end")
  .text("Global Surface Temperature");
