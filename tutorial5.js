/**
 * Call our functions on window load event
 */
window.onload = function(){
    setupVis1();
    setupVis2();
    setupVis3();
    setupVis4();
    setupVis5();
};

const SAMPLE_DATA = [
    { "month" : "January", "point" : [5, 20], "r" : 10 },
    { "month" : "February", "point" : [480, 90], "r" : 1 },
    { "month" : "March", "point" : [250, 50], "r" : 3 },
    { "month" : "April", "point" : [100, 33], "r" : 3 },
    { "month" : "May", "point" : [330, 95], "r" : 4 },
    { "month" : "June", "point" : [300, 40], "r" : 8 },
    { "month" : "July", "point" : [410, 35], "r" : 6 },
    { "month" : "August", "point" : [475, 44], "r" : 4 },
    { "month" : "September", "point" : [25, 67], "r" : 1 },
    { "month" : "October", "point" : [85, 21], "r" : 5 },
    { "month" : "November", "point" : [220, 88], "r" : 10 },
    { "month" : "December", "point" : [400, 4], "r" : 7 },
];

const WIDTH = 1000;
const HEIGHT = 300;
const PAD = 10;
const MARGIN = 50;

// code modified from Scott Murray's example
// https://alignedleft.com/tutorials/d3/scales
function setupVis1(){
    // Here we create linear scales to map our x values to the width of the svg viewport
    let xScale = d3.scaleLinear()
        .domain([0, d3.max(SAMPLE_DATA, function(d) { return d.point[0]; })])
        .range([MARGIN, WIDTH-MARGIN]); // limit our range within the margins

    // Here we create linear scales to map our y values to the height of the svg viewport
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(SAMPLE_DATA, function(d) { return d.point[1]; })])
        .range([MARGIN, HEIGHT-MARGIN]);

    //Create SVG element
    let svg = d3.select("#vis1")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

    svg.selectAll("circle")
        .data(SAMPLE_DATA)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d.point[0]);
        })
        .attr("cy", function(d) {
            return yScale(d.point[1]);
        })
        .attr("r", 5)
        .style("fill", "coral")
        .style("stroke", "none");

    svg.selectAll("text")
        .data(SAMPLE_DATA)
        .enter()
        .append("text")
        .text(function(d) {
            return d.month;
        })
        .attr("x", function(d) {
            return xScale(d.point[0]) + PAD;
        })
        .attr("y", function(d) {
            return yScale(d.point[1]);
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "teal")
        .style("text-anchor", "start")
        .style("alignment-baseline", "middle");
}

function setupVis2(){
    let xScale = d3.scaleLinear()
        .domain([0, d3.max(SAMPLE_DATA, function(d) { return d.point[0]; })])
        .range([MARGIN, WIDTH-MARGIN]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(SAMPLE_DATA, function(d) { return d.point[1]; })])
        .range([MARGIN, HEIGHT-MARGIN]);

    // Here we create a power scale with an exponent value of 2
    // which we will use to resize the radii of our circle data points
    let sizeScale = d3.scalePow()
        .exponent(2)
        .domain([0, d3.max(SAMPLE_DATA, function(d) { return d.r; })])
        .range([5, 50]); // 0 to 50 pixels

    //Create SVG element
    let svg = d3.select("#vis2")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

    svg.selectAll("circle")
        .data(SAMPLE_DATA)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d.point[0]);
        })
        .attr("cy", function(d) {
            return yScale(d.point[1]);
        })
        .attr("r", function(d){
            return sizeScale(d.r);  // call our sizeScale function to map values from d.r
        })
        .style("fill", "coral")
        .style("stroke", "none");

    svg.selectAll("text")
        .data(SAMPLE_DATA)
        .enter()
        .append("text")
        .text(function(d) {
            return d.month;
        })
        .attr("x", function(d) {
            return xScale(d.point[0]) + sizeScale(d.r) + 2;
        })
        .attr("y", function(d) {
            return yScale(d.point[1]);
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "teal")
        .style("text-anchor", "start")
        .style("alignment-baseline", "middle");
}

