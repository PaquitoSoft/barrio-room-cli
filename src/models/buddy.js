class Buddy {
	constructor(buddyInfo) {
		this.userData = buddyInfo;
		this.peer = undefined;
		this.stream = undefined;
	}

	setPeer(peer) {
		this.peer = peer;
	}

	setStream(stream) {
		this.stream = stream;
	}
}

export default Buddy;
