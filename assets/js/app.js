
var svgWidth = 1000;
var svgHeight = 600;
var transitionTime = 1000; // 300
var transitionStyle = "linear"; // "linear"

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var files = ["assets/data/data.csv"];

Promise.all(files.map(url => d3.csv(url))).then(drawChart);

// -------------------------------------------------------------

function drawChart(cvsData) {
  //console.log(error);
  //onsole.log(topojsonData);
  console.log(cvsData);
  cvsData = cvsData[0];
  console.log(cvsData);
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    cvsData.forEach( data => {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });

  var curX = "poverty";
  var curY = "obesity";
  var xMin;
  var xMax;
  var yMin;
  var yMax;

  // a. change the min and max for x
  function xMinMax() {
    // min will grab the smallest datum from the selected column.
    xMin = d3.min(cvsData, function(d) {
      return parseFloat(d[curX]) * 0.90;
    });

    // .max will grab the largest datum from the selected column.
    xMax = d3.max(cvsData, function(d) {
      return parseFloat(d[curX]) * 1.10;
    });
  }

  // b. change the min and max for y
  function yMinMax() {
    // min will grab the smallest datum from the selected column.
    yMin = d3.min(cvsData, function(d) {
      return parseFloat(d[curY]) * 0.90;
    });

    // .max will grab the largest datum from the selected column.
    yMax = d3.max(cvsData, function(d) {
      return parseFloat(d[curY]) * 1.10;
    });
  }

  // c. change the classes (and appearance) of label text when clicked.
  function labelChange(axis, clickedText) {
    // Switch the currently active to inactive.
    d3
      .selectAll(".axisText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // Switch the text just clicked to active.
    clickedText.classed("inactive", false).classed("active", true);
  }

  xMinMax();
  yMinMax();

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      //.domain([8, d3.max(cvsData, d => d.poverty)+1])
      //.range([0, width]);
      .domain([xMin, xMax])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      //.domain([2, d3.max(cvsData, d => d.healthcare)+1])
      //.range([height, 0]);
      .domain([yMin, yMax])
      // Height is inverses due to how d3 calc's y-axis placement
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis)
    .attr("class", "xAxis");

    chartGroup.append("g")
    .call(leftAxis)
    .attr("class", "yAxis");

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(cvsData)
    .enter();

    circlesGroup.append("circle")
    //.attr("cx", d => xLinearScale(d.poverty))
    .attr("cx", d => xLinearScale(d[curX]))
    .attr("cy", d => yLinearScale(d[curY])-5)
    //.attr("cy", d => yLinearScale(d.healthcare)-5)
    .attr("r", "14")
    .attr("fill", "coral")
    .attr("opacity", ".5")
    .on("mouseover", data => {
      toolTip.show(data, this);
    }).on("mouseout", data => {
        toolTip.hide(data);
    });

    // Step 6: Create the text group
    // ==============================
    //var textGroup = chartGroup.selectAll("text")
    //.data(healthData)
    //.enter()
    circlesGroup.append("text")
    .attr("text-anchor", "middle")
    //.attr("x", d => xLinearScale(d.poverty))
    .attr("dx", d => xLinearScale(d[curX]))
    .attr("dy", d => yLinearScale(d[curY]))
    //.attr("y", d => yLinearScale(d.healthcare))
    //.style("font-size", "15px")
    .attr("class", "stateText")
    .attr("fill", "grey")
    .text(d => d.abbr)
    .on("mouseover", data => {
      toolTip.show(data, this);
    }).on("mouseout", data => {
        toolTip.hide(data);
    });

    // Step 7: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      //.offset([80, -60])
      .offset([45, -83])
      .html( d => {
        return (`<b>${d.state}</b> (${d.abbr})<br>Poverty: ${d.poverty}%<br>HealthCare: ${d.healthcare}%`);
      });

    // Step 8: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 9: Create event listeners to display and hide the tooltip
    // ==============================
    //circlesGroup

    // Create Y labels
    /*
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");
    */

    // 1. Obesity
    chartGroup
   .append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 0 - margin.left + 60)
   .attr("x", 0 - (height / 2))
   .attr("data-name", "obesity")
   .attr("data-axis", "y")
   .attr("class", "axisText active y")
   .text("Obese (%)");
 
 // 2. Smokes
 chartGroup
   .append("text")
   .attr("transform", "rotate(-90)")
   .attr("x", 0 - (height / 2))
   .attr("y", 0 - margin.left + 40)
   .attr("data-name", "smokes")
   .attr("data-axis", "y")
   .attr("class", "axisText inactive y")
   .text("Smokes (%)");
 
 // 3. Lacks Healthcare
 chartGroup
   .append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 0 - margin.left + 20)
   .attr("x", 0 - (height / 2))
   .attr("data-name", "healthcare")
   .attr("data-axis", "y")
   .attr("class", "axisText inactive y")
   .text("Lacks Healthcare (%)");

    // Create X labels
    /*
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");
    */
    // 1. Poverty
    chartGroup
    .append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
    .attr("y", -20)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "axisText active x")
    .text("In Poverty (%)");
    // 2. Age
    chartGroup
    .append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "axisText inactive x")
    .text("Age (Median)");
    // 3. Income
    chartGroup
    .append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
    .attr("y", 20)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "axisText inactive x")
    .text("Household Income (Median)");
    
     // Select all axis text and add this d3 click event.
  d3.selectAll(".axisText").on("click", function() {
    //alert('clicked');
    // Make sure we save a selection of the clicked text,
    // so we can reference it without typing out the invoker each time.
    var self = d3.select(this);

    // We only want to run this on inactive labels.
    // It's a waste of the processor to execute the function
    // if the data is already displayed on the graph.
    if (self.classed("inactive")) {
      // Grab the name and axis saved in label.
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");

      // When x is the saved axis, execute this:
      if (axis === "x") {
        // Make curX the same as the data name.
        curX = name;

        // Change the min and max of the x-axis
        xMinMax();

        // Update the domain of x.
        xLinearScale.domain([xMin, xMax]);

        // Now use a transition when we update the xAxis.
        svg.select(".xAxis").transition().duration(transitionTime).call(bottomAxis);

        // With the axis changed, let's update the location of the state circles.
        d3.selectAll("circle").each(function() {
          // Each state circle gets a transition for it's new attribute.
          // This will lend the circle a motion tween
          // from it's original spot to the new location.
          d3
            .select(this)
            .transition()
            //.ease(d3.easeElastic)
            .attr("cx", function(d) {
              return xLinearScale(d[curX]);
            })
            .duration(transitionTime);
        });

        // We need change the location of the state texts, too.
        d3.selectAll(".stateText").each(function() {
          // We give each state text the same motion tween as the matching circle.
          d3
            .select(this)
            .transition()
            //.ease(d3.easeElastic)
            .attr("dx", function(d) {
              return xLinearScale(d[curX]);
            })
            .duration(transitionTime);
        });

        // Finally, change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
      else {
        // When y is the saved axis, execute this:
        // Make curY the same as the data name.
        curY = name;

        // Change the min and max of the y-axis.
        yMinMax();

        // Update the domain of y.
        yLinearScale.domain([yMin, yMax]);

        // Update Y Axis
        svg.select(".yAxis").transition().duration(transitionTime).call(leftAxis);

        // With the axis changed, let's update the location of the state circles.
        d3.selectAll("circle").each(function() {
          // Each state circle gets a transition for it's new attribute.
          // This will lend the circle a motion tween
          // from it's original spot to the new location.
          d3
            .select(this)
            .transition()
            .ease(d3.easeBounce)
            .attr("cy", function(d) {
              return yLinearScale(d[curY])-5;
            })
            .duration(transitionTime);
        });

        // We need change the location of the state texts, too.
        d3.selectAll(".stateText").each(function() {
          // We give each state text the same motion tween as the matching circle.
          d3
            .select(this)
            .transition()
            .ease(d3.easeBounce)
            .attr("dy", function(d) {
              return yLinearScale(d[curY]);
            })
            .duration(transitionTime);
        });

        // Finally, change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
    }
  });

  }
