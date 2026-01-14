declare module 'pg' {
  export class Pool {
    constructor(config?: any);
    connect?: (...args: any[]) => any;
    end?: (...args: any[]) => any;
    query?: (...args: any[]) => any;
  }
}
