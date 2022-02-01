import server from './server'

const PORT = process.env["PORT"] ? Number(process.env["PORT"]) : 10000
const HOST = process.env["HOST"] ? String(process.env["HOST"]) : '127.0.0.1'
const BACKLOG = 100


server.listen(PORT, HOST, BACKLOG, () => {
    console.log(`Server is lisetning on port ${PORT}`);
})


server.on('error', (e) => {

    console.error(`An error occurred while starting the server. ${e}`);
    setTimeout(() => {
        server.close();
    }, 1000);

});