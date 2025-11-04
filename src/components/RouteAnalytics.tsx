import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fbTrack, gaTrack } from '@/utils/tracking';

// Fires page view events on SPA route changes for Meta Pixel and GA4
export default function RouteAnalytics() {
	const location = useLocation();

	useEffect(() => {
		// Meta Pixel
		fbTrack('PageView');
		// GA4
		gaTrack('page_view', {
			page_path: location.pathname + location.search,
		});
	}, [location.pathname, location.search]);

	return null;
}





