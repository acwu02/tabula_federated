// Lightweight entrypoint for entire network
import axios from 'axios';
import express from 'express';
import cors from 'cors';
import Node from './userNode.js';

const app = express();

app.use(express.json());

const ports = new Map<number, boolean>();
const users = new Map<string, Node>(); // TODO replace w/ DB

const startPort: number = parseInt(process.env.START_NODE_PORT || '8001', 10);
const endPort: number = parseInt(process.env.END_NODE_PORT || '8005', 10);

for (let port = startPort; port <= endPort; port++) {
  console.log(`Setting port ${port}`);
  ports.set(port, false);
}

const allowedOrigins = ['http://localhost:3000'];

const relayPort = parseInt(process.env.RELAY_PORT || '8080', 10)

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));

app.get('/relay', async (req, res) => {
  res.send('Initiating relay');
  try {
    const response = await axios.get(`http://localhost:${relayPort}/`);
    res.send(response.data);
  } catch (e) {
    console.error(e);
  }
});

app.post('/users/register', async (req, res) => {
  const { handle, publicKey, hash } = req.body;
  console.log(`Registering user with handle ${handle}`);
  console.log(`Hash: ${hash}`);
  if (!handle || !publicKey) {
    res.status(400).send('missingHandleOrPublicKey');
    return;
  }
  if (users.has(handle)) {
    res.status(409).send('incorrectPassword');
    return;
  }
  for (let [port, available] of ports) {
    if (!available) {
      ports.set(port, true);
      let node = new Node(port, handle, hash, publicKey);
      node.create();
      users.set(handle, node);
      console.log(`User registered with handle ${handle} on port ${port}`);
      const did = node.getDidDocument();
      res.json({ "success": true, "did": did });
      return;
    }
  }
  res.status(503).send('noAvailablePorts');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Bootstrap server running on port ${PORT}`);
});

export { app };