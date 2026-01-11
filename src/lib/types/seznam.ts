// modified types of seznam panoramas:
// https://developer.mapy.cz/en/js-panorama-2/
export interface ICreatePanoFromPositionOpts {
	/** Parent element */
	parent: HTMLElement;
	/** Wgs84 longitude coordinate */
	lon: number;
	/** Wgs84 latitude coordinate  */
	lat: number;
	/** API key */
	apiKey: string;
	/** Default pano view - yaw - "auto", "point" - direction to point, number - custom value <0;2 * Math.PI> [rad] */
	yaw?: 'auto' | 'point' | number;
	/** Default pano view - pitch */
	pitch?: number;
	/** Horizontal field of view */
	fov?: number;
	/** Search area radius [m] */
	radius?: number;
	/** Supported langs: cs, de, el, en, es, fr, it, nl, pl, pt, ru, sk, tr, uk */
	lang?:
		| 'cs'
		| 'de'
		| 'el'
		| 'en'
		| 'es'
		| 'fr'
		| 'it'
		| 'nl'
		| 'pl'
		| 'pt'
		| 'ru'
		| 'sk'
		| 'tr'
		| 'uk';
	/** Show navigations - neighbors, click mask */
	showNavigation?: boolean;
	/** Hide errors output */
	hideErrors?: boolean;
}

interface ICamera {
	yaw: number;
	pitch: number;
	fov: number;
}

export interface PanoramaMeta {
	/** Pano wgs84 longitude coordinate */
	lon: number;
	/** Pano wgs84 latitude coordinate */
	lat: number;
	/** Create date YYYY-MM-DD hh:mm:ss*/
	date: string;
}

interface IEvent {
	'pano-view': {
		yaw: number;
		pitch: number;
		fov: number;
		angle: number;
	};
	'pano-place': PanoramaMeta;
}

export interface ICreatePanoFromPositionOutput {
	/** Panorama meta information */
	info?: PanoramaMeta;
	/** Error message */
	error: string;
	/** Error code */
	errorCode: 'NONE' | 'PANORAMA_NOT_FOUND' | 'MISSING_API_KEY' | 'WRONG_API_KEY';
	/** Add listener */
	addListener: <K extends keyof IEvent>(name: K, callback: (data: IEvent[K]) => void) => void;
	/** Remove listener */
	removeListener: <K extends keyof IEvent>(name: K, callback: (data: IEvent[K]) => void) => void;
	/** Get panorama camera */
	getCamera: () => ICamera;
	/** Set panorama camera */
	setCamera: (camera: ICamera) => void;
	/** Destroy panorama */
	destroy: () => void;
}
