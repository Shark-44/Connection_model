import logger, { asyncLocalStorage } from './src/utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

console.log("Starting Logger Verification...");

// Simulation d'une requête 1
const traceId1 = uuidv4();
const store1 = new Map();
store1.set("traceId", traceId1);

asyncLocalStorage.run(store1, () => {
    logger.info("Log from Request 1");
    const currentStore = asyncLocalStorage.getStore();
    console.log(`Request 1 - Expected: ${traceId1}, Actual: ${currentStore?.get("traceId")}`);
});

// Simulation d'une requête 2
const traceId2 = uuidv4();
const store2 = new Map();
store2.set("traceId", traceId2);

asyncLocalStorage.run(store2, () => {
    logger.info("Log from Request 2");
    const currentStore = asyncLocalStorage.getStore();
    console.log(`Request 2 - Expected: ${traceId2}, Actual: ${currentStore?.get("traceId")}`);
});

// Simulation d'une requête 3 (Test GDPR)
const traceId3 = uuidv4();
const store3 = new Map();
store3.set("traceId", traceId3);

asyncLocalStorage.run(store3, () => {
    const email = "john.doe@example.com";
    logger.info(`User login attempt: ${email}`);
    console.log(`Request 3 - Logged email: ${email}. Check logs to ensure it is masked as j***@example.com`);
    logger.info({ message: "User data", userEmail: "jane.doe@test.com" });
    console.log(`Request 3 - Logged object with email. Check logs to ensure userEmail is masked.`);

    // Test JTI masking
    logger.info({ message: "Token info", jti: "1234567890-abcdef-jti" });
    console.log(`Request 3 - Logged object with jti. Check logs to ensure jti is masked.`);
});

console.log("Verification Complete. Check logs/ folder for output.");
