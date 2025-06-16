const users = [];

const getAll = () => users;
const getByEmail = (email) => users.find(user => user.email === email);
const getById = (id) => users.find(user => user.id === id);
const add = (user) => {
  users.push(user);
  return user;
};
const deleteById = (id) => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users.splice(index, 1);
    return true;
  }
  return false;
};
const updateById = (id, newData) => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...newData };
    return users[index];
  }
  return null;
};

export default {
  getAll,
  getByEmail,
  getById,
  add,
  deleteById,
  updateById
};