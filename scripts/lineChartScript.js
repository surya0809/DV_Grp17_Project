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
var colors = ["orangered", "skyblue", "white", "green", "yellow"];
// if the data is scaled using log scale
let logScale = d3.scaleLog()
    .domain([0, 10])

// if the data is scaled using linear scale
let linearScale = d3.scaleLinear()
    .domain([0, 1000])

// open both files
Promise.all([
    d3.csv(elec_gen),
]).then(d => {
    lineChart(d[0]);
});

var legend = d3.select("#legend")

// create a list of keys
var keys = ["Coal", "Natural Gas", "Nuclear", "Renewables", "Petroleum"];

// Usually you have a color scale in your chart already
var color = d3.scaleOrdinal()
    .domain(keys)
    .range(colors);

// Add one dot in the legend for each name.
legend.selectAll("mydots")
    .data(keys)
    .enter()
    .append("circle")
    .attr("cx", 10)
    .attr("cy", function (d, i) {
        return 25 + i * 25
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function (d) {
        return color(d)
    })

// Add one dot in the legend for each name.
legend.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 30)
    .attr("y", function (d, i) {
        return 30 + i * 25
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) {
        return color(d)
    })
    .text(function (d) {
        return d
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

function lineChart(d) {

    let data = d.map((dt) => {
        return {
            year: d3.timeParse("%Y")(dt.year),
            coal: dt.coal / 1000,
            petrol: dt['petroleum and other'] / 1000,
            gas: dt["natural gas"] / 1000,
            nuclear: dt.nuclear / 1000,
            new: dt.renewables / 1000
        }
    });

    /*-------------------------------------------------------*/
    /*---------------------- Tooltip ------------------------*/
    /*-------------------------------------------------------*/
    const tooltip = d3.select("#tooltip");

    /*-------------------------------------------------------*/
    /*---------------------- SVG ------------------------*/
    /*-------------------------------------------------------*/
    let svg = d3.select("#line");
    svg.selectAll('g').remove();
    svg.selectAll('path').remove();
    svg.selectAll('text').remove();
    svg.attr("style", "max-width: 100%; height: auto")
    svg.attr("viewBox", [190, 225, window_dims.width, window_dims.height]);

    let extent = d3.extent(data, function (d) {
        return d.year;
    });

    let x = d3.scaleTime()
        .domain(extent)
        .range([margin, window_dims.width]);

    let y = d3.scaleLinear()
        .domain([-100 / 1000,
            d3.max([

                d3.max(data, function (d) {

                    return d.coal;
                }),
                d3.max(data, function (d) {

                    return d.petrol;
                }),
                d3.max(data, function (d) {

                    return d.gas;
                }),
                d3.max(data, function (d) {

                    return d.nuclear;
                }),
                d3.max(data, function (d) {

                    return d.new;
                })

            ]) +
            (100 / 1000)
        ])
        .range([window_dims.height, margin]);

    let line1 = d3.line()
        .x(function (d) {

            return x(d.year);
        })
        .y(function (d) {

            return y(d.coal);
        });

    let line5 = d3.line()
        .x(function (d) {

            return x(d.year);
        })
        .y(function (d) {

            return y(d.petrol);
        });

    let line2 = d3.line()
        .x(function (d) {

            return x(d.year);
        })
        .y(function (d) {

            return y(d.gas);
        });

    let line3 = d3.line()
        .x(function (d) {

            return x(d.year);
        })
        .y(function (d) {

            return y(d.nuclear);
        });

    let line4 = d3.line()
        .x(function (d) {

            return x(d.year);
        })
        .y(function (d) {

            return y(d.new);
        });


    // line 1 - coal
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("stroke", colors[0])
        .attr("d", line1)
        .on("mouseenter", (m, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
            tooltip.html(() => {
                    return `
    <p class="card-title">Coal</p>
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

    // svg.selectAll("circle")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("class", "circ")
    //     .attr("fill", colors[0])
    //     .attr("cx", function (d) {
    //         return x(d.year)
    //     })
    //     .attr("cy", function (d) {
    //         return y(d.coal)
    //     })
    //     .attr("r", 5)
    //     .on("mouseenter", (m, d) => {
    //         tooltip.transition()
    //             .duration(200)
    //             .style("opacity", .9)
    //         tooltip.html(() => {
    //                 return `
    //     <p class="card-title">Year: ${d3.timeFormat("%Y")(d.year)}</p>
    //     <p class="card-title">Energy Produced: ${d.coal}MW</p>
    //     `
    //             })
    //             .style("left", m.clientX + "px")
    //             .style("top", m.clientY + "px");
    //     })
    //     .on("mousemove", (m, d) => {
    //         tooltip.style("opacity", .9)
    //             .style("z-index", "999")
    //     })
    //     .on("mouseout", (m, d) => {
    //         tooltip.transition()
    //             .duration(200)
    //             .style("opacity", 0)
    //             .style("z-index", "-999")
    //     });


    // line 2 - petrol
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("stroke", colors[4])
        .attr("d", line5)
        .on("mouseenter", (m, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
            tooltip.html(() => {
                    return `
    <p class="card-title">Petroleum and Others</p>
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

    // svg.selectAll("circle")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("class", "circ")
    //     .attr("fill", colors[4])
    //     .attr("cx", function (d) {
    //         return x(d.year)
    //     })
    //     .attr("cy", function (d) {
    //         return y(d.petrol)
    //     })
    //     .attr("r", 5)
    //     .on("mouseenter", (m, d) => {
    //         tooltip.transition()
    //             .duration(200)
    //             .style("opacity", .9)
    //         tooltip.html(() => {
    //                 return `
    //     <p class="card-title">Year: ${d3.timeFormat("%Y")(d.year)}</p>
    //     <p class="card-title">Energy Produced: ${d.petrol}MW</p>
    //     `
    //             })
    //             .style("left", m.clientX + "px")
    //             .style("top", m.clientY + "px");
    //     })
    //     .on("mousemove", (m, d) => {
    //         tooltip.style("opacity", .9)
    //             .style("z-index", "999")
    //     })
    //     .on("mouseout", (m, d) => {
    //         tooltip.transition()
    //             .duration(200)
    //             .style("opacity", 0)
    //             .style("z-index", "-999")
    //     });



    // line 3 - gas
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("stroke", colors[1])
        .attr("d", line2)
        .on("mouseenter", (m, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
            tooltip.html(() => {
                    return `
    <p class="card-title">Natural Gas</p>
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

    // svg.selectAll("circle")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("class", "circ")
    //     .attr("fill", colors[1])
    //     .attr("cx", function (d) {
    //         return x(d.year)
    //     })
    //     .attr("cy", function (d) {
    //         return y(d.gas)
    //     })
    //     .attr("r", 5)
    //     .on("mouseenter", (m, d) => {
    //         tooltip.transition()
    //             .duration(200)
    //             .style("opacity", .9)
    //         tooltip.html(() => {
    //                 return `
    //     <p class="card-title">Year: ${d3.timeFormat("%Y")(d.year)}</p>
    //     <p class="card-title">Energy Produced: ${d.gas}MW</p>
    //     `
    //             })
    //             .style("left", m.clientX + "px")
    //             .style("top", m.clientY + "px");
    //     })
    //     .on("mousemove", (m, d) => {
    //         tooltip.style("opacity", .9)
    //             .style("z-index", "999")
    //     })
    //     .on("mouseout", (m, d) => {
    //         tooltip.transition()
    //             .duration(200)
    //             .style("opacity", 0)
    //             .style("z-index", "-999")
    //     });



    // line 4 - nuclear
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("stroke", colors[2])
        .attr("d", line3)
        .on("mouseenter", (m, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
            tooltip.html(() => {
                    return `
    <p class="card-title">Nuclear</p>
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

    // svg.selectAll("circle")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("class", "circ")
    //     .attr("fill", colors[2])
    //     .attr("cx", function (d) {
    //         return x(d.year)
    //     })
    //     .attr("cy", function (d) {
    //         return y(d.nuclear)
    //     })
    //     .attr("r", 5)
    //     .on("mouseenter", (m, d) => {
    //         tooltip.transition()
    //             .duration(200)
    //             .style("opacity", .9)
    //         tooltip.html(() => {
    //                 return `
    //     <p class="card-title">Year: ${d3.timeFormat("%Y")(d.year)}</p>
    //     <p class="card-title">Energy Produced: ${d.nuclear}MW</p>
    //     `
    //             })
    //             .style("left", m.clientX + "px")
    //             .style("top", m.clientY + "px");
    //     })
    //     .on("mousemove", (m, d) => {
    //         tooltip.style("opacity", .9)
    //             .style("z-index", "999")
    //     })
    //     .on("mouseout", (m, d) => {
    //         tooltip.transition()
    //             .duration(200)
    //             .style("opacity", 0)
    //             .style("z-index", "-999")
    //     });



    // line 5 - new
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("stroke", colors[3])
        .attr("d", line4)
        .on("mouseenter", (m, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
            tooltip.html(() => {
                    return `
    <p class="card-title">Renewables</p>
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

    // svg.selectAll("circle")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("class", "circ")
    //     .attr("fill", colors[3])
    //     .attr("cx", function (d) {
    //         return x(d.year)
    //     })
    //     .attr("cy", function (d) {
    //         return y(d.new)
    //     })
    //     .attr("r", 5)
    //     .on("mouseenter", (m, d) => {
    //         tooltip.transition()
    //             .duration(200)
    //             .style("opacity", .9)
    //         tooltip.html(() => {
    //                 return `
    //     <p class="card-title">Year: ${d3.timeFormat("%Y")(d.year)}</p>
    //     <p class="card-title">Energy Produced: ${d.new}MW</p>
    //     `
    //             })
    //             .style("left", m.clientX + "px")
    //             .style("top", m.clientY + "px");
    //     })
    //     .on("mousemove", (m, d) => {
    //         tooltip.style("opacity", .9)
    //             .style("z-index", "999")
    //     })
    //     .on("mouseout", (m, d) => {
    //         tooltip.transition()
    //             .duration(200)
    //             .style("opacity", 0)
    //             .style("z-index", "-999")
    //     });



    // x-axis
    svg.append("g")
        .attr("transform", "translate(" + '0' + "," + window_dims.height + ")")
        .attr("class", "axis")
        .call(d3.axisBottom(x).ticks(10));

    // text label for the x axis
    svg.append("text")
        .attr("transform",
            "translate(" + (window_dims.width / 2) + " ," +
            (window_dims.height + 60) + ")")
        .style("text-anchor", "middle")
        .attr("class", "chartTitle")
        .text("Year");

    // Y-axis
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
        .text("Electricity generated");

}