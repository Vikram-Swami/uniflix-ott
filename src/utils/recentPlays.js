const STORAGE_KEY = "recentPlays_v1";

function loadRecp() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { M: [], S: {} };
  } catch (e) {
    console.error("loadRecp error", e);
    return { M: [], S: {} };
  }
}

function saveRecp(recp) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recp));
  } catch (e) {
    console.error("saveRecp error", e);
  }
}

function flatten(recp) {
  const list = [];
  (recp.M || []).forEach((m) => list.push({ ...m, _type: "M" }));
  Object.keys(recp.S || {}).forEach((seriesTitle) => {
    (recp.S[seriesTitle] || []).forEach((ep) => list.push({ ...ep, _type: "S", seriesTitle }));
  });
  return list;
}

function rebuild(list) {
  const recp = { M: [], S: {} };
  list.forEach((it) => {
    if (it._type === "M") recp.M.push(stripMeta(it));
    else {
      const s = it.seriesTitle || it.seriesTitle;
      recp.S[s] = recp.S[s] || [];
      recp.S[s].push(stripMeta(it));
    }
  });
  return recp;
}

function stripMeta(it) {
  const copy = { ...it };
  delete copy._type;
  delete copy.seriesTitle;
  return copy;
}

// add or update an entry. rawItem should contain either movie fields or series fields
function addRecent(rawItem, maxItems = 20) {
  const recp = loadRecp();
  const now = Date.now();
  const item = { ...rawItem, lastPlayedAt: now };

  const list = flatten(recp).filter((e) => {
    // detect duplicate
    if ((item.seriesTitle || item.episodeId) && e._type === "S") {
      return !(e.seriesTitle === item.seriesTitle && e.episodeId === item.episodeId);
    }
    if (!item.seriesTitle && !item.episodeId && e._type === "M") {
      return !(e.id === item.id);
    }
    return true;
  });

  const entry =
    item.seriesTitle || item.episodeId
      ? { ...item, _type: "S", seriesTitle: item.seriesTitle }
      : { ...item, _type: "M" };
  list.unshift(entry);

  const trimmed = list.slice(0, maxItems);
  const newRecp = rebuild(trimmed);
  saveRecp(newRecp);
  return newRecp;
}

function removeRecent(target) {
  const recp = loadRecp();
  const list = flatten(recp).filter((e) => {
    if (target._type === "M" || (!target.seriesTitle && target.id)) {
      return !(e._type === "M" && e.id === target.id);
    }
    return !(
      e._type === "S" &&
      e.seriesTitle === target.seriesTitle &&
      e.episodeId === target.episodeId
    );
  });
  const newRecp = rebuild(list);
  saveRecp(newRecp);
  return newRecp;
}

function getSwiperItems() {
  const recp = loadRecp();
  const items = [];
  (recp.M || []).forEach((m) => items.push({ ...m, _type: "M" }));
  Object.entries(recp.S || {}).forEach(([seriesTitle, episodes]) => {
    if (episodes && episodes.length) {
      const latest = episodes[0];
      items.push({ ...latest, seriesTitle, _type: "S" });
    }
  });
  items.sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0));
  return items;
}

export { loadRecp, saveRecp, addRecent, removeRecent, getSwiperItems };
