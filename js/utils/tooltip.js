// js/utils/tooltip.js
import * as d3 from 'https://cdn.skypack.dev/d3@7';

let tooltip = null;

export function createTooltip(event, html) {
  if (!tooltip) {
    tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#333')
      .style('color', '#fff')
      .style('padding', '6px 10px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '0.9em')
      .style('opacity', 0);  // start hidden
  }
  
  tooltip.html(html)
    .style('opacity', 0.9)
    .style('left', (event.pageX + 10) + 'px')
    .style('top', (event.pageY + 10) + 'px');
}

export function moveTooltip(event) {
  if (tooltip) {
    tooltip.style('left', (event.pageX + 10) + 'px')
           .style('top', (event.pageY + 10) + 'px');
  }
}

export function removeTooltip() {
  if (tooltip) {
    tooltip.style('opacity', 0);
  }
}
