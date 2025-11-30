// Shared playlist store for both dev and production
// In production (Vercel), this will be per-instance, but that's okay for temporary playlists
const playlistStore = new Map();

export function getPlaylist(id) {
  return playlistStore.get(id);
}

export function setPlaylist(id, content) {
  playlistStore.set(id, content);

  // Clean up old playlists (keep only last 100)
  if (playlistStore.size > 100) {
    const firstKey = playlistStore.keys().next().value;
    playlistStore.delete(firstKey);
  }
}

export function hasPlaylist(id) {
  return playlistStore.has(id);
}

export function deletePlaylist(id) {
  playlistStore.delete(id);
}
