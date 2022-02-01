
import server from './server'
import * as net from "net";

//Server parameters used for test and different from default
const testPort = 8000
const testIp = '127.0.0.1'

//Number of clients to simulate
const n_clients = 5;
//Create n_clients clients
const clients: Array<net.Socket> = []

const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const randomString = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//Convert net.Socket.on callback to promise
const clientOn = (event: string, client: net.Socket) => {
  return new Promise((resolve, reject) => {
    try {
      client.on(event, (data) => {
        resolve(data)
      })
    } catch (error) {
      reject(error)
    }
  })
}

//This function sends a data string trought senderClient and waits for other clients to receive it
const sendDataAndWait = (senderClient:net.Socket, data:string) => {
  senderClient.write(data)
  
  const allPromises = []
  clients.forEach((cl)=>{
    if (cl !== senderClient){
      allPromises.push(clientOn('data', cl))
    }
  })
  return Promise.all(allPromises);
}

describe('Test conncetion with telnet', function () {

  for (let i = 0; i < n_clients; i++)
    clients.push(new net.Socket())

  beforeAll(async () => {
    //Start server
    await new Promise<void>((resolve) => {
      server.listen(testPort, testIp, 100, () => {
        resolve()
      })
    });

    //Connect clients to server
    const connections = clients.map(cl => cl.connect(testPort, testIp))
    await Promise.all(connections)

  });


  test('Send random string from random client and receive to other', done => {
    
    const rndClient = Math.floor(Math.random() * clients.length)
    const rndStringLen = Math.floor(Math.random() * 20)
    const sendString = randomString(rndStringLen) + "\r\n"
    const senderClient = clients[rndClient]
    
    sendDataAndWait(senderClient, sendString).then((data) => {
      const check = data.reduce(function (a, b) { return (a + "" === b + "") ? a + "" : NaN; })
      expect(check).toBe(sendString);
      done();
    }).catch((error) => {
      done(error)
    })

  });

  test('Send random string with random disconnected client', done => {
    
    
    const rndClientToDisconnect = Math.floor(Math.random() * clients.length)
    const disconnectClient = clients[rndClientToDisconnect]
    disconnectClient.destroy()

    clientOn('close', disconnectClient).then(async ()=>{
      await delay(100);
      clients.splice(rndClientToDisconnect, 1);

      const rndClient = Math.floor(Math.random() * clients.length)
      const rndStringLen = Math.floor(Math.random() * 30)
      const sendString = randomString(rndStringLen) + "\r\n"
      const senderClient = clients[rndClient]
      
      sendDataAndWait(senderClient, sendString).then((data) => {
        const check = data.reduce(function (a, b) { return (a + "" === b + "") ? a + "" : NaN; })
        expect(check).toBe(sendString);
        done();
      }).catch((error) => {
        done(error)
      })
    })
    

  });

  afterAll(done => {

    const allClosed = []
    clients.forEach(async cl => {
      allClosed.push(clientOn('close', cl))
      await delay(100);
      cl.destroy()
    })

    Promise.all(allClosed).then(async () => {
      await delay(100);
      server.close(done)
    })

  });

});

