type ProcessorType<TData, TResult> = (data: TData) => Promise<TResult>;
type GetProcessorDataType<TProcessor extends ProcessorType<any, any>> =
  TProcessor extends ProcessorType<infer TData, any> ? TData : never;
type GetProcessorReturnType<TProcessor extends ProcessorType<any, any>> =
  TProcessor extends ProcessorType<any, infer TReturn> ? TReturn : never;

type PromiseReturnType<
  TData,
  TPromiseType extends ParallelPromiseType,
> = TPromiseType extends ParallelPromiseType.ALL_SETTLED
  ? PromiseSettledResult<Awaited<TData>>[]
  : TPromiseType extends ParallelPromiseType.ALL
  ? TData[]
  : never;

type ParallelReturnType<
  TData,
  TReturnType,
  TPromiseType extends ParallelPromiseType,
> = (
  data: TData,
  parallel?: number,
) => Promise<PromiseReturnType<TReturnType, TPromiseType>>;

type PromiseMethod<TPromiseType extends ParallelPromiseType> =
  TPromiseType extends ParallelPromiseType.ALL
    ? typeof Promise['all']
    : TPromiseType extends ParallelPromiseType.ALL_SETTLED
    ? typeof Promise['allSettled']
    : never;

export enum ParallelPromiseType {
  ALL = 'all',
  ALL_SETTLED = 'allSettled',
}

const parallelPromise = <
  TProcessor extends ProcessorType<any, any>,
  TPromiseMethod extends ParallelPromiseType = ParallelPromiseType.ALL,
  TData = GetProcessorDataType<TProcessor>,
  TReturnType = GetProcessorReturnType<TProcessor>,
>(
  processor: TProcessor,
  promiseMethod: ParallelPromiseType = ParallelPromiseType.ALL,
): ParallelReturnType<TData[], TReturnType, TPromiseMethod> => {
  const processPromises = Promise[promiseMethod].bind(
    Promise,
  ) as PromiseMethod<TPromiseMethod>;

  return async (data, parallel = 10) => {
    // @ts-ignore
    let results: any[] = [];
    for (let i = 0, sz = data.length; i < sz; i += parallel) {
      results = [
        ...results,
        // @ts-ignore
        ...(await processPromises(
          data.slice(i, i + parallel).map((el) => processor(el)),
        )),
      ];
    }
    return results as PromiseReturnType<TReturnType, TPromiseMethod>;
  };
};

export default parallelPromise;
