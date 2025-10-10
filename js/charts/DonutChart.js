import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { createTooltip, removeTooltip } from '../utils/tooltip.js';

const DonutChart = {
  name: 'DonutChart',

  // Add an optional onSegmentClick callback
  render(container, data, onSegmentClick) {
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

    // Aggregate data by genre
    const genreMap = new Map();

    data.forEach(d => {
      if (d.genres && d.revenue && d.budget) {
        d.genres.forEach(g => {
          const genreName = g.name || g;
          if (!genreMap.has(genreName)) {
            genreMap.set(genreName, { revenue: 0, budget: 0, count: 0 });
          }
          const entry = genreMap.get(genreName);
          entry.revenue += d.revenue;
          entry.budget += d.budget;
          entry.count += 1;
        });
      }
    });

    // Calculate profit per genre and total profit
    const genreData = Array.from(genreMap, ([genre, vals]) => {
      const profit = vals.revenue - vals.budget;
      return { genre, ...vals, profit };
    }).filter(d => d.profit > 0);

    const totalProfit = d3.sum(genreData, d => d.profit);

    if (genreData.length === 0 || totalProfit === 0) {
      container.innerHTML = '<p>No positive profit data available for donut chart.</p>';
      return;
    }

    // Pie generator
    const pie = d3.pie()
      .value(d => d.profit)
      .sort(null);

    const arcs = pie(genreData);

    // Arc generator
    const arc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(genreData.map(d => d.genre));

    // Draw slices
    svg.selectAll('path')
      .data(arcs)
      .join('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.genre))
      .style('cursor', 'pointer')
      .style('stroke', '#fff')
      .style('stroke-width', '1.5px')
      .on('mouseenter', (event, d) => {
        const { genre, revenue, budget, profit, count } = d.data;
        const profitMargin = ((profit / revenue) * 100).toFixed(2);

        createTooltip(event, `
          <strong>${genre}</strong><br/>
          Total Revenue: $${revenue.toLocaleString()}<br/>
          Total Budget: $${budget.toLocaleString()}<br/>
          Profit Margin: ${profitMargin}%<br/>
          Number of Movies: ${count}
        `);
      })
      .on('mouseleave', removeTooltip)
      .on('click', (event, d) => {
        if (onSegmentClick) onSegmentClick(d.data.genre);
      });

    // Add center text
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '1.4em')
      .style('font-weight', 'bold')
      .text('Profit Share by Genre');

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${radius + 20}, ${-radius})`);

    genreData.forEach((d, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('fill', color(d.genre));

      legendRow.append('text')
        .attr('x', 18)
        .attr('y', 12)
        .text(d.genre);
    });
  }
};

export default DonutChart;
