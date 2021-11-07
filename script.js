/*-------------------------------------------------------*/
/*------------------- Window setting --------------------*/
/*-------------------------------------------------------*/
// dimension of the page
const window_dims = {
    width: window.innerWidth,
    height: window.innerHeight
};
const margin = window_dims.width * .2

const data = [];

let yearSlider = document.getElementById("yearRange");
yearSlider.addEventListener('change', v => {
    // console.log(v.target.value);
    // open both files
    Promise.all([
        d3.json(states_topo),
        d3.csv(elec_gen),
        d3.csv(c02_emissions),
        d3.csv(population)
    ]).then((d) => main(d, v.target.value))
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


// open both files
Promise.all([
    d3.json(states_topo),
    d3.csv(elec_gen),
    d3.csv(c02_emissions),
    d3.csv(population)
]).then(d => main(d, 2010));

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

function main(data, year) {

    data = data;

    let dat = filterData(data, year);

    // console.log(dat);
    // topo data
    const topo_data = dat[0];

    // electricity data
    const elec_data = dat[1];

    // co2 data
    const co2_data = dat[2];

    // pop 00-18 data
    const pop_data = dat[3];
    /*-------------------------------------------------------*/
    /*-----------------Topojson data handling----------------*/
    /*-------------------------------------------------------*/
    // if topojson file is imported we need to 
    // convert topology data to geojson 
    const geojson = topojson.feature(topo_data, topo_data.objects.cb_2018_us_state_500k);
    console.log(geojson.features);

    /*-------------------------------------------------------*/
    /*----------------------Projections----------------------*/
    /*-------------------------------------------------------*/
    const projections = [
        d3
            .geoAzimuthalEqualArea(), //Azimuthal projections project the sphere directly onto a plane.
        d3.geoAlbersUsa(), // USA conic projection
        d3.geoAlbers(), // equal-area conic projection
        d3.geoMercator(), // cylindrical projection
        d3.geoNaturalEarth1(), // pseudocylindrical projection designed by Tom Patterson
        d3.geoEqualEarth(), // Equal Earth projection, by Bojan Šavrič et al., 2018.
        d3.geoConicEqualArea(), //equal-area conic projection
        d3.geoEquirectangular(), //Cylindrical Projections
        d3.geoOrthographic()
    ]

    /*-------------------------------------------------------*/
    /*----------------geoPath generator----------------------*/
    /*-------------------------------------------------------*/

    const geoPath_generator = d3.geoPath()
        .projection(projections[3].fitSize([window_dims.width - margin, window_dims.height - margin],
            geojson))

    /*-------------------------------------------------------*/
    /*----------------------Color Scaling--------------------*/
    /*-------------------------------------------------------*/
    ////https://observablehq.com/@d3/working-with-color
    var colorInterpolator = d3.interpolateRgbBasis(["blue", "steelblue", "green", "purple", "red"])
    // if the data is scaled using log scale
    let logScale = d3.scaleLog()
        .domain(d3.extent(co2_data, (d) => {
            return d.emission;
        }))

    // if the data is scaled using linear scale
    let linearScale = d3.scaleLinear()
        .domain(d3.extent(co2_data, (d) => {
            return d.emission;
        }))


    /*-------------------------------------------------------*/
    /*---------------------- Tooltip ------------------------*/
    /*-------------------------------------------------------*/
    const tooltip = d3.select("#tooltip");

    /*--------------------------------------------------------*/
    /*----------------- channelling marks --------------------*/
    /*--------------------------------------------------------*/


    // Append a SVG element to body, then append a path for the boundaries
    // let svg = d3.select("body").append("svg")
    //     .attr("width", "80vw")
    //     .attr("height", "90vh");

    // d3.selectAll('#map').remove()
    // let svg = d3.select("body").append("svg").attr("width", "80vw").attr("height", "90vh");

    let svg = d3.select('#map');

    svg.selectAll('path').remove();

    svg.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        // .attr("id", "map")
        .attr("d", d => geoPath_generator(d))
        // .attr("fill", "yellow")
        // .attr("fill", d => colorInterpolator(logScale(d.emission)))
        .attr("fill", d => {
            var found = co2_data.find(function (item) { return item.state == d.properties.NAME; });
            if (found) return colorInterpolator(linearScale(found.emission));
        })
        // .attr("fill", d => {
        //     var found = co2_data.find(function (item) { return item.state == d.properties.NAME; });
        //     if (found) return colorInterpolator(logScale(found.emission));
        // })
        // .attr("class", d => {
        //     return `a${d.emission}`
        // })
        .on("mouseenter", (m, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9)
            tooltip.html(() => {
                var cbdx = co2_data.find(function (item) { return item.state == d.properties.NAME; });
                var pop = pop_data.find(function (item) { return item.state == d.properties.NAME; });
                return `
                <p class="card-title">State: ${d.properties.NAME}</p>
                <p class="card-title">Population: ${pop.population}</p>
                <p class="card-title">CO2 Emissions(tons): ${cbdx.emission}</p>
                `
            })
                .style("left", m.clientX + "px")
                .style("top", m.clientY + "px");
        })
        .on("mousemove", (m, d) => {
            tooltip.style("opacity", .9)
        })
        .on("mouseout", (m, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0)
        })
}