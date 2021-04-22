const express = require('express')
const axios = require('axios');
const bodyParser = require('body-parser');
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors');
const shell = require('shelljs');
const { response } = require('express');
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(cors())

//let servers = [{path: "http://localhost:3000/", alive: false, id: 3000, isLeader:true}, {path: "http://localhost:2999/", alive: false, id: 2999, isLeader:false}, {path: "http://localhost:2998/", alive: false, id: 2998, isLeader:false}];
//let servers = [{path: "http://localhost:3000/", alive: false, id: 3000, isLeader:true}]
let servers = []
const PORT = 3050
let portInstance = 4000;
let leader = `http://172.17.0.1:4000/`;
let portStop = 4000;
let monitoring = []

//servers.push({path:`http://localhost:${portInstance}/`, alive: true, id:portInstance, isLeader:true});

//Crea un nuevo servidor
app.get('/server_created', async(req, res) => {
    
    //poner un post
    await shell.exec(`sh createInstance.sh ${portInstance}`)
    //envia lista de servers
    //En la instancia valida si puede o no ser lider.
    if(servers.length == 0){
        console.log('Crear el lider');
        servers.push({path:`http://172.17.0.1:${portInstance}/`, alive: true, id:portInstance, isLeader:true});
        leader = `http://172.17.0.1:${portInstance}/`;
        setTimeout(async function() {
            await sendServerToAll('new_server')
        }, 1500)
    }else{
        console.log('Ya hay un lider');
        servers.push({path:`http://172.17.0.1:${portInstance}/`, alive: true, id:portInstance, isLeader:false});
        setTimeout(async function() {
            await sendServerToAll('new_server')
        }, 1500)
    }
    await getMonitoring();
    res.sendStatus(200)
})

async function sendServerToAll(afterUrl) {
    await getMonitoring();
    console.log("Enviando Servidores a todos...")
    for (const host in servers) {
        console.log(`${servers[host].path}${afterUrl}`)
        await axios({
            method: 'post',
            url : `${servers[host].path}${afterUrl}`,
            data: {
              path: `http://172.17.0.1:${portInstance}/`,
              id: portInstance,
              leader: leader,
              servers: servers
            }
        }).then(response => {
            console.log('Resultado:', response.data);
        }).catch(err => {
            console.log("Apagadooo")
        });
    }
    portInstance--;
}

async function findNewLeader() {
    for (const server in servers) {
        try {
            console.log(`${servers[server].path}update`)
            let response = await axios(`${servers[server].path}update`)
            servers = response.data
            console.log(response.data)
            //servers = response.data
            return;
        } catch(err) {
            console.log('err.Error')
        }
    }
}

app.post('/update', (req, res) => {
    console.log('lo uso?', req.body.servers, req.body.leader)
    servers = req.body.servers;
    leader = req.body.leader;
    res.sendStatus(200)
})

app.get('/new_leader', async (req, res) => {
    await getMonitoring();
    await shell.exec(`sh stopInstance.sh ${portStop}`)
    //actualizar servers
    //await sendServerToAll('update')
    console.log('count', portInstance)
    console.log('Buscar quien es el nuevo leader')
    await setTimeout(() => {
        findNewLeader();
        //Hacer get pidiendo todo actualizado
    }, 8000)
    setTimeout(async function() {
        for (const server in servers) {
            try {
                console.log(`${servers[server].path}leader_called`)
                let response = await axios(`${servers[server].path}leader_called`)
                leader = response.data
                console.log('para el stop', response.data.substring(18,22))
                portStop = response.data.substring(18,22);
                console.log(response.data)
                //servers = response.data
                return;
            } catch(err) {
                console.log('err.Error')
                //servers[server].isLeader = false
            }
        }
    },12000)
    await getMonitoring();
})

async function getMonitoring() {
    try {
        console.log(`${leader}monitoring`)
        let response = await axios(`${leader}monitoring`)
        monitoring = response.data
        //monitoring = response.data
        return;
    } catch(err) {
        console.log('err.Error')
    }
}

io.on('connection', function (socket) {
    console.log(`client: ${socket.id}`)
    //enviando al cliente
    setInterval(async () => {
        socket.emit('server/list_servers', servers)
        socket.emit('server/monitoring', monitoring)
    }, 5000)
})

server.listen(PORT, () => {
    console.log(`Server running in port:${PORT}`)
})