import * as net from "net";
import { v4 as uuid } from 'uuid';

interface SuperSocket extends net.Socket {
    uuid: string;
}

//Dictionary with client connected to chat server
const clients: { [key: string]: SuperSocket } = {}

const generateUUID = (): string => {
    let temp: string;
    do {
        temp = uuid()
    } while (temp in Object.keys(clients))
    return temp;
}


const broadcastToAll = (data: string, sender: SuperSocket): void => {
    console.log(`  Broadcast data to ${Object.keys(clients).length - 1} client!`);
    for (const uuid in clients) {
        const client = clients[uuid]
        if (sender.uuid != client.uuid) {
            client.write(data);
        }
    }
}

const connectionListner = (client: SuperSocket) => {
    client.uuid = generateUUID()
    console.log(`Client connected with UUID: ${client.uuid}`);

    clients[client.uuid] = client

    client.on('data', function (data) {
        console.log(`Client ${client.uuid} sent data!`);
        const receivedString = data.toString()

        //Detect exit or Ctr+C from received string
        if (receivedString === 'exit\r\n' || receivedString.charCodeAt(0) == 65533)
            client.destroy()
        else if (receivedString != '' && receivedString != '\r\n') {
            broadcastToAll(receivedString, client)
        }
    });

    client.on('close', function () {
        console.log(`Client ${client.uuid} closed connection!`);
        delete clients[client.uuid]
    });
}

const server: net.Server = net.createServer(connectionListner);

export default server;