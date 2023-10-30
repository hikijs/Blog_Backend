// document: https://archive.jestjs.io/docs/en/24.x/configuration
module.exports = {
	verbose: true,
	bail: 1, // that mean if failed 1 test, it will stop test,\
	testMatch: [
		// the file will be test
		'**/tests/**/*test*.js',
	],
	collectCoverageFrom: [
		/**
		 * The ** is a wildcard that matches any number of directories and subdirectories.
		 * In this context, it's used to indicate that the pattern can match files in any subdirectory under the src and utils directory.
		 */
		'<rootDir>/server.js',
		'<rootDir>/utils/**/*.js',
		'<rootDir>/src/**/*.js',
		'!**/node_modules/**',
	],
	notify: false, // it will notify in your machine
	roots: [
		'<rootDir>/tests', // where the jest can find the test
	],
	displayName: {
		name: 'BLOG_PROJECT',
		color: 'green',
	},
	moduleDirectories: [
		// where jest can find the npm module
		'<rootDir>/node_modules',
	],
	testEnvironment: 'node',
	globalSetup: './tests/setupTest/global-setup.js',
	globalTeardown: './tests/setupTest/global-teardown.js',
};
