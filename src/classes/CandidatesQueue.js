const candidatesQueue = {};

module.exports = function CandidatesQueue() {
    this.getCandidatesQueue = () => candidatesQueue;

    this.getCandidateQueueById = (Id) => candidatesQueue[Id];

    this.shiftCandidateQueueById = (Id) => candidatesQueue[Id].shift();

    this.clearCandidatesQueue = (sessionId) => {
        if (candidatesQueue[sessionId]) {
            delete candidatesQueue[sessionId];
        }
    }

    this.addCandidateQueueWithData = (sessionId, candidate) => {
        candidatesQueue[sessionId].push(candidate);
    }

    this.addEmptyCandidateQueue = (sessionId) => {
        candidatesQueue[sessionId] = [];
    }
}