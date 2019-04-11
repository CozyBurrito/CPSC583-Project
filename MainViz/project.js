/*
    Adapted from CPSC 583 - Tutorial 3 and 5 
    code modified from Scott Murray's example
    https://alignedleft.com/tutorials/d3/scales
*/


/**
 * Call our functions on window load event
 */
window.onload = function () {
    setup();
};

/**
 * object to keep track of our magic numbers for margins
 * @type {{top: number, left: number, bottom: number, right: number}}
 */
const MARGINS = { top: 40, right: 10, bottom: 100, left: 160 };

const CATEGORIES = ["Thriller", "Mystery", "Sci-Fi", "Biography", "Horror", "Fantasy", "Drama", "Crime", "Comedy", "Animation", "Adventure", "Action"];

const COLORS = ["#C3F5CD", "#AAEFC5", "#91E9C5", "#7AE3CA", "#63DBD6", "#4CC0D3", "#369ACB", "#2A5DAC", "#1F2B8C", "#25166B"];

var Scatterplot = function () {
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

    this.zoom;

    this.tooltip;

    this.stayHighlightedColors = [];

    /**
     * Function setupScales initializes D3 scales for our x and y axes
     * @param xRange (required) array containing the bounds of the interval we are scaling to (e.g., [0,100]) for the x-axis
     * @param xDomain (required) array containing the bounds of the interval from which our input comes from (e.g., [0,1] for the x-axis
     * @param yRange (required) array containing the bounds of the interval we are scaling to (e.g., [0,100]) for the y-axis
     * @param yDomain (required) array containing the bounds of the interval from which our input comes from (e.g., [0,1] for the y-axis
     */
    this.setupScales = function (xRange, xDomain, yRange, yDomain) {
        this.xAxisScale = d3.scaleLog()
            .domain(xDomain).nice()
            .range(xRange).nice();

        this.yAxisScale = d3.scalePoint()
            .domain(yDomain)
            .range(yRange);

        // Size of circle is the films Runtime
        this.rScale = d3.scaleLinear()
            .domain([60, 180])
            .range([8, 20]);

        // Color represents average rating
        this.fillScale = d3.scaleQuantile()
            .domain([0, 100])
            .range(COLORS);
    };

    /**
     * Function setupAxes initializes D3 axes for our Scatterplot
     */
    this.setupAxes = function () {
        xLabel = "Revenue (Millions)";
        yLabel = "Genre";

        // call d3's axisBottom for the x-axis
        this.xAxis = d3.axisBottom(this.xAxisScale)
            .tickSize(-this.height + MARGINS.bottom + MARGINS.top - 26.25)
            .ticks(5)
            .tickFormat(d3.format(","))
            .tickPadding(10);
        // call d3's axisLeft for the y-axis
        this.yAxis = d3.axisLeft(this.yAxisScale)
            .tickSize(-this.width + MARGINS.left * 2)
            .ticks(10)
            .tickPadding(15);

        // call our axes inside "group" (<g></g>) objects inside our SVG container
        this.svgContainer.append("g")
            .attr("class", "xaxis")
            .attr("transform", `translate(0, ${this.height - MARGINS.bottom})`)
            .call(this.xAxis);
        this.svgContainer.append("g")
            .attr("transform", `translate(${MARGINS.left}, 0)`)
            .call(this.yAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").attr('transform', 'translate(' + 0 + ',' + -26.25 + ')'));

        // add text labels
        this.svgContainer.append("text")
            .attr("x", MARGINS.left)
            .attr("y", (this.height) / 2)
            .attr("transform", `rotate(-90, ${MARGINS.left / 3}, ${this.height / 2})`)
            .style("text-anchor", "middle")
            .attr("id", "labelText")
            .text(yLabel);
        this.svgContainer.append("text")
            .attr("x", (this.width) / 2)
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
    this.createCircles = function (xAxisSelector, yAxisSelector) {

        var clip = _vis.svgContainer
            .append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("id", "clip-rect")
            .attr("width", (_vis.width - MARGINS.left * 2))
            .attr("height", (_vis.height - MARGINS.top - MARGINS.bottom + 26.25))
            .attr('transform', 'translate(' + MARGINS.left + ',' + (MARGINS.top - 26.25) + ')');

        xAxisSelector = "Revenue";
        yAxisSelector = "Genre";

        this.tooltip = d3
            .componentsTooltip()
            .container(this.svgContainer)
            .content([
                {
                    left: "Title: ",
                    right: "{title}"
                },
                {
                    left: "Genre: ",
                    right: "{genre}"
                },
                {
                    left: "Director: ",
                    right: "{director}"
                },
                {
                    left: "Runtime (Min): ",
                    right: "{runtime}"
                },
                {
                    left: "Revenue (Millions): ",
                    right: "{revenue}"
                },
                {
                    left: "Average Rating: ",
                    right: "{avgRating}"
                }
            ]);

        // Use D3's selectAll function to create instances of SVG:circle virtually
        // per item in our data array
        this.datapoints = this.svgContainer.selectAll("circle")
            .data(this.data)
            .enter()
            .append("circle")
            .attr("class", "datapoint")
            .attr("clip-path", "url(#clip)")
            .attr("r", function (d) {                 // Scale radius based off of film's Runtime
                return _vis.rScale(d["Runtime"]);
            })
            .attr("cx", function (d) {
                return _vis.xAxisScale(d[xAxisSelector]);
            })
            .attr("cy", function (d) {
                return _vis.yAxisScale(d[yAxisSelector]);
            })
            .style("fill", function (d) {             // Color represents average rating
                return _vis.fillScale(d["AvgRating"]);
            })
            .attr("isFill", function (d) {             
                return d3.select(this).style("fill");
            })
            .on("mouseenter", (d, i) => {
                var xloc = _vis.xAxisScale(d[xAxisSelector]);
                var yloc = _vis.yAxisScale(d[yAxisSelector]) - 20;
                var direction = "bottom";
                var fill = _vis.fillScale(d["AvgRating"]);

                if (yloc < this.height / 4) {
                    direction = "top";
                    yloc += 40;
                }

                this.tooltip
                    .textColor("white")
                    .tooltipFill(fill)
                    .fontSize(14)
                    .x(xloc)
                    .y(yloc)
                    .direction(direction)
                    .leftMargin(3)
                    .rightMargin(13)
                    .contentMargin(5)
                    .heightOffset(8)
                    .show({
                        title: d.Title,
                        genre: d.Genre,
                        director: d.Director,
                        runtime: d.Runtime,
                        revenue: d.Revenue,
                        avgRating: d.AvgRating
                    });

                d3.select(d3.event.target)
                    .style('stroke', 'silver')
                    .style('opacity', 1)
                    .style('stroke-width', 1.5);

            })
            .on("mouseleave", (d, i) => {
                this.tooltip.hide();

                d3.select(d3.event.target)
                    .style('stroke', 'whitesmoke')
                    .style('opacity', 0.60)
                    .style('stroke-width', 1);
            });

    }

    // Setup the legends from the scales. Uses d3-legend
    this.setupLegends = function () {
        // The quantile color legend
        this.svgContainer.append("g")
            .attr("class", "legendQuant")
            .attr("transform", "translate(" + (_vis.width - MARGINS.left + 20) + "," + (MARGINS.top + 12) + ")");

        var quantileLegend = d3.legendColor()
            .labelFormat(d3.format(".2f"))
            .title("Average Rating")
            .scale(_vis.fillScale)
            .labelFormat(",d");

        this.svgContainer.select(".legendQuant")
            .call(quantileLegend);

        // The linear size legend
        this.svgContainer.append("g")
            .attr("class", "legendSize")
            .attr("transform", "translate(" + (_vis.width - MARGINS.left + 20) + "," + (MARGINS.top + 292) + ")");

        var legendSize = d3.legendSize()
            .scale(_vis.rScale)
            .shape('circle')
            .shapePadding(15)
            .labelOffset(20)
            .orient('vertical')
            .title("Runtime (Min)")
            .labelFormat(",d");

        this.svgContainer.select(".legendSize")
            .call(legendSize);

        this.svgContainer.selectAll(".legendQuant .legendCells .cell .swatch")
            .attr('stayHighlighted', false)
            .on('mouseover', function (d) {
                d3.select(this)
                    .style('opacity', 1)
                    .style('stroke-width', 1.5);
            })
            .on('mouseout', function (d) {
                if (d3.select(this).attr('stayHighlighted') == "false") {
                    d3.select(this)
                        .style('opacity', 0.6)
                        .style('stroke-width', 0);
                }
            })
            .on("click", function (d) {

                if (d3.select(this).attr('stayHighlighted') == "false") {
                    d3.select(this).attr('stayHighlighted', true);
                    _vis.stayHighlightedColors.push(d3.select(this).style("fill"));
                }
                else {
                    d3.select(this).attr('stayHighlighted', false);
                    _vis.stayHighlightedColors = _vis.stayHighlightedColors.filter(item => item !== d3.select(this).style("fill"));
                }

                console.log(_vis.stayHighlightedColors);
                

                if (_vis.stayHighlightedColors.length == "0") {
                    _vis.svgContainer.selectAll(".datapoint")
                        .each(function (d) {
                            d3.select(this)
                                .style("fill", function (d) {
                                    return _vis.fillScale(d["AvgRating"]);
                                })
                                .style('stroke-width', 1);
                        });
                }
                else {                  
                    _vis.svgContainer.selectAll(".datapoint")
                        .each(function (d) {
                            if (_vis.stayHighlightedColors.includes(d3.select(this).attr("isFill"))) {

                                d3.select(this)
                                    .style("fill", function (d) {
                                        return _vis.fillScale(d["AvgRating"]);
                                    })
                                    .style('stroke-width', 1);
                            }
                            else {
                                d3.select(this)
                                    .style('fill', 'none')
                                    .style('stroke-width', 0);
                            }
                        });
                }

            });
    }

    this.setupZoom = function () {
        this.zoom = d3.zoom()
            .scaleExtent([1, 30])
            .extent([[0, 0], [_vis.width, _vis.height]])
            .on("zoom", this.updateChart);

        this.svgContainer
            .append("rect")
            .attr("width", (_vis.width - MARGINS.left * 2))
            .attr("height", (_vis.height - MARGINS.top - MARGINS.bottom + 26.25))
            .style("fill", "black")
            .style("opacity", 0)
            .style("pointer-events", "scroll")
            .attr('transform', 'translate(' + MARGINS.left + ',' + (MARGINS.top - 26.25) + ')')
            .call(this.zoom);

    }

    this.updateChart = function () {
        var newXAxisScale = d3.event.transform.rescaleX(_vis.xAxisScale);

        d3.select(".xaxis")
            .call(_vis.xAxis.scale(newXAxisScale).ticks(4));

        _vis.svgContainer.selectAll(".datapoint")
            .attr("cx", function (d) {
                return newXAxisScale(d["Revenue"]);
            })
            .on("mouseenter", (d, i) => {
                var xloc = newXAxisScale(d["Revenue"]);
                var yloc = _vis.yAxisScale(d["Genre"]) - 20;
                var direction = "bottom";
                var fill = _vis.fillScale(d["AvgRating"]);

                if (yloc < _vis.height / 4) {
                    direction = "top";
                    yloc += 40;
                }

                _vis.tooltip
                    .textColor("white")
                    .tooltipFill(fill)
                    .fontSize(14)
                    .x(xloc)
                    .y(yloc)
                    .direction(direction)
                    .leftMargin(3)
                    .rightMargin(13)
                    .contentMargin(5)
                    .heightOffset(8)
                    .show({
                        title: d.Title,
                        genre: d.Genre,
                        director: d.Director,
                        runtime: d.Runtime,
                        revenue: d.Revenue,
                        avgRating: d.AvgRating
                    });

                d3.select(d3.event.target)
                    .style('stroke', 'silver')
                    .style('opacity', 1)
                    .style('stroke-width', 1.5);
            })
            .on("mouseleave", (d, i) => {
                _vis.tooltip.hide();

                d3.select(d3.event.target)
                    .style('stroke', 'whitesmoke')
                    .style('opacity', 0.60)
                    .style('stroke-width', 1);
            });


    }

};

/**
 * Global variables
 */
var _vis;               // our visualization

/**
 * Function setup: sets up our visualization environment.
 */
function setup() {
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
function loadData(path) {
    // call D3's loading function for CSV and load the data to our global variable _data
    d3.csv(path).then(function (data) {
        _vis.data = data;
        // let's use the scales and domain from Life Satisfaction and Employment Rate
        _vis.setupScales([MARGINS.left, _vis.width - MARGINS.left], [1e-2, 950],
            [_vis.height - MARGINS.bottom - 30, MARGINS.top], CATEGORIES);
        _vis.setupAxes();
        _vis.setupZoom();
        _vis.createCircles();
        _vis.setupLegends();
    });
}