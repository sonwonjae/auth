// import type { RQParams, RQServerParams } from "./types";
import type { ResponseMap, RQParams, RQServerParams } from "./types";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ServerResponse } from "http";

import https from "https";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

export const apiAxios = axios.create({
  baseURL: process.env.HOST,
  timeout: 1000 * 60,
  withCredentials: true,
  httpsAgent: new https.Agent({
    rejectUnauthorized: process.env.NEXT_PUBLIC_MODE !== "dev",
  }),
});

class RQ<
  ReqURL extends keyof ResponseMap,
  TQueryFnData extends ResponseMap[ReqURL],
> {
  #method: "GET";

  url: ReqURL;
  axiosConfig?: AxiosRequestConfig;
  customQueryOptions?: UseQueryOptions<TQueryFnData, AxiosError>;

  constructor({
    url,
    axiosConfig,
    customQueryOptions,
  }: RQParams<TQueryFnData, ReqURL>) {
    this.#method = "GET";

    this.url = url;
    this.axiosConfig = axiosConfig;
    this.customQueryOptions = customQueryOptions;
  }

  get baseKey() {
    return [this.url, this.#method];
  }

  get queryKey() {
    return [
      ...this.baseKey,
      ...Object.values({ ...this.axiosConfig?.params }),
      ...Object.values({ ...this.axiosConfig?.data }),
    ] as const;
  }

  get queryFn() {
    return async () => {
      try {
        const { data } = await apiAxios(this.url, {
          method: this.#method,
          withCredentials: true,
          ...this.axiosConfig,
        });

        return data as TQueryFnData;
      } catch (error) {
        throw error as AxiosError;
      }
    };
  }

  get queryOptions() {
    return {
      ...this.customQueryOptions,
      queryKey: this.queryKey,
      queryFn: this.queryFn,
    };
  }
}

export class RQClient<
  ReqURL extends keyof ResponseMap,
  TQueryFnData extends ResponseMap[ReqURL],
> extends RQ<ReqURL, TQueryFnData> {
  constructor({
    url,
    axiosConfig,
    customQueryOptions,
  }: RQParams<TQueryFnData, ReqURL>) {
    super({ url, axiosConfig, customQueryOptions });
  }
}

export class RQServer<
  ReqURL extends keyof ResponseMap,
  TQueryFnData extends ResponseMap[ReqURL],
> extends RQ<ReqURL, TQueryFnData> {
  #method: "GET";
  res: ServerResponse;

  constructor({
    url,
    res,
    axiosConfig,
    customQueryOptions,
  }: RQServerParams<TQueryFnData, ReqURL>) {
    super({ url, axiosConfig, customQueryOptions });
    this.#method = "GET";
    this.res = res;
  }

  get queryFn() {
    return async () => {
      try {
        const { data, headers } = await apiAxios(this.url, {
          method: this.#method,
          withCredentials: true,
          ...this.axiosConfig,
        });
        const setCookieHeader = headers["set-cookie"];

        if (setCookieHeader) {
          this.res.setHeader("Set-Cookie", setCookieHeader);
        }

        return data as TQueryFnData;
      } catch (error) {
        throw error as AxiosError;
      }
    };
  }
}
