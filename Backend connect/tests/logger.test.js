import logger, { asyncLocalStorage } from '../src/utils/logger.js';
import winston from 'winston';

class TestTransport extends winston.Transport {
    constructor(opts) {
        super(opts);
        this.logs = [];
    }

    log(info, callback) {
        this.logs.push(info);
        callback();
    }
}

describe('Fichier parametre logger', () => {
    let testTransport;

    beforeEach(() => {
        testTransport = new TestTransport();
        logger.add(testTransport);
    });

    afterEach(() => {
        logger.remove(testTransport);
    });

    test('devrait masquer l adresse mail dans les log', () => {
        const email = 'test.user@example.com';
        const message = `User ${email} logged in`;

        logger.info(message);

        // Wait for the log to be processed (winston is async)
        return new Promise((resolve) => {
            setImmediate(() => {
                const loggedInfo = testTransport.logs[0];
                expect(loggedInfo).toBeDefined();
                expect(loggedInfo.message).toContain('t***@example.com');
                expect(loggedInfo.message).not.toContain(email);
                resolve();
            });
        });
    });

    test('devrait masquer l adresse mail dans les metadatas', () => {
        const email = 'sensitive@data.com';

        logger.info('User action', { userEmail: email });

        return new Promise((resolve) => {
            setImmediate(() => {
                const loggedInfo = testTransport.logs[0];
                expect(loggedInfo).toBeDefined();
                expect(loggedInfo.userEmail).toBe('s***@data.com');
                resolve();
            });
        });
    });

    test('devrait masquer JTI dans les metadatas', () => {
        logger.info('Token check', { jti: 'some-jwt-id' });

        return new Promise((resolve) => {
            setImmediate(() => {
                const loggedInfo = testTransport.logs[0];
                expect(loggedInfo).toBeDefined();
                expect(loggedInfo.jti).toBe('***MASKED***');
                resolve();
            });
        });
    });

    test('devrait inclure traceId de asyncLocalStorage', () => {
        const traceId = 'test-trace-123';
        const store = new Map();
        store.set('traceId', traceId);

        asyncLocalStorage.run(store, () => {
            logger.info('Request avec trace');

            // Nous devons vérifier à l'intérieur de la fonction de rappel d'exécution ou attendre
            // Comme Winston est asynchrone, il faudra peut-être attendre un peu.
        });

        return new Promise((resolve) => {
            setImmediate(() => {
                // Le journal aurait dû se produire
                const loggedInfo = testTransport.logs[0];
                expect(loggedInfo).toBeDefined();
                expect(loggedInfo.traceId).toBe(traceId);
                resolve();
            });
        });
    });

    test('devrait utiliser l identifiant de trace par défaut en dehors de asyncLocalStorage', () => {
        logger.info('Request sans trace');

        return new Promise((resolve) => {
            setImmediate(() => {
                const loggedInfo = testTransport.logs[0];
                expect(loggedInfo).toBeDefined();
                expect(loggedInfo.traceId).toBe('no-trace');
                resolve();
            });
        });
    });
});
