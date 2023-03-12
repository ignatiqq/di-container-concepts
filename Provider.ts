import { TokenType } from "./createToken"

type ValueProvider = {
    provide: TokenType,
    useValue: any,
    multi?: boolean,
}

// Class providers

type ClassProviderBase = {
    provide: TokenType,
    multi?: boolean;
}

type ClassCreator<Deps> = new (deps: Deps) => any;
type FactoryCreator<Deps> = (deps: Deps) => any;

type ClassProviderWithDeps<Deps> = ClassProviderBase & {
    useClass: ClassCreator<Deps>,
    deps: Deps
}

type ClassProviderWithoutDeps = ClassProviderBase & {
    useClass: new () => any;
}

// Factory providers

type FactoryProviderBase = {
    provide: TokenType,
    multi?: boolean;
}

type FactoryProviderWithDeps<Deps> = FactoryProviderBase & {
    useFactory: FactoryCreator<Deps>,
    deps: Deps
}

type FactoryCreatorWithoutDeps = FactoryProviderBase & {
    useFactory: () => any;
}

export type Provider<Deps = any> = 
    ValueProvider | 
    ClassProviderWithDeps<Deps> | 
    ClassProviderWithoutDeps |
    FactoryProviderWithDeps<Deps> |
    FactoryCreatorWithoutDeps

