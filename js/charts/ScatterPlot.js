import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { createTooltip, removeTooltip } from '../utils/tooltip.js';

const ScatterPlot = {
  name: 'ScatterPlot',

  render(container, data) {
    container.innerHTML = '';

    const margin = { top: 40, right: 30, bottom: 60, left: 70 };
    const containerWidth = container.clientWidth || 800;
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Filter valid data with all required numeric fields
    const filtered = data.filter(d =>
      d.budget > 0 &&
      d.revenue > 0 &&
      !isNaN(d.budget) &&
      !isNaN(d.revenue) &&
      !isNaN(d.popularity) &&
      !isNaN(d.vote_average)
    );

    if (filtered.length === 0) {
      container.innerHTML = '<p>No valid data available for scatter plot.</p>';
      return;
    }

    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('font-family', 'Segoe UI, sans-serif');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => d.budget)]).nice()
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => d.revenue)]).nice()
      .range([height, 0]);

    const size = d3.scaleSqrt()
      .domain(d3.extent(filtered, d => d.popularity))
      .range([3, 15]);

    const color = d3.scaleSequential()
      .domain(d3.extent(filtered, d => d.vote_average))
      .interpolator(d3.interpolateBlues);

    // Draw axes
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format('~s')));

    const yAxis = g.append('g')
      .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format('~s')));

    // Draw circles
    const dotsGroup = g.append('g');
    const circles = dotsGroup.selectAll('circle')
      .data(filtered)
      .join('circle')
      .attr('cx', d => x(d.budget))
      .attr('cy', d => y(d.revenue))
      .attr('r', d => size(d.popularity))
      .attr('fill', d => color(d.vote_average))
      .style('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        createTooltip(event, `
          <strong>${d.title}</strong><br/>
          Budget: $${d.budget.toLocaleString()}<br/>
          Revenue: $${d.revenue.toLocaleString()}<br/>
          Popularity: ${d.popularity}<br/>
          Avg Rating: ${d.vote_average}
        `);
      })
      .on('mouseleave', removeTooltip);

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      // Allow panning 100px beyond each side for smoother experience
      .translateExtent([[-100, -100], [width + 100, height + 100]])
      .on('zoom', (event) => {
        const transform = event.transform;
        const newX = transform.rescaleX(x);
        const newY = transform.rescaleY(y);

        // Update circles position according to zoom/pan
        circles
          .attr('cx', d => newX(d.budget))
          .attr('cy', d => newY(d.revenue));

        // Update axes accordingly
        xAxis.call(d3.axisBottom(newX).ticks(6).tickFormat(d3.format('~s')));
        yAxis.call(d3.axisLeft(newY).ticks(6).tickFormat(d3.format('~s')));
      });

    svg.call(zoom);

    // Chart title
    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '1.3em')
      .text('Budget vs Revenue (Size: Popularity, Color: Avg Rating)');
  }
};

export default ScatterPlot;
