const pipelines = {}

module.exports = function Pipelines() {
    this.getPipelines = () => pipelines

    this.removePipeline = (sessionId) => {
        delete pipelines[sessionId]
    }

    this.addPipeline = (sessionId, pipeline) => {
        pipelines[sessionId] = pipeline
    }
}