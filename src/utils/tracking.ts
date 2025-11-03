declare global {
	// eslint-disable-next-line no-var
	var fbq: undefined | ((...args: any[]) => void);
	// eslint-disable-next-line no-var
	var gtag: undefined | ((...args: any[]) => void);
}

export type TrackingData = Record<string, any>;

// Meta Pixel
export const fbTrack = (event: string, data: TrackingData = {}): void => {
	try {
		if (typeof fbq === 'function') {
			fbq('track', event, data);
		}
	} catch {
		// no-op
	}
};

// Google Analytics 4
export const gaTrack = (event: string, data: TrackingData = {}): void => {
	try {
		if (typeof gtag === 'function') {
			gtag('event', event, data);
		}
	} catch {
		// no-op
	}
};


