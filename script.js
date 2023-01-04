console.log("Hello World!")
var year = 2019
const svg = d3.select("svg#scatterplot");
const legend1 = d3.select("svg#legends");
const width = svg.attr("width");
const height = svg.attr("height");
globalFactor = "Family"
const margin = {
    top: 10,
    right: 10,
    bottom: 50,
    left: 60
};
let tooltipWidth = 200;
let tooltipHeight = 60;
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;
let annotations = svg.append("g").attr("id", "annotations");
let chartArea = svg.append("g").attr("id", "points")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// intialise tootip
var div = d3.select("#scatterplotdiv").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// mouseover helper functions
const mouseover = svg.append("g").attr("class", "mouseover")
    .attr("transform", `translate(${margin.left + 15},${margin.top + 15})`);

function lenlimit(str) {
    const dummytxt = mouseover.append("text").attr("class", "legendtext").attr("visibility", "hidden");
    dummytxt.text(str)
    let length = dummytxt.node().getComputedTextLength()
    dummytxt.remove()
    return length;
}

const frame = mouseover.append("rect").attr("class", "frame")
    .attr("x", 510).attr("y", 365)
    .attr("rx", 3).attr("ry", 3)
    //.attr("width", 210)
    .attr("height", 120);

const textbox = mouseover.append("g").attr("transform", "translate(10,10)");

function updateMouseover(d) {
    textbox.html('');

    let countryname = `Country: ${d["Country"]}`;
    let gdpval = `GDP: ${d["GDP"]}`;
    let happinessval = `Happiness: ${d["Happiness Score"]}`;
    let regionval = `Region: ${d["Region"]}`;
    // let familyval = `Family: ${d["Family"]}`;
    // let lifeval = `Life: ${d["Life"]}`;
    // let freedomval = `Freedom: ${d["Freedom"]}`;
    let trustval = `Government Corruption: ${d["Trust"]}`;
    // let genval = `Generosity: ${d["Generosity"]}`;

    let maxWidth = Math.max(lenlimit(regionval), lenlimit(happinessval))
    frame.attr("width", maxWidth + 30);

    textbox.append("text").text(countryname)
        .attr("x", 510).attr("y", 380);
    textbox.append("text").text(regionval)
        .attr("x", 510).attr("y", 400);
    textbox.append("text").text(happinessval)
        .attr("x", 510).attr("y", 420);
    textbox.append("text").text(gdpval)
        .attr("x", 510).attr("y", 440);
    // textbox.append("text").text(familyval)
    //     .attr("x", 510).attr("y", 460);
    // textbox.append("text").text(lifeval)
    //     .attr("x", 510).attr("y", 480);
    // textbox.append("text").text(freedomval)
    //     .attr("x", 510).attr("y", 500);
    textbox.append("text").text(trustval)
        .attr("x", 510).attr("y", 460);
    // textbox.append("text").text(genval)
    //     .attr("x", 510).attr("y", 540);
}

