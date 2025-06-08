// Initialize Bar + Line Chart
export function initBarLineChart(data) {

  // Set margins
  const margin = { top: 60, right: 120, bottom: 50, left: 100 };

  // Calculate chart dimensions
  const containerWidth = document.getElementById("bar-line-chart").clientWidth;
  const width = containerWidth - margin.left - margin.right;
  const height = 550 - margin.top - margin.bottom;

  // Remove existing SVG if present
  d3.select("#bar-line-chart svg").remove();

  // Create SVG
  const svg = d3.select("#bar-line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add Legend for Line toggle
  const legend = d3.select("#bar-line-chart svg")
    .append("g")
    .attr("transform", `translate(${margin.left}, 20)`);

  legend.append("rect")
    .attr("x", 0)
    .attr("y", -10)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", "#e74c3c")
    .attr("id", "legend-line-box")
    .style("cursor", "pointer");

  legend.append("text")
    .attr("x", 24)
    .attr("y", 5)
    .text("Positive Rate (%)")
    .style("font-size", "14px")
    .attr("alignment-baseline", "middle")
    .style("cursor", "pointer");

  // Define drop shadow for clicked bar
  const defs = svg.append("defs");
  const filter = defs.append("filter")
    .attr("id", "barDropShadow")
    .attr("height", "130%");
  filter.append("feDropShadow")
    .attr("dx", 0)
    .attr("dy", 3)
    .attr("stdDeviation", 4)
    .attr("flood-color", "#999")
    .attr("flood-opacity", 0.5);

  // Define scales
  const x = d3.scaleBand()
    .domain(data.map(d => d['YEAR (Right)']))
    .range([0, width])
    .padding(0.08);

  const yLeft = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Tests_Conducted)]).nice()
    .range([height, 0]);

  const yRight = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Positive_Rate_Percent)]).nice()
    .range([height, 0]);

  // Add Y Left axis
  svg.append("g")
    .call(d3.axisLeft(yLeft))
    .selectAll("text")
    .style("font-size", "14px");

  // Add Y Right axis
  svg.append("g")
    .attr("transform", `translate(${width},0)`)
    .call(d3.axisRight(yRight))
    .selectAll("text")
    .style("font-size", "14px");

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("font-size", "14px");

  // Add X axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("Year")
    .style("font-size", "16px");

  // Add Y Left axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("text-anchor", "middle")
    .text("Tests Conducted")
    .style("font-size", "16px");

  // Add Y Right axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", width + 50)
    .attr("text-anchor", "middle")
    .text("Positive Rate (%)")
    .style("font-size", "16px");

  // Tooltip reference
  const tooltip = d3.select("#tooltip-bar");

  // Draw bars
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d['YEAR (Right)']))
    .attr("width", x.bandwidth())
    .attr("y", d => yLeft(d.Tests_Conducted))
    .attr("height", d => height - yLeft(d.Tests_Conducted))
    .attr("fill", "#69b3a2")
    .style("transform-box", "fill-box")
    .style("transform-origin", "center")
    .on("click", function(event, d) {
      event.stopPropagation();

      // Reset all bars
      svg.selectAll(".bar")
        .transition()
        .duration(200)
        .attr("fill", "#69b3a2")
        .attr("y", d => yLeft(d.Tests_Conducted))
        .attr("height", d => height - yLeft(d.Tests_Conducted))
        .attr("transform", "scale(1)")
        .style("filter", null);

      // Highlight clicked bar
      d3.select(this)
        .raise()
        .transition()
        .duration(300)
        .attr("fill", "#e74c3c")
        .attr("y", yLeft(d.Tests_Conducted) - 10)
        .attr("height", height - yLeft(d.Tests_Conducted) + 10)
        .attr("transform", "scale(1.05, 1.05)")
        .style("filter", "url(#barDropShadow)");

      // Show tooltip
      tooltip
        .style("visibility", "visible")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 30}px`)
        .html(`
          <strong>Year:</strong> ${d['YEAR (Right)']}<br>
          <strong>Tests Conducted:</strong> ${d.Tests_Conducted.toLocaleString()}<br>
          <strong>Positive Rate:</strong> ${d.Positive_Rate_Percent.toFixed(1)}%
        `);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 30}px`);
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    });

  // Draw line path
  const linePath = svg.append("path")
    .datum(data)
    .attr("class", "line-path")
    .attr("fill", "none")
    .attr("stroke", "#e74c3c")
    .attr("stroke-width", 3)
    .attr("d", d3.line()
      .x(d => x(d['YEAR (Right)']) + x.bandwidth() / 2)
      .y(d => yRight(d.Positive_Rate_Percent))
    );

  // Draw line points (circles)
  svg.selectAll(".line-point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "line-point")
    .attr("cx", d => x(d['YEAR (Right)']) + x.bandwidth() / 2)
    .attr("cy", d => yRight(d.Positive_Rate_Percent))
    .attr("r", 5)
    .attr("fill", "#e74c3c")
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .on("mouseover", function(event, d) {
      tooltip
        .style("visibility", "visible")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 30}px`)
        .html(`
          <strong>Year:</strong> ${d['YEAR (Right)']}<br>
          <strong>Positive Rate:</strong> ${d.Positive_Rate_Percent.toFixed(1)}%
        `);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 30}px`);
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    });

  // Toggle line visibility
  let lineVisible = true;

  d3.select("#legend-line-box").on("click", function() {
    lineVisible = !lineVisible;
    d3.select(".line-path")
      .style("opacity", lineVisible ? 1 : 0);
    d3.selectAll(".line-point")
      .style("opacity", lineVisible ? 1 : 0);
  });

  // Reset bars when clicking outside chart
  if (!window._barResetAttached) {
    document.body.addEventListener("click", () => {
      svg.selectAll(".bar")
        .transition()
        .duration(200)
        .attr("fill", "#69b3a2")
        .attr("transform", "scale(1)")
        .style("filter", null)
        .attr("y", d => yLeft(d.Tests_Conducted))
        .attr("height", d => height - yLeft(d.Tests_Conducted))
        .on("end", function() {
          d3.select(this).lower();
        });

      tooltip.style("visibility", "hidden");
    });
    window._barResetAttached = true;
  }
}
