export const TEST_USERS = {
	default: {
		username: 'test2',
		password: 'test2'
	},
	player2: { username: 'testuser', password: 'testuser' },
	invalid: {
		username: 'invaliduser',
		password: 'wrongpass'
	},
	newUser: {
		username: 'newtestuser',
		password: 'newtestpass',
		confirmPassword: 'newtestpass'
	}
};

export const LOBBY_SETTINGS = {
	default: {
		provider: 'Seznam',
		rounds: 3,
		spicy: true,
		timerSeconds: 50 // slider move amount
	},
	custom: {
		provider: 'Seznam',
		rounds: 5,
		spicy: false,
		timerSeconds: 30
	}
};
