import sqlite, { Database } from 'sqlite3';
import { MerkleTree } from 'merkletreejs';
import SHA256 from 'crypto-js/sha256';

interface DBHandler {
    db: Database;
    port: number;
}

class DBHandler {
    constructor(port: number) {
        this.port = port;
        this.db = this.initDB();
        this.initTables();
        this.initMerkleTree();
        this.addPost = this.addPost.bind(this);
        this.compareMerkleTreeLeaves = this.compareMerkleTreeLeaves.bind(this);
    }

    initDB(): Database {
        return new sqlite.Database('user.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log(`Connected to the user database for node running on port ${this.port}`);
        });
    }

    isConnected(): boolean {
        return this.db !== null;
    }

    initTables(): void {

        this.db.run('CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, title TEXT, body TEXT)', (err) => {
            if (err) {
                console.error(err.message);
            }
        });
        console.log(`Created posts table for node running on port ${this.port}`);

        this.db.run('CREATE TABLE IF NOT EXISTS merkle_tree (id INTEGER PRIMARY KEY, leaves TEXT, root TEXT)', (err) => {
            if (err) {
                console.error(err.message);
            }
        });

        console.log(`Created merkle_tree table for node running on port ${this.port}`);

    }

    initMerkleTree(): void {

        const tree = new MerkleTree([], SHA256);
        const root = tree.getRoot().toString('hex');
        const leaves = tree.getLeaves();
        const sql = 'INSERT INTO merkle_tree (leaves) VALUES (?) (root) VALUES (?)';
        this.db.run(sql, [leaves, root], function (err) {
            if (err) {
                console.error(err.message);
            }
        });
        console.log(`Initialized Merkle tree for node running on port ${this.port}`);

    }

    addPost(title: string, body: string) {

    const sql = 'INSERT INTO posts (title, body) VALUES (?, ?)';
    this.db.run(sql, [title, body], function (err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`Post added with ID: ${this.lastID} for node running on port ${this.port}`);
        }
    }.bind(this));

    }

    compareMerkleTreeLeaves(leaves: Buffer<ArrayBufferLike>[]): Buffer<ArrayBufferLike>[][] {

        let mismatchedLeaves: Buffer<ArrayBufferLike>[][] = [];
        const sql = 'SELECT leaves, root FROM merkle_tree';
        this.db.get(sql, [], (err, row) => {
            if (err) {
                console.error(err.message);
            }
            if ((row as { leaves: Buffer<ArrayBufferLike>[] }).leaves !== leaves) {
                console.log('Hash mismatch between cached leaves and most recent leaves. Potential data tampering detected.');
                console.log('Cached leaves:', (row as { leaves: Buffer<ArrayBufferLike>[] }).leaves);
                console.log('Most recent leaves:', leaves);
                console.log('Mismatched leaves:', mismatchedLeaves);
                mismatchedLeaves.push((row as { leaves: Buffer<ArrayBufferLike>[] }).leaves);
            }
        });

        return mismatchedLeaves;

    }
}

export default DBHandler;