// data analysis
let colorScale;
var happiness;
const requestData = async function() {
    happiness = await d3.csv("dataset.csv", d3.autoType);
    console.log("fds");


    const happyExtent = d3.extent(happiness, d => d["Happiness Score"]);
    const happyScale = d3.scaleLinear().domain(happyExtent).range([chartHeight, 0]);
    const gdpExtent = d3.extent(happiness, d => d['GDP']);
    const gdpScale = d3.scaleLinear().domain(gdpExtent).range([0, chartWidth]);
    const trustExtent = d3.extent(happiness, d => d['Trust']);
    const trustScale = d3.scaleLinear().domain(trustExtent).range([0, 25]);
    //const regionExtent = d3.extent(happiness, d => d['Region']);

    const colorsRegion = happiness.map(d => d["Region"]);


    //colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    divergentScale = ["#fde725", "#b5de2b", "#6ece58", "#35b779", "#1f9e89", "#26828e", "#31688e", "#3e4989", "#482878", "#440154"]
    var colorScale = d3.scaleOrdinal()
        .domain(colorsRegion)
        .range(divergentScale);

    // x and y axis of the scatterplot
    let leftAxis = d3.axisLeft(happyScale);
    annotations.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${margin.left - 10},${margin.top})`)
        .call(leftAxis)

    annotations.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .text("GDP");

    annotations.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 1)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Happiness Score");



    let bottomAxis = d3.axisBottom(gdpScale);
    let bottomGridlines = d3.axisBottom(gdpScale)
        .tickSize(-chartHeight - 10).tickFormat("")

    annotations.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(${margin.left - 10},${chartHeight + margin.top + 2})`)
        .call(bottomAxis);

    let circles = chartArea.selectAll("circle")
        .data(happiness)
        .join("circle")
        .attr("cx", d => gdpScale(d['GDP']))
        .attr("cy", d => happyScale(d['Happiness Score']))
        .attr("r", d => trustScale(d['Trust']))
        .attr("opacity", 0.8)
        .attr("fill", d => colorScale(d['Region']))
        .attr("label", d => d["Country"])
        .on("mouseover", mouseover)
        //.on("mousemove", mousemove )
        //console.log(d.Country)

    /////////// newly added mouseover event//////////
    circles.on("mouseover", function(d) {
        //console.log(dataset);
        mouseover.attr("visibility", "");
        d3.select(this)
            .transition().duration(200)
            .attr("stroke", "black")
            .attr("stroke-width", 4)
            //.attr("fill", lighten(colorScale(d => d['Country'])));

        updateMouseover(d3.select(this).datum());

    });

    circles.on("mouseout", function() {
        mouseover.attr("visibility", "hidden");
        d3.select(this)
            .transition().duration(200)
            .attr("stroke-width", 0)
            //.attr("fill", colorScale(d => d['Country']));
    });





    legend1.append("text").attr("x", 10).attr("y", 10).text("Western Europe")
        .style("font-size", "12px").attr("alignment-baseline", "middle").style("fill", "#fde725");


    legend1.append("text").attr("x", 10).attr("y", 50).text("Central and Eastern Europe")
        .style("font-size", "12px").attr("alignment-baseline", "middle").style("fill", "#31688e");


    legend1.append("text").attr("x", 170).attr("y", 10).text("North America")
        .style("font-size", "12px").attr("alignment-baseline", "middle").style("fill", "#ccbe9f");


    legend1.append("text").attr("x", 170).attr("y", 50).text("Latin America and Caribbean")
        .style("font-size", "12px").attr("alignment-baseline", "middle").style("fill", "#1f9e89");

    legend1.append("text").attr("x", 360).attr("y", 10).text("Middle East and Northern Africa")
        .style("font-size", "12px").attr("alignment-baseline", "middle").style("fill", "#35b779");



    legend1.append("text").attr("x", 390).attr("y", 50).text("Australia and New Zealand")
        .style("font-size", "12px").attr("alignment-baseline", "middle").style("fill", "#6ece58");


    legend1.append("text").attr("x", 600).attr("y", 10).text("Eastern Asia")
        .style("font-size", "12px").attr("alignment-baseline", "middle").style("fill", "#31688e");


    legend1.append("text").attr("x", 600).attr("y", 50).text("Southeastern Asia")
        .style("font-size", "12px").attr("alignment-baseline", "middle").style("fill", "#26828e");


    legend1.append("text").attr("x", 770).attr("y", 10).text("Sub-Saharan Africa")
        .style("font-size", "12px").attr("alignment-baseline", "middle").style("fill", "#482878");


    legend1.append("text").attr("x", 770).attr("y", 50).text("Southern Asia")
        .style("font-size", "12px").attr("alignment-baseline", "middle").style("fill", "#440154");





    // function updateyear() {

    //     var appending = canvas.selectAll('circle')
    //        .data(happiness);
    //     appending.enter().append('rect');
    //     appending.transition()
    //         .duration(0)
    //         .attr("width",function (d) {return d.y; });
    //     appending.exit().remove();

    // }
    // updateyear(initialValues);
    // d3.select('#opts')
    //   .on('change', function() {
    //     var happiness = eval(d3.select(this).property('value'));
    //     updateyear(happiness);
    // })

    // legend on the scatterplot
    // chartArea.append("rect")
    //     .attr("x", 570)
    //     .attr("y", 380)
    //     .attr("width", 225)
    //     .attr("height", 100)
    //     .attr("rx", 4)
    //     .attr("ry", 4)
    //     .attr("opacity", 0.8)
    //     .style("stroke", '#f3f3f3')
    //     .style("stroke-width", '4px')
    //     .attr("fill", "#FFF");




    // function mouseover() {
    //     chain = d3.select(this);
    //     circle = chain.datum();
    //     Country = circle["Country"]
    //     console.log(Country)
    //     div
    //         .style("opacity", 1)
    //         .text("Country: " + Country)
    // }
    //   var mousemove = function(d) {
    //       console.log(d)
    //   div
    //     .style("opacity", 1)
    // }


    //////////////////////////////////////////////



    /*circle.on("mouseover", function() {

    d3.select(this)
    .transition().duration(2)
    .attr("stroke","black")
    .attr("stroke-width", 2)
    .attr("r", trustScale(d['Trust'])) */
    /*.on("mouseover", function(d) {    
    div.transition()    
        .duration(200)    
        style("opacity", .9) 
        div.html("Country:" + d['Happiness Score'])
        .style("opacity", .9) */

    /*.on("mouseout", function(d) {   
        div.transition()    
            .duration(500)    
            .style("opacity", 0) ;  */
    /*d3.select("#label").text(d['Country']);
                })

                circle.on("mouseout", function() {

                d3.select(this)
                .transition().duration(2)
                .attr("stroke-width", 0)
                .attr("r", trustScale(d['Trust']));
              
                d3.select("#label").text(""); */
    // })

    const country_boundaries = await d3.json("countries.geo.json");
    visualiseStateMap(country_boundaries, colorScale, "countriesMap")

    function addGraticule(map, path) {
        // add graticule
        var graticule = d3.geoGraticule10();
        map.append("path").attr("class", "graticule").attr("d", path(graticule))
    }


    function visualiseStateMap(country_boundaries, colorScale, svgName) {
        console.log("Visualising: ", svgName)
        const map = d3.select("#" + svgName).style("fill", "#44A7C4");
        const mapWidth = map.attr("width");
        const mapHeight = map.attr("height");
        var countries = topojson.feature(country_boundaries, country_boundaries.features);
        var countriesMesh = topojson.feature(country_boundaries, country_boundaries.features);
        var projection = d3.geoMercator().fitSize([mapWidth, mapHeight], country_boundaries);
        var path = d3.geoPath().projection(projection);
        let viewport = map.append("g");

        // STATE MESH
        viewport.append("path").datum(countriesMesh)
            .attr("class", "country-outline")
            .attr("fill", "none")
            .attr("d", path);

        // // ADD GRATICULE
        addGraticule(viewport, path)

        const [tooltip, nameTxt, hapinessScoreTxt, countTxt] = addTooltip(map, "hover")

        viewport.selectAll("path.country").data(country_boundaries.features)
            .join("path")
            .attr("class", "country")
            //.attr("note", d => d.id)
            .attr("d", path)
            .style("stroke", "black")
            .style("fill", "#1453ad")
            .style("stroke-width", ".5")
            .on('mouseover', mouseEntersPlot)
            .on('mouseout', mouseLeavesPlot)
            // .on('click', clickState)
            // MOUSEOVER FUNCTIONS FOR STATES
        let momesh = map.append("path")
            .attr("fill", "none")
            .attr("class", "mouseover outline")
            .attr("d", "");


        var zoom = d3.zoom()
            .scaleExtent([1, 10])

        .on("zoom", mapZoomed);


        map.call(zoom);
        map.call(zoom.transform, d3.zoomIdentity);

        function mapZoomed({ transform }) {
            viewport.attr("transform", transform.toString());
            viewport.select(".state-outline")
                .style("stroke-width", 2 / transform.k);
            viewport.select(".county-outline")
                .style("stroke-width", 1 / transform.k);
            viewport.select(".county-outline")
                .attr("visibility", (transform.k > 3) ? "visible" : "hidden");
            viewport.selectAll(".county")
                .attr("visibility", (transform.k > 3) ? "visible" : "hidden");
        }



        function mouseEntersPlot() {
            let element = d3.select(this);

            const country = element.datum();
            const countryName = country.properties.name;
            console.log(countryName)
            tooltip.style("visibility", "visible").attr("visibility", "visible");
            let selectedCountry;
            happiness.forEach((d, i) => {
                if (countryName == d.Country) {
                    selectedCountry = d
                }
            })
            nameText = `Name: ${selectedCountry["Country"]}`
            nameTxt.text(nameText);
            hapinessText = `Happiness Score: ${selectedCountry["Happiness Score"]}`
            hapinessScoreTxt.text(hapinessText);
            countTxt.text(`${globalFactor} Score: ${selectedCountry[globalFactor]}`)
                //let bounds = path.bounds(country);   // Get the pixel boundaries of the state
                // let xPos = (bounds[0][0]+bounds[1][0])/2.0;
                // let yPos = bounds[1][1] - 15; 
                // tooltip.attr("transform",`translate(${xPos},${yPos})`);

            var mo = topojson.mesh(country_boundaries, country_boundaries.features, function(a, b) { return a.id === countryName || b.id === countryName; });
            momesh.datum(mo).attr("d", path)
                .attr("stroke", "black")
                .attr("stroke-width", 20);
        }


        function mouseLeavesPlot() {
            let state = d3.select(this);
            tooltip.style("visibility", "hidden");
            momesh.attr("d", "");
        }


    }

    var margin2 = {
            top: 30,
            right: 30,
            bottom: 70,
            left: 60
        },
        width2 = 460 - margin2.left - margin2.right,
        height2 = 400 - margin2.top - margin2.bottom;

    var svg2 = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width2 + margin2.left + margin2.right)
        .attr("height", height2 + margin2.top + margin2.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin2.left + "," + margin2.top + ")");

    function update(factor) {
        globalFactor = factor;
        if (factor == "clear") {
            console.log("factor: clear")
            svg2.selectAll("*").remove();
            d3.selectAll("text").text("")
        } else {
            yearList = happiness.filter(function(d) {
                return (d.Year == year)
            })
            sortedYearList = yearList.sort((a, b) => d3.descending(a[factor], b[factor]))
            topTenCountries = sortedYearList.slice(0, 10)
            console.log("factor: ", factor)
            factorExtent = d3.extent(topTenCountries, d => d[factor])
            happinessExtent = d3.extent(topTenCountries, d => d["Happiness_Score"])
            countryList = []


            topTenCountries.forEach(d => {
                countryList.push(d['Country'])
            });
            var factorScale = d3.scaleLinear()
                .domain([factorExtent[0] - 0.01, factorExtent[1] + 0.01])
                .range([height2, 0])

            var happinessScale = d3.scaleLinear()
                .domain(happinessExtent)
                .range([-height2, 0]);


            const countryScale = d3.scaleBand()
                .domain(countryList)
                .range([0, width2])
                .padding(1);
            const axisBottom = d3.axisBottom(countryScale)
            const axisLeft = d3.axisLeft(factorScale)
            console.log(topTenCountries)
            var xAxis = svg2.append("g")
                .attr("transform", "translate(0," + height2 + ")")
                .call(axisBottom)
                .attr("class", "myXaxis")
                .transition()
                .selectAll("text")
                .style("text-anchor", "end")
                .style("font-family", "Trebuchet MS")
                .style("font-size", 14)
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");


            var yAxis = svg2.append("g")
                .attr("class", "myYaxis")
                .transition()
                .duration(1000)
                .call(axisLeft);



            var lines = svg2.selectAll("g.myline")
                .data(topTenCountries)
                .join("line")
                // .enter()
                .attr("class", "myline")
                .transition()
                .duration(1000)
                .attr("x1", d => countryScale(d.Country))
                .attr("x2", d => countryScale(d.Country))
                .attr("y1", d => factorScale(factorExtent[0] - 0.01))
                .attr("y2", d => factorScale(d[factor]))
                .attr("stroke", "grey")


            var circle = svg2.selectAll("circle")
                .data(topTenCountries)
                .join("circle")
                .transition()
                .duration(1000)
                .attr("cx", d => countryScale(d.Country))
                .attr("cy", d => factorScale(d[factor]))
                .attr("r", 13)
                .attr("fill", "#ccccff");
            //circle
            //.enter()




            const map = d3.select("#countriesMap");
            countriesList = []
            topTenCountries.forEach((d, i) => {
                countriesList.push(d.Country)
            })

            function highlightTop(list, d) {
                if (countriesList.includes(d.properties.name)) {
                    return colorScale(d.properties.name)
                } else {
                    return "white"
                }
            }

            map.selectAll("path.country")
                //.style("stroke", "black")
                .style("fill", d => highlightTop(countriesList, d))




        }
    }

    update("Family")
    buttons = d3.select("#buttonPanel");
    factors = ["Family", "GDP", "Life", "Freedom", "Trust", "Generosity"]
        // buttons.selectAll("filters")
        //     .data(factors)
        //     .join("button")
        //                 .style("width", 200)
        //         .style("height", 100)
        //         .attr("class", "filter")
        //     .text(d => d)
    factors.forEach((factor, i) => {
        buttons
            .append("button")
            .text(factor)
            .attr("id", factor)
            .classed("button", true)
            .attr("width", 200)
            .attr("height", 100)
            .style("padding-left", "20")
            .style("padding-left", "20")
            .on('click', function() {
                update("clear")
                update(factor)
            });
    })

    function addTooltip(map, path) {
        let tooltip = map.append("g")
            .attr("class", name)
            .attr("visibility", "hidden");
        let toolrect = tooltip.append("rect")
            .attr("fill", "black")
            .attr("opacity", 0.9)
            .attr("x", 10)
            .attr("y", 0)
            .attr("width", tooltipWidth)
            .attr("height", tooltipHeight)

        let nameTxt = tooltip.append("text")
            .attr("fill", "white")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "hanging")
            .attr("x", tooltipWidth / 2.0)
            .attr("y", 2);
        let hapinessScoreTxt = tooltip.append("text")
            .attr("fill", "white")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "hanging")
            .attr("x", tooltipWidth / 2.0)
            .attr("y", 22);
        let countTxt = tooltip.append("text")
            .attr("fill", "white")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "hanging")
            .attr("x", tooltipWidth / 2.0)
            .attr("y", 42);

        return [tooltip, nameTxt, hapinessScoreTxt, countTxt];

    }

}
requestData();