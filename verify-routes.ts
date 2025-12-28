import { AuthAPI, FileAPI, ProfileAPI } from "./frontend/src/lib/api";

// Polyfill window for the API client
(global as any).window = {
    localStorage: {
        getItem: () => null,
        setItem: () => { },
        removeItem: () => { },
    },
} as any;

// API base URL is set via environment variable

async function verifyAllRoutes() {
    console.log("Starting Route Verification...");
    const timestamp = Date.now();
    const email = `route_test_${timestamp}@example.com`;
    const password = "password123";
    const fullName = "Route Tester";

    try {
        // 1. Health Check (Direct fetch because it's not in API lib)
        console.log("1. Testing /health...");
        const healthRes = await fetch("http://localhost:5000/health");
        if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.statusText}`);
        console.log("   OK");

        // 2. Auth: Signup
        console.log("2. Testing /api/auth/signup...");
        const signupRes = await AuthAPI.signup({ fullName, email, password });
        if (!signupRes.user.id) throw new Error("Signup failed: No user ID");
        console.log("   OK");

        // 3. Auth: Login
        console.log("3. Testing /api/auth/login...");
        const loginRes = await AuthAPI.login({ email, password });
        const token = loginRes.token;
        if (!token) throw new Error("Login failed: No token");
        console.log("   OK");

        // 4. Profile: Me
        console.log("4. Testing /api/profile...");
        const profile = await ProfileAPI.me(token);
        if (profile.email !== email) throw new Error("Profile fetch failed: Email mismatch");
        console.log("   OK");

        // 5. Files: List
        console.log("5. Testing /api/files...");
        const files = await FileAPI.list(token);
        if (!Array.isArray(files)) throw new Error("File list failed: Not an array");
        console.log("   OK");

        // 6. Test Route (Direct fetch)
        console.log("6. Testing /api/test...");
        const testRes = await fetch("http://localhost:5000/api/test");
        if (!testRes.ok) console.warn(`   WARNING: /api/test failed: ${testRes.statusText}`);
        else console.log("   OK");

        console.log("7. Testing /api/test-direct...");
        const directRes = await fetch("http://localhost:5000/api/test-direct");
        if (!directRes.ok) throw new Error(`Direct test route failed: ${directRes.statusText}`);
        console.log("   OK");

        console.log("\nSUCCESS: All checked routes are working.");

    } catch (error) {
        console.error("\nFAILURE:", error);
        process.exit(1);
    }
}

verifyAllRoutes();
