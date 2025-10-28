const Database = require("../../models/db");
const dotenv = require("dotenv")

describe('create database instance', () => {
    beforeEach(() => {
        jest.resetModules(); // clear cached modules
        process.env = {}; // clear cached variables
        dotenv.config({ quiet: true });
      });


    it('should return connection object', async () => {
        const d = new Database(true)
        await d.connect()
        expect(d.connection).not.toBeNull()
        await d.close()
    });

    it('should not throw error when closing invalid connection', async () => {
        const d = new Database(true)
        await expect(d.close()).resolves.toBeUndefined()
    });

    it('should resolve when closing a connection', async () => {
        const d = new Database(true)
        await d.connect()
        await expect(d.close()).resolves.toBeUndefined()
    });

    it('should throw error on connection error', async () => {
        process.env.DB_PASS = 'invalid password';
        const db = new Database(true);
      
        await expect(db.connect()).rejects.toThrow(/ER_ACCESS_DENIED_ERROR/);
      });
});

  