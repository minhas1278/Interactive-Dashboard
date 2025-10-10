// js/dataLoader.js
import * as d3 from 'https://cdn.skypack.dev/d3@7';

// Parse date from your dataset format "dd/mm/yyyy"
function parseDate(d) {
  const parts = d.split('/');
  if (parts.length !== 3) return null;
  const day = +parts[0];
  const month = +parts[1] - 1; // JS months 0-based
  const year = +parts[2];
  return new Date(year, month, day);
}

export async function loadMovieData(csvPath = 'data/movies.csv') {
  try {
    const rawData = await d3.csv(csvPath);

    const processedData = rawData.map(d => ({
      ...d,
      budget: +d.budget || 0,
      revenue: +d.revenue || 0,
      vote_average: +d.vote_average || 0,
      release_date: d.release_date ? parseDate(d.release_date) : null,
      genres: (() => {
        try {
          return JSON.parse(d.genres.replace(/'/g, '"'));
        } catch {
          // fallback if parsing fails, return empty array
          return [];
        }
      })(),
      title: d.title || '',
    }));

    return processedData;

  } catch (error) {
    console.error('Error loading or parsing CSV data:', error);
    throw error;
  }
}
