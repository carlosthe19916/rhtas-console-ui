import ENV from "@app/env";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";

const defaultTimeout = 1000;

const mockPromise = <TQueryFnData>(data: TQueryFnData, timeout = defaultTimeout, success = true) => {
  return new Promise<TQueryFnData>((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve(data);
      } else {
        reject(new Error("Error"));
      }
    }, timeout);
  });
};

export const useMockableQuery = <TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
  params: UseQueryOptions<TQueryFnData, TError, TData>,
  mockData: TQueryFnData
) => {
  return useQuery<TQueryFnData, TError, TData>({
    ...params,
    queryFn: ENV.MOCK === "off" ? params.queryFn : () => mockPromise(mockData),
  });
};