function setupVis3(){
    let xScale = d3.scaleLinear()
        .domain([0, d3.max(SAMPLE_DATA, function(d) { return d.point[0]; })])
        .range([MARGIN, WIDTH-MARGIN]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(SAMPLE_DATA, function(d) { return d.point[1]; })])
        .range([MARGIN, HEIGHT-MARGIN]);

    // Here we call D3's scaleOrdinal function and pass it with the schema name for
    // schemeDark2 which is a pre-defined set of colours for discrete values available in D3
    let colorScale = d3.scaleOrdinal(d3["schemeDark2"]);

    //Create SVG element
    let svg = d3.select("#vis3")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

    svg.selectAll("circle")
        .data(SAMPLE_DATA)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d.point[0]);
        })
        .attr("cy", function(d) {
            return yScale(d.point[1]);
        })
        .attr("r", 10)
        .style("fill", function(d){
            // when passing the month value, D3 will assign a unique
            // colour per unique month value
            // e.g., all "January" values will have a different colour
            // from "February" values, but all "January" values will be
            // of the same colour
            return colorScale(d.month);
        })
        .style("stroke", "none");

    svg.selectAll("text")
        .data(SAMPLE_DATA)
        .enter()
        .append("text")
        .text(function(d) {
            return d.month;
        })
        .attr("x", function(d) {
            return xScale(d.point[0]) + PAD*1.5;
        })
        .attr("y", function(d) {
            return yScale(d.point[1]);
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "teal")
        .style("text-anchor", "start")
        .style("alignment-baseline", "middle");
}

function setupVis4(){
    let xScale = d3.scaleLinear()
        .domain([0, d3.max(SAMPLE_DATA, function(d) { return d.point[0]; })])
        .range([MARGIN, WIDTH-MARGIN]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(SAMPLE_DATA, function(d) { return d.point[1]; })])
        .range([MARGIN, HEIGHT-MARGIN]);

    // Create a scale using d3.scaleQuantize to bin values from the domain
    // into categories coloured as deeppink, pink, paleturquoise, and darkturquoise
    // the values are divided equally to each category
    // e.g., if the upper limit to the domain is 100, and we specified 4 categories,
    // then the first category will have values between 0 and 25, then 25 and 50, etc.
    let colorScale = d3.scaleQuantize()
        .domain([0, d3.max(SAMPLE_DATA, function(d) { return d.r; })])
        .range(["deeppink", "pink", "paleturquoise", "darkturquoise"]);

    let sizeScale = d3.scalePow()
        .exponent(2)
        .domain([0, d3.max(SAMPLE_DATA, function(d) { return d.r; })])
        .range([5, 50]); // 0 to 50 pixels

    //Create SVG element
    let svg = d3.select("#vis4")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

    svg.selectAll("circle")
        .data(SAMPLE_DATA)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d.point[0]);
        })
        .attr("cy", function(d) {
            return yScale(d.point[1]);
        })
        .attr("r", function(d){
            return sizeScale(d.r);
        })
        .style("fill", function(d){
            return colorScale(d.r);
        })
        .style("stroke", "none");

    svg.selectAll("text")
        .data(SAMPLE_DATA)
        .enter()
        .append("text")
        .text(function(d) {
            return d.month;
        })
        .attr("x", function(d) {
            return xScale(d.point[0]) + sizeScale(d.r) + (PAD/2);
        })
        .attr("y", function(d) {
            return yScale(d.point[1]);
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "teal")
        .style("text-anchor", "start")
        .style("alignment-baseline", "middle");
}

// code modified from Jerome Freye's example @ http://bl.ocks.org/jfreyre/b1882159636cc9e1283a
function setupVis5(){
    const NUM_SQUARES = 100;

    // this code interpolates between 2 colours
    let colorScale = d3.scaleLinear()
        .domain([0, 100])
        .interpolate(d3.interpolateHcl) // this interpolation is based off the hcl colour gamut
        // other colour gamuts are interpolateHsl, interpolateRGB
        .range(["blue", "yellow"]);

    /*
     * if you want to interpolate with more than one colour
     * you can add "stops" to the domain array
     * e.g., [0, 50, 100]
     * and a corresponding colour in your range,
     * e.g., ["blue", "yellow", red"]
     * D3 will then find the colours between
     * blue to yellow (values 0-50), and from yellow to red
     * (values 51-100)
     */

    var container = d3.select("#vis5");

    for (let i = 0; i < NUM_SQUARES; i++){
        container.append("div")
            .attr("style", function(){
                return `background-color: ${colorScale(i)}`;
            })
    }
}


