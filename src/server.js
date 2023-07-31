const path = require('path');
const express = require('express');
const ws = require('ws');
const fs = require('fs');
const https = require('https');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { json, urlencoded } = require('body-parser')

const Router = require('./routes/index.router');
const UserRegistryClass = require('./classes/UserRegistry');
const Connection = require('./classes/Connection');
const response = require('./helpers/response');
const env = require('./config/env');

const UserRegistry = new UserRegistryClass();

let idCounter = 0;

const app = express();

app.use(cors({credentials: true, origin: true}));
app.use(helmet());
app.use(compression());
app.use(json({limit: '50mb'}));
app.use(urlencoded({ limit: '50mb', extended: true }));
app.use(response)
app.use('/api', Router)

let server;
if (process.env.NODE_ENV === 'development') {
    const options = {
        key: fs.readFileSync('keys/server.key'),
        cert: fs.readFileSync('keys/server.crt')
    }

    server = https.createServer(options, app).listen(env.port, function () {
        console.log('Server is running on port', env.port);
    });
}

if (process.env.NODE_ENV === 'production') {
    server = app.listen(env.port, function () {
        console.log('Server is running on port', env.port);
    });
}

const wss = new ws.Server({
    server: server,
    path: '/one2one'
});

function nextUniqueId() {
    idCounter++;
    return idCounter.toString();
}

wss.on('connection', function (ws) {
    const sessionId = nextUniqueId();
    console.log('Connection received with sessionId ' + sessionId);

    ws.on('error', function (error) {
        console.log('Connection ' + sessionId + ' error');
        Connection.stop(sessionId);
    });

    ws.on('close', async function () {
        console.log('Connection ' + sessionId + ' closed');
        const user = UserRegistry.getById(sessionId);
        Connection.stop(sessionId);
        UserRegistry.unregister(sessionId);

        if (user?.role === 'admin') {
            const UserActive = UserRegistry.getAllAdmins();
            const UserForUpdate = UserRegistry.getAllClient();
            UserForUpdate.forEach(user => {
                user.sendMessage({
                    id: 'updateListUserResponseClient',
                    users: UserActive
                })
            })
        }

        if (user?.role === 'client') {
            const UserActive = UserRegistry.getAllClient();
            const UserForUpdate = UserRegistry.getAllAdmins();
            UserForUpdate.forEach(user => {
                user.sendMessage({
                    id: 'updateListUserResponseAdmin',
                    users: UserActive
                })
            })
        }
    });

    ws.on('message', function (_message) {
        const message = JSON.parse(_message);
        console.log('Connection ' + sessionId + ' received message ', message);

        switch (message.id) {
            case 'getListUsersAdmin':
                const UserActive = UserRegistry.getAllAdmins();
                console.log('UserActive', UserActive)
                ws.send(JSON.stringify({
                    id: 'listUserResponse',
                    users: UserActive
                }))
            break;
            case 'getListUsersClient':
                const UserActiveClient = UserRegistry.getAllClient();
                ws.send(JSON.stringify({
                    id: 'listUserResponse',
                    users: UserActiveClient
                }))
            break;
            case 'getListStateAdmin':
                const UserActiveStateAdmin = UserRegistry.getAllAdmins();
                const UserForUpdateAdmin = UserRegistry.getAllClient();
                UserForUpdateAdmin.forEach(user => {
                    user.sendMessage({
                        id: 'updateListUserResponseClient',
                        users: UserActiveStateAdmin
                    })
                })
                UserActiveStateAdmin.forEach(user => {
                    user.sendMessage({
                        id: 'updateListUserResponseAdmin',
                        users: UserForUpdateAdmin
                    })
                })
            break;
            case 'getListStateClient':
                const UserActiveStateClient = UserRegistry.getAllClient();
                const UserForUpdateClient = UserRegistry.getAllAdmins();
                UserForUpdateClient.forEach(user => {
                    user.sendMessage({
                        id: 'updateListUserResponseAdmin',
                        users: UserActiveStateClient
                    })
                })
                UserActiveStateClient.forEach(user => {
                    user.sendMessage({
                        id: 'updateListUserResponseClient',
                        users: UserForUpdateClient
                    })
                })
            break;
            case 'register':
                Connection.register(sessionId, message.name, ws, message.state, message.role);
            break;
            case 'call':
                Connection.call(sessionId, message.from, message.to, message.sdpOffer, message.state);
            break;
            case 'incomingCallResponse':
                Connection.incomingCallResponse(sessionId, message.from, message.callResponse, message.state, ws);
            break;
            case 'stop':
                Connection.stop(sessionId, message.from, message.to);
            break;
            case 'onIceCandidate':
                Connection.onIceCandidate(sessionId, message.candidate, message.to, message.from);
                console.log('onIceCandidate', message)
            break;
            case 'peerConnected':
                Connection.peerConnected(sessionId, message.from, message.to);
            break;
            case 'description':
                const caller = UserRegistry.getById(sessionId)
                const callee = UserRegistry.getByName(message.to) ? UserRegistry.getByName(message.to) : UserRegistry.getByName(caller.peer);
                const msg = {
                    id: 'description',
                    description: message.description,
                    from: message.from
                }
                callee.sendMessage(msg);
            break;
            default:
                ws.send(JSON.stringify({
                    id: 'error',
                    message: 'Invalid message ' + message
                }));
                break;
        }
    });
});

app.use(express.static(path.join(process.cwd(), 'static')));