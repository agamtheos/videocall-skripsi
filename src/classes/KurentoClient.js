const kurento = require('kurento-client');
const minimist = require('minimist');

const env = require('../config/env');

let kurentoClient = null

module.exports = function KurentoClient() {
    this.getKurentoClient = (callback) => {
        const argv = minimist(process.argv.slice(2), {
            default: {
                as_uri: env.as_uri,
                ws_uri: env.ws_uri
            }
        })

        if (kurentoClient !== null) {
            return callback(null, kurentoClient);
        }
    
        kurento(argv.ws_uri, function(error, _kurentoClient) {
            console.log('KurentoClient connected at address ' + argv.ws_uri)
            if (error) {
                let message = 'Coult not find media server at address ' + argv.ws_uri;
                return callback(message + ". Exiting with error " + error);
            }
    
            kurentoClient = _kurentoClient;
            callback(null, kurentoClient);
        });
    }

    this.get = () => kurentoClient

    // this.add = (client) => 
}