import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
import { beginMessage, emptyCell } from '../libs';

export type MainConfig = {
    value?: number | bigint     // "?" means value is optional
};

export function mainConfigToCell(config: MainConfig): Cell {
    return beginCell()
        .storeUint(config.value ?? 0, 32)   // if value is undefined use 0 as default
    .endCell();
}


export class MainContract implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new MainContract(address);
    }

    static createFromConfig(config: MainConfig, code: Cell, workchain = 0) {
        const data = mainConfigToCell(config);
        const init = { code, data };
        return new MainContract(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: emptyCell(),
            bounce: false
        });
    }

    async sendClick(provider: ContractProvider, via: Sender, opts: {
        newValue: number | bigint
    }, value: bigint) {
        await provider.internal(via, {
            value: value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginMessage("click")
                .storeUint(opts.newValue, 32)
                .endCell()
        });
    }

    async sendGarbage(provider: ContractProvider, via: Sender, value: bigint) {
        // this op does not exits on contract so it will bounce
        await provider.internal(via, {
            value: value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginMessage("garbage")
                .storeUint(123, 32)
                .endCell()
        });
    }

    async getValue(provider: ContractProvider) {
        const result = await provider.get('get_value', []);
        return {
            value: result.stack.readNumber()
        }
    }
}
