export interface AuthState {
  isAuthenticated: boolean
  username: string | null
}

class AuthService {
  private static instance: AuthService
  private authState: AuthState = {
    isAuthenticated: false,
    username: null,
  }
  private listeners: ((state: AuthState) => void)[] = []

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  constructor() {
    // Check if user is already logged in
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_auth")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed.isAuthenticated && parsed.username) {
            this.authState = parsed
          }
        } catch (e) {
          localStorage.removeItem("admin_auth")
        }
      }
    }
  }

  login(username: string, password: string): boolean {
    // Predefined credentials
    if (username === "akvin" && password === "242005") {
      this.authState = {
        isAuthenticated: true,
        username: username,
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("admin_auth", JSON.stringify(this.authState))
      }

      this.notifyListeners()
      return true
    }
    return false
  }

  logout(): void {
    this.authState = {
      isAuthenticated: false,
      username: null,
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_auth")
    }

    this.notifyListeners()
  }

  getAuthState(): AuthState {
    return { ...this.authState }
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getAuthState()))
  }
}

export const authService = AuthService.getInstance()
