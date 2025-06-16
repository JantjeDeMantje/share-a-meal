// utils/dateHelper.js  (create this)
export const toMySqlDateTime = iso =>
  new Date(iso).toISOString().slice(0, 19).replace('T', ' ');

