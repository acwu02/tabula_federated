import { Database } from "sqlite3";
import DBHandler from "../dbHandler";

jest.mock('sqlite3');

describe('DBHandler', () => {
    let dbHandler: DBHandler;
    let mockDb: jest.Mocked<Database>;

    beforeEach(() => {
        mockDb = new Database('') as jest.Mocked<Database>;
        dbHandler = new DBHandler();
        dbHandler.db = mockDb;
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return empty array when there is no mismatch', (done) => {
        const leaves = [Buffer.from('leaf1'), Buffer.from('leaf2')];
        const row = { leaves };

        const result = dbHandler.compareMerkleTreeLeaves(leaves);
        setTimeout(() => {
            expect(result).toEqual([]);
            done();
        }, 0);
    });

    test('should return mismatched leaves when there is a mismatch', (done) => {
        const leaves = [Buffer.from('leaf1'), Buffer.from('leaf2')];
        const cachedLeaves = [Buffer.from('leaf3'), Buffer.from('leaf4')];
        const row = { leaves: cachedLeaves };

        mockDb.get.mockImplementation((_sql, _params, callback) => {
            return callback(null, row);
        });

        const result = dbHandler.compareMerkleTreeLeaves(leaves);
        setTimeout(() => {
            expect(result).toEqual([cachedLeaves]);
            done();
        }, 0);
    });
});

