import { NetworkProvider } from '@ton/blueprint';
import { cliConfig } from '../helpers/helpers';
import { color } from "../libs";
import { MainContract } from '../wrappers/Main';

export async function run(provider: NetworkProvider) {
    // just read data from contract on blockchain
    cliConfig.readConfig()
    let config = cliConfig.values
    
    if (config.mainAddress === null) {
        throw new Error('mainAddress is not defined');
    }

    const main = provider.open(MainContract.createFromAddress(config.mainAddress));
    const data = await main.getValue()
    
    color.log(`<y>Value: <b>${data.value}`)

}
