import * as d3 from 'https://cdn.skypack.dev/d3@7';
import BarChart from './charts/BarChart.js';
import LineChart from './charts/LineChart.js';
import ScatterPlot from './charts/ScatterPlot.js';
import DonutChart from './charts/DonutChart.js';
import PieChart from './charts/PieChart.js';

let fullData = [];
let filteredData = [];
let currentChart = 'bar';
let clickedGenre = null;
let drilldownGenre = null;  // Track drilldown state

const genreSelect = document.getElementById('genre');
const yearSelect = document.getElementById('year');
const chartArea = document.getElementById('chart-area');
const insightsPanel = document.getElementById('questions-answers');
const chartButtons = document.querySelectorAll('#chart-nav button');

function parseDate(d) {
  if (!d) return null;
  const parts = d.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const date = new Date(`${year}-${month}-${day}`);
  return isNaN(date) ? null : date;
}

async function loadData() {
  try {
    const rawData = await d3.csv('data/movies.csv');
    console.log('CSV loaded:', rawData.length);

    fullData = rawData.map(d => ({
      ...d,
      genres: d.genres ? JSON.parse(d.genres.replace(/'/g, '"')) : [],
      release_date: d.release_date ? parseDate(d.release_date) : null,
      budget: +d.budget || 0,
      revenue: +d.revenue || 0,
      vote_average: +d.vote_average || 0,
      popularity: +d.popularity || 0,
      title: d.title || ''
    }));

    console.log('Sample data:', fullData[0]);
    populateFilters();
    applyFiltersAndRender();
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

function populateFilters() {
  const genreSet = new Set();
  const yearSet = new Set();

  fullData.forEach(d => {
    if (Array.isArray(d.genres)) {
      d.genres.forEach(g => genreSet.add(g.name || g));
    }
    if (d.release_date instanceof Date && !isNaN(d.release_date)) {
      yearSet.add(d.release_date.getFullYear());
    }
  });

  genreSelect.innerHTML = '<option value="All">All</option>';
  [...genreSet].sort().forEach(g => {
    const option = document.createElement('option');
    option.value = g;
    option.textContent = g;
    genreSelect.appendChild(option);
  });

  yearSelect.innerHTML = '<option value="All">All</option>';
  [...yearSet].sort((a, b) => a - b).forEach(y => {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  });
}

function filterData() {
  const genreVal = genreSelect.value;
  const yearVal = yearSelect.value;

  filteredData = fullData.filter(d => {
    const genreMatch = genreVal === 'All' || d.genres?.some(g => (g.name || g) === genreVal);
    const yearMatch = yearVal === 'All' || (d.release_date && d.release_date.getFullYear() === +yearVal);
    return genreMatch && yearMatch;
  });

  console.log(`Filtered data count: ${filteredData.length}`);
}

function addChartHeading(text) {
  const heading = document.createElement('h2');
  heading.textContent = text;
  heading.style.fontWeight = 'bold';
  heading.style.fontSize = '1.5em';
  heading.style.textAlign = 'center';
  heading.style.margin = '10px 0';
  chartArea.prepend(heading);
}

function addAxisLabels(xLabel, yLabel) {
  // Remove old labels first
  d3.select(chartArea).selectAll('.axis-label').remove();

  // X label
  d3.select(chartArea).append('div')
    .attr('class', 'axis-label')
    .style('text-align', 'center')
    .style('margin-top', '10px')
    .style('font-weight', 'bold')
    .text(xLabel);

  // Y label (vertical label on left)
  d3.select(chartArea).append('div')
    .attr('class', 'axis-label')
    .style('position', 'absolute')
    .style('top', '50%')
    .style('left', '10px')
    .style('transform', 'translateY(-50%) rotate(-90deg)')
    .style('transform-origin', 'center')
    .style('font-weight', 'bold')
    .text(yLabel);
}

function addScatterLegend() {
  // Remove old legend first
  d3.select(chartArea).selectAll('.scatter-legend').remove();

  const legend = d3.select(chartArea)
    .append('div')
    .attr('class', 'scatter-legend')
    .style('margin', '10px auto')
    .style('max-width', '600px')
    .style('font-size', '0.9em')
    .style('color', '#333');

  legend.html(`
    <strong>Legend:</strong><br/>
    <span style="color: steelblue;">●</span> Color: Average Rating (darker = higher)<br/>
    <span style="font-size: 1.5em;">●</span> Size: Popularity (larger = more popular)
  `);
}

function renderChart() {
  console.log(`Render chart: ${currentChart} with ${filteredData.length} records`);
  chartArea.innerHTML = ''; // Clear chart area (remove previous heading/labels/legend)

  if (filteredData.length === 0) {
    chartArea.innerHTML = '<p>No data available for this selection.</p>';
    insightsPanel.innerHTML = '<p>No insights available due to no data.</p>';
    return;
  }

  const selectedGenre = genreSelect.value;

  if (currentChart === 'donut') {
    if (drilldownGenre) {
      console.log('Drilldown: Showing Pie chart for genre:', drilldownGenre);
      PieChart.render(chartArea, filteredData, drilldownGenre, () => {
        console.log('Back clicked - returning to Donut chart');
        drilldownGenre = null;
        renderChart();
        updateInsightsDonut();
      });
      updateInsightsDonutDrilldown(drilldownGenre);
    } else {
      console.log('Showing Donut chart');
      DonutChart.render(chartArea, filteredData, genre => {
        console.log('Donut segment clicked:', genre);
        drilldownGenre = genre;
        renderChart();
      });
      updateInsightsDonut();
    }
    clickedGenre = null;
    return;
  }

  switch (currentChart) {
    case 'bar':
      BarChart.render(chartArea, filteredData, genre => {
        clickedGenre = genre;
        updateInsightsBar(clickedGenre);
      });
      addChartHeading('Number of Movies by Genre (Bar Chart)');
      addAxisLabels('Genres', 'Number of Movies');
      if (!clickedGenre) updateInsightsBar();
      break;

    case 'line':
      clickedGenre = null;
      LineChart.render(chartArea, filteredData, selectedGenre === 'All' ? null : selectedGenre);
      addChartHeading(selectedGenre === 'All' ? 'Average Movie Ratings Over Years (All Genres)' : `Average Movie Ratings Over Years (${selectedGenre})`);
      addAxisLabels('Year', 'Average Rating');
      updateInsightsLine(selectedGenre === 'All' ? null : selectedGenre);
      break;

    case 'scatter':
      clickedGenre = null;
      ScatterPlot.render(chartArea, filteredData);
      addChartHeading('Budget vs Revenue Scatter Plot');
      addAxisLabels('Budget ($)', 'Revenue ($)');
      addScatterLegend();
      updateInsightsScatter(selectedGenre === 'All' ? null : selectedGenre);
      break;

    default:
      chartArea.innerHTML = '<p>Unknown chart selected.</p>';
      insightsPanel.innerHTML = '';
  }
}

function applyFiltersAndRender() {
  filterData();
  drilldownGenre = null; // reset drilldown on filter change
  renderChart();
}

// Insights functions

function updateInsightsBar(clickedGenre) {
  if (clickedGenre) {
    const genreMovies = filteredData.filter(d =>
      d.genres && d.genres.some(g => (g.name || g) === clickedGenre)
    );
    const count = genreMovies.length;
    const avgRating = genreMovies.reduce((sum, m) => sum + m.vote_average, 0) / (count || 1);

    insightsPanel.innerHTML = `
      <p><strong>Selected Genre:</strong> ${clickedGenre}</p>
      <p><strong>Number of Movies:</strong> ${count}</p>
      <p><strong>Average Rating:</strong> ${avgRating.toFixed(2)}</p>
      <p><em>Click another bar or change filters to update.</em></p>
    `;
  } else {
    insightsPanel.innerHTML = `
      <p><strong>Q1:</strong> Which genres have the most movies?</p>
      <p><em>A:</em> The bar chart shows the distribution of movies by genre.</p>
      <p><strong>Q2:</strong> How does genre popularity change over time?</p>
      <p><em>A:</em> Use the year filter to analyze trends across years.</p>
      <p><strong>Q3:</strong> What strategic decisions can the organization make?</p>
      <p><em>A:</em> Insights from the chart help guide production planning and marketing focus on genres that are gaining or maintaining popularity.</p>
    `;
  }
}


function updateInsightsLine(selectedGenre = null) {
  if (selectedGenre) {
    insightsPanel.innerHTML = `
      <p><strong>Q1:</strong> What does the line chart show for "${selectedGenre}"?</p>
      <p><em>A:</em> It shows average movie ratings for the selected genre over years.</p>
      <p><strong>Q2:</strong> How has the rating changed over time?</p>
      <p><em>A:</em> Peaks and dips reveal audience engagement trends.</p>
      <p><strong>Q3:</strong> How is this useful?</p>
      <p><em>A:</em> Helps target production for high-performing years in this genre.</p>
      <p><strong>Q4:</strong> Why is this valuable for the business?</p>
      <p><em>A:</em> It enables strategic planning to invest in genres and years with higher audience approval, maximizing revenue and minimizing risk.</p>
    `;
  } else {
    insightsPanel.innerHTML = `
      <p><strong>Q1:</strong> What are overall rating trends?</p>
      <p><em>A:</em> Shows average movie ratings over years for all genres.</p>
      <p><strong>Q2:</strong> How do genres compare?</p>
      <p><em>A:</em> Multiple lines reveal which genres are rising or falling in popularity.</p>
      <p><strong>Q3:</strong> Why is this valuable for the business?</p>
      <p><em>A:</em> Helps identify broad market trends and prioritize investments in promising genres to optimize portfolio success.</p>
    `;
  }
}


function updateInsightsScatter(selectedGenre = null) {
  if (!selectedGenre) {
    insightsPanel.innerHTML = `
      <p><strong>Q1:</strong> What does the scatter plot show for all genres?</p>
      <p><em>A:</em> Relationship between budget and revenue, dot size shows popularity, color is average rating.</p>
      <p><strong>Q2:</strong> How can this help business?</p>
      <p><em>A:</em> Identifies profitable budget ranges and popular, well-rated movies.</p>
      <p><strong>Q3:</strong> Business decisions?</p>
      <p><em>A:</em> Allocate budget wisely and focus on high-return movies.</p>
    `;
  } else {
    const genreMovies = filteredData.filter(d =>
      d.genres && d.genres.some(g => (g.name || g) === selectedGenre)
    );
    const totalRevenue = genreMovies.reduce((sum, m) => sum + (m.revenue || 0), 0);
    const totalBudget = genreMovies.reduce((sum, m) => sum + (m.budget || 0), 0);
    const totalProfit = totalRevenue - totalBudget;

    insightsPanel.innerHTML = `
      <p><strong>Q1:</strong> Scatter plot trend for "${selectedGenre}"?</p>
      <p><em>A:</em> Shows budget vs revenue relationship with dot size popularity and color rating.</p>
      <p><strong>Q2:</strong> Total profit?</p>
      <p><em>A:</em> Approximately $${totalProfit.toLocaleString()}</p>
      <p><strong>Q3:</strong> Business decisions?</p>
      <p><em>A:</em> Focus investment on profitable budget ranges and popular, high-rated movies.</p>
    `;
  }
}

function updateInsightsDonut() {
  insightsPanel.innerHTML = `
    <p><strong>Q1:</strong> What does the donut chart show?</p>
    <p><em>A:</em> It displays profit share by genre, helping identify which genres generate the most profit.</p>
    <p><strong>Q2:</strong> How is this valuable for the business?</p>
    <p><em>A:</em> It helps businesses focus investments on the most profitable genres, optimize production strategies, and maximize overall returns.</p>
  `;
}

function updateInsightsDonutDrilldown(genre) {
  const genreMovies = filteredData.filter(d =>
    d.genres && d.genres.some(g => (g.name || g) === genre) &&
    d.revenue && d.budget
  ).map(d => ({
    title: d.title,
    revenue: d.revenue,
    profit: d.revenue - d.budget
  })).filter(d => d.profit > 0);

  const topEarningMovie = genreMovies.reduce((max, movie) => movie.revenue > max.revenue ? movie : max, genreMovies[0]);
  const topProfitableMovie = genreMovies.reduce((max, movie) => movie.profit > max.profit ? movie : max, genreMovies[0]);

  insightsPanel.innerHTML = `
    <p><strong>Q1:</strong> What does this pie chart show?</p>
    <p><em>A:</em> Profit share by individual movies in the genre <strong>${genre}</strong>.</p>
    <p><strong>Q2:</strong> Which are the top earning and most profitable movies?</p>
    <p><em>A:</em> Top earning movie: <strong>${topEarningMovie.title}</strong> with revenue $${topEarningMovie.revenue.toLocaleString()}<br/>
    Most profitable movie: <strong>${topProfitableMovie.title}</strong> with profit $${topProfitableMovie.profit.toLocaleString()}</p>
    <p><strong>Q3:</strong> What insights can the organization gain from this chart?</p>
    <p><em>A:</em> The organization can identify high-performing movies to focus marketing and investment efforts, optimize budgets, and plan future productions for maximum profit.</p>
  `;
}

// Event listeners
genreSelect.addEventListener('change', () => {
  clickedGenre = null;
  applyFiltersAndRender();
});

yearSelect.addEventListener('change', () => {
  clickedGenre = null;
  applyFiltersAndRender();
});

chartButtons.forEach(button => {
  button.addEventListener('click', () => {
    chartButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    currentChart = button.dataset.chart.toLowerCase();
    clickedGenre = null;
    drilldownGenre = null;
    applyFiltersAndRender();
  });
});

window.onload = async () => {
  chartButtons.forEach(btn => btn.classList.remove('active'));
  const defaultBtn = Array.from(chartButtons).find(btn => btn.dataset.chart.toLowerCase() === 'bar');
  if (defaultBtn) defaultBtn.classList.add('active');

  await loadData();
};
