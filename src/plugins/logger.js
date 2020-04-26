const colors = [
	'#C0392B', '#884EA0', '#2471A3', '#138D75', '#023618',
	'#F1C40F', '#D35400', '#839192', '#34495E', '#5E565A'
];

function getColor() {
	colors.push(colors.shift());
	return colors[0];
}

class Logger {

	constructor(area = '') {
		this.area = area;
		// this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
		this.color = getColor();
	}

	log(message, ...rest) {
		const now = new Date();
		const params = [
			`%c [${now.toISOString()}] (${this.area}) ${message}`,
			`color: ${this.color}`,
			...rest
		];
		console.log.apply(null, params);
	}

}

export default Logger;
