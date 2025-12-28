import { AuthAPI } from "./frontend/src/lib/api";
// Mock browser globals for the API client
(global as any).window = {
    localStorage: {
        getItem: () => null,
        setItem: () => { },
        removeItem: () => { },
    },
} as any;

// Override API base URL for node environment
process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:5000/api";

async function verifyAuth() {
    const timestamp = Date.now();
    const email = `test_${timestamp}@example.com`;
    const password = "password123";
    const fullName = "Test User";

    console.log(`1. Signing up user: ${email}`);
    try {
        const signupRes = await AuthAPI.signup({ fullName, email, password });
        console.log("   Signup successful. User ID:", signupRes.user.id);

        console.log("2. Logging in with same credentials...");
        const loginRes = await AuthAPI.login({ email, password });
        console.log("   Login successful. Token received.");

        if (signupRes.user.id === loginRes.user.id) {
            console.log("   SUCCESS: User ID matches.");
        } else {
            console.error("   FAILURE: User ID mismatch.");
            process.exit(1);
        }

    } catch (error) {
        console.error("   FAILURE:", error);
        process.exit(1);
    }
}

verifyAuth();
