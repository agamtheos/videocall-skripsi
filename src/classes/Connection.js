// const kurento = require('kurento-client');

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
    register(id, name, ws, state, callback) {
        function onError(error) {
            ws.send(JSON.stringify({id:'registerResponse', response : 'rejected ', message: error}));
        }
    
        if (!name) {
            return onError("empty user name");
        }
    
        if (UserRegistry.getByName(name)) {
            return onError("User " + name + " is already registered");
        }
    
        UserRegistry.register(new UserSessionClass(id, name, ws, state));
        try {
            ws.send(JSON.stringify({id: 'registerResponse', response: 'accepted', name: name}));
        } catch(exception) {
            onError(exception);
        }
    },

    call(callerId, from, to, sdpOffer, state) {
        CandidatesQueue.clearCandidatesQueue(callerId);
    
        let caller = UserRegistry.getById(callerId);

        let rejectCause = 'User ' + to + ' is not registered';

        if (UserRegistry.getByName(to)) {
            let callee = UserRegistry.getByName(to);
            caller.sdpOffer = sdpOffer
            caller.peer = to;
            caller.state = state;

            callee.peer = from;
            callee.state = state;

            let message = {
                id: 'incomingCall',
                from: from,
                sdpOffer: sdpOffer
                // from: to
            };

            try{
                return callee.sendMessage(message);
            } catch(exception) {
                rejectCause = "Error " + exception;
            }

            // let msg = {
            //     id: 'callResponse',
            //     response: 'accepted',
            //     from: from,
            //     to: to,
            // }
            // try {
            //     caller.sendMessage(msg);
            // } catch(exception) {
            //     rejectCause = "Error " + exception;
            // }
        }
        let message  = {
            id: 'callResponse',
            response: 'rejected: ',
            message: rejectCause
        };
        caller.sendMessage(message);
    },

    incomingCallResponse(calleeId, from, callResponse, calleeSdp, state, ws) {
        let caller = UserRegistry.getByName(from);
        let callee = UserRegistry.getById(calleeId);

        caller.state = state;
        callee.state = state;
        // const msg = {
        //     id: 'startCandidates',
        // }

        // caller.sendMessage(msg);
        
        if (callResponse === 'reject') {
            let message = {
                id: 'callResponse',
                response: 'rejected',
                message: 'user declined'
            };
            return caller.sendMessage(message);
        }

        if (!from || !UserRegistry.getByName(from)) {
            return onError(null, 'unknown from = ' + from);
        }

        if (callResponse === 'accept') {
            message = {
                id: 'startCommunication',
                sdpAnswer: calleeSdp
            }
            caller.sendMessage(message);
            // add delay 1 second
            // setTimeout(() => {
            //     const msg = {
            //         id: 'startCandidates'
            //     }
            //     callee.sendMessage(msg);
            //     caller.sendMessage(msg);
            // }, 1000);
            
        } else {
            const decline = {
                id: 'callResponse',
                response: 'rejected',
                message: 'user declined'
            };
            caller.sendMessage(decline);
        }
    },
    stop(sessionId, from, to) {
        let stoppedUser;
        if (to) {
            const stopperUser = UserRegistry.getById(sessionId);
            stoppedUser = UserRegistry.getByName(stopperUser.peer) ? UserRegistry.getByName(stopperUser.peer) : UserRegistry.getByName(to);
        }

        if (stoppedUser) {
            let message = {
                id: 'stopCommunication',
                message: 'remote user hanged out'
            }
            stoppedUser.sendMessage(message);
        }
    },
    onIceCandidate(sessionId, _candidate, to, from) {
        const user = UserRegistry.getById(sessionId)
        const peer = UserRegistry.getByName(user.peer);

        // always loop to check peer.state === 'accept_calling' then send candidate
        if (peer.state === 'req_calling') {
            console.log('adding candidate queue')
            CandidatesQueue.addEmptyCandidateQueue(user.name);
            CandidatesQueue.addCandidateQueueWithData(user.name, _candidate);
            // break;
        }

        // if user state === 'acc_calling' then send candidate
        if (user.state === 'acc_calling') {
            const candidates = CandidatesQueue.getCandidateQueueById(user.name);
            console.log('candidates', candidates)
            // send candidate that come late
            if (candidates?.length > 0) {
                for (let i = 0; i < candidates.length; i++) {
                    const message = {
                        id: 'iceCandidate',
                        candidate: candidates[i]
                    }
                    peer.sendMessage(message);
                }
            }
            
            // send candidate that come right away
            const msessage = {
                id: 'iceCandidate',
                candidate: _candidate
            }
            peer.sendMessage(msessage);
        }
        // const message = {
        //     id: 'iceCandidate',
        //     candidate: _candidate
        // }
        // peer.sendMessage(message);

        // if (user.state === 'req_calling') {
        //     CandidatesQueue.addEmptyCandidateQueue(user.name);
        //     CandidatesQueue.addCandidateQueueWithData(user.name, _candidate);
        // }
    },
    peerConnected(sessionId, from, to) {
        const user = UserRegistry.getById(sessionId);

        const message = {
            id: 'peerConnected',
            message: 'peer connected'
        }
        user.sendMessage(message);
    },
    onFinishRequest(sessionId) {
        const user = UserRegistry.getById(sessionId);
        const peer = UserRegistry.getByName(user.peer);

        const peerCandidate = CandidatesQueue.getCandidateQueueById(user.peer);
        console.log('peerCandidate', peerCandidate[0])
        const message = {
            id: 'iceCandidate',
            candidate: peerCandidate[0]
        }
        user.sendMessage(message);
    }
}