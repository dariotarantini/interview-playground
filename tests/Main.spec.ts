import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { MainContract } from '../wrappers/Main';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { BracketKeysType } from '../libs';
import { expectBounced, expectNotBounced } from '../libs/src/test-helpers';
import { createMdGraphLocal } from '../helpers/helpers';

// @ts-ignore
BigInt.prototype.toJSON = function () { return this.toString(); };

type SBCtrTreasury = SandboxContract<TreasuryContract>;
type SBCtrMain = SandboxContract<MainContract>;

describe('Main', () => {
    let code: Cell,
        blockchain: Blockchain,
        alice: SBCtrTreasury,
        main: SBCtrMain,
        bracketMap: Map<string, BracketKeysType>,
        addressMap: Map<string, string>


    addressMap = new Map();
    bracketMap = new Map();

    beforeAll(async () => {
        // this block executes only once before all tests
        code = await compile('Main');
    });


    beforeEach(async () => {
        // this block executes before each test 
        blockchain = await Blockchain.create();     // initialize local sandbox
        alice = await blockchain.treasury('alice');  // create a treasury account to send transactions from

        main = blockchain.openContract(MainContract.createFromConfig({}, code));    // open an instance of Main contract
        
        const deployResult = await main.sendDeploy(alice.getSender(), toNano('0.05'));  // deploy this contract on sandbox
        
        // confirm the contract was deployed
        expect(deployResult.transactions).toHaveTransaction({
            from: alice.address,
            to: main.address,
            deploy: true,
            success: true,
        });

        // those maps are used to create mermaid graph
        addressMap.set(alice.address.toString(), "Admin");  // assign a label to address
        bracketMap.set(alice.address.toString(), "circle"); // make this object display as a circle
        addressMap.set(main.address.toString(), "Main"); 
        bracketMap.set(main.address.toString(), "diamond"); 
    });

    it('should deploy', async () => {
        // check if it deploys
    });

    it('should set new value', async () => {
        // send tx to contract
        let msgResult = await main.sendClick(alice.getSender(), {
            newValue: 1234,
        }, toNano("1"))

        // check if there're no bounced msgs
        expectNotBounced(msgResult.events)

        // get off-chain data from the contract
        const data = await main.getValue()
        // confirm new value matches what we sent
        expect(data.value).toEqual(1234)

        // create md graph in build/graph/
        createMdGraphLocal({
            folderPath: "build/graphs/",
            msgResult: msgResult,   // transactions to graph
            output: "set_new_value",    // file name, will be "build/graph/set_new_value.md"
            addressMap: addressMap,     // our address map to display human-readable labels instead of addresses
            bracketMap: bracketMap,     // shapes of each block
            chartType: "LR"         // direction of the chart; "LR" means "left-to-right", "TB" means "top-to-bottom"
        })
    });

    it('should bounce if value is too big', async () => {
        // set original value
        let msgResult = await main.sendClick(alice.getSender(), {
            newValue: 123,
        }, toNano("1"))

        expectNotBounced(msgResult.events)

        // get data before next tx
        const oldData = await main.getValue()
        
        // send tx to contract that should bounce
        msgResult = await main.sendClick(alice.getSender(), {
            newValue: 12345,
        }, toNano("1"))
        
        expectBounced(msgResult.events)

        // get data after tx
        // confirm value didn't change
        const data = await main.getValue()
        expect(data.value).toEqual(oldData.value)

        createMdGraphLocal({
            folderPath: "build/graphs/",
            msgResult: msgResult,
            output: "set_new_value_bounce",
            addressMap: addressMap,
            bracketMap: bracketMap,
            chartType: "LR"
        })
    });

    it('should bounce on garbage op', async () => {
        let msgResult = await main.sendGarbage(alice.getSender(), toNano("1"))
        expectBounced(msgResult.events)

        createMdGraphLocal({
            folderPath: "build/graphs/",
            msgResult: msgResult,
            output: "garbage",
            addressMap: addressMap,
            bracketMap: bracketMap,
            chartType: "LR"
        })
    });
});
