export interface ApiTransformer {
  (data: any, headers?: any): any;
}

export interface ApiAdapter {
  (config: ApiRequestConfig): ApiPromise<any>;
}

export interface ApiBasicCredentials {
  username: string;
  password: string;
}

export interface ApiProxyConfig {
  host: string;
  port: number;
  auth?: {
    username: string;
    password:string;
  }
}

export interface ApiRequestConfig {
  url?: string;
  method?: string;
  baseURL?: string;
  transformRequest?: ApiTransformer | ApiTransformer[];
  transformResponse?: ApiTransformer | ApiTransformer[];
  headers?: any;
  params?: any;
  paramsSerializer?: (params: any) => string;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  adapter?: ApiAdapter;
  auth?: ApiBasicCredentials;
  responseType?: string;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  maxContentLength?: number;
  validateStatus?: (status: number) => boolean;
  maxRedirects?: number;
  httpAgent?: any;
  httpsAgent?: any;
  proxy?: ApiProxyConfig | false;
  cancelToken?: CancelToken;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
}

export interface ApiProxyError extends Error {
  config: ApiRequestConfig;
  code?: string;
  request?: any;
  response?: ApiResponse;
}

export interface ApiPromise<T = any> extends Promise<ApiResponse<T>> {
}

export interface CancelStatic {
  new (message?: string): Cancel;
}

export interface Cancel {
  message: string;
}

export interface Canceler {
  (message?: string): void;
}

export interface CancelTokenStatic {
  new (executor: (cancel: Canceler) => void): CancelToken;
  source(): CancelTokenSource;
}

export interface CancelToken {
  promise: Promise<Cancel>;
  reason?: Cancel;
  throwIfRequested(): void;
}

export interface CancelTokenSource {
  token: CancelToken;
  cancel: Canceler;
}

export interface ApiInterceptorManager<V> {
  use(onFulfilled?: (value: V) => V | Promise<V>, onRejected?: (error: any) => any): number;
  eject(id: number): void;
}

export interface ApiInstance {
  defaults: ApiRequestConfig;
  get<T = any>(url: string, config?: ApiRequestConfig): ApiPromise<T>;
  delete(url: string, config?: ApiRequestConfig): ApiPromise;
  post<T = any>(url: string, data?: any, config?: ApiRequestConfig): ApiPromise<T>;
  put<T = any>(url: string, data?: any, config?: ApiRequestConfig): ApiPromise<T>;
}

export interface ApiStatic extends ApiInstance {
  create(config?: ApiRequestConfig): ApiInstance;
  Cancel: CancelStatic;
  CancelToken: CancelTokenStatic;
  isCancel(value: any): boolean;
  all<T>(values: (T | Promise<T>)[]): Promise<T[]>;
  spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R;
}
