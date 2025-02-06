import { del, get, Itf, post, put } from "./api";
import JWT from "jsonwebtoken";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "./storage";

export interface JwtPayload {
  [key: string]: any;
  iss?: string | undefined;
  sub?: string | undefined;
  aud?: string | string[] | undefined;
  exp?: number | undefined;
  nbf?: number | undefined;
  iat?: number | undefined;
  jti?: string | undefined;
}

export interface Payload extends JwtPayload { }

const TokenKey = "token";
export type TokenType = typeof DefaultTokenType;
export const DefaultTokenType = "login";
export const AuthorizationKey = "Authorization";

export function authGet<I = any, O = any>(
  host: string,
  url: string,
  type: TokenType = DefaultTokenType
): Itf<I, O> {
  return (d, h) =>
    get<I, O>(host, url)(d, {
      [AuthorizationKey]: `${useToken(type)}`,
      ...h,
    });
}
export function authPost<I = any, O = any>(
  host: string,
  url: string,
  type: TokenType = DefaultTokenType
): Itf<I, O> {
  return (d, h) =>
    post<I, O>(host, url)(d, {
      [AuthorizationKey]: `${useToken(type)}`,
      ...h,
    });
}
export function authPut<I = any, O = any>(
  url: string,
  type: TokenType = DefaultTokenType
): Itf<I, O> {
  return (d, h) =>
    put<I, O>(url)(d, {
      [AuthorizationKey]: `${useToken(type)}`,
      ...h,
    });
}
export function authDel<I = any, O = any>(
  url: string,
  type: TokenType = DefaultTokenType
): Itf<I, O> {
  return (d, h) =>
    del<I, O>(url)(d, {
      [AuthorizationKey]: `${useToken(type)}`,
      ...h,
    });
}

class Token {
  public value!: string;
  public data!: Payload;

  public isValid() {
    return (
      (!this.isOutOfDate() && this.data.count == null) ||
      this.data.count == -1 ||
      this.data.count > 0
    );
  }

  public isOutOfDate() {
    const now = Date.now();
    return now >= (this.data.exp ?? 0) * 1000;
  }

  public static create(token: string | Token) {
    if (token instanceof Token) return token;
    const res = new Token();
    res.value = token;
    res.data = JWT.decode(token) as Payload;
    return res;
  }

  public static invalid() {
    const res = new Token();
    res.value = "";
    return res;
  }
}

const JWTKey = "1234567";
const JWTExpireTime = 60 * 60 * 24 * 3;

const _tokens: { [K in TokenType]?: Token } = {}; // Token.invalid();

// region Token

export function loadToken(type: TokenType = DefaultTokenType) {
  const token = getTokenFromCache(type);
  token && setupToken(token);
  return _tokens[type];
}

export function getToken(type: TokenType = DefaultTokenType) {
  const res = _tokens[type] || loadToken(type);
  if (!res?.isValid()) removeToken(type);
  return res;
}

function getTokenFromCache(type: TokenType = DefaultTokenType) {
  const tokenStr = getLocalStorage(`${TokenKey}-${type}`);
  return tokenStr && Token.create(tokenStr);
}

export function getTokenValue(type: TokenType = DefaultTokenType) {
  return getToken(type)?.value;
}

export function getPayload(type: TokenType = DefaultTokenType) {
  return getToken(type)?.data;
}
export function useToken(type: TokenType = DefaultTokenType) {
  const token = getToken(type);
  if (token?.data && token?.data.count > 0) token.data.count--;
  return token?.value;
}

export function setupToken(
  token: string | Token,
  type: TokenType = DefaultTokenType,
  save = true
) {
  token = Token.create(token);
  if (!token.isValid()) return;

  if (save) console.log("setupToken", token, type);

  _tokens[type] = token;

  // 有次数限制就不保存
  save = save && (token.data.count == -1 || token.data.count == undefined);
  if (save) setLocalStorage(`${TokenKey}-${type}`, token.value);
}

export function removeToken(type: TokenType = DefaultTokenType) {
  delete _tokens[type];
  removeLocalStorage(`${TokenKey}-${type}`);
}

export function clearToken() {
  Object.keys(_tokens).forEach((type: string) =>
    removeToken(type as TokenType)
  );

  // for (const type of Object.keys(_tokens)) {
  //   delete _tokens[type];
  //   removeLocalStorage(`${TokenKey}-${type}`);
  // }
}

// endregion

// JWT

export function generateKey(payload: Payload) {
  return JWT.sign(payload, JWTKey, { expiresIn: JWTExpireTime });
}

export function verifyKey(key: any) {
  let res: {
    success: boolean;
    errMsg?: string;
    payload?: Payload;
  };
  JWT.verify(key, JWTKey, (err: any, decoded: any) => {
    res = err
      ? { success: false, errMsg: err.message }
      : { success: true, payload: decoded };
    if (!err) {
      if ("iat" in decoded) delete decoded.iat;
      if ("exp" in decoded) delete decoded.exp;
    }
    return res;
  });
}

// endregion
