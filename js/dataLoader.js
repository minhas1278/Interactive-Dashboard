import * as d3 from 'https://cdn.skypack.dev/d3@7';

export async function loadData(csvPath) {
  try {
    const rawData = await d3.csv(csvPath, d3.autoType);

    const parsedData = rawData.map(d => {
      return {
        adult: d.adult === 'TRUE' || d.adult === true,
        belongs_to_collection: safeParseJSON(d.belongs_to_collection),
        budget: +d.budget || 0,
        genres: safeParseJSON(d.genres) || [],
        homepage: d.homepage || null,
        id: d.id || '',
        imdb_id: d.imdb_id || '',
        original_language: d.original_language || '',
        original_title: d.original_title || '',
        overview: d.overview || '',
        popularity: +d.popularity || 0,
        poster_path: d.poster_path || '',
        production_companies: safeParseJSON(d.production_companies) || [],
        production_countries: safeParseJSON(d.production_countries) || [],
        release_date: d.release_date ? parseDate(d.release_date) : null,
        revenue: +d.revenue || 0,
        runtime: +d.runtime || 0,
        spoken_languages: safeParseJSON(d.spoken_languages) || [],
        status: d.status || '',
        tagline: d.tagline || '',
        title: d.title || '',
        video: d.video === 'TRUE' || d.video === true,
        vote_average: +d.vote_average || 0,
        vote_count: +d.vote_count || 0,
      };
    });

    return parsedData;
  } catch (error) {
    console.error('Error loading or parsing CSV:', error);
    return [];
  }
}

// Helper to safely parse JSON strings with single quotes or empty strings
function safeParseJSON(str) {
  if (!str || str === '') return null;
  try {
    // Replace single quotes with double quotes for valid JSON
    const fixed = str.replace(/'/g, '"');
    return JSON.parse(fixed);
  } catch {
    return null;
  }
}

// Helper: parse release_date like "30/10/1995"
function parseDate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
}
