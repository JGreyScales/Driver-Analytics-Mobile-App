const Database = require("../../models/db");
const dotenv = require("dotenv");

describe('create database instance', () => {
    beforeEach(() => {
        jest.resetModules(); // clear cached modules
        process.env = {}; // clear cached variables
        dotenv.config({ quiet: true });
    });

    afterAll(() => {
        process.env = {}; // clear cached variables
        dotenv.config({ quiet: true });
    })

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

    it('should reject when closing an already closed connection', async () => {
        const d = new Database(true)
        await d.connect()
        await d.close()
        await expect(d.close()).rejects.toBeDefined()
    })

    it('should throw error on connection error', async () => {
        process.env.DB_PASS = 'invalid password';
        const d = new Database(true);
      
        await expect(d.connect()).rejects.toThrow(/ER_ACCESS_DENIED_ERROR/);
      });
});

describe('writing to table', () => {
    let d = null

    beforeAll(async () => {
        d = new Database(true)
        await d.connect()
    })

    beforeEach(async () => {
        await d.dropSafety();
        const query = `TRUNCATE  TABLE ${d.defaultTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();
    })

    afterAll(async () => {
        await d.dropSafety();
        const query = `TRUNCATE  TABLE ${d.defaultTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();
        await d.close();
    })

    it('should allow me to submit a query', async () => {
        const query = `INSERT INTO ${d.defaultTable} (username, email, passwordHash) VALUES (?, ?, ?)`
        const params = ['testUsername', 'testEmail', 'testPassword']
        await expect(d.submitQuery(query, params)).resolves.toBeDefined()
    })

    it('should reject bad queries from submission', async () => {
        const query = `INSERT INTO notATable (username, email, passwordHash) VALUES (?, ?, ?)`
        const params = ['testUsername', 'testEmail', 'testPassword']
        await expect(d.submitQuery(query, params)).rejects.toBeDefined() // unwrap rejection & ensure it exists
    })

    it('should reject if no rows were updated', async () => {
        const invalidUserUpdateQuery = `UPDATE  ${d.defaultTable} set userID = 24 WHERE userID = 20`
        const invalidUserUpdateParams = []

        await expect(d.submitQuery(invalidUserUpdateQuery, invalidUserUpdateParams)).rejects.toBeDefined()
    })
})

describe('reading from table', () => {
    let d = null

    beforeAll(async () => {
        d = new Database(true);
        await d.connect();
        await d.dropSafety();
        const query = `TRUNCATE  TABLE ${d.defaultTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();

        const userQuery = `INSERT INTO ${d.defaultTable} (username, email, passwordHash) VALUES (?, ?, ?)`
        const user1Params = ['testUsername', 'testEmail', 'testPassword']
        const user2Params = ['testUsernamex', 'testEmailx', 'testPasswordx']

        await d.submitQuery(userQuery, user1Params);
        await d.submitQuery(userQuery, user2Params);
    })

    afterAll(async () => {
        await d.dropSafety();
        const query = `TRUNCATE  TABLE ${d.defaultTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();
        await d.close();
    })
    
    it('should allow me to fetch objects', async () => {
        query = `SELECT * FROM ${d.defaultTable} WHERE userID = 1`
        const results = await d.fetchQuery(query, []);

        expect(results[0]).toBeDefined();
        expect(results[0]).toMatchObject({
            userID: 1,
            username: 'testUsername',
            email: 'testEmail',
            passwordHash: 'testPassword',
            score: null
        });
    })

    it('should allow me to fetch multiple objects', async () => {
        query = `SELECT * FROM ${d.defaultTable} WHERE userID BETWEEN 1 AND 2`
        const results = await d.fetchQuery(query, []);

        expect(results[0]).toBeDefined();
        expect(results[0]).toMatchObject({
            userID: 1,
            username: 'testUsername',
            email: 'testEmail',
            passwordHash: 'testPassword',
            score: null
        });

        expect(results[1]).toBeDefined();
        expect(results[1]).toMatchObject({
            userID: 2,
            username: 'testUsernamex',
            email: 'testEmailx',
            passwordHash: 'testPasswordx',
            score: null
        });
    })

    it('should reject bad queries from fetching', async () => {
        query = `SELECxT * FROM ${d.defaultTable} WHERE userID = 1`
        await expect(d.fetchQuery(query, [])).rejects.toBeDefined()
    })

    it('should reject if no objects are found', async () => {
        query = `SELECT * FROM ${d.defaultTable} WHERE userID = -1`
        await expect(d.fetchQuery(query, [])).rejects.toBeDefined()
    })
})

describe('handling safety', () => {
    let d = null

    beforeEach(async () => {
        d = new Database(true)
        await d.connect()
    })

    it('should be able to raise the safety', async () => {
        await d.dropSafety() // default safety state is raised

        await d.raiseSafety()
        const results = await d.fetchQuery('SELECT @@SQL_SAFE_UPDATES;', [])
        expect(results[0]['@@SQL_SAFE_UPDATES']).toBe(1)
        await d.close()
    })

    it('should be able to lower the safety', async () => {
        await d.dropSafety()
        const results = await d.fetchQuery('SELECT @@SQL_SAFE_UPDATES;', [])
        expect(results[0]['@@SQL_SAFE_UPDATES']).toBe(0)
        await d.close()
    })

    it('should reject on drop with no connection', async () => {
        await d.close()
        await expect(d.dropSafety).rejects.toBeDefined()
    })

    it('should reject on raise with no connection', async () => {
        await d.close()
        await expect(d.raiseSafety).rejects.toBeDefined()
    })
})