import express, { Express } from 'express';
import { MerkleTree } from 'merkletreejs';
import SHA256 from 'crypto-js/sha256';
import DBHandler from './dbHandler.ts';

interface Node {
    port: number;
    did: string;
    dbHandler: DBHandler;
    tree: MerkleTree;
}

interface PostRequest {
    title: string;
    body: string;
}

class Node {
    constructor(port: number) {
        this.port = port;
        this.did = `did:example:${process.env.NODE_DOMAIN}:${port}`;
        this.dbHandler = new DBHandler(port);
        this.tree = new MerkleTree([SHA256('default').toString()], SHA256);
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