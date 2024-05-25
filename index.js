// REWRITE
const prompt = require("prompt-sync")();
const axios = require("axios");
const genUuid = require('uuid')
const config = require('./config.json')
const fs = require('fs')
require('colors')
// options
var sendFromMessageFile = false;
var randomizeUUID = true;
// data
var username = "Not set";
var message = "Not set";
var gameslug = ""
var amount = 0;
// splash
const splash = `

##    ##  ######   ##        ######  ########     ###    ##     ##    ##     ##  #######  
###   ## ##    ##  ##       ##    ## ##     ##   ## ##   ###   ###    ##     ## ##     ## 
####  ## ##        ##       ##       ##     ##  ##   ##  #### ####    ##     ##        ## 
## ## ## ##   #### ##        ######  ########  ##     ## ## ### ##    ##     ##  #######  
##  #### ##    ##  ##             ## ##        ######### ##     ##     ##   ##  ##        
##   ### ##    ##  ##       ##    ## ##        ##     ## ##     ##      ## ##   ##        
##    ##  ######   ########  ######  ##        ##     ## ##     ##       ###    ######### 

`;
function clearAndSplash() {
	console.clear();
	console.log(splash.green)
	
}
function mainMenu() {
	console.clear();
	console.log(splash.green)
	console.log(`👤 Username: ${username}\n💬 Message: ${message}\n🔄 Amount: ${amount}\n🎮 GameSlug: ${gameslug}`)
	console.log("🚀 Welcome to NGLspam v2, select what do you want to do:\n"
	+ "1. Spam\n"
	+ "2. Options\n"
	+ "3. Exit")
	const input = prompt("> ")
	if (input == "2") return optionsMenu();
	if (input == "1") return spamMenu();
	if (input == "3") return process.exit();
}
function optionsMenu() {
	clearAndSplash();
	console.log(`🚀 Options\n1. 🔢 Randomize UUID: ${randomizeUUID ? "Yes" : "No"}\n2. 💬 Send messages from messages.txt: ${sendFromMessageFile ? "Yes" : "No"}\n3. 🎮 Change the GameSlug\n` +
	"4. ❌ Go back")
	const input = prompt("> ")
	if (input == 1) {
		randomizeUUID = !randomizeUUID
		optionsMenu();
	} else if (input == 2) {
		sendFromMessageFile = !sendFromMessageFile
		message = "From messages.txt"
		optionsMenu();
	} else if (input == 4) {
		mainMenu();
	} else if (input == 3) {
		gameSlugMenu();
	}

}

function gameSlugMenu() {
	clearAndSplash();
	const gameSlugs = ["confess", "3words", "neverhave", "tbh", "shipme", "yourcrush", "cancelled", "dealbreaker", "default"]
	console.log("🎮 Select the gameslug you want to use:")
	console.log(gameSlugs.map((gameSlug, index) => `${index + 1}. ${gameSlug}`).join("\n"))

	const input = prompt("> ")
	if (input === "default") {
		gameslug = ""
		mainMenu();
	} else {
		if (!gameSlugs.includes(input)) {
			console.log("❌ Invalid input")
			gameSlugMenu();
		}
		gameslug = gameSlugs[gameSlugs.indexOf(input)]
		mainMenu();
	}
}

function spamMenu() {
	clearAndSplash();
	console.log(`👤 Please set the username that you want to spam:`)
	username = prompt("> ")
	if (message === "From messages.txt") {
		console.log("💬 The tool send random messages from messages.txt")
	} else {
		console.log("💬 Please set the message that you want to spam")
		message = prompt("> ")
	}
	console.log("🔄 Please set the amount of messages that you want to spam:")
	amount = parseInt(prompt("> "))
	if (isNaN(amount)) {
		console.log("❌ Please enter a number")
		console.log("🔄 Please set the amount of messages that you want to spam:")
		amount = parseInt(prompt("> "))
	}
	clearAndSplash();
	console.log("🚀 Review your settings\n"+
	`👤 Username: ${username}\n💬 Message: ${message}\n🔄 Amount: ${amount}`)
	console.log(`1. Start spamming\n2. Cancel`)
	const input = prompt("> ")
	if (input == 1) {
		spam(username, amount, randomizeUUID, sendFromMessageFile, message);
	} else if (input == 2) {
		mainMenu();
	}
}
function spam(username, amount, randomizeUUID, sendFromMessageFile, message) {
	var howManySent = 0
	let interval = setInterval(() => {
		var uuid;
		if (howManySent >= amount) {
			clearInterval(interval);
			console.log("✅ Spam finished")
			console.log("⌨ Press any key to continue.")
			const input = prompt("> ")
			return mainMenu();
		}
		if (randomizeUUID) {
			uuid = genUuid.v4();
		} else {
			uuid = config.uuid
		}
		if (!sendFromMessageFile) {
			axios.default.post("https://ngl.link/api/submit", {
				username: username,
				question: message,
				deviceId: uuid,
				gameSlug: gameslug
			}).then(res => {
				console.log(`${"[+]".green} Sent message no. ${howManySent}`)
			})
		} else {
			const messagesFile = fs.readFileSync("messages.txt").toString().replaceAll("\r", "").split("\n");
			if (messagesFile.length === 0) {
				console.log("❌ No messages in messages.txt")
				clearInterval(interval)
				console.log("⌨ Press any key to continue.")
				const input = prompt("> ")
				if (input) {
					return mainMenu();
				}
			}
			if (randomizeUUID) {
				uuid = genUuid.v4();
			} else {
				uuid = config.uuid
			}
			axios.default.post("https://ngl.link/api/submit", {
				username: username,
				question: messagesFile[Math.floor(Math.random() * messagesFile.length)],
				deviceId: uuid,
				gameSlug: gameslug || ""
			}).then(res => {
				console.log(`${"[+]".green} Sent message no. ${howManySent}`)
			})
		}
		howManySent += 1
	}, config.delay)
}

mainMenu();