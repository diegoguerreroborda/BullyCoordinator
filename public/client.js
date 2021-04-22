var socket = io()
var rowData = []
var rowMonitoring = []

var app = new Vue({
    el: '#app',
    data: {
        rowData: rowData,
        rowMonitoring : rowMonitoring,
        rowInfo: [],
        rowInfoMonitoring: []
    },
    created: function() {
        this.connect();
    },
    methods: {
        connect: function() {
            let vue = this;
            console.log('l')
            socket.on('server/list_servers', function(data) {
                console.log(data)
                vue.rowData = []
                data.forEach(server => {
                    vue.rowData.push({
                        id: server.id,
                        alive: server.alive,
                        isLeader: server.isLeader
                    })
                });
            })
            socket.on('server/monitoring', function(data) {
                console.log(data)
                vue.rowMonitoring = []
                data.forEach(server => {
                    vue.rowMonitoring.push({
                        time: server.time,
                        action: server.action,
                        server: server.server
                    })
                });
            })
        },
        add: function() {
            fetch('/server_created')
            .then(response => response.text())
            .then( 
                data => {
                    console.log(data)
                    
                }
            );
        },
        stop: function() {
            fetch('/new_leader')
            .then(response => response.text())
            .then( 
                data => {
                    console.log(data)
                    
                }
            );
        }
    }
})