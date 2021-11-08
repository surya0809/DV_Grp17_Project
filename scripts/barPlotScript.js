/*-------------------------------------------------------*/
/*------------------- Window setting --------------------*/
/*-------------------------------------------------------*/
// dimension of the page
const window_dims = {
    width: window.innerWidth,
    height: window.innerHeight
};
const margin = window_dims.width * .2;

var data = [];

let yearSlider = document.getElementById("yearRange");
yearSlider.addEventListener('change', v => {
    // console.log(v.target.value);
    // open both files
    barPlot(data, v.target.value);
});
/*-------------------------------------------------------*/
/*-----------------parallel load data--------------------*/
/*-------------------------------------------------------*/

// US states topojson
const states_topo = "./data/us_states.json"

// a csv file containing the electricity generated from different energy sources
const elec_gen = "./data/elec_gen_transpose.csv"

// xlsx with co2 emissions
const c02_emissions = "./data/CO2.csv"

// xlsx with population from 2000 - 2018
const population = "./data/pop_2010_2019.csv"

/*-------------------------------------------------------*/
/*----------------------Color Scaling--------------------*/
/*-------------------------------------------------------*/
////https://observablehq.com/@d3/working-with-color
var colorInterpolator = d3.interpolateRgbBasis(["white", "yellow", "orange", "maroon", "brown"]);
// if the data is scaled using log scale
let logScale = d3.scaleLog()
    .domain([0, 10])

// if the data is scaled using linear scale
let linearScale = d3.scaleLinear()
    .domain([0, 1000])

// open both files
Promise.all([
    d3.json(states_topo),
    d3.csv(elec_gen),
    d3.csv(c02_emissions),
    d3.csv(population)
]).then(d => {
    data = d;
    barPlot(d, 2010);
});

function filterData(data, year) {
    // console.log(year);
    let elec = data[1][0][year];

    let co2 = data[2].map(d => {
        return {
            state: d.State,
            emission: d[year]
        };
    });

    let pop = data[3].map(d => {
        return {
            state: d.State,
            population: d[year]
        };
    });

    d3.select('#year_value').html(() => {
        return year;
    })
    return [data[0], elec, co2, pop];
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/bar-chart
function barChart(data, {
    x = (d, i) => i, // given d in data, returns the (ordinal) x-value
    y = d => d, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    marginTop = 20, // the top margin, in pixels
    marginRight = 0, // the right margin, in pixels
    marginBottom = 30, // the bottom margin, in pixels
    marginLeft = 40, // the left margin, in pixels
    width = 640, // the outer width of the chart, in pixels
    height = 400, // the outer height of the chart, in pixels
    xDomain, // an array of (ordinal) x-values
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // y-scale type
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    xPadding = 0.1, // amount of x-range to reserve to separate bars
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    color = "currentColor" // bar fill color
  } = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
  
    // Compute default domains, and unique the x-domain.
    if (xDomain === undefined) xDomain = X;
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    xDomain = new d3.InternSet(xDomain);
  
    // Omit any data not present in the x-domain.
    const I = d3.range(X.length).filter(i => xDomain.has(X[i]));
  
    // Construct scales, axes, and formats.
    const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);
  
    // Compute titles.
    if (title === undefined) {
      const formatValue = yScale.tickFormat(100, yFormat);
      title = i => `${X[i]}\n${formatValue(Y[i])}`;
    } else {
      const O = d3.map(data, d => d);
      const T = title;
      title = i => T(O[i], i, data);
    }
  
    const svg = d3.select("#")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));
  
    const bar = svg.append("g")
        .attr("fill", color)
      .selectAll("rect")
      .data(I)
      .join("rect")
        .attr("x", i => xScale(X[i]))
        .attr("y", i => yScale(Y[i]))
        .attr("height", i => yScale(0) - yScale(Y[i]))
        .attr("width", xScale.bandwidth());
  
    if (title) bar.append("title")
        .text(title);
  
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);
  
    return svg.node();
  }