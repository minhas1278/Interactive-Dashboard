import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { createTooltip, removeTooltip } from '../utils/tooltip.js';

const LineChart = {
  name: 'LineChart',

  render(container, data, selectedGenre = null) {
    container.innerHTML = '';

    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const width = 600;
    const height = 400;

    // Group data by genre and year, compute average ratings
    // If selectedGenre is set, only include that genre; else all genres
    const genreGroups = {};

    data.forEach(d => {
      if (d.release_date instanceof Date && !isNaN(d.release_date) && d.vote_average != null) {
        const year = d.release_date.getFullYear();
        const genres = d.genres || [];

        genres.forEach(g => {
          const genreName = g.name || g;
          if (selectedGenre && genreName !== selectedGenre) return; // Skip others if filtered

          if (!genreGroups[genreName]) genreGroups[genreName] = {};
          if (!genreGroups[genreName][year]) genreGroups[genreName][year] = [];
          genreGroups[genreName][year].push(d.vote_average);
        });
      }
    });

    // Convert to array of {genre, points:[{year, avgRating}]}
    const allGenresData = Object.entries(genreGroups).map(([genre, yearData]) => {
      const points = Object.entries(yearData)
        .map(([year, ratings]) => ({
          year: +year,
          avgRating: d3.mean(ratings)
        }))
        .sort((a, b) => a.year - b.year);
      return { genre, points };
    });

    if (allGenresData.length === 0) {
      container.innerHTML = '<p>No rating data to display.</p>';
      return;
    }

    // Flatten all years to find global x domain
    const allYears = [...new Set(allGenresData.flatMap(g => g.points.map(p => p.year)))].sort((a, b) => a - b);

    // Find global y domain (0 to max avgRating or 10)
    const maxRating = d3.max(allGenresData.flatMap(g => g.points.map(p => p.avgRating)));
    const yMax = Math.max(10, maxRating);

    // Create SVG and group container
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('font-family', 'Segoe UI, sans-serif');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(allYears))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, yMax])
      .range([height, 0])
      .nice();

    // Axes
    const xAxis = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')));

    const yAxis = g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    // Line generator
    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.avgRating))
      .curve(d3.curveMonotoneX);

    // Color scale for genres
    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(allGenresData.map(d => d.genre));

    // Draw lines and points for each genre
    const genreLines = g.selectAll('.genre-line')
      .data(allGenresData)
      .join('g')
      .attr('class', 'genre-line');

    genreLines.append('path')
      .attr('class', 'line-path')
      .attr('fill', 'none')
      .attr('stroke', d => color(d.genre))
      .attr('stroke-width', 2.5)
      .attr('d', d => line(d.points))
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        // Optional: Add click interactivity if you want to zoom or filter on click
      });

    // Draw points
    genreLines.selectAll('circle')
      .data(d => d.points.map(p => ({ ...p, genre: d.genre })))
      .join('circle')
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d.avgRating))
      .attr('r', 5)
      .attr('fill', d => color(d.genre))
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        createTooltip(event, `Genre: <strong>${d.genre}</strong><br/>Year: ${d.year}<br/>Avg Rating: ${d.avgRating.toFixed(2)}`);
      })
      .on('mouseleave', removeTooltip);

    // Title
    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '1.4em')
      .style('font-weight', 'bold')
      .text(selectedGenre ? `Average Ratings Over Years: ${selectedGenre}` : 'Average Ratings Over Years: All Genres');

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        // Rescale axes
        const newX = event.transform.rescaleX(x);
        const newY = event.transform.rescaleY(y);

        // Update axes
        xAxis.call(d3.axisBottom(newX).tickFormat(d3.format('d')));
        yAxis.call(d3.axisLeft(newY));

        // Update lines
        genreLines.selectAll('.line-path')
          .attr('d', d => d3.line()
            .x(p => newX(p.year))
            .y(p => newY(p.avgRating))
            .curve(d3.curveMonotoneX)(d.points)
          );

        // Update points
        genreLines.selectAll('circle')
          .attr('cx', d => newX(d.year))
          .attr('cy', d => newY(d.avgRating));
      });

    svg.call(zoom);
  }
};

export default LineChart;
