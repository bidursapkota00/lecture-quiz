// Simple auth utility for demo purposes
// Using hardcoded credentials until proper auth is set up

const DEMO_USER = {
  email: "bidursapkota00@gmail.com",
  password: "demo123", // Temporary password for demo
};

export function checkAuth(email: string, password: string): boolean {
  return email === DEMO_USER.email && password === DEMO_USER.password;
}

export function getUserEmail(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userEmail");
  }
  return null;
}

export function setUserEmail(email: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("userEmail", email);
  }
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userEmail");
  }
}

export function isAuthenticated(): boolean {
  return getUserEmail() !== null;
}
