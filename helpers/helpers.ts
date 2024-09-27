import { SendMessageResult } from "@ton/sandbox";
import { 
    AddressMap, 
    BracketType, 
    AsyncReturnType, 
    CliConfig, 
    ElementType, 
    HOLE_ADDRESS, 
    createMdGraph, 
    fetchJettonData, 
    jMinterOpcodes, 
    jWalletOpcodes, 
    nftMinterOpcodes, 
    nftOpcodes, 
    parseErrors, 
    parseOp, 
    parseVersion, 
    preprocBuildContracts, 
    resolvers, 
    stdFtOpCodes, 
    stdNftOpCodes, 
    toGraphMap, 
    toHexStr, 
    tvmErrorCodes, 
    StorageParser,
    CaptionHandler,
    BracketKeysType,
    CaptionHandlerParams,
    Captions,
    opEntries
} from "../libs";

export type GraphParams = {
    msgResult: SendMessageResult,
    chartType?: "TB" | "LR" | "BT" | "RL", // default TB
    output: string,
    folderPath: string,
    addressMap?: AddressMap<string>,
    bracketMap?: AddressMap<BracketKeysType>,
    hideOkValues?: boolean,
    displayValue?: boolean,
    displayTokens?: boolean,
    displayExitCode?: boolean,
    displayFees?: boolean,
    displayActionResult?: boolean,
    displayDeploy?: boolean,
    displayAborted?: boolean,
    displayDestroyed?: boolean,
    displaySuccess?: boolean,
    disableStyles?: boolean,
    storageMap?: AddressMap<StorageParser>
}

export type GraphParamsWithoutPath = Omit<GraphParams, "folderPath">
// let codes = {}
export function createMdGraphLocal(params: GraphParams) {
    // @ts-ignore
    if (typeof createMdGraphLocal.opMap == 'undefined') {
        // @ts-ignore
        createMdGraphLocal.opMap = toGraphMap({
            ...nftMinterOpcodes,
            ...stdFtOpCodes,
            ...stdNftOpCodes,
            ...nftOpcodes,
            ...jWalletOpcodes,
            ...jMinterOpcodes,
            ...parseOp("contracts/common/op.fc")
        });
    }
    // @ts-ignore
    if (typeof createMdGraphLocal.errorMap == 'undefined') {
        // @ts-ignore
        createMdGraphLocal.errorMap = toGraphMap({
            ...tvmErrorCodes,
            ...parseErrors("contracts/common/errors.fc")
        });
    }
    
    // @ts-ignore
    // (createMdGraphLocal.opMap as Map<number, string>).forEach((value, key) => {
    //     // @ts-ignore
    //     codes[value] = toHexStr(key)
    // })
    // console.log(codes)

    const details = true

    const captionMap: Map<number, CaptionHandler> = new Map(opEntries({}))
    
    createMdGraph({
        chartType: params.chartType ?? "TB",
        hideOkValues: params.hideOkValues ?? true,
        displayValue: params.displayValue ?? details,
        displayTokens: params.displayTokens ?? details,
        displayExitCode: params.displayExitCode ?? details,
        displayFees: params.displayFees ?? details,
        displayActionResult: params.displayActionResult ?? details,
        displayAborted: params.displayAborted ?? details,
        displayDeploy: params.displayDeploy ?? true,
        displayDestroyed: params.displayDestroyed ?? true,
        displaySuccess: params.displaySuccess ?? false,
        disableStyles: params.disableStyles ?? false,
        msgResult: params.msgResult,
        storageMap: params.storageMap,
        output: `${params.folderPath}${params.output}.md`,
        addressMap: params.addressMap,
        bracketMap: params.bracketMap,
        captionsMap: captionMap,
        tableInfo: "mermaid",
        // @ts-ignore
        opMap: createMdGraphLocal.opMap,
        // @ts-ignore
        errMap: createMdGraphLocal.errorMap,
    });
}


// config for working on-chain
const configParams = {
    mainAddress: resolvers.address,
};
export const cliConfig = new CliConfig(configParams)