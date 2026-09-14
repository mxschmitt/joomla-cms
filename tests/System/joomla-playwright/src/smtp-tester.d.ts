declare module 'smtp-tester' {
  interface SmtpServer {
    bind(handler: (addr: unknown, id: unknown, email: unknown) => void): void;
    module(name: string): void;
  }
  const mailTester: {
    init(port: number): SmtpServer;
  };
  export default mailTester;
}

declare module 'pg' {
  export class Pool {
    constructor(config: Record<string, unknown>);
    query(sql: string): Promise<{ rows: Array<Record<string, any>> }>;
  }
  const pg: { Pool: typeof Pool };
  export default pg;
}
