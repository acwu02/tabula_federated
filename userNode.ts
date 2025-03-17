import express, { Express } from 'express';
import { MerkleTree } from 'merkletreejs';
import SHA256 from 'crypto-js/sha256';
import UserDBHandler from './userDbHandler.ts';
import cors from 'cors';

interface Node {
    port: number;
    handle: string;
    hash: string;
    publicKey: string;
    did: string;
    dbHandler: UserDBHandler;
    tree: MerkleTree;
}

interface PostRequest {
    title: string;
    body: string;
}

class Node {
    constructor(port: number, handle: string, hash: string, publicKey: string) {
        this.port = port;
        this.handle = handle;
        this.hash = hash;
        this.publicKey = publicKey;
        this.did = `did:example:${process.env.NODE_DOMAIN}:${port}`;
        this.dbHandler = new UserDBHandler(port);
        this.tree = new MerkleTree([SHA256('default').toString()], SHA256);
    }

    getDidDocument(): string {
        return JSON.stringify({
            '@context': 'https://www.w3.org/ns/did/v1',
            id: this.did,
            publicKey: [{
                id: `${this.did}#keys-1`,
                type: 'Ed25519VerificationKey2018',
                controller: this.did,
                publicKeyBase58: this.publicKey
            }],
            authentication: [{
                type: 'Ed25519SignatureAuthentication2018',
                publicKey: `${this.did}#keys-1`
            }],
            service: [{
                type: 'MessagingService',
                serviceEndpoint: `http://localhost:${this.port}` // TODO change to standardized
            }]
        });
    }

    validateMerkleTree(prevRootHash: string): boolean {
        const root = this.tree.getRoot().toString('hex');
        if (root !== prevRootHash) {
            console.log('Root hash mismatch. Cached root:', prevRootHash, 'Current root:', root);
            const leaves = this.tree.getLeaves();
            return this.validateMerkleTreeLeaves(leaves);
        }
        console.log('Root hash matches. No action needed.');
        return true;
    }

    validateMerkleTreeLeaves(leaves: Buffer<ArrayBufferLike>[]): boolean {
        const mismatchedLeaves = this.dbHandler.compareMerkleTreeLeaves(leaves);
        if (mismatchedLeaves.length > 0) {
            console.log('Mismatched leaves:', mismatchedLeaves);
            return false;
        } else {
            console.log('All leaves match.');
            return true;
        }

    }

    create(): void {

        const app: Express = express();
        app.use(express.json());

        const allowedOrigins = ['http://localhost:3000'];

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

        app.get('/', (req, res) => {
            res.send('Hello, world!');
        });

        app.post('/post', async (req, res) => {

            const { title, body } = req.body as PostRequest;
            if (!title || !body) {
                res.status(400).send('Title and body are required');
                return;
            }

            try {
                this.post(title, body);
                res.status(201).send(`Post added successfully. New Merkle root: ${this.tree.getRoot().toString('hex')}`);
            } catch (e) {
                console.error(e);
                res.status(500).send('Internal server error');
            }

        });

        app.get('/content', (req, res) => {
            const posts = this.dbHandler.getPosts();
            res.send(posts);
        });


        app.get('/relay', (req, res) => {
            console.log(`Initiating relay at port ${this.port}`);
            try {
                if (!this.dbHandler.isConnected()) {
                    throw new Error('Database not connected');
                }
                if (!this.tree) {
                    throw new Error('Merkle tree not initialized');
                }
                const { prevRootHash } = req.body;
                if (!prevRootHash) {
                    throw new Error('Cached hash is required');
                }
                const isMerkleTreeValid = this.validateMerkleTree(prevRootHash);
                if (!isMerkleTreeValid) {
                    throw new Error('Merkle tree leaves are invalid. Data tampering detected.');
                } else {
                    const response = `Relay response from port ${this.port}: Merkle tree is valid.`;
                    res.send(response);
                }
            } catch (e) {
                console.error(e);
            }
        });

        app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });

    }

    post(title: string, body: string) {

        this.dbHandler.addPost(title, body);
        this.tree.addLeaf(Buffer.from(SHA256(title + body).toString(), 'hex'), true);

    }
}

export default Node;