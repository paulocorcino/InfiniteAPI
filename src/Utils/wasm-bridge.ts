type WasmBridgeModule = typeof import('whatsapp-rust-bridge')

let _bridge: WasmBridgeModule | undefined

// Start loading eagerly using .then() instead of top-level await.
// This prevents the whatsapp-rust-bridge top-level await from propagating
// through the ESM graph, which would break CJS require() consumers.
const _bridgeReady = import('whatsapp-rust-bridge').then(m => {
	_bridge = m
	return m
})

export { _bridgeReady as wasmBridgeReady }

function getBridge(): WasmBridgeModule {
	if (!_bridge) {
		throw new Error(
			'whatsapp-rust-bridge not yet loaded. ' + 'Ensure async operations have started before calling crypto functions.'
		)
	}

	return _bridge
}

export const hkdf: WasmBridgeModule['hkdf'] = (...args) => getBridge().hkdf(...args)

export const md5: WasmBridgeModule['md5'] = (...args) => getBridge().md5(...args)

export const expandAppStateKeys: WasmBridgeModule['expandAppStateKeys'] = (...args) =>
	getBridge().expandAppStateKeys(...args)

let _ltHash: InstanceType<WasmBridgeModule['LTHashAntiTampering']> | undefined

export function getLTHashAntiTampering(): InstanceType<WasmBridgeModule['LTHashAntiTampering']> {
	if (!_ltHash) {
		_ltHash = new (getBridge().LTHashAntiTampering)()
	}

	return _ltHash
}
