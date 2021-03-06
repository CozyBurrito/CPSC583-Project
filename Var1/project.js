/*
    Adapted from CPSC 583 - Tutorial 3 and 5 
    code modified from Scott Murray's example
    https://alignedleft.com/tutorials/d3/scales
*/


/**
 * Call our functions on window load event
 */
window.onload = function(){
    setup();
};

/**
 * object to keep track of our magic numbers for margins
 * @type {{top: number, left: number, bottom: number, right: number}}
 */
const MARGINS = {top: 40, right: 10, bottom: 100, left: 150};

const CATEGORIES = ["Thriller", "Mystery", "Sci-Fi", "Biography", "Horror", "Fantasy", "Drama", "Crime", "Comedy", "Animation", "Adventure", "Action"];

const COLORS = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"];

var Scatterplot = function(){
    this.data;          // contains our dataset
    this.width = 800;   // default value of 1000
    this.height = 750;  // default value of 700

    this.svgContainer;  // the SVG element where we will be drawing our vis
    this.datapoints;    // SVG elements per data point

    // D3 axes
    this.xAxis;
    this.yAxis;

    // D3 scales
    this.xAxisScale;
    this.yAxisScale;
    this.rScale;
    this.fillScale;

    /**
     * Function setupScales initializes D3 scales for our x and y axes
     * @param xRange (required) array containing the bounds of the interval we are scaling to (e.g., [0,100]) for the x-axis
     * @param xDomain (required) array containing the bounds of the interval from which our input comes from (e.g., [0,1] for the x-axis
     * @param yRange (required) array containing the bounds of the interval we are scaling to (e.g., [0,100]) for the y-axis
     * @param yDomain (required) array containing the bounds of the interval from which our input comes from (e.g., [0,1] for the y-axis
     */
    this.setupScales = function(xRange, xDomain, yRange, yDomain){
        this.xAxisScale = d3.scaleLinear()
            .domain(xDomain)
            .range(xRange);

        this.yAxisScale = d3.scalePoint()
            .domain(yDomain)
            .range(yRange);

        // Size of circle is the films Runtime
        this.rScale = d3.scaleLinear()
            .domain(d3.extent(this.data, function (d) { return +d["Runtime"]; } )) 
            .range([8,20]);

        // Color represents average rating
        this.fillScale = d3.scaleQuantile()
            .domain(d3.extent(this.data, function (d) { return +d["AvgRating"]; } ))
            .range(COLORS);
    };

    /**
     * Function setupAxes initializes D3 axes for our Scatterplot
     */
    this.setupAxes = function(){
        xLabel = "Revenue (Millions)";
        yLabel = "Genre";

        // call d3's axisBottom for the x-axis
        this.xAxis = d3.axisBottom(this.xAxisScale)
            .tickSize(-this.height + MARGINS.bottom + MARGINS.top)
            .ticks(10)
            .tickPadding(10);
        // call d3's axisLeft for the y-axis
        this.yAxis = d3.axisLeft(this.yAxisScale)
            .tickSize(-this.width + MARGINS.left*2)
            .ticks(10)
            .tickPadding(10);

        // call our axes inside "group" (<g></g>) objects inside our SVG container
        this.svgContainer.append("g")
            .attr("transform", `translate(0, ${this.height - MARGINS.bottom })`)
            .call(this.xAxis);
        this.svgContainer.append("g")
            .attr("transform", `translate(${MARGINS.left}, 0)`)
            .call(this.yAxis);

        // add text labels
        this.svgContainer.append("text")
            .attr("x", MARGINS.left)
            .attr("y", (this.height)/2)
            .attr("transform", `rotate(-90, ${MARGINS.left / 3}, ${this.height/2})`)
            .style("text-anchor", "middle")
            .attr("id", "labelText")
            .text(yLabel);
        this.svgContainer.append("text")
            .attr("x", (this.width)/2)
            .attr("y", (this.height - MARGINS.top))
            .style("text-anchor", "middle")
            .attr("id", "labelText")
            .text(xLabel);

    };

    /**
     * Function createCircles initializes the datapoints in our scatterplot
     * @param xAxisSelector the data property for values to appear in x-axis
     * @param yAxisSelector the data property for values to appear in y-axis
     */
    this.createCircles = function(xAxisSelector, yAxisSelector){
        // default to Life Satisfaction and Employment Rate
        xAxisSelector = "Revenue";
        yAxisSelector = "Genre";

        // Use D3's selectAll function to create instances of SVG:circle virtually
        // per item in our data array
        this.datapoints = this.svgContainer.selectAll("circle")
            .data(this.data)    
            .enter()            
            .append("circle")   
            .attr("r", function(d){                 // Scale radius based off of film's Runtime
                return _vis.rScale(d["Runtime"]);
            })
            .attr("cx", function(d){
                return _vis.xAxisScale(d[xAxisSelector]);
            })
            .attr("cy", function(d){
                return _vis.yAxisScale(d[yAxisSelector]);
            })
            .style("fill", function(d){             // Color represents average rating
                return _vis.fillScale(d["AvgRating"]);
            })
            .style("stroke", "white")
            .append("svg:title")
            .text(function(d){
                return "Title: " + d.Title + "\n" 
                        + "Genre: " + d.Genre + "\n" 
                        + "Director: " + d.Director + "\n" 
                        + "Runtime (Min): " + d.Runtime + "\n" 
                        + "Revenue (Millions): " + d.Revenue + "\n" 
                        + "AvgRating: " + d.AvgRating;
            });
    }

    // Setup the legends from the scales. Uses d3-legend
    this.setupLegends = function(){
        // The quantile color legend
        this.svgContainer.append("g")
            .attr("class", "legendQuant")
            .attr("transform", "translate(" + (_vis.width-MARGINS.left+10) + "," + (MARGINS.top+12) + ")");

        var quantileLegend = d3.legendColor()
            .labelFormat(d3.format(".2f"))
            .title("Average Rating")
            .scale(_vis.fillScale);

        this.svgContainer.select(".legendQuant")
            .call(quantileLegend);

        // The linear size legend
        this.svgContainer.append("g")
            .attr("class", "legendSize")
            .attr("transform", "translate(" + (_vis.width-MARGINS.left+10) + "," + (MARGINS.top+262) + ")");

        var legendSize = d3.legendSize()
            .scale(_vis.rScale)
            .shape('circle')
            .shapePadding(15)
            .labelOffset(20)
            .orient('vertical')
            .title("Runtime (Min)");

        this.svgContainer.select(".legendSize")
            .call(legendSize);

    }

};

