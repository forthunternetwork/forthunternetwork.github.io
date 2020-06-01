// viz-block-3

//slider start year
var selectedYearThree = 1745;
$("#selected-year-3").change(function(){
  selectedYearThree = $(this).val();
  showLinkLinesThree();
  updateNodeSizeThree();
  //showText();
});

// label year slider
$('#selected-year-3').on('input change', function(){
      $(this).next($('.slider_label-3')).html(this.value);
    });
  $('.slider_label-3').each(function(){
      var value = $(this).prev().attr('value');
      $(this).html(value);
    });

// variable to store node size
var nodeSizeThree = ['degree'];

// select node size
$("#node-size-3").change(function(){
  nodeSizeThree = $(this).val();
  updateNodeSizeThree()
});

// variable to store button coloring
var colorFillCategoryThree = ['gender'];
//var colorStrokeCategoryThree = ['gender'];
var colorFillLegendThree = ['gender'];
//var colorStrokeLegendThree = ['gender'];

// filter based on gender or color
$("#filter-fill-3").change(function(){
  colorFillCategoryThree = $(this).val();
  colorFillLegendThree = $(this).val();
  updateLegendThree();
  updateNodeColorThree();
});

//$("#filter-stroke-3").change(function(){
//  colorStrokeCategoryThree = $(this).val();
//  colorStrokeLegendThree = $(this).val();
//  updateLegendThree();
//  updateNodeOutlineThree()
//});

// preallocate linkedbyindex
let linkedByIndexThree = {};

// build the svg for the viz
var svgThree = d3.select("#viz-3")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 " + width + " " + height)
  .call(d3.zoom().on("zoom", function() {
    svgThree.attr("transform", d3.event.transform)
  }))
  .on("dblclick.zoom", null)
  .append("g");

var legendDomainThree = genderDomain;
var fillLegendThree = ['gender'];
//var strokeLegendThree = ['gender'];

var legendThree = d3.select("#viz-3").select("svg");

legendThree.append("g")
  .attr("class", "legendOrdinal-3")
  .attr("id", "legend-3")
  .attr("transform", "translate(20,20)");

var legendOrdinalThree = d3.legendColor()
  .shapePadding(10)
  .cellFilter(function(d){
    var filterOut = $(allDomains).not(legendDomainThree).get();
    return !filterOut.includes(d.label)
    })
  .scale(color);

legendThree.select(".legendOrdinal-3")
  .call(legendOrdinalThree);

function redrawLegendThree() {
  var color = d3.scaleOrdinal()
  .domain(allDomains)
  .range(selectedColorPalette);
  svgThree.selectAll(".legendOrdinal-3").remove();
  legendThree.select(".legendOrdinal-3").call(legendOrdinalThree);
}

// use force simulation
// is there a way to change the collision distance on radius change?
var simulationThree = d3.forceSimulation()
  .force("link", d3.forceLink().id(function(d) {
    return d.name;
  }).strength(1))
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(function(d) {
    return (d.betweenesscentrality_1745 * 150 + d.degree_1745) / 2 + 15
  }));

// Define the div for the tooltip
var divThree = d3.select("body").append("div")
  .attr("class", "tooltip-3");
var toggleThree = 0;

