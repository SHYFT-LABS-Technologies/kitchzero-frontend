class SecureAuthStorage {
  private static instance: SecureAuthStorage;
  
  static getInstance(): SecureAuthStorage {
    if (!SecureAuthStorage.instance) {
      SecureAuthStorage.instance = new SecureAuthStorage();
    }
    return SecureAuthStorage.instance;
  }

  // Use sessionStorage with encryption for sensitive data
  setTokens(accessToken: string, refreshToken: string): void {
    try {
      // In production, these should be httpOnly cookies set by backend
      const encrypted = this.encrypt(JSON.stringify({ accessToken, refreshToken }));
      sessionStorage.setItem('auth_data', encrypted);
    } catch (error) {
      console.error('Failed to store tokens securely');
    }
  }

  getAccessToken(): string | null {
    try {
      const encrypted = sessionStorage.getItem('auth_data');
      if (!encrypted) return null;
      
      const decrypted = this.decrypt(encrypted);
      const { accessToken } = JSON.parse(decrypted);
      return accessToken;
    } catch {
      return null;
    }
  }

  getRefreshToken(): string | null {
    try {
      const encrypted = sessionStorage.getItem('auth_data');
      if (!encrypted) return null;
      
      const decrypted = this.decrypt(encrypted);
      const { refreshToken } = JSON.parse(decrypted);
      return refreshToken;
    } catch {
      return null;
    }
  }

  clearTokens(): void {
    sessionStorage.removeItem('auth_data');
    sessionStorage.removeItem('user_data');
  }

  setUser(user: any): void {
    try {
      const encrypted = this.encrypt(JSON.stringify(user));
      sessionStorage.setItem('user_data', encrypted);
    } catch (error) {
      console.error('Failed to store user data securely');
    }
  }

  getUser(): any | null {
    try {
      const encrypted = sessionStorage.getItem('user_data');
      if (!encrypted) return null;
      
      const decrypted = this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  private encrypt(text: string): string {
    // Simple XOR encryption (in production, use proper encryption)
    const key = this.getEncryptionKey();
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  }

  private decrypt(encryptedText: string): string {
    const key = this.getEncryptionKey();
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  private getEncryptionKey(): string {
    // Generate a session-specific key (in production, use proper key management)
    const sessionKey = sessionStorage.getItem('session_key');
    if (sessionKey) return sessionKey;
    
    const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('session_key', newKey);
    return newKey;
  }
}

export const authStorage = SecureAuthStorage.getInstance();