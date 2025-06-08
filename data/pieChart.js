// Initialize Pie Chart
export function initPieChart(data, selectedJurisdiction) {
  
  // Add glow effect on Pie Chart update
  const pieChartBox = document.getElementById("pie-chart");
  pieChartBox.classList.add("glow-effect");
  setTimeout(() => {
    pieChartBox.classList.remove("glow-effect");
  }, 800);

  // Group data: sum of Tests Conducted per Jurisdiction
  const grouped = d3.rollup(
    data,
    v => d3.sum(v, d => d.Tests_Conducted),
    d => d['JURISDICTION (Right)']
  );

  // Convert grouped data to array of objects
  const pieData = Array.from(grouped, ([key, value]) => ({ key, value }));

  // Build Pie Chart container
  const pieContainer = d3.select("#pie-chart")
    .style("display", "flex")
    .style("align-items", "flex-start")
    .style("gap", "30px")
    .style("padding", "20px");

  // Clear previous chart
  pieContainer.selectAll("*").remove();

  // SVG dimensions
  const svgSize = 600;
  const radius = svgSize / 2 - 20;

  // Create SVG
  const svg = pieContainer.append("svg")
    .attr("width", svgSize)
    .attr("height", svgSize)
    .append("g")
    .attr("transform", `translate(${svgSize / 2}, ${svgSize / 2})`);

  // Define color scale
  const color = d3.scaleOrdinal()
    .domain(pieData.map(d => d.key))
    .range(d3.schemeCategory10);

  // Define pie generator
  const pie = d3.pie()
    .sort(null)
    .value(d => d.value);

  // Define arc generator
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const arcs = pie(pieData);

  // Clean selectedJurisdiction for comparison
  const selectedJurisdictionClean = selectedJurisdiction ? selectedJurisdiction.trim().toUpperCase() : "";

  // Draw pie slices
  svg.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.key))
    .attr("stroke", d => {
      const sliceKeyClean = d.data.key.trim().toUpperCase();
      return (sliceKeyClean === selectedJurisdictionClean) ? "#0b5ed7" : "white";
    })
    .style("stroke-width", d => {
      const sliceKeyClean = d.data.key.trim().toUpperCase();
      return (sliceKeyClean === selectedJurisdictionClean) ? "5px" : "1px";
    })
    .attr("transform", d => {
      const sliceKeyClean = d.data.key.trim().toUpperCase();
      if (sliceKeyClean === selectedJurisdictionClean) {
        const midAngle = (d.startAngle + d.endAngle) / 2;
        const x = Math.sin(midAngle) * 15;
        const y = -Math.cos(midAngle) * 15;
        return `translate(${x},${y})`;
      } else {
        return "translate(0,0)";
      }
    })
    .style("transition", "transform 0.4s ease, stroke-width 0.4s ease, stroke 0.4s ease");

  // Tooltip handling
  const tooltip = d3.select("#tooltip");

  svg.selectAll("path")
    .on("mouseover", (event, d) => {
      tooltip
        .style("visibility", "visible")
        .html(`<strong>${d.data.key}</strong><br>${d.data.value.toLocaleString()} tests`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 15) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });

  // Build right side legend
  const legend = pieContainer.append("div")
    .attr("class", "pie-legend");

  pieData.forEach(d => {
    legend.append("div")
      .html(`
        <div style="width: 18px; height: 18px; background-color: ${color(d.key)}; margin-right: 10px; border-radius: 3px; display: inline-block;"></div>
        <span style="font-size: 17px; color: #222;">${d.key}: ${d.value.toLocaleString()}</span>
      `);
  });
}
