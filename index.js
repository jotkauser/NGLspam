const figlet = require('figlet');
const prompt = require('prompt-sync')();
const colors = require('colors');
const uuid = require('uuid');
const axios = require('axios').default;
const fs = require('fs');
const { randomInt } = require('crypto');

const welcomeSplash = figlet.textSync("NGLspam").rainbow
const messageArray = fs.readFileSync("messages.txt").toString().split("\n")
console.log(welcomeSplash)

console.log("Welcome, please input the username that you want to spam.")
const username = prompt("> ")
console.log("How many different messages from messages.txt do you want to send?")
const messageCount = prompt("> ")
if (!parseInt(messageCount)) return console.log("Please input a number.")
console.log("Cooldown? (in ms)")
const cooldown = prompt("> ")
var sentMessages = 0
const sendNglMessage = async (username, message) => {
	const deviceUuid = uuid.v4()
	const req = await axios.post("https://ngl.link/api/submit", {
		deviceId: deviceUuid,
		username: username,
		question: message,
		gameSlug: "",
		refferer: ""
	}, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			"Sec-Fetch-Dest": "empty",
			"Sec-Fetch-Mode": "cors",
			"Sec-Fetch-Site": "same-origin"
		}
	})
	const status = req.status
	if (status !== 200)  throw new Error("Failed to send NGL message!")
}
// do it!
var interval; 
interval = setInterval(() => {
	const randomIndex = randomInt(0, messageArray.length - 1)
	sentMessages += 1
	sendNglMessage(username, messageArray[randomIndex])
	console.log(`Sent message ${sentMessages} out of ${messageCount}!`)
}, cooldown)
	