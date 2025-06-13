const users = [];

module.exports = {
  getAll: () => users,
  getByEmail: (email) => users.find(user => user.email === email),
  getById: (id) => users.find(user => user.id === id),
  add: (user) => {
    users.push(user);
    return user;
  },
  deleteById: (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users.splice(index, 1);
      return true;
    }
    return false;
  },
  updateById: (id, newData) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...newData };
      return users[index];
    }
    return null;
  }
};

