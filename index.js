const express = require('express');
const axios = require('axios');
//const cors = require('cors');
const shell = require('shelljs');

const port = 3050;

let servers = [{path: "http://localhost:3000/", alive: true}, {path: "http://localhost:3000/", alive: true}];

const app = express()

//Crea un nuevo servidor
app.post('/server_created', (req, res) => {
    //Si existen instancias, lo crea como seguidor, si no como Líder
    //Crea instancia
    //envia lista de servers
    //En la instancia valida si puede o no ser lider.
    if(servers.length == 0){
        console.log('Crear el lider')
    }else{
        console.log('Ya hay un lider')
    }
})
/*
function createLeader() {

}
*/

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})