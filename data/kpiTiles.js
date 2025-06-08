// KPI Tile Grid Component
export function initKPIGrid(filteredData, selectedJurisdiction = "") {
  
  // Map state codes to full names
  const regionMap = {
    ACT: "Australian Capital Territory",
    NSW: "New South Wales",
    NT: "Northern Territory",
    QLD: "Queensland",
    SA: "South Australia",
    TAS: "Tasmania",
    VIC: "Victoria",
    WA: "Western Australia"
  };

  // Group data by jurisdiction and calculate aggregates
  const grouped = d3.rollups(
    filteredData,
    v => ({
      count: d3.sum(v, d => d["Sum(COUNT)"]),
      charges: d3.sum(v, d => +d["Sum(CHARGES)"] || 0),
      rate: d3.mean(v, d => d["Positive_Rate_Percent"])
    }),
    d => d.JURISDICTION
  );

  // Convert grouped data to a Map for lookup
  const groupedMap = new Map(grouped);

  // Build KPI Grid container
  const kpiDiv = d3
    .select("#kpi-grid")
    .html("") // Clear previous grid
    .style("display", "grid")
    .style("grid-template-columns", "repeat(auto-fit, minmax(180px, 1fr))")
    .style("gap", "12px")
    .style("margin-top", "20px");

  // Build individual KPI tiles
  Object.keys(regionMap).forEach(region => {
    const stats = groupedMap.get(region) || { count: 0, charges: 0, rate: 0 };

    const html = `
      <h4>${region}</h4>
      <p>Drug Tests: ${stats.count.toLocaleString()}</p>
      ${stats.charges > 0 ? `<p>Charges: ${stats.charges}</p>` : ""}
      <p>Positive Rate: ${stats.rate.toFixed(1)}%</p>
    `;

    kpiDiv
      .append("div")
      .attr(
        "class",
        "kpi-tile" + (region === selectedJurisdiction ? " selected" : "")
      )
      .html(html);
  });
}

// Top KPI Summary Component (National totals)
export function initTopKPIs(barLineData) {
  
  // Calculate national totals
  const totalTests = d3.sum(barLineData, d => d.Tests_Conducted);
  const avgRate = d3.mean(barLineData, d => d.Positive_Rate_Percent);

  // Build KPI container
  const kpiDiv = d3.select("#kpi-container")
    .html("") // Clear previous
    .style("display", "flex")
    .style("gap", "20px")
    .style("justify-content", "center")
    .style("flex-wrap", "wrap")
    .style("align-items", "center");

  // Add Total Drug Tests tile
  kpiDiv.append("div")
    .style("background-color", "white")
    .style("padding", "16px")
    .style("border-radius", "8px")
    .style("box-shadow", "0 2px 5px rgba(0,0,0,0.05)")
    .html(`<strong>Total Drug Tests</strong><br><h2>${totalTests.toLocaleString()}</h2>`);

  // Add Average Positive Rate tile
  kpiDiv.append("div")
    .style("background-color", "white")
    .style("padding", "16px")
    .style("border-radius", "8px")
    .style("box-shadow", "0 2px 5px rgba(0,0,0,0.05)")
    .html(`<strong>Average Positive Rate</strong><br><h2>${avgRate.toFixed(1)}%</h2>`);
}
