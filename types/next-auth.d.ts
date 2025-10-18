/**
 * NextAuth TypeScript Definitions
 * Extends default types with custom user properties
 */

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: {
        id: number;
        code: string;
        name: string;
        permissions: string;
      };
    };
  }

  interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: {
      id: number;
      code: string;
      name: string;
      permissions: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    fullName: string;
    role: {
      id: number;
      code: string;
      name: string;
      permissions: string;
    };
  }
}
