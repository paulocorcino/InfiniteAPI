// ============================================
// Suppress verbose logs from libsignal BEFORE any imports
// This MUST be at the very top to intercept console.log before libsignal loads
// ============================================
const _origConsoleLog = console.log
console.log = function(...args: unknown[]) {
	if (args.length > 0 && typeof args[0] === 'string') {
		const msg = args[0]

		// Check if this log comes from libsignal by examining the call stack
		const stack = new Error().stack || ''
		const isFromLibsignal = stack.includes('libsignal') || stack.includes('session_cipher')

		if (isFromLibsignal) {
			// Suppress session lifecycle dumps
			if (msg.startsWith('Closing session')) {
				return
			}

			// Suppress transient decryption errors auto-recovered by retry logic
			if (
				msg.includes('Session error') ||
				msg.includes('Bad MAC') ||
				msg.includes('MessageCounterError') ||
				msg.includes('Key used already or never filled') ||
				msg.includes('Failed to decrypt message with any known session')
			) {
				return
			}
		}
	}

	_origConsoleLog.apply(console, args)
}

import makeWASocket, { makeWASocketAutoVersion } from './Socket/index'

export * from '../WAProto/index.js'
export * from './Utils/index'
export * from './Types/index'
export * from './Defaults/index'
export * from './WABinary/index'
export * from './WAM/index'
export * from './WAUSync/index'

export type WASocket = ReturnType<typeof makeWASocket>
export { makeWASocket, makeWASocketAutoVersion }

// Alias de compatibilidade para zpro.io
// isJidUser é um alias para isPersonJid (mantém retrocompatibilidade)
export { isPersonJid as isJidUser } from './Utils/history'

export default makeWASocket
