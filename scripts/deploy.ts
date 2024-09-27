import { NetworkProvider, compile } from '@ton/blueprint';
import { Address, toNano } from '@ton/core';
import { cliConfig } from '../helpers/helpers';
import { MainConfig, MainContract } from '../wrappers/Main';
import { waitConfirm, color } from '../libs';

export async function run(provider: NetworkProvider) {
    // import config
    cliConfig.readConfig()
    let config = cliConfig.values
    
    // address of your connected wallet
    const senderAddress = provider.sender().address as Address;

    color.log(` - <y>Deploy new Clicker?`)
    waitConfirm()   // waits until you click Enter to continue or Ctrl+C to cancel

    // contract address is defined by its code and init state
    // if you want to deploy the same 2 contracts with the same code you need to change the init state
    // in practical terms if you set init "value" in config as non-zero you will get a different address
    let initData: MainConfig = {
        value: 0
    }
    
    const main = provider.open(MainContract.createFromConfig(initData, await compile('Main')));
    if (await provider.isContractDeployed(main.address)) {
        color.log(` - <r>This contract is already deployed!`)
        throw ""
    }
    
    await main.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(main.address, 100);

    config.mainAddress = main.address
    cliConfig.updateConfig()

}
