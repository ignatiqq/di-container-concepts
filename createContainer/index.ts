import { Provider } from "../provider";
import { Container } from '../Container';

export function createContainer(providers: Provider[]) {
    return new Container(providers);
}