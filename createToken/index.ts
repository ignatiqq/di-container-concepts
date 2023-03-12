interface TokenOptions {
    multi?: boolean;
}

export interface TokenType {
    name: symbol;
    options?: TokenOptions;
    toString(): string;
}

class TokenService implements TokenType {
    name: symbol;
    options?: TokenOptions;

    constructor(name: string, options = {}) {
        this.name = Symbol.for(name);
        this.options = options;
    }

    toString(): string {
        return this.name.toString().replace(/^Symbol\((.+)\)$/, '$1');
    }
}

export function createToken(name: string, options?: any) {
    return new TokenService(name, options);
}