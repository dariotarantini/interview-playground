# Tips 

## Sending msgs

There're several functions to send msgs in `@ston-fi/funcbox`, you can find them in `node_modules/@ston-fi/funcbox/contracts/msgs.fc`

Msgs are sent using different [send modes](https://docs.ton.org/develop/smart-contracts/messages#message-modes) (some of them can be combined):

  - `NORMAL` (0)
  - `PAID_EXTERNALLY` (1)
  - `IGNORE_ERRORS` (2)
  - `BOUNCE_IF_FAIL` (16)
  - `DESTROY_IF_ZERO` (32)
  - `CARRY_REMAINING_GAS` (64)
  - `CARRY_ALL_BALANCE` (128)

Some of them can be combined with a bitwise `or` operation (`|`) since each bit represents a mode:

```func
int mode = CARRY_ALL_BALANCE | IGNORE_ERRORS; 	;; this is valid send_mode that will carry all balance (if no reserve command) and won't throw error on failure
```

## Working with dictionary

You can use dict utils from `@ston-fi/funcbox` at `node_modules/@ston-fi/funcbox/contracts/dict.fc` but they are pretty complex.

You can start by using functions from [stdlib](https://docs.ton.org/develop/func/stdlib#dictionaries-primitives)

## Using address as dictionary key

In order to use address as key in dictionary we need to use its 256-bit hashpart. [More about addresses](https://docs.ton.org/learn/overviews/addresses)

```func
...
	slice account = in_msg_body~load_msg_addr();	;; read incoming address from msg

	;; the value in dict is slice, so if you want to put an actual number here you need to create a slice with it
	storage::accounts~udict_set(256, account.address::get_hashpart(), empty_slice());
...
```

In the wrapper in order to parse dict into a readable map of addresses you can use this snippet

```ts
import { parseDict } from "@ton/core/dist/dict/parseDict";
...
 	let accountsRaw = result.stack.readCellOpt()	// read raw cell from contract getter
	const addressList: Address[] = []

	if (accountsRaw !== null) {
		const addrMap = parseDict(accountsRaw.beginParse(), 256, (slice) => {
			// here we should parse slice that contains data for each entry for each dict
			// but our slice is empty so we just return 0
			return 0
		});
		for (let k of addrMap.keys()) {
			// create address from hashpart
			addressList.push(rawNumberToAddress(k))
		}

	}
...
```

Or you can use in-build dict utils if you have simple value (like `uint8`) in slice that doesn't require custom parsing:

```ts
import { Dictionary } from '@ton/core';
...
 	let accountsRaw = result.stack.readCellOpt()	// read raw cell from contract getter
	const addressList: Address[] = []

	if (accountsRaw !== null) {
		// this will only work if we have uint8 value as slice in dict for each entry
		let accountsDict = Dictionary.loadDirect(Dictionary.Keys.BigUint(256), Dictionary.Values.Uint(8), accountsRaw)

		for (let entry of accountsDict) {
			// create address from hashpart
			addressList.push(rawNumberToAddress(entry[0]))
		}

	}
...
```

## Working with child contracts

### Create function that returns init storage 

This function depends on the `user_address` and since contract address depends on contract code and `state_init` each user will have a unique `Tracker` contract

```func
(cell) tracker_data(slice _user_address, slice _clicker_address) inline {
    return begin_cell()
        .store_slice(_user_address) 		;; address of the user that is tracked
        .store_slice(_clicker_address)		;; parent contract
        .store_uint32(0) 					;; id of vote_option
    .end_cell();
}
```
### Send msg to child contract with `state_init`

```func
...
	var tracker = contracts::from_sources(
		tracker_data(ctx.at(SENDER), my_address()),
		storage::tracker_code
	);

	var msg = begin_message(internal_vote)
		.store_uint(vote_id, 32)
		.end_cell();

	msgs::send_with_stateinit(
		0, 										;; ton value (in addition to whatever send_mode you're using)
		tracker~address(params::workchain), 	;; child ctr address
		tracker~state_init(), 					;; contract state_init
		msg, 									;; msg cell
		CARRY_REMAINING_GAS						;; send mode
	);

...
```

### Verify a call came from child contract

In order to verify a call came from a child contract you need to construct the same `tracker` using incoming data and check this condition:

```func
...
	slice user_address = in_msg_body~load_msg_addr();  ;; read user address from incoming msg since it defines state_init

	var tracker = contracts::from_sources(
		tracker_data(user_address, my_address()),
		storage::tracker_code
	);

	;; check if the call came from the address of the tracker contract that is defined for this user
	throw_unless(error::invalid_caller, ctx.at(SENDER).equal_slices(tracker~address(params::workchain)));
...
```
