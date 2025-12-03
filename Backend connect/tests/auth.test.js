import { jest } from '@jest/globals';

// Mock dependences
jest.unstable_mockModule('argon2', () => ({
    default: {
        hash: jest.fn(),
        verify: jest.fn(),
        argon2id: 2,
    },
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
        sign: jest.fn(),
        verify: jest.fn(),
    },
}));

jest.unstable_mockModule('../src/models/Token.js', () => ({
    default: {
        create: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
    },
}));

jest.unstable_mockModule('../src/models/user.model.js', () => ({
    default: {
        findOne: jest.fn(),
        update: jest.fn(),
    },
}));

// Mock Sequelize Op
jest.unstable_mockModule('sequelize', () => ({
    Op: {
        or: Symbol('or'),
    },
}));

// Import modules 
const { hashPassword, generateToken, verifyPassword, checkToken } = await import('../src/middlewares/auth.js');
const { default: argon2 } = await import('argon2');
const { default: jwt } = await import('jsonwebtoken');
const { default: Token } = await import('../src/models/Token.js');
const { default: User } = await import('../src/models/user.model.js');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            cookies: {},
            headers: {},
            socket: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('hashPassword', () => {
        test('devrait hacher le mot de passe', async () => {
            req.body.password = 'password123';
            argon2.hash.mockResolvedValue('hashed_password');

            await hashPassword(req, res, next);

            expect(argon2.hash).toHaveBeenCalledWith('password123', expect.any(Object));
            expect(req.body.hashedPassword).toBe('hashed_password');
            expect(req.body.password).toBeUndefined();
            expect(next).toHaveBeenCalled();
        });

        test('devrait générer une erreur si le mot de passe est manquant', async () => {
            await hashPassword(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400, message: 'Mot de passe requis' }));
        });
    });

    describe('generateToken', () => {
        test('devrait générer un token', () => {
            const user = { id: 1, username: 'test' };
            jwt.sign.mockReturnValue('signed_token');

            const result = generateToken(user);

            expect(jwt.sign).toHaveBeenCalled();
            expect(result).toHaveProperty('token', 'signed_token');
            expect(result).toHaveProperty('jti');
        });
    });

    describe('verifyPassword', () => {
        test('devrait vérifier le mot de passe et associer utilisateur à la requête', async () => {
            req.body = { identifier: 'test@example.com', password: 'password123' };
            const user = {
                id: 1,
                email: 'test@example.com',
                password: 'hashed_password',
                is_verified: true,
                failed_attempts: 0,
                update: jest.fn(),
            };

            User.findOne.mockResolvedValue(user);
            argon2.verify.mockResolvedValue(true);
            jwt.sign.mockReturnValue('token');

            await verifyPassword(req, res, next);

            expect(User.findOne).toHaveBeenCalled();
            expect(argon2.verify).toHaveBeenCalledWith('hashed_password', 'password123');
            expect(req.user).toBe(user);
            expect(req.token).toBeDefined();
            expect(next).toHaveBeenCalled();
        });

        test('Devrait renvoyer une erreur 404 si utilisateur est introuvable', async () => {
            req.body = { identifier: 'unknown', password: 'pass' };
            User.findOne.mockResolvedValue(null);

            await verifyPassword(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
        });

        test('devrait renvoyer erreur 401 si mot passe incorrect', async () => {
            req.body = { identifier: 'test@example.com', password: 'wrong' };
            const user = {
                id: 1,
                password: 'hashed',
                is_verified: true,
                failed_attempts: 0,
                update: jest.fn(),
            };
            User.findOne.mockResolvedValue(user);
            argon2.verify.mockResolvedValue(false);

            await verifyPassword(req, res, next);

            expect(user.update).toHaveBeenCalled(); // Should increment failed attempts
            expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
        });
    });

    describe('checkToken', () => {
        test('devrait autoriser un token valide', async () => {
            req.cookies.auth_token = 'valid_token';
            req.headers['user-agent'] = 'device1';
            req.socket.remoteAddress = '127.0.0.1';

            jwt.verify.mockReturnValue({ jti: 'jti-123', sub: 1 });
            Token.findOne.mockResolvedValue({
                jti: 'jti-123',
                revoked: false,
                expiresAt: new Date(Date.now() + 10000),
                ip: '127.0.0.1',
                device: 'device1',
                update: jest.fn(),
            });

            await checkToken(req, res, next);

            expect(req.user).toBeDefined();
            expect(next).toHaveBeenCalled();
        });

        test('devrait renvoyer une erreur 499 si le token est manquant', async () => {
            await checkToken(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 499, message: 'Token manquant' }));
        });

        test('devrait renvoyer une erreur 499 si le token est revoked', async () => {
            req.cookies.auth_token = 'revoked_token';
            jwt.verify.mockReturnValue({ jti: 'jti-revoked' });
            Token.findOne.mockResolvedValue(null); // Not found or revoked check logic in code

            await checkToken(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 499, message: 'Token révoqué' }));
        });
        test('devrait renvoyer une erreur 498 si le token est expiré', async () => {
            req.cookies.auth_token = 'expired_token';
            jwt.verify.mockReturnValue({ jti: 'jti-expired' });
            Token.findOne.mockResolvedValue({
              jti: 'jti-expired',
              revoked: false,
              expiresAt: new Date(Date.now() - 1000), // Date dans le passé
            });
            await checkToken(req, res, next);
            expect(next).toHaveBeenCalledWith(
              expect.objectContaining({ status: 498, message: 'Token expiré' })
            );
          });
          
    });
});
