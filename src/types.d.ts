declare module 'tailwind.macro';
declare module '@dhis2/ui-widgets';
declare module '@dhis2/d2-ui-app';
declare module 'd2';
declare module 'mobx-react-lite/batchingForReactDom';
declare module 'workerize-loader?inline!*' {
  type AnyFunction = (...args: any[]) => any;
  type Async<F extends AnyFunction> = (
    ...args: Parameters<F>
  ) => Promise<ReturnType<F>>;

  type Workerized<T> = Worker &
    { [K in keyof T]: T[K] extends AnyFunction ? Async<T[K]> : never };

  function createInstance<T>(): Workerized<T>;
  export = createInstance;
}
