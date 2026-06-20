const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

const getLocalTimeZone = (): string => {
	const dateTimeFormat = new Intl.DateTimeFormat();
	return dateTimeFormat.resolvedOptions().timeZone;
};

const getLocalDateTime = (timestamp: string): Temporal.ZonedDateTime =>
	Temporal.Instant.from(timestamp).toZonedDateTimeISO(getLocalTimeZone());

export function formatDate(timestamp: string): string {
	const value = DATE_ONLY_PATTERN.test(timestamp)
		? Temporal.PlainDate.from(timestamp)
		: getLocalDateTime(timestamp).toPlainDate();

	return value.toLocaleString(undefined, {
		day: 'numeric',
		month: 'numeric',
		year: 'numeric'
	});
}

export function formatTime(timestamp: string): string {
	return getLocalDateTime(timestamp).toPlainTime().toLocaleString(undefined, {
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	});
}

export function formatDateTime(timestamp: string): string {
	return getLocalDateTime(timestamp).toPlainDateTime().toLocaleString(undefined, {
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		month: 'numeric',
		second: 'numeric',
		year: 'numeric'
	});
}
