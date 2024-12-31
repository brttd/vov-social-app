const post = {
	text: (text) => {
		return typeof text === 'string' && text.length >= 3 && text.length <= 1024;
	}
};

const user = {
	username: (username) => {
		return (
			typeof username === 'string' &&
			username.length >= 3 &&
			username.length <= 31 &&
			/^[a-z0-9_-]+$/.test(username)
		);
	},

	email: (email) => {
		// TODO: Do something better than regex validation
		return (
			typeof email === 'string' &&
			email.length > 3 &&
			email.length <= 255 &&
			email
				.toLowerCase()
				.match(
					/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
				)
		);
	},

	password: (password) => {
		return typeof password === 'string' && password.length >= 6 && password.length <= 255;
	}
};

export { user, post };
