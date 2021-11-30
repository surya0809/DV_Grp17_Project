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

const tooltip = d3.select("#tooltip");

/*-------------------------------------------------------*/
/*-----------------parallel load data--------------------*/
/*-------------------------------------------------------*/

// xlsx with co2 emissions
const c02_emissions = "./data/CO2_T.csv"

// xlsx with population from 2000 - 2018
const population = "./data/pop_2010_2019_T.csv"

// open both files
Promise.all([
    d3.csv(c02_emissions),
    d3.csv(population)
]).then(d => {
    data = d;
    barPlot(d);
});

function barPlot(d) {

    const co2_data = d[0].map((dt) => {
        return {
            year: dt.Year,
            co2: parseFloat(dt['United States'])
        }
    });

    const pop_data = d[1].map((dt) => {
        return {
            year: dt.Year,
            population: parseInt(dt['United States']) 
        }
    });

    var xScale = d3.scaleBand().range([0, window_dims.width - margin]).padding(0.4);

    var yScale = d3.scaleLinear().range([window_dims.height, 0]);

    var yScale2 = d3.scaleLinear().range([window_dims.height, 0]);

    let svg = d3.select('#bar');

    svg.selectAll('g').remove();
    svg.selectAll('rect').remove();
    svg.attr("style", "max-width: 100%; height: auto")
    svg.attr("viewBox", [-200, -100, 1750, 915]);

    xScale.domain(pop_data.map(function (d) {
        return d.year;
    }));
    yScale.domain([5, d3.max(pop_data, function (d) {
        return d.population;
    }) + 1000000]);

    yScale2.domain([4500, d3.max(co2_data, function (d) {
        return d.co2;
    }) + 500]);


    svg.append("g")
        .attr("transform", "translate(0," + window_dims.height + ")")
        .attr("class", "axis")
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("transform",
            "translate(" + (window_dims.width / 2.5) + " ," +
            (window_dims.height - margin * 2.30) + ")")
        .style("text-anchor", "middle")
        .attr("class", "chartTitle")
        .text("Year");

    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat(function (d) {
                return d / 1000000 + "M";
            })
            .ticks(15))
        .attr("class", "axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin - margin - 100)
        .attr("x", 0 - (window_dims.height / 2))
        .attr("class", "chartTitle")
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Population");

    // right axis for co2
    svg.append("g")
        .call(d3.axisRight(yScale2).tickFormat(function (d) {
                return d + " Tons";
            })
            .ticks(15))
        .attr("class", "rightAxis")
        .attr("transform",
            "translate(" + (window_dims.width / 1.25) + " ," +
            (window_dims.height - margin * 2.45) + ")")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 100)
        .attr("x", 0 - (window_dims.height / 2))
        .attr("class", "rightChartTitle")
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("CO2 Emissions");

    svg.selectAll(".bar")
        .data(pop_data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return xScale(d.year);
        })
        .attr("y", function (d) {
            return yScale(d.population);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) {
            return window_dims.height - yScale(d.population);
        })
        .on("mouseenter", (m, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
            tooltip.html(() => {
                    return `
                    <p class="card-title">Year: ${d.year}</p>
                    <p class="card-title">Population: ${d3.format(",")(d.population)}</p>
                    `
                })
                .style("left", m.clientX + "px")
                .style("top", m.clientY + "px");
        })
        .on("mousemove", (m, d) => {
            tooltip.style("opacity", .9)
                .style("z-index", "9999")
        })
        .on("mouseout", (m, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0)
                .style("z-index", "-999")
        });

    let line1 = d3.line()
        .x(function (d) {

            return xScale(d.year);
        })
        .y(function (d) {

            return yScale2(d.co2);
        });

    svg.append("path")
        .data([co2_data])
        .attr("class", "line1")
        .attr("d", line1)
        .attr("transform",
            "translate(" + (20) + " ," +
            (window_dims.height - margin * 2.45 - 30) + ")");

    let c = svg.selectAll("circle")
        .data(co2_data)
        .enter()
        .append("circle")
        .attr("class", "circ")
        .attr("fill", "red")
        .attr("stroke", "none")
        .attr("cx", function (d) {
            return xScale(d.year)
        })
        .attr("cy", function (d) {
            return yScale2(d.co2)
        })
        .attr("r", 4)
        .attr("transform",
            "translate(" + (20) + " ," +
            (window_dims.height - margin * 2.45 - 30) + ")")
        .on("mouseenter", (m, d) => {
            c.attr("r", 5);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
            tooltip.html(() => {
                    return `
                    <p class="card-title">Year: ${d.year}</p>
                    <p class="card-title">CO2 Emissions: ${d.co2}MW</p>
                    `
                })
                .style("left", m.clientX + "px")
                .style("top", m.clientY + "px");
        })
        .on("mousemove", (m, d) => {
            c.attr("r", 5);
            tooltip.style("opacity", .9)
                .style("z-index", "9999")
        })
        .on("mouseout", (m, d) => {
            c.attr("r", 4);

            tooltip.transition()
                .duration(200)
                .style("opacity", 0)
                .style("z-index", "-999")
        });
}