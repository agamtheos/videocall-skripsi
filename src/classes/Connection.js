// const kurento = require('kurento-client');

const UserSessionClass = require('./UserSession');
const UserRegistryClass = require('./UserRegistry');
const PipelinesClass = require('./Pipelines');
const CandidatesQueueClass = require('./CandidatesQueue');
const MediaPipelineClass = require('./MediaPipeline');
const User = require('../models/user.model');

const UserRegistry = new UserRegistryClass();
const Pipelines = new PipelinesClass();
const CandidatesQueue = new CandidatesQueueClass();
const MediaPipeline = new MediaPipelineClass();

module.exports = {
    register(id, name, ws, state, role, callback) {
        function onError(error) {
            ws.send(JSON.stringify({id:'registerResponse', response : 'rejected ', message: error}));
        }
    
        if (!name) {
            return onError("empty user name");
        }
    
        if (UserRegistry.getByName(name)) {
            return onError("User " + name + " is already registered");
        }

        UserRegistry.register(new UserSessionClass(id, name, ws, state, role));

        if (role === 'admin') {
            const UserActive = UserRegistry.getAllAdmins();
            const UserForUpdate = UserRegistry.getAllClient();
            UserForUpdate.forEach(user => {
                user.sendMessage({
                    id: 'updateListUserResponseClient',
                    users: UserActive
                })
            })
        }

        if (role === 'client') {
            const UserActive = UserRegistry.getAllClient();
            const UserForUpdate = UserRegistry.getAllAdmins();
            UserForUpdate.forEach(user => {
                user.sendMessage({
                    id: 'updateListUserResponseAdmin',
                    users: UserActive
                })
            })
        }
        try {
            ws.send(JSON.stringify({id: 'registerResponse', response: 'accepted', name: name}));
        } catch(exception) {
            onError(exception);
        }
    },

    call(callerId, from, to, state) {
        console.log('Call Function Called')

        CandidatesQueue.clearCandidatesQueue(callerId);
    
        let caller = UserRegistry.getById(callerId);
        let callee = UserRegistry.getByName(to);

        console.log('Checking Callee State')
        if (callee?.state === 'IN_CALL') {
            console.log('Callee State is not registered')
            const msg = {
                id: 'callResponse',
                response: 'reject_incall',
                message: 'User masih dalam panggilan lain atau sedang tidak dapat dihubungi, silahkan coba beberapa saat lagi'
            }
            return caller.sendMessage(msg);
        }

        console.log('Callee State is registered')

        let rejectCause = 'User ' + to + ' is not registered';

        if (callee) {
            console.log('Processing Call')

            caller.peer = to;
            caller.state = state || 'IN_CALL';

            callee.peer = from;
            callee.state = state || 'IN_CALL';

            let message = {
                id: 'incomingCall',
                from: from,
            };

            try{
                console.log('Sending Message to Callee')
                return callee.sendMessage(message);
            } catch(exception) {
                rejectCause = "Error " + exception;
            }
        }
        let message  = {
            id: 'callResponse',
            response: 'rejected',
            message: rejectCause
        };
        caller.sendMessage(message);
    },

    incomingCallResponse(calleeId, from, callResponse, state, ws) {
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

        if (callResponse === 'reject_incall') {
            let message = {
                id: 'callResponse',
                response: 'reject_incall',
                message: 'user is in call'
            };
            return caller.sendMessage(message);
        }

        if (!from || !UserRegistry.getByName(from)) {
            return onError(null, 'unknown from = ' + from);
        }

        if (callResponse === 'accept') {
            message = {
                id: 'startCommunication',
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
        let stopperUser;
        if (to) {
            stopperUser = UserRegistry.getById(sessionId);
            stoppedUser = UserRegistry.getByName(stopperUser.peer) ? UserRegistry.getByName(stopperUser.peer) : UserRegistry.getByName(to);
        }

        if (stoppedUser) {
            let message = {
                id: 'stopCommunication',
                message: 'remote user hanged out'
            }
            stoppedUser.sendMessage(message);
        }

        if (stoppedUser) UserRegistry.unregister(stoppedUser.id);

        if (stopperUser?.role === 'admin') {
            const UserActive = UserRegistry.getAllAdmins();
            const UserForUpdate = UserRegistry.getAllClient();
            UserForUpdate.forEach(user => {
                user.sendMessage({
                    id: 'updateListUserResponseClient',
                    users: UserActive
                })
            })
        }

        if (stopperUser?.role === 'client') {
            const UserActive = UserRegistry.getAllClient();
            const UserForUpdate = UserRegistry.getAllAdmins();
            UserForUpdate.forEach(user => {
                user.sendMessage({
                    id: 'updateListUserResponseAdmin',
                    users: UserActive
                })
            })
        }
        UserRegistry.unregister(sessionId);
    },
    onIceCandidate(sessionId, _candidate, to, from) {
        const user = UserRegistry.getById(sessionId)
        const peer = UserRegistry.getByName(user.peer);

        const message = {
            id: 'iceCandidate',
            candidate: _candidate
        }
        peer.sendMessage(message);
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