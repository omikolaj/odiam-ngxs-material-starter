// SCREEN MEDIA QUERIES MATCH THOSE FOUND IN styles-variables.scss

/**
 * Screen media query type.
 */
interface ScreenMediaQuery {
	sm: string;
	md: string;
	lg: string;
	xl: string;
}

/**
 * Screen media queries for BreakpointObserver angular cdk.
 */
export const MinScreenSizeQuery: Readonly<ScreenMediaQuery> = {
	sm: '(min-width: 576px)',
	md: '(min-width: 768px)',
	lg: '(min-width: 992px)',
	xl: '(min-width: 1200px)'
};
