// src/lib/auth-storage.ts
class SecureAuthStorage {
  private static instance: SecureAuthStorage;
  
  static getInstance(): SecureAuthStorage {
    if (!SecureAuthStorage.instance) {
      SecureAuthStorage.instance = new SecureAuthStorage();
    }
    return SecureAuthStorage.instance;
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      if (!window.crypto?.subtle) {
        console.warn('Web Crypto API not available, using sessionStorage');
        sessionStorage.setItem('auth_tokens', JSON.stringify({ 
          accessToken, 
          refreshToken, 
          timestamp: Date.now() 
        }));
        return;
      }

      const key = await this.generateKey();
      const data = JSON.stringify({ 
        accessToken, 
        refreshToken, 
        timestamp: Date.now() 
      });
      
      const encrypted = await this.encryptData(data, key);
      const exportedKey = await this.exportKey(key);
      
      sessionStorage.setItem('auth_data', encrypted);
      sessionStorage.setItem('auth_key', exportedKey);
    } catch (error) {
      console.error('Failed to store tokens securely:', error);
      // Fallback to basic storage
      sessionStorage.setItem('auth_fallback', JSON.stringify({ 
        accessToken, 
        refreshToken,
        timestamp: Date.now()
      }));
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      // Try encrypted storage first
      if (window.crypto?.subtle) {
        const encryptedData = sessionStorage.getItem('auth_data');
        const keyData = sessionStorage.getItem('auth_key');
        
        if (encryptedData && keyData) {
          const key = await this.importKey(keyData);
          const decrypted = await this.decryptData(encryptedData, key);
          const { accessToken, timestamp } = JSON.parse(decrypted);
          
          // Check if token is too old (24 hours)
          if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
            this.clearTokens();
            return null;
          }
          
          return accessToken;
        }
      }

      // Fallback to basic storage
      const fallback = sessionStorage.getItem('auth_tokens') || sessionStorage.getItem('auth_fallback');
      if (fallback) {
        const { accessToken, timestamp } = JSON.parse(fallback);
        if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
          this.clearTokens();
          return null;
        }
        return accessToken;
      }

      return null;
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      if (window.crypto?.subtle) {
        const encryptedData = sessionStorage.getItem('auth_data');
        const keyData = sessionStorage.getItem('auth_key');
        
        if (encryptedData && keyData) {
          const key = await this.importKey(keyData);
          const decrypted = await this.decryptData(encryptedData, key);
          const { refreshToken } = JSON.parse(decrypted);
          return refreshToken;
        }
      }

      const fallback = sessionStorage.getItem('auth_tokens') || sessionStorage.getItem('auth_fallback');
      if (fallback) {
        const { refreshToken } = JSON.parse(fallback);
        return refreshToken;
      }

      return null;
    } catch {
      return null;
    }
  }

  clearTokens(): void {
    sessionStorage.removeItem('auth_data');
    sessionStorage.removeItem('auth_key');
    sessionStorage.removeItem('auth_tokens');
    sessionStorage.removeItem('auth_fallback');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('session_key');
  }

  setUser(user: any): void {
    try {
      const userData = { ...user, storedAt: Date.now() };
      sessionStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  getUser(): any | null {
    try {
      const userData = sessionStorage.getItem('user_data');
      if (!userData) return null;
      
      const parsed = JSON.parse(userData);
      
      // Check if user data is too old (24 hours)
      if (Date.now() - parsed.storedAt > 24 * 60 * 60 * 1000) {
        this.clearTokens();
        return null;
      }
      
      return parsed;
    } catch {
      return null;
    }
  }

  // Web Crypto API methods
  private async generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private async encryptData(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataBuffer
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  private async decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
    const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  private async exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  private async importKey(keyData: string): Promise<CryptoKey> {
    const keyBuffer = new Uint8Array(atob(keyData).split('').map(c => c.charCodeAt(0)));
    return await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      'AES-GCM',
      true,
      ['encrypt', 'decrypt']
    );
  }
}

export const authStorage = SecureAuthStorage.getInstance();

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept();
}