/**
 * Global variables
 */
var _vis;               // our visualization

/**
 * Function setup: sets up our visualization environment.
 */
function setup(){
    _vis = new Scatterplot();
    _vis.svgContainer = d3.select("#vis");
    // dynamically change our SVG container's dimensions with the current browser dimensions
    _vis.width = _vis.svgContainer.node().getBoundingClientRect().width != undefined ?
        _vis.svgContainer.node().getBoundingClientRect().width :
        _vis.width;
    _vis.height = _vis.svgContainer.node().getBoundingClientRect().height != undefined ?
        _vis.svgContainer.node().getBoundingClientRect().height :
        _vis.height;

    loadData("IMDB_dataset_processed.csv");
}

/**
 * Function loadData: loads data from a given CSV file path/url
 * @param path string location of the CSV data file
 */
function loadData(path){
    // call D3's loading function for CSV and load the data to our global variable _data
    d3.csv(path).then(function(data){
        _vis.data = data;
        // let's use the scales and domain from Life Satisfaction and Employment Rate
         _vis.setupScales([MARGINS.left, _vis.width-MARGINS.left], [-10, 950],
             [_vis.height-MARGINS.bottom-30, MARGINS.top], CATEGORIES);
        _vis.setupAxes();
        _vis.createCircles();
        _vis.setupLegends();
    });
}
