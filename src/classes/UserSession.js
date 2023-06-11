module.exports = function UserSession(id, name, ws, state, role) {
    this.id = id;
    this.name = name;
    this.shortName = name.split(' ').map(word => word[0]).join('').toUpperCase();
    this.ws = ws;
    this.peer = null;
    this.sdpOffer = null;
    this.state = state;
    this.role = role;

    this.sendMessage = function(message) {
        const jsonMessage = JSON.stringify(message);
        this.ws.send(jsonMessage);
    }
}