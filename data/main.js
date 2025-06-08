// Import modules for KPI tiles, Pie chart, and Bar + Line chart
import { initTopKPIs, initKPIGrid } from './kpiTiles.js';
import { initPieChart } from './pieChart.js';
import { initBarLineChart } from './barLineChart.js';

// Mapping short state codes to full state names
const stateNameMap = {
  "ACT": "Australian Capital Territory",
  "NSW": "New South Wales",
  "NT": "Northern Territory",
  "QLD": "Queensland",
  "SA": "South Australia",
  "TAS": "Tasmania",
  "VIC": "Victoria",
  "WA": "Western Australia"
};

// Global data storage for use across charts
let globalData = { barLine: [], pie: [], kpi: [] };

// Load datasets and process data
Promise.all([
  d3.csv("combineLineBar_Data.csv"),
  d3.csv("combineLineBar_pie_Data.csv"),
  d3.csv("drug_kpi_visualisation_data.csv")
]).then(([barLineData, pieData, kpiData]) => {
  
  // Process Bar + Line chart data
  barLineData.forEach(d => {
    d['YEAR (Right)'] = +d['YEAR (Right)'];
    d.Tests_Conducted = +d.Tests_Conducted;
    d.Positive_Rate_Percent = +d.Positive_Rate_Percent;
  });

  // Process Pie chart data
  pieData.forEach(d => {
    d['YEAR (Right)'] = +d['YEAR (Right)'];
    d.Tests_Conducted = +d.Tests_Conducted;
  });

  // Process KPI data
  kpiData.forEach(d => {
    d.YEAR = +d.YEAR;
    d['Sum(COUNT)'] = +d['Sum(COUNT)'];
    d['Sum(CHARGES)'] = +d['Sum(CHARGES)'];
    d.Positive_Rate_Percent = +d.Positive_Rate_Percent;
  });

  // Store processed data globally
  globalData = { barLine: barLineData, pie: pieData, kpi: kpiData };

  // Initialize filters and dashboard
  buildFilters();
  updateDashboard();
});

// Builds dropdown filters and reset button
function buildFilters() {
  // Extract unique years and jurisdictions
  const years = [...new Set(globalData.kpi.map(d => d.YEAR))].sort();
  const states = [...new Set(globalData.kpi.map(d => d.JURISDICTION))].sort();

  // Build filter container
  const filterDiv = d3.select("#filters")
    .style("display", "flex")
    .style("gap", "10px")
    .style("margin", "20px")
    .style("justifyContent", "center")
    .style("alignItems", "center")
    .style("flexWrap", "wrap");

  // Year filter
  filterDiv.append("select").attr("id", "yearFilter")
    .selectAll("option")
    .data(years)
    .enter().append("option")
    .text(d => d);

  // State filter
  const stateSelect = filterDiv.append("select").attr("id", "stateFilter");
  stateSelect.append("option").text("All States");
  stateSelect.selectAll("option.state")
    .data(states)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => stateNameMap[d] || d);

  // Reset button
  filterDiv.append("button")
    .text("Reset View")
    .style("padding", "8px 16px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("background-color", "#f1f1f1")
    .style("cursor", "pointer")
    .on("click", () => window.location.reload());

  // Attach change event listener
  d3.selectAll("select").on("change", updateDashboard);
}

// Updates all charts based on selected filters
function updateDashboard() {
  const selectedYear = +d3.select("#yearFilter").property("value");
  const selectedState = d3.select("#stateFilter").property("value");

  // Bar + Line chart always shows full national trend
  const filteredBarLine = globalData.barLine;
  d3.select("#bar-line-chart").html("");
  initBarLineChart(filteredBarLine);

  // Pie chart responds to year filter and selected state
  const pieData = globalData.pie.filter(d => d['YEAR (Right)'] === selectedYear);
  d3.select("#pie-chart").html("");

  // Map selected state to corresponding jurisdiction in Pie chart data
  const pieJurisdictions = [...new Set(pieData.map(d => d['JURISDICTION (Right)']))];
  const jurisdictionMap = {};
  pieData.forEach(d => {
    jurisdictionMap[d['JURISDICTION']] = d['JURISDICTION (Right)'];
  });

  let selectedJurisdictionForPie = "";
  if (selectedState !== "All States") {
    selectedJurisdictionForPie = jurisdictionMap[selectedState] || "";
    // Fallback if mapping not found
    if (!pieJurisdictions.includes(selectedJurisdictionForPie)) {
      selectedJurisdictionForPie = "";
    }
  }

  // Initialize Pie chart
  initPieChart(pieData, selectedJurisdictionForPie);

  // Filter KPI data by selected year
  let filteredKPI = globalData.kpi.filter(d => d.YEAR === selectedYear);

  // Initialize KPI Grid
  d3.select("#kpi-grid").html("");
  if (selectedState === "All States") {
    // No highlight
    initKPIGrid(filteredKPI, "");
  } else {
    // Highlight selected state
    initKPIGrid(filteredKPI, selectedState);
  }

  // Initialize Top KPIs (national total)
  d3.select("#kpi-container").html("");
  initTopKPIs(filteredBarLine);
}
