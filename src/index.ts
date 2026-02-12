// ============================================
// Format session error logs from libsignal BEFORE any imports
// This MUST be at the very top to intercept console before libsignal loads
// ============================================
const _origConsoleLog = console.log
const _origConsoleError = console.error

// Track last error to avoid duplicates
let _lastErrorMsg = ''
let _lastErrorTime = 0

console.log = function(...args: unknown[]) {
	if (args.length > 0 && typeof args[0] === 'string') {
		const msg = args[0]
		const stack = new Error().stack || ''
		const isFromLibsignal = stack.includes('libsignal') || stack.includes('session_cipher')

		if (isFromLibsignal) {
			// Suppress session lifecycle dumps
			if (msg.startsWith('Closing session')) {
				return
			}

			// Format session errors cleanly
			if (
				msg.includes('Session error') ||
				msg.includes('Bad MAC') ||
				msg.includes('MessageCounterError') ||
				msg.includes('Key used already') ||
				msg.includes('Failed to decrypt')
			) {
				// Extract error type
				let errorType = '⚠️  Session Error'
				if (msg.includes('Bad MAC')) errorType = '🔐 Bad MAC Error'
				else if (msg.includes('MessageCounterError') || msg.includes('Key used already')) errorType = '🔢 Counter Error'
				else if (msg.includes('Failed to decrypt')) errorType = '🔌 Decryption Failed'

				// Extract JID if present (format: 46802258641027_1.0 or similar)
				const jidMatch = msg.match(/(\d{10,}(?:_\d+\.\d+)?)/);
				const jid = jidMatch ? jidMatch[1] : null
				const maskedJid = jid && jid.length > 8 ? `${jid.substring(0, 4)}****${jid.substring(jid.length - 4)}` : jid

				// Format clean message
				const cleanMsg = maskedJid
					? `${errorType} | JID: ${maskedJid}`
					: errorType

				// Avoid duplicate logs (within 100ms)
				const now = Date.now()
				if (cleanMsg === _lastErrorMsg && now - _lastErrorTime < 100) {
					return
				}
				_lastErrorMsg = cleanMsg
				_lastErrorTime = now

				_origConsoleError(cleanMsg)
				return
			}
		}
	}

	_origConsoleLog.apply(console, args)
}

console.error = function(...args: unknown[]) {
	if (args.length > 0 && typeof args[0] === 'string') {
		const msg = args[0]
		const stack = new Error().stack || ''
		const isFromLibsignal = stack.includes('libsignal') || stack.includes('session_cipher')

		if (isFromLibsignal) {
			// Format session errors cleanly
			if (
				msg.includes('Session error') ||
				msg.includes('Bad MAC') ||
				msg.includes('MessageCounterError') ||
				msg.includes('Key used already')
			) {
				// Extract error type
				let errorType = '⚠️  Session Error'
				if (msg.includes('Bad MAC')) errorType = '🔐 Bad MAC Error'
				else if (msg.includes('MessageCounterError') || msg.includes('Key used already')) errorType = '🔢 Counter Error'

				// Extract JID from stack trace or message
				const jidMatch = (msg + (args[1] || '')).match(/(\d{10,}(?:_\d+\.\d+)?)/);
				const jid = jidMatch ? jidMatch[1] : null
				const maskedJid = jid && jid.length > 8 ? `${jid.substring(0, 4)}****${jid.substring(jid.length - 4)}` : jid

				// Format clean message
				const cleanMsg = maskedJid
					? `${errorType} | JID: ${maskedJid}`
					: errorType

				// Avoid duplicate logs (within 100ms)
				const now = Date.now()
				if (cleanMsg === _lastErrorMsg && now - _lastErrorTime < 100) {
					return
				}
				_lastErrorMsg = cleanMsg
				_lastErrorTime = now

				_origConsoleError(cleanMsg)
				return
			}
		}
	}

	_origConsoleError.apply(console, args)
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
