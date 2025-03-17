import sqlite, { Database } from 'sqlite3';
import { MerkleTree } from 'merkletreejs';
import SHA256 from 'crypto-js/sha256';
import bcrypt from 'bcrypt';

interface BootstrapDBHandler {
    db: Database;
    port: number;
}

class BootstrapDBHandler {

    constructor() {
        this.db = this.initDB();
        this.port = process.env.BOOTSTRAP_PORT ? parseInt(process.env.BOOTSTRAP_PORT) : 8000;
        this.initTables();
    }

    initDB(): Database {
        return new sqlite.Database('bootstrap.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the bootstrap database');
        });
    }

    initTables(): void {
        this.db.run('CREATE TABLE IF NOT EXISTS nodes (id INTEGER PRIMARY KEY, port INTEGER, did TEXT, root TEXT)', (err) => {
            if (err) {
                console.error(err.message);
            }
        });
        console.log('Created nodes table');
    }
}