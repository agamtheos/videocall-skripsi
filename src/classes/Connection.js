const kurento = require('kurento-client');

const UserSessionClass = require('./UserSession');
const UserRegistryClass = require('./UserRegistry');
const PipelinesClass = require('./Pipelines');
const CandidatesQueueClass = require('./CandidatesQueue');
const MediaPipelineClass = require('./MediaPipeline');

const UserRegistry = new UserRegistryClass();
const Pipelines = new PipelinesClass();
const CandidatesQueue = new CandidatesQueueClass();
const MediaPipeline = new MediaPipelineClass();

module.exports = {
    register(id, name, ws, callback) {
        function onError(error) {
            ws.send(JSON.stringify({id:'registerResponse', response : 'rejected ', message: error}));
        }
    
        if (!name) {
            return onError("empty user name");
        }
    
        if (UserRegistry.getByName(name)) {
            return onError("User " + name + " is already registered");
        }
    
        UserRegistry.register(new UserSessionClass(id, name, ws));
        try {
            ws.send(JSON.stringify({id: 'registerResponse', response: 'accepted'}));
        } catch(exception) {
            onError(exception);
        }
    },

    call(callerId, to, from, sdpOffer) {
        CandidatesQueue.clearCandidatesQueue(callerId);
    
        let caller = UserRegistry.getById(callerId);
        let rejectCause = 'User ' + to + ' is not registered';
        if (UserRegistry.getByName(to)) {
            let callee = UserRegistry.getByName(to);
            caller.sdpOffer = sdpOffer
            callee.peer = from;
            caller.peer = to;
            let message = {
                id: 'incomingCall',
                from: from
            };
            try{
                return callee.sendMessage(message);
            } catch(exception) {
                rejectCause = "Error " + exception;
            }
        }
        let message  = {
            id: 'callResponse',
            response: 'rejected: ',
            message: rejectCause
        };
        caller.sendMessage(message);
    },

    incomingCallResponse(calleeId, from, callResponse, calleeSdp, ws) {
        function onError(callerReason, calleeReason) {
            if (pipeline) MediaPipeline.release();
            if (caller) {
                let callerMessage = {
                    id: 'callResponse',
                    response: 'rejected'
                }
                if (callerReason) callerMessage.message = callerReason;
                caller.sendMessage(callerMessage);
            }
    
            let calleeMessage = {
                id: 'stopCommunication'
            };
            if (calleeReason) calleeMessage.message = calleeReason;
            callee.sendMessage(calleeMessage);
        }
    
        let callee = UserRegistry.getById(calleeId);
        if (!from || !UserRegistry.getByName(from)) {
            return onError(null, 'unknown from = ' + from);
        }
        let caller = UserRegistry.getByName(from);
        if (callResponse === 'accept') {
            let pipeline = new MediaPipelineClass();
            Pipelines.addPipeline(caller.id, pipeline);
            Pipelines.addPipeline(callee.id, pipeline);

            MediaPipeline.createPipeline(caller.id, callee.id, ws, function(error) {
                if (error) {
                    return onError(error, error);
                }
    
                MediaPipeline.generateSdpAnswer(caller.id, caller.sdpOffer, function(error, callerSdpAnswer) {
                    if (error) {
                        return onError(error, error);
                    }
    
                    MediaPipeline.generateSdpAnswer(callee.id, calleeSdp, function(error, calleeSdpAnswer) {
                        if (error) {
                            return onError(error, error);
                        }
    
                        let message = {
                            id: 'startCommunication',
                            sdpAnswer: calleeSdpAnswer
                        };
                        callee.sendMessage(message);
    
                        message = {
                            id: 'callResponse',
                            response : 'accepted',
                            sdpAnswer: callerSdpAnswer
                        };
                        caller.sendMessage(message);
                    });
                });
            });
        } else {
            const decline = {
                id: 'callResponse',
                response: 'rejected',
                message: 'user declined'
            };
            caller.sendMessage(decline);
        }
    },
    stop(sessionId) {
        let pipelines = Pipelines.getPipelines();
        if (!pipelines[sessionId]) {
            return;
        }
    
        let pipeline = pipelines[sessionId];
        Pipelines.removePipeline(sessionId);
        pipeline.release();
        let stopperUser = UserRegistry.getById(sessionId);
        let stoppedUser = UserRegistry.getByName(stopperUser.peer);
        stopperUser.peer = null;
    
        if (stoppedUser) {
            stoppedUser.peer = null;
            delete pipelines[stoppedUser.id];
            let message = {
                id: 'stopCommunication',
                message: 'remote user hanged out'
            }
            stoppedUser.sendMessage(message)
        }
    
        CandidatesQueue.clearCandidatesQueue(sessionId);
    },
    onIceCandidate(sessionId, _candidate) {
        const candidate = kurento.getComplexType('IceCandidate')(_candidate);
        const user = UserRegistry.getById(sessionId);
    
        const pipelines = Pipelines.getPipelines();
        if (pipelines[user.id] && pipelines[user.id].webRtcEndpoint && pipelines[user.id].webRtcEndpoint[user.id]) {
            const webRtcEndpoint = pipelines[user.id].webRtcEndpoint[user.id];
            webRtcEndpoint.addIceCandidate(candidate);
        }
        else {
            let candidatesQueue = CandidatesQueue.getCandidateQueueById(user.id);
            if (!candidatesQueue) {
                CandidatesQueue.addEmptyCandidateQueue(sessionId)
            }
            CandidatesQueue.addCandidateQueueWithData(sessionId, candidate);
        }
    },
}