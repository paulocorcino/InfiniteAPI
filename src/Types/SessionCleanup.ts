/**
 * Session cleanup configuration
 */
export interface SessionCleanupConfig {
	enabled: boolean
	intervalMs: number
	cleanupHour: number
	secondaryDeviceInactiveDays: number
	primaryDeviceInactiveDays: number
	lidOrphanHours: number
	cleanupOnStartup: boolean
	autoCleanCorrupted: boolean
}

/**
 * Session cleanup statistics
 */
export interface SessionCleanupStats {
	totalScanned: number
	secondaryDevicesDeleted: number
	primaryDevicesDeleted: number
	lidOrphansDeleted: number
	totalDeleted: number
	durationMs: number
	errors: number
}
