import { NetworkProvider } from '@ton/blueprint';
import { Address, toNano } from '@ton/core';
import { cliConfig } from '../helpers/helpers';
import { awaitConfirmation, getSeqNo, waitSeqNoChange, waitConfirm, findArgs, color} from '../libs';
import { MainContract } from '../wrappers/Main';

export async function run(provider: NetworkProvider) {
    // send tx to change value on contract

    cliConfig.readConfig()
    let config = cliConfig.values
    
    const senderAddress = provider.sender().address as Address;

    if (config.mainAddress === null) {
        throw new Error('mainAddress is not defined');
    }

    // this is a block to read args from cli
    let validArgs = "click"
    let argIndex = findArgs(process.argv, validArgs)
    let newValue: bigint | null = null
    try {
        newValue = BigInt(process.argv[++argIndex])
    } catch (_) {
        console.error("Usage:\n\tnpx blueprint run click <new_number>");
        return;
    }

    if (newValue === null) {
        throw new Error('newValue is not defined');
    }

    // create contract instance that is linked to address on blockchain
    const main = provider.open(MainContract.createFromAddress(config.mainAddress));
    
    color.log(` - <y>Set new value on contract to: <b>${newValue}`)
    waitConfirm()   // waits until you click Enter to continue or Ctrl+C to cancel

    // to confirm that blockchain received our tx we change wallet's seqno
    let seqno = await getSeqNo(provider, senderAddress);

    // sending tx
    await main.sendClick(provider.sender(), {
        newValue: newValue
    }, toNano("0.1"));
    
    if (await waitSeqNoChange(provider, senderAddress, seqno)) {
        // we wait until seqno on wallet changes
        // after that we wait until the value on contract matches what we expect
        if (await awaitConfirmation(async () => {
            const data = await main.getValue()
            return BigInt(data.value) === newValue
        })) {
            color.log(` - <g>Successfully set new value`);
        } else {
            color.log(` - <r>Error setting new value`);
        }
    }

}
