module.exports = function UserSession(id, name, ws, state) {
    this.id = id;
    this.name = name;
    this.ws = ws;
    this.peer = null;
    this.sdpOffer = null;
    this.state = state;

    this.sendMessage = function(message) {
        const jsonMessage = JSON.stringify(message);
        this.ws.send(jsonMessage);
    }
}