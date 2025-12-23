// API service functions
// Using Vite proxy in development (backend server is optional for video streaming)
// my website domian https://uniflix-ott.vercel.app
const BASE_URL = import.meta.env.DEV ? "/api" : "/api";

export const fetchHomepage = async () => {
  try {
    const response = await fetch(`${BASE_URL}/homepage.php`);
    if (!response.ok) throw new Error("Failed to fetch homepage data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching homepage:", error);
    throw error;
  }
};
export const fetchShowpage = async () => {
  try {
    const response = await fetch(`${BASE_URL}/homepage.php?p=show`);
    if (!response.ok) throw new Error("Failed to fetch series page");
    return await response.json();
  } catch (error) {
    console.error("Error fetching series:", error);
    throw error;
  }
};
export const fetchMoviepage = async () => {
  try {
    const response = await fetch(`${BASE_URL}/homepage.php?p=movie`);
    if (!response.ok) throw new Error("Failed to fetch movie page");
    return await response.json();
  } catch (error) {
    console.error("Error fetching movie page:", error);
    throw error;
  }
};

export const fetchMovieInfo = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/mini-modal-info.php?id=${id}`);
    if (!response.ok) throw new Error("Failed to fetch movie info");
    return await response.json();
  } catch (error) {
    console.error("Error fetching movie info:", error);
    throw error;
  }
};

// netflix
export const fetchMovieInfo2 = async (id) => {
  try {
    const response = await fetch(`api2/mini-modal-info.php?id=${id}`);
    if (!response.ok) throw new Error("Failed to fetch movie info");
    return await response.json();
  } catch (error) {
    console.error("Error fetching movie info:", error);
    throw error;
  }
};

export const searchMovie = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/search.php?s=${query}`);
    if (!response.ok) throw new Error("Failed to fetch movie info");
    return await response.json();
  } catch (error) {
    console.error("Error fetching movie info:", error);
    throw error;
  }
};

export const getMovieDetails = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/post.php?id=${id}&t=1763834888`);
    if (!response.ok) throw new Error("Failed to fetch movie details");
    return await response.json();
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

// netflix
export const getMovieDetails2 = async (id) => {
  try {
    const response = await fetch(`api2/post.php?id=${id}&t=1763834888`);
    if (!response.ok) throw new Error("Failed to fetch movie details");
    return await response.json();
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

export const nextEpisode = async (id, series, page) => {
  try {
    const response = await fetch(
      `${BASE_URL}/episodes.php?s=${id}&series=${series}&page=${page}&t=1763848157`
    );
    if (!response.ok) throw new Error("Failed to fetch next episode");
    return await response.json();
  } catch (error) {
    console.error("Error fetching next episode:", error);
    throw error;
  }
};

export const nextEpisode2 = async (id, series, page) => {
  try {
    const response = await fetch(
      `api2/episodes.php?s=${id}&series=${series}&page=${page}&t=1763848157`
    );
    if (!response.ok) throw new Error("Failed to fetch next episode");
    return await response.json();
  } catch (error) {
    console.error("Error fetching next episode:", error);
    throw error;
  }
};

export const getImageUrl = (id) => {
  if (!id) return;
  return `https://imgcdn.kim/pv/341/${id}.jpg`;
};
export const getImageUrl2 = (id, h) => {
  if (!id) return;
  return `https://imgcdn.kim/poster/${h}/${id}.jpg`;
};
