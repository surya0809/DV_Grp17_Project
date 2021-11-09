/*-------------------------------------------------------*/
/*------------------- Window setting --------------------*/
/*-------------------------------------------------------*/
// dimension of the page
const window_dims = {
    width: window.innerWidth,
    height: window.innerHeight
};
const margin = window_dims.width * .2;


// a csv file containing the electricity generated from different energy sources
const elec_gen = "./data/generation_source.csv"


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

/*-------------------------------------------------------*/
/*---------------------- Tooltip ------------------------*/
/*-------------------------------------------------------*/
const tooltip = d3.select("#tooltip");

// open both files
Promise.all([
    d3.csv(elec_gen),
]).then(d => {
    lineChart(d[0]);
});

function lineChart(d) {

    let data = d.map((dt) => {
        return {
            year: d3.timeParse("%Y")(dt.year),
            coal: dt.coal
        }
    });


    /*-------------------------------------------------------*/
    /*---------------------- Tooltip ------------------------*/
    /*-------------------------------------------------------*/
    const tooltip = d3.select("#tooltip");

    /*--------------------------------------------------------*/
    /*----------------- channelling marks --------------------*/
    /*--------------------------------------------------------*/

    let svg = d3.select('#line');

    svg.selectAll('g').remove();
    svg.selectAll('path').remove();
    svg.selectAll('text').remove();
    svg.attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    svg.attr("viewBox", [200, 200, 2000, 1000]);

    let x = d3.scaleTime()
        .domain(d3.extent(data, function (d) {
            return d.year;
        }))
        .range([margin, window_dims.width]);

    let y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {

            return d.coal / 1000;
        })])
        .range([window_dims.height, margin]);

    let line1 = d3.line()
        .x(function (d) {

            return x(d.year);
        })
        .y(function (d) {

            return y(d.coal / 1000);
        });

    svg.append("path")
        .data([data])
        .attr("class", "line1")
        .attr("d", line1);

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("fill", "red")
        .attr("stroke", "none")
        .attr("cx", function (d) {
            return x(d.year)
        })
        .attr("cy", function (d) {
            return y(d.coal / 1000)
        })
        .attr("r", 5)
        .on("mouseenter", (m, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
            tooltip.html(() => {
                    return `
                <p class="card-title">Year: ${d3.timeFormat("%Y")(d.year)}</p>
                <p class="card-title">Energy Produced: ${d.coal}MW</p>
                `
                })
                .style("left", m.clientX + "px")
                .style("top", m.clientY + "px");
        })
        .on("mousemove", (m, d) => {
            tooltip.style("opacity", .9)
                .style("z-index", "999")
        })
        .on("mouseout", (m, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0)
                .style("z-index", "-999")
        });


    svg.append("g")
        .attr("transform", "translate(" + '0' + "," + window_dims.height + ")")
        .attr("class", "axis")
        .call(d3.axisBottom(x));

    // text label for the x axis
    svg.append("text")
        .attr("transform",
            "translate(" + (window_dims.width / 2) + " ," +
            (window_dims.height + 60) + ")")
        .style("text-anchor", "middle")
        .attr("class", "chartTitle")
        .text("Year");

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin + "," + '0' + ")")
        .call(d3.axisLeft(y).ticks(10).tickFormat(function (d) {
            return `${d} GW`;
        }));

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin - 100)
        .attr("x", 0 - (window_dims.height / 2) - 200)
        .attr("class", "chartTitle")
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Electricity generated using coal");

}