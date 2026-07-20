// Web shim for react-native-mmkv (no web support) backed by localStorage.
// metro.config.js redirects `react-native-mmkv` to this file on web. Implements
// only the subset the app uses: getString/getBoolean/set/delete/getAllKeys.
export class MMKV {
  private prefix: string;

  constructor(config?: {id?: string}) {
    this.prefix = config?.id ? `mmkv.${config.id}.` : 'mmkv.';
  }

  private key(k: string): string {
    return this.prefix + k;
  }

  set(key: string, value: string | number | boolean): void {
    localStorage.setItem(this.key(key), String(value));
  }

  getString(key: string): string | undefined {
    const v = localStorage.getItem(this.key(key));
    return v === null ? undefined : v;
  }

  getBoolean(key: string): boolean | undefined {
    const v = localStorage.getItem(this.key(key));
    return v === null ? undefined : v === 'true';
  }

  getNumber(key: string): number | undefined {
    const v = localStorage.getItem(this.key(key));
    return v === null ? undefined : Number(v);
  }

  contains(key: string): boolean {
    return localStorage.getItem(this.key(key)) !== null;
  }

  delete(key: string): void {
    localStorage.removeItem(this.key(key));
  }

  getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.prefix)) {
        keys.push(k.slice(this.prefix.length));
      }
    }
    return keys;
  }

  clearAll(): void {
    this.getAllKeys().forEach(k => this.delete(k));
  }
}
