import Node from '../userNode';
import DBHandler from '../dbHandler';
import { MerkleTree } from 'merkletreejs';
import SHA256 from 'crypto-js/sha256';

jest.mock('../dbHandler');

describe('Node', () => {
    let node: Node;
    let mockDBHandler: jest.Mocked<DBHandler>;

    beforeEach(() => {
        mockDBHandler = new DBHandler() as jest.Mocked<DBHandler>;
        node = new Node(8001);
        node.dbHandler = mockDBHandler;
    });

    test('should add a post and update the Merkle tree', async () => {
        const title = 'Test Title';
        const body = 'Test Body';
        const root = node.tree.getRoot().toString('hex');

        node.post(title, body);

        const newRoot = node.tree.getRoot().toString('hex');

        const postHash = SHA256(title + body).toString();
        const postProof = node.tree.getProof(postHash);

        expect(mockDBHandler.addPost).toHaveBeenCalledWith(title, body);
        expect(newRoot).not.toBe(root);
        expect(node.tree.verify(postProof, postHash, root))
    });

    test('should not verify an invalid post proof', async () => {

        const title = 'Test Title';
        const body = 'Test Body';
        const root = node.tree.getRoot().toString('hex');

        node.post(title, body);

        const newRoot = node.tree.getRoot().toString('hex');

        const invalidPostHash = SHA256('Invalid Title' + 'Invalid Body').toString();
        const invalidPostProof = node.tree.getProof(invalidPostHash);

        expect(mockDBHandler.addPost).toHaveBeenCalledWith(title, body);
        expect(newRoot).not.toBe(root);
        expect(node.tree.verify(invalidPostProof, invalidPostHash, root)).toBeFalsy();
    });

    test('should detect a mismatched root hash but validate if leaves are valid', async () => {

        const title = 'Test Title';
        const body = 'Test Body';
        const root = node.tree.getRoot().toString('hex');

        node.post(title, body);

        const newRoot = node.tree.getRoot().toString('hex');

        const postHash = SHA256(title + body).toString();
        const postProof = node.tree.getProof(postHash);

        (node.dbHandler.compareMerkleTreeLeaves as jest.Mock).mockReturnValueOnce([]);

        expect(mockDBHandler.addPost).toHaveBeenCalledWith(title, body);
        expect(newRoot).not.toBe(root);
        expect(node.tree.verify(postProof, postHash, root));

        expect(node.validateMerkleTree(root)).toBeTruthy();
    });

    test('should detect a mismatched root hash and invalid leaves', async () => {

        const title = 'Test Title';
        const body = 'Test Body';
        const root = node.tree.getRoot().toString('hex');

        node.post(title, body);

        const newRoot = node.tree.getRoot().toString('hex');

        const postHash = SHA256(title + body).toString();
        const postProof = node.tree.getProof(postHash);

        (node.dbHandler.compareMerkleTreeLeaves as jest.Mock).mockReturnValueOnce([Buffer.from('Invalid Leaf')]);

        expect(mockDBHandler.addPost).toHaveBeenCalledWith(title, body);
        expect(newRoot).not.toBe(root);
        expect(node.tree.verify(postProof, postHash, root));

        expect(node.validateMerkleTree(root)).toBeFalsy();
    });
});