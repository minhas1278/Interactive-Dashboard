import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { createTooltip, removeTooltip } from '../utils/tooltip.js';

const PieChart = {
  name: 'PieChart',

  render(container, data, genre, onBackClick) {
    container.innerHTML = '';

    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const width = 600;
    const height = 400;
    const radius = Math.min(width, height) / 2 - Math.max(...Object.values(margin));

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('font-family', 'Segoe UI, sans-serif')
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Filter movies for the genre
    const movies = data.filter(d =>
      d.genres && d.genres.some(g => (g.name || g) === genre) &&
      d.revenue && d.budget
    ).map(d => {
      const profit = d.revenue - d.budget;
      return { title: d.title, revenue: d.revenue, budget: d.budget, profit };
    }).filter(d => d.profit > 0);

    if (movies.length === 0) {
      container.innerHTML = `<p>No profitable movies in genre "${genre}".</p>`;
      return;
    }

    const totalProfit = d3.sum(movies, d => d.profit);

    // Pie generator
    const pie = d3.pie()
      .value(d => d.profit)
      .sort(null);

    const arcs = pie(movies);

    // Arc generator
    const arc = d3.arc()
      .innerRadius(0)  // Full pie (no hole)
      .outerRadius(radius);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(movies.map(d => d.title));

    // Draw slices
    svg.selectAll('path')
      .data(arcs)
      .join('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.title))
      .style('cursor', 'pointer')
      .style('stroke', '#fff')
      .style('stroke-width', '1.5px')
      .on('mouseenter', (event, d) => {
        const { title, revenue, budget, profit } = d.data;
        const profitMargin = ((profit / revenue) * 100).toFixed(2);
        createTooltip(event, `
          <strong>${title}</strong><br/>
          Revenue: $${revenue.toLocaleString()}<br/>
          Budget: $${budget.toLocaleString()}<br/>
          Profit: $${profit.toLocaleString()}<br/>
          Profit Margin: ${profitMargin}%
        `);
      })
      .on('mouseleave', removeTooltip);

    // Title
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '1.4em')
      .style('font-weight', 'bold')
      .text(`Profit Share by Movies in "${genre}"`);

    // Back Button
    const backBtn = d3.select(container)
      .append('button')
      .text('← Back to Genres')
      .style('display', 'block')
      .style('margin', '10px auto')
      .style('padding', '8px 16px')
      .style('font-size', '1em')
      .on('click', () => {
        if (onBackClick) onBackClick();
      });
  }
};

export default PieChart;
