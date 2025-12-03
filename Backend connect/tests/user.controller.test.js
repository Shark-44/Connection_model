import { jest } from '@jest/globals';

// mock les dependances 
jest.unstable_mockModule('../src/models/user.model.js', () => ({
    default: {
        findOne: jest.fn(),
        create: jest.fn(),
    },
}));

jest.unstable_mockModule('../src/models/role.model.js', () => ({
    default: {
        findAll: jest.fn(),
    },
}));

jest.unstable_mockModule('../src/models/Token.js', () => ({
    default: {
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.unstable_mockModule('../src/services/mailer.service.js', () => ({
    sendVerificationEmail: jest.fn(),
}));

jest.unstable_mockModule('../src/controllers/consent.controller.js', () => ({
    setConsent: jest.fn(),
}));

jest.unstable_mockModule('../src/utils/logger.js', () => ({
    default: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
        verify: jest.fn(),
    },
}));

jest.unstable_mockModule('../src/middlewares/auth.js', () => ({
    generateToken: jest.fn(),
}));

jest.unstable_mockModule('../src/utils/generateOTP.js', () => ({
    default: jest.fn(() => '123456'),
}));

// Importez les modules mocked
const { createuser, login, logout } = await import('../src/controllers/user.controller.js');
const { default: User } = await import('../src/models/user.model.js');
const { default: Role } = await import('../src/models/role.model.js');
const { default: Token } = await import('../src/models/Token.js');
const { sendVerificationEmail } = await import('../src/services/mailer.service.js');
const { setConsent } = await import('../src/controllers/consent.controller.js');
const { default: logger } = await import('../src/utils/logger.js');
const { default: jwt } = await import('jsonwebtoken');
const { generateToken } = await import('../src/middlewares/auth.js');

describe('User Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            headers: {},
            cookies: {},
            socket: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('createuser', () => {
        test('devrait créer un nouvel utilisateur avec succès', async () => {
            req.body = {
                username: 'testuser',
                email: 'test@example.com',
                hashedPassword: 'hashedpassword',
                roles: ['user'],
            };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                setRoles: jest.fn(),
            });
            Role.findAll.mockResolvedValue([{ id: 1, name: 'user' }]);

            await createuser(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(User.create).toHaveBeenCalled();
            expect(sendVerificationEmail).toHaveBeenCalledWith('test@example.com', '123456');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Utilisateur créé. Code de vérification envoyé par email.',
            }));
        });

        test('devrait renvoyer 400 si des champs sont manquants', async () => {
            req.body = { username: 'test' }; // Missing email and password

            await createuser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
        });

        test('devrait renvoyer une erreur 409 si l adresse e-mail existe déjà', async () => {
            req.body = {
                username: 'testuser',
                email: 'existing@example.com',
                hashedPassword: 'password',
            };

            User.findOne.mockResolvedValue({ id: 1 });

            await createuser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 409 }));
        });
    });

    describe('login', () => {
        test('devrait connecter l utilisateur avec succès', async () => {
            req.user = { id: 1, email: 'test@example.com', username: 'testuser' };
            req.body = { cookieConsent: true };

            generateToken.mockReturnValue({ token: 'access-token', jti: 'jti-123' });
            Token.create.mockResolvedValue({});

            await login(req, res, next);

            expect(setConsent).toHaveBeenCalledWith(1, true, null);
            expect(Token.create).toHaveBeenCalled();
            expect(res.cookie).toHaveBeenCalledWith('auth_token', 'access-token', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Connexion réussie',
            }));
        });
    });

    describe('logout', () => {
        test('devrait se déconnecter avec succès', async () => {
            req.cookies.auth_token = 'valid-token';
            jwt.verify.mockReturnValue({ jti: 'jti-123' });
            Token.update.mockResolvedValue([1]);

            await logout(req, res, next);

            expect(Token.update).toHaveBeenCalledWith(
                { revoked: true },
                { where: { jti: 'jti-123', revoked: false } }
            );
            expect(res.clearCookie).toHaveBeenCalledWith('auth_token', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('devrait gérer les utilisateurs déjà déconnectés', async () => {
            req.cookies.auth_token = null;

            await logout(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Déjà déconnecté' });
        });
    });
});
