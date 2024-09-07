addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#03c2fc",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expo = new Decimal(0)
        if (hasUpgrade('p', 15)) expo = expo.add(upgradeEffect('p', 15))

        
        if (expo.lte(new Decimal(0))) {
            expo = new Decimal(1)
        }
        return expo
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    upgrades: {
        11: {


            effect() {
                let logEff = new Decimal(1.5)

                if (hasUpgrade('p', 14)) {
                    let add = new Decimal(1).div(player.points.add(10).log(2))
                    logEff = new Decimal(1).add(add)
                }

                let effect = player.points.add(2).log(logEff)

                //if (new Decimal(effect).gte( 100 )) {
                //    effect = effect.sub(100)
                //    effect = effect.pow(.0001)
                //    effect = effect.add(100)
                //}

                return effect
            },


            title: "Point Inflation",
            cost: new Decimal(1),

            description() {
                let text = "Point gain is multiplied by itself at a slightly reduced rate."
                //if (new Decimal(effect()).gte(100)) {
                //    text = text + ' (softcapped)'
                //}
                return text
            },

            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },

        12: {
            title: "Exponential",
            description: "Raise point gain based on prestige points.",
            cost: new Decimal(5),

            effect() {
                let eff = player[this.layer].points.add(500).log(400)
                let dec = new Decimal(2)
                if (eff.gte(dec)) {
                    eff = eff.sub(dec)
                    eff = eff.pow(.01).sub(1)
                    eff = eff.add(dec)
                }

                return eff
            },
            effectDisplay() { return '^'+format(upgradeEffect(this.layer, this.id))}
        },

        13: {
            title: "Prestige Inflation",
            description: "Point gain boosts Prestige Point gain.",
            cost: new Decimal(10),
            


            effect() {
                return player.points.add(5).log(3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },

        14: {
            title: "Inflate Inflation",
            description: "Point Inflation effect is increased based on points.",
            cost: new Decimal(50),
        
            
        },

        15: {
            title: "Prestiged Exponential",
            description: "Raise Prestige Point gain based on points.",
            cost: new Decimal(250),
            


            effect() {
                return player.points.add(5100).log(2500).pow(.4)
            },
            effectDisplay() { return "^"+format(upgradeEffect(this.layer, this.id)) }
        },

        16: {
            title: "Prestige Buyable",
            description: "Unlock a buyable.",
            cost: new Decimal(300),
            
            
        },
    },

    buyables: {
        11: {
            cost(x) { return new Decimal(100).mul(new Decimal(5).pow(x))},
            title: 'More Points',
            display() { return "x1.5 points compounding per upgrade. Cost: "+format(this.cost())+' Purchased: '+format(getBuyableAmount(this.layer, this.id)) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                return new Decimal(1.5).pow(x)
            },
            unlocked() {
                if (hasUpgrade('p', 16)) {
                    return true
                }
                return false
            },
        },
        
    }
})
