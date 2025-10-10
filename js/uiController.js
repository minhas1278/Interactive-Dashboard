// js/uiController.js

/**
 * Extracts unique genres and years from the dataset
 * and populates the filter dropdowns accordingly.
 */

export function populateFilters(data) {
  const genreSet = new Set();
  const yearSet = new Set();

  data.forEach(d => {
    // Genres is an array of objects with 'name' property
    if (d.genres && Array.isArray(d.genres)) {
      d.genres.forEach(g => {
        if (typeof g === 'string') {
          genreSet.add(g);
        } else if (g.name) {
          genreSet.add(g.name);
        }
      });
    }

    if (d.release_date instanceof Date && !isNaN(d.release_date)) {
      yearSet.add(d.release_date.getFullYear());
    }
  });

  const genreSelect = document.getElementById('genre');
  const yearSelect = document.getElementById('year');

  // Clear old options except 'All'
  genreSelect.querySelectorAll('option:not([value="All"])').forEach(opt => opt.remove());
  yearSelect.querySelectorAll('option:not([value="All"])').forEach(opt => opt.remove());

  // Populate genres sorted alphabetically
  Array.from(genreSet).sort().forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreSelect.appendChild(option);
  });

  // Populate years sorted descending
  Array.from(yearSet).sort((a,b) => b - a).forEach(year => {
    const option = document.createElement('option');
    option.value = year.toString();
    option.textContent = year.toString();
    yearSelect.appendChild(option);
  });
}

/**
 * Reads current filter selections and returns an object.
 */
export function getSelectedFilters() {
  const genre = document.getElementById('genre').value;
  const year = document.getElementById('year').value;
  return { genre, year };
}

/**
 * Event handler stub for filters to notify main.js when filters change.
 * You may expand this to trigger callbacks if needed.
 */
export function onFilterChange(callback) {
  document.getElementById('genre').addEventListener('change', callback);
  document.getElementById('year').addEventListener('change', callback);
}
