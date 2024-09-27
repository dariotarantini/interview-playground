# Useful materials

## Links

- [getting started](https://docs.ton.org/develop/smart-contracts/sdk/javascript)
- FunC [std lib](https://docs.ton.org/develop/func/stdlib)
- FunC [specification](https://docs.ton.org/develop/func/types)
- FunC [cookbook](https://docs.ton.org/develop/func/cookbook)
- FunC [send mods](https://docs.ton.org/develop/smart-contracts/messages#message-modes)
- FunC [lessons](https://github.com/romanovichim/TonFunClessons_Eng/tree/main/lessons/smartcontract)
- [some youtube lessons](https://www.youtube.com/watch?v=isfFGmyJvns&list=PLyDBPwv9EPsA5vcUM2vzjQOomf264IdUZ)

## Notes

### General

- install `Nodejs >= 18`
- you should familiarize yourself with `git` (you can use GitHub app or VsCode extension for repo management)
- you should publish your tasks on `GitHub`
- you should try using wallets from mnemonic, browser extension and tonkeeper mobile
- you can use testnet to deploy your contracts
- use this telegram bot to get testnet TON: https://t.me/testgiver_ton_bot

### Contracts

- you should always check if there's enough TON sent in a transaction to complete the whole message chain
- you should use [`@ston-fi/funcbox`](https://www.npmjs.com/package/@ston-fi/funcbox) for std FunC functions
- you should use [`@ton/blueprint`](https://www.npmjs.com/package/@ton/blueprint) for development environment
- you should test all you project's functionality in local sandbox
- you should create cli scripts to interact with contracts on-chain

### VsCode

- install this extension for intellisense: `VisualStudioExptTeam.vscodeintellicode`
- install this extension for packages intellisense: `christian-kohler.npm-intellisense`
- install this extension for FunC language support: `tonwhales.func-vscode`
- install this extension for markdown support: `yzhang.markdown-all-in-one`
- install this extension for mermaid graph support: `bierner.markdown-mermaid`
- install this extension to check your spelling: `streetsidesoftware.code-spell-checker`
- install this extension for better icons in a file tree: `vscode-icons-team.vscode-icons`
- press `Ctrl + /` to toggle comments in code

## Contract template

You can use [this template](https://github.com/dariotarantini/interview-tasks) to start your projects or create basic project template with `npm create ton@latest` command