// load the data, pass in error, graph variables
d3.json("native.json", function(error, graph) {
  if (error) throw error;

  var linkThree = svgThree.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line");
  //.attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var nodeThree = svgThree.selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("id", function(d) { return d.name + "-3"})
    .attr("r", function(d) { return d.degree_1745 + 2; })
    .attr("fill", function(d) {
      return color(d[colorFillCategoryThree]);
    })
    .on("mouseover", function(d) {
      div.html("<h6>" + d.name + "</h6><strong>Race:</strong> " + d.race + "</br><strong>Gender:</strong> " + d.gender + "</br><strong>Clan:</strong> " + d.clan + "</br><strong>First appeared as:</strong> " + d.role + "</br><strong>Subcommunity:</strong> " + d.modularity_class)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
        .style("opacity", 1);
    })
    .on("mouseout", function(d) {
      div.transition()
        .duration(50) // duration is critical for mouse over.. if a user is moving the mouse fast the tooltip is not responsive
        .style("opacity", 0);
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on('dblclick', connectedNodesThree);

  var textThree = svgThree.selectAll("text")
    .data(nodeThree)
    .enter()
    .append("text");

  var labelsThree = textThree
    .attr("x", function(d) {
      return d.cx
    })
    .attr("y", function(d) {
      return d.cy
    })
    .text(function(d) {
      return "( " + d.cx + ", " + d.cy + " )"
    })
  simulationThree
    .nodes(graph.nodes)
    .on("tick", tickedThree);
  simulationThree.force("link")
    .links(graph.links);
  function tickedThree() {
    linkThree
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });
    nodeThree
      .attr("cx", function(d) {
        return d.x;
      })
      .attr("cy", function(d) {
        return d.y;
      });
  }

  // mouse double click highlight is taken from this example:
  // http://www.coppelia.io/2014/06/finding-neighbours-in-a-d3-force-directed-layout-3/
  // we need to create an array of "connections" for quick lookup
  var linkedByIndexThree = {};
  for (i = 0; i < graph.nodes.length; i++) {
      linkedByIndexThree[i + "," + i] = 1;
  };

  // Loop over each "link" and determine if they are connectioned
  graph.links.forEach(function (d) {
      linkedByIndexThree[d.source.index + "," + d.target.index] = 1;
  });

  // define a "lookup" function to get connections
  function neighboringThree(a, b) {
      return linkedByIndexThree[a.index + "," + b.index];
  };
  linksThree = d3.selectAll('line');

  // set opacity based on connections
  function connectedNodesThree() {
      if (toggleThree == 0) {
          // select the nodes
          d = d3.select(this).node().__data__;
          // loop over each node and style
          nodeThree.style("opacity", function (o) {
              // ? is a conditional operator of the form condition ? value-if-true : value-if-false
              return neighboringThree(d, o) | neighboringThree(o, d) ? 1 : 0.15;
          });
          toggleThree = 1;
      } else {
          nodeThree.style("opacity", 1);;
          toggleThree = 0;
      }
  };
});

//update legend domains

function updateLegendThree() {
  legendDomainThree = [];

  if (colorFillLegendThree == ['race']) {
    var fillLegendThree = raceDomain
  } else if (colorFillLegendThree == ['gender']) {
    var fillLegendThree = genderDomain
  } else if (colorFillLegendThree == ['clan']) {
    var fillLegendThree = clanDomain
  } else if (colorFillLegendThree == ['modularity_class']) {
    var fillLegendThree = modularityDomain
  } else if (colorFillLegendThree == ['role']) {
    var fillLegendThree = roleDomain
  }

  if (typeof fillLegendThree == 'undefined') {
    fillLegendThree = genderDomain
  }
  //if (typeof strokeLegendThree == 'undefined') {
  //  strokeLegendThree = raceDomain
  //}

  legendDomainThree = fillLegendThree
};

// Update node size

function updateNodeSizeThree(){
  var allCirclesThree = svgThree.selectAll('circle')
  // loop over each node, and update color attribute
  allCirclesThree.transition().duration(300).attr("r", function(d) {
    if (nodeSizeThree == 'betweenness') {
      nodeSizeValueThree = d["betweenesscentrality_" + selectedYearThree] * 150 + 5
    } else {
      nodeSizeValueThree = d["degree_" + selectedYearThree] + 2
    }
    return nodeSizeValueThree;
    })
  allCirclesThree.exit().remove()
};

/* ------------ Update Node Color --------------*/
// function to get all nodes, and change the color. Follow the general update pattern
// https://bl.ocks.org/mbostock/3808218

function updateNodeColorThree(){
  var color = d3.scaleOrdinal()
  .domain(allDomains)
  .range(selectedColorPalette);
  var allCirclesThree = svgThree.selectAll('circle')
  // loop over each node, and update color attribute
  allCirclesThree.transition().duration(300).attr("fill", function(d,i){
    return color(d[colorFillCategoryThree])
  });
  allCirclesThree.exit().remove();
  ////update legend
  redrawLegendThree();
};

function updateNodeOutlineThree(){
  var color = d3.scaleOrdinal()
  .domain(allDomains)
  .range(selectedColorPalette);
  var allCirclesThree = svgThree.selectAll('circle')
  // loop over each node, and update color attribute
  allCirclesThree.transition().duration(300).attr("stroke", function(d,i){
    return color(d[colorStrokeCategoryThree])
  });
  allCirclesThree.exit().remove();
  ////update legend
  redrawLegendThree();

};

function showLinkLinesThree(){
  var filterIdThree = [];
  var allLinesThree = svgThree.selectAll('line');
  var allNodesThree = svgThree.selectAll('circle');
  // loop over each node, and update color attribute
  allLinesThree.style("stroke-opacity", function(d,i){
    return d.year <= parseInt(selectedYearThree) ? 0.7 : 0
  });
  allLinesThree.exit().remove()
  allNodesThree.style('opacity',function(d,i){
    return (d.year <= parseInt(selectedYearThree))? 1 : 0
  });
  allNodesThree.exit().remove()
};
