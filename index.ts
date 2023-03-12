// class Logger {
//     logger: {info: (mes: string) => void};
//     constructor(logger: {info: (mes: string) => void}) {
//         this.logger = logger;
//     }

//     info(message: string) {
//         this.logger.info('foo: bar')
//     }
// }

// class RemoteReporter {
//     constructor() {

//     }

//     report(message) {
//         console.log("Reporting: " + message);
//     }
// }

// class Foo {}

// // first realizartion

// const container = new Map();

// container.set('logger', {
//     useClass: Logger,
//     deps: {
//         remoteReporter: 'remoteReporter',
//     }
// });

// container.set('remoteReporter', {
//     useClass: RemoteReporter,
// });


// const pipe = (...fns) => (val) => fns.reduce((acc, val) => {
//     console.log({acc, val});
//     return acc(val);
// }, val)

// const createInstance = (container, token) => {
//     const realizationOptions = container.get(token);
//     const Class = realizationOptions.useClass;
//     const deps = Object.values(realizationOptions.deps);
//     const dependencies = {};
//     deps.forEach((token) => {
//         const Class = container.get(token).useClass;
//         dependencies[token] = new Class();
//     })
//     return new Class(dependencies)
//     // const piped = pipe((dep) => )
//     // return new Class(new Dep());
// }

// const instance = createInstance(container, 'logger');
// console.log({instance})
// instance.info('hello')

import {provide} from './provide';
import {createToken} from './createToken';
import {createContainer} from './createContainer';

const COUNTER = createToken('counter');
const MULTIPLIER = createToken('multiplier')

const TEST = createToken('test')
const providers = [
    // provide это настройки для какого либо провайдера, контейнера
    // контейнер имеет "provide" поле которое является токеном (его уникальным идентификатором)
    // реализовано js Symbol
    provide({
        provide: COUNTER,
        // useValues поле, которое ресолвит значение для текущего провайдера
        useFactory: (deps: any) => {
            return deps.val + 5;
        },
        deps: {
            val: TEST
        }
    }),
    provide({
        provide: MULTIPLIER,
        // для multipliter мы подставляем реализацию с помощью фабрики, которая принимает
        // (может и не принимать) зависимости от другого провайдера (из deps)
        useFactory(deps) {
            return deps.counter * 2
        },
        // так же мултиплайер имеет зависимости, которые как раз и попадают в useFactory фабрику
        deps: {
            // в данном случае будет внедрена {value: 2} зависимость в multiplier (ресолв значения)
            counter: COUNTER
        }
    }),
    // FOR TEST
    provide({
        provide: TEST,
        useValue: 1
    })
];

// создание контейнера с помощью createContainer функции (создания инстанса Container класса)
// const container = createContainer(providers);
// console.log(container.get(MULTIPLIER))

class Logger {
    logger: {info: (mes: string) => void};
    constructor(logger: {logger: {info: (mes: string) => void}}) {
        console.log('инстнасирование:', logger);
        this.logger = logger.logger;
    }

    info(message: string) {
        this.logger.info('foo: bar')
    }
}

class Reporter {
    info(message: string) {
        console.log('Report: ' + message);
    }
}

const REPORTER = createToken("REPOTER");
const LOGGER = createToken('LOGGER');

const providers1 = [
    provide({
        provide: LOGGER,
        useClass: Logger,
        deps: {
            // в данном случае будет внедрена {value: 2} зависимость в multiplier (ресолв значения)
            logger: REPORTER
        }
    }),
    // FOR TEST
    provide({
        provide: REPORTER,
        useClass: Reporter
    })
];

const loggger = createContainer(providers1);
console.log(loggger.get(REPORTER).info('hello'));
