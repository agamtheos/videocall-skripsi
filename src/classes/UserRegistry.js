const userRegistry = {};
const userRegistryByUsername = {};

module.exports = function Registry() {
    this.getById = (id) => {
        return userRegistry[id];
    }
    this.getByName = (name) => {
        return userRegistryByUsername[name];
    }
    this.removeById = (id) => {
        const user = userRegistry[id];
        if (!user) {
            delete userRegistry[id];
            delete userRegistryByUsername[user.name];
        }
    }
    this.register = (user) => {
        userRegistry[user.id] = user;
        userRegistryByUsername[user.name] = user;
    }
    this.unregister = (id) => {
        const user = this.getById(id);
        if (user) delete userRegistry[id]
        if (user && this.getByName(user.name)) delete userRegistryByUsername[user.name];
    }
}