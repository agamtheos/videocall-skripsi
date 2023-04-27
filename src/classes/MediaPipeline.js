const kurento = require('kurento-client');

const UserRegistryClass = require('./UserRegistry');
const PipelinesClass = require('./Pipelines');
const CandidatesQueueClass = require('./CandidatesQueue');
const KurentoClientClass = require('./KurentoClient');

const Pipelines = new PipelinesClass();
const CandidatesQueue = new CandidatesQueueClass();
const UserRegistry = new UserRegistryClass();
const KurentoClient = new KurentoClientClass();

const selfPipeline = null;
const selfWebRtcEndpoint = {};

module.exports = function MediaPipeline() {
    this.pipeline = null;
    this.webRtcEndpoint = {};

    this.createPipeline = (callerId, calleeId, ws, callback) => {
        let self = this
        KurentoClient.getKurentoClient(function(error, kurentoClient) {
            if (error) {
                return callback(error);
            }

            kurentoClient.create('MediaPipeline', function(error, pipeline) {
                if (error) {
                    return callback(error);
                }

                pipeline.create('WebRtcEndpoint', function(error, callerWebRtcEndpoint) {
                    if (error) {
                        pipeline.this.release();
                        return callback(error);
                    }
                    const candidatesQueue = CandidatesQueue.getCandidateQueueById(callerId);
                    if (candidatesQueue) {
                        while(candidatesQueue.length) {
                            const candidate = CandidatesQueue.shiftCandidateQueueById(callerId);
                            callerWebRtcEndpoint.addIceCandidate(candidate);
                        }
                    }

                    callerWebRtcEndpoint.on('IceCandidateFound', function(event) {
                        const candidate = kurento.getComplexType('IceCandidate')(event.candidate);
                        const caller = UserRegistry.getById(callerId)
                        caller.ws.send(JSON.stringify({
                            id : 'iceCandidate',
                            candidate : candidate,
                            userId : caller.name
                        }));
                    });

                    pipeline.create('WebRtcEndpoint', function(error, calleeWebRtcEndpoint) {
                        if (error) {
                            pipeline.this.release();
                            return callback(error);
                        }

                        const candidatesQueue = CandidatesQueue.getCandidateQueueById(calleeId);
                        if (candidatesQueue) {
                            while(candidatesQueue.length) {
                                const candidate = CandidatesQueue.shiftCandidateQueueById(calleeId);
                                calleeWebRtcEndpoint.addIceCandidate(candidate);
                            }
                        }

                        calleeWebRtcEndpoint.on('IceCandidateFound', function(event) {
                            const candidate = kurento.getComplexType('IceCandidate')(event.candidate);
                            const callee = UserRegistry.getById(calleeId)
                            callee.ws.send(JSON.stringify({
                                id : 'iceCandidate',
                                candidate : candidate,
                                userId: callee.name
                            }));
                        });

                        callerWebRtcEndpoint.connect(calleeWebRtcEndpoint, function(error) {
                            if (error) {
                                pipeline.this.release();
                                return callback(error);
                            }

                            calleeWebRtcEndpoint.connect(callerWebRtcEndpoint, function(error) {
                                if (error) {
                                    pipeline.this.release();
                                    return callback(error);
                                }

                                self.pipeline = pipeline;
                                self.webRtcEndpoint[callerId] = callerWebRtcEndpoint;
                                self.webRtcEndpoint[calleeId] = calleeWebRtcEndpoint;

                                callback(null);
                            });
                        });
                    });
                });
            });
        });
    }

    this.generateSdpAnswer = (id, sdpOffer, callback) => {
        this.webRtcEndpoint[id].processOffer(sdpOffer, callback);
        this.webRtcEndpoint[id].gatherCandidates(function(error) {
            if (error) {
                return callback(error);
            }
        });
    }

    this.release = () => {
        if (this.pipeline) this.pipeline.this.release();
        this.pipeline = null;
    }
}