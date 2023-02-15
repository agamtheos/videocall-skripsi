module.exports = function UserSession(id, name, ws) {
    this.id = id;
    this.name = name;
    this.ws = ws;
    this.peer = null;
    this.sdpOffer = null;

    this.sendMessage = function(message) {
        const jsonMessage = JSON.stringify(message);
        this.ws.send(jsonMessage);
    }
}