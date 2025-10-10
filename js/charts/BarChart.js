import * as d3 from 'https://cdn.skypack.dev/d3@7';

export default {
  render: function(container, data, onBarClick) {
    container.innerHTML = ''; // Clear previous chart

    const width = 600;
    const height = 400;
    const margin = { top: 40, right: 20, bottom: 80, left: 70 };

    if (!data || data.length === 0) {
      container.innerHTML = '<p>No data available for this selection.</p>';
      return;
    }

    // Count movies by all genres in each movie
    const counts = {};
    data.forEach(d => {
      if (Array.isArray(d.genres) && d.genres.length > 0) {
        d.genres.forEach(g => {
          const genre = g.name || g;
          counts[genre] = (counts[genre] || 0) + 1;
        });
      }
    });

    // Sort top 10 genres by count
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const genres = sorted.map(([genre]) => genre);
    const values = sorted.map(([, count]) => count);

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const x = d3.scaleBand()
      .domain(genres)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(values)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    // Y axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Bars
    svg.selectAll('rect')
      .data(genres)
      .join('rect')
      .attr('x', d => x(d))
      .attr('y', d => y(counts[d]))
      .attr('width', x.bandwidth())
      .attr('height', d => y(0) - y(counts[d]))
      .attr('fill', 'steelblue')
      .style('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this).attr('fill', '#4682b4');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', 'steelblue');
      })
      .on('click', (event, d) => {
        if (onBarClick) onBarClick(d);
      });

    // Chart title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .text('Number of Movies per Genre');

    console.log('✅ BarChart rendered with', data.length, 'records');
  }
};
