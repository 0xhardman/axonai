
export function setLocalStorage<T>(key: string, data: T) {
  let strData;
  switch (typeof data) {
    case "object": strData = JSON.stringify(data); break;
    case "boolean": strData = data ? "true" : "false"; break;
    default: strData = (data as any).toString(); break;
  }
  window?.localStorage?.setItem(key, strData);
  return data as T
}
export function getLocalStorage<T = string>(key: string, type?: any): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const data = window?.localStorage?.getItem(key);
  if (data === null) return null;
  switch (type) {
    case Object: return JSON.parse(data as string) as T;
    case Number: return Number(data) as T;
    case Boolean: return (data && data != "false") as T;
    default: return data as T;
  }
}
export function getOrSetLocalStorage<T>(key: string, data: T | (() => T)) {
  const res = getLocalStorage<T>(key);
  return res !== null ? res :
    setLocalStorage<T>(key, data instanceof Function ? data() : data)
}

export function removeLocalStorage(key: string) {
  if (typeof window === 'undefined') {
    return null;
  }
  window?.localStorage?.removeItem(key);
}
