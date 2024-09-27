import {
    Address,
    beginCell,
    Cell
} from '@ton/core';

import { cellToBocStr, codeFromString } from "../cell";
import { JettonWalletContractBase } from './abstract/abcJettonWallet';

export type JettonWalletConfig = {
    balance: bigint,
    ownerAddress: Address,
    jettonMasterAddress: Address,
    jettonWalletCode?: Cell,
};

export function jettonWalletStorageParser(src: Cell) {
    let ds = src.beginParse()
    return {
        balance: ds.loadCoins(),
        owner: ds.loadAddress(),
        master: ds.loadAddress(),
        lpWalletCode: cellToBocStr(ds.loadRef()),
    }
}

export function jettonWalletConfigToCell(config: JettonWalletConfig): Cell {
    return beginCell()
        .storeCoins(config.balance)
        .storeAddress(config.ownerAddress)
        .storeAddress(config.jettonMasterAddress)
        .storeRef(config.jettonWalletCode ?? DEFAULT_JETTON_WALLET_CODE)
        .endCell();
}

export const jWalletOpcodes = {
    transfer: 0xf8a7ea5,
    internalTransfer: 0x178d4519,
    burn: 0x595f07bc,
} as const;

export class JettonWalletContract extends JettonWalletContractBase<typeof jWalletOpcodes> {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell; }) { 
        super(jWalletOpcodes, address, init)
    }

    static createFromConfig(config: JettonWalletConfig, code?: Cell, workchain = 0) {
        return this.createFromConfigBase(config, jettonWalletConfigToCell, code ?? DEFAULT_JETTON_WALLET_CODE, workchain)
    }
}

export const DEFAULT_JETTON_WALLET_CODE = codeFromString("b5ee9c7241021201000334000114ff00f4a413f4bcf2c80b010201620302001ba0f605da89a1f401f481f481a8610202cc0f04020148080502012007060083200835c87b51343e803e903e90350c0134c7e08405e3514654882ea0841ef765f784ee84ac7cb8b174cfcc7e800c04e81408f214013e809633c58073c5b3327b552000db3b51343e803e903e90350c01f4cffe803e900c145468549271c17cb8b049f0bffcb8b0a0823938702a8005a805af3cb8b0e0841ef765f7b232c7c572cfd400fe8088b3c58073c5b25c60063232c14933c59c3e80b2dab33260103ec01004f214013e809633c58073c5b3327b55200201200d0903f73b51343e803e903e90350c0234cffe80145468017e903e9014d6f1c1551cdb5c150804d50500f214013e809633c58073c5b33248b232c044bd003d0032c0327e401c1d3232c0b281f2fff274140371c1472c7cb8b0c2be80146a2860822625a020822625a004ad8228608239387028062849f8c3c975c2c070c008e00c0b0a0076c200b08e218210d53276db708010c8cb055008cf165004fa0216cb6a12cb1f12cb3fc972fb0093356c21e203c85004fa0258cf1601cf16ccc9ed54000e10491038375f0400705279a018a182107362d09cc8cb1f5230cb3f58fa025007cf165007cf16c9718010c8cb0524cf165006fa0215cb6a14ccc971fb001024102301f100f4cffe803e90087c007b51343e803e903e90350c144da8548ab1c17cb8b04a30bffcb8b0950d109c150804d50500f214013e809633c58073c5b33248b232c044bd003d0032c032483e401c1d3232c0b281f2fff274013e903d010c7e800835d270803cb8b11de0063232c1540233c59c3e8085f2dac4f3200e00ae8210178d4519c8cb1f19cb3f5007fa0222cf165006cf1625fa025003cf16c95005cc2391729171e25008a813a08208e4e1c0aa008208989680a0a014bcf2e2c504c98040fb001023c85004fa0258cf1601cf16ccc9ed540201d4111000113e910c1c2ebcb8536000c30831c02497c138007434c0c05c6c2544d7c0fc02f83e903e900c7e800c5c75c87e800c7e800c1cea6d0000b4c7e08403e29fa954882ea54c4d167c0238208405e3514654882ea58c511100fc02780d60841657c1ef2ea4d67c02b817c12103fcbc204479e250");