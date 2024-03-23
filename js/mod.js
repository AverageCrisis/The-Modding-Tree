let modInfo = {
	name: "The Point Tree",
	id: "pointtreeincrementalgame",
	author: "lucas",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Things",
}

let changelog = `<h1>Changelog:</h1><br>
	<br>
	<h3>v0.1</h3><br>
		- Added rebirth points.<br>
		- Added quarks.<br>
		- Added 3 Supremacy Milestones<br>
		<br>
		<br>
	<h3>v0.0</h3><br>
		- Added points.<br>
		- Added enhance points.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)

	if (hasUpgrade('e', 11)) gain = gain.times(2) // If they have upgrade 11 then they get double

	if (hasUpgrade('e', 12)) {
		
		gain = gain.times(upgradeEffect('e', 12))
		
	}
	

	if (hasUpgrade('e', 14)) gain = gain.times(upgradeEffect('e', 14))

	if (hasUpgrade('e', 17)) gain = gain.pow(1.02)

	if (hasUpgrade('e', 18)) gain = gain.times(2)

	
	let thiseffect = new Decimal(1)

	if (hasMilestone('r', 6)) {
		thiseffect = player.r.points.add(1).pow(.65)
	} else {
		if (hasMilestone('r', 0)) thiseffect = player.r.points.add(1).pow(.6)
	}

	if (thiseffect.gte(100000)) {
		if(hasUpgrade('q', 19)) {
			thiseffect = thiseffect.sub(100000).pow(.6).add(100000)
		} else { 
			thiseffect = thiseffect.sub(100000).pow(.5).add(100000)
		}
	}

	gain = gain.times(thiseffect)

	if (hasUpgrade('e', 22)) gain = gain.times(10)

	if (hasUpgrade('q', 11)) gain = gain.times(5)
	
	let e2 = new Decimal(1)

	if (hasMilestone('q', 4)) e2 = player.q.points.add(1).pow(.6)
	if (hasUpgrade('q', 15)) e2 = player.q.points.add(1).pow(.8)

	if (e2.gte(new Decimal(1e8))) {
		e2 = e2.sub(new Decimal(1e8)).pow(.5).add(new Decimal(1e8))
	}

	gain = gain.times(e2)

	if (hasUpgrade('q', 14)) gain = gain.times(10000)

	gain = gain.times(buyableEffect('q', 11))
	gain = gain.pow(buyableEffect('q', 14))

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}