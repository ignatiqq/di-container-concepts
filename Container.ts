import { TokenType } from "./createToken";
import { Provider } from "./provider";

type FactoryFnType<T> = (deps?: any) => T;
type ResolvedDepsType = Record<string, TokenType> | null;

type RecordProvider<T> = {
    factory: FactoryFnType<T> | null;
    resolvedDeps: ResolvedDepsType;
    multi: any[] | false;
}

/**
 * providerToRecord функция которая маппит значения провайдера в нужные нам
 * Provider => {factory, resolveDeps, multi}
 * @param provider
 * @returns 
 */
function providerToRecord<T>(provider: Provider): RecordProvider<T> {
    let factory: FactoryFnType<T> | null = null;
    let deps: Record<string, TokenType> | null = null;

    if('useFactory' in provider) {
        factory = (deps: any) => provider.useFactory(deps);
        if('deps' in provider) {
            deps = provider.deps
        }
    } else if('useClass' in provider) {
        factory = (deps: any) => new provider.useClass(deps);
        if('deps' in provider) {
            deps = provider.deps
        }
    }

    return {
        factory,
        resolvedDeps: deps || null,
        multi: provider.multi ? [] : false
    }
}

function providerToValue<T>(provider: Provider): T | null {
    if('useValue' in provider) {
        // useValue это объект с пропсами поэтому достаточно просто вернуть его
        return provider.useValue;
    }
    return null;
}

export class Container {
    /**
    * Список c записями инстансов провайдеров
    */
    private records = new Map<symbol, RecordProvider<any>>();

    private recordValues = new Map<RecordProvider<any>, any>();

    constructor(providers: Provider[]) {
        if(providers) {
            // при инстанцировании Container класса в него попадают 0 - сколько-то провайдеров
            // он их всех регистрирует с помощью register метода
            providers.forEach((provider) => this.register(provider));
        }
    }

    /**
     * validateProvider метод валидирует провайдер
     * в провайдере обязательно наличие provide токена
     * и любой фабрики
     * @param provider 
     */
    validateProvider(provider: Provider) {
        if(
            !provider ||
            !provider.provide ||
            (
                !provider.hasOwnProperty('useClass') &&
                !provider.hasOwnProperty('useFactory') && 
                !provider.hasOwnProperty('useValue')
            )
        ) {
            throw new Error("Invalid provider interface")
        }
    }

    getDependencies(deps: ResolvedDepsType): any {
        const dependencies: Record<string, any> = {};

        for(const key in deps) {
            dependencies[key] = this.get(deps[key]);
        }

        return dependencies;
    }

    get(token: TokenType) {
        const record = this.getRecord(token.name);

        if(!record) {
            throw new Error("Record by " + token.toString() + ' token is not found');
        }

        return this.hydrate(record, token.name);
    }

    hydrate<T>(record: RecordProvider<T>, token: symbol) {

            // если у record есть значение value, значит в его провайдер передан
            // useValues проп которые ресолвит какоето значение
            let value = this.getValue(record);

            // выход из рекусивного поиска value
            if(value) {
                return value;
            }

            if(!record.multi) {
                // вызываем рекуссивно фабрику каждого провайдера для того чтобы
                // в конце концов зарезолвить значение в цепочке "deps"
                value = record.factory?.(this.getDependencies(record.resolvedDeps));
            } else {}

            // хз зачем пока
            this.recordValues.set(record, value);

            return value as T;
    }

    getRecordValue(record: RecordProvider<any>) {
        return this.recordValues.get(record);
    }

    /**
     * регистрация провайдера
     * @param provider 
     * @returns 
     */
    register<Deps>(provider: Provider<Deps>) {
        this.validateProvider(provider);
        // разбор кадого провайдера
        return this.processProvider(provider);
    }

    hasRecord(symbol: symbol) {
        return this.records.has(symbol);
    }

    /**
     * Записываем в Map значение record под value ключом
     * @param name
     * @param record 
     */
    setRecord(name: symbol, record: RecordProvider<any>) {
        this.records.set(name, record);
    }

    getRecord(name: symbol) {
        return this.records.get(name);
    }

    getValue(record: RecordProvider<any>) {
        return this.recordValues.get(record);
    }

    /**
     * Обработка различных провайдеров
     */
    processProvider(provider: Provider) {
        // берем токен из провайдера
        const token = provider.provide.name;
        // если useClass или useFactory
        // возвращаем объект с factory, desps и multi
        const record = providerToRecord(provider);
        // возвращаем значение или строчку
        const value = providerToValue(provider);

        if(provider.multi) {
            const alreadyRecorded = this.hasRecord(token);

            if(alreadyRecorded) {
                // multi check here
            } else {
    
            }
        } else {
            this.setRecord(token, record)
        }
        this.recordValues.set(record, value);
    }
}