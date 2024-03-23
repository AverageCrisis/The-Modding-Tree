addLayer("e", {
    name: "enhance", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#f63222",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "enhance points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    branches: ['e', "r"],
    gainMult() {
        let mult = new Decimal(1)

        if (hasUpgrade('e', 13)) mult = mult.times(upgradeEffect('e', 13))
        if (hasUpgrade('e', 15)) mult = mult.times(2)
        if (hasUpgrade('e', 18)) mult = mult.times(2)
        if (hasMilestone('r', 1)) mult = mult.times(3)
        if (hasUpgrade('q', 11)) mult = mult.times(2)
        if (hasMilestone('q', 3)) mult = mult.times(player.q.points.add(1).pow(.55))
        if (hasUpgrade('q', 12)) mult = mult.times(upgradeEffect('q', 12))

        mult = mult.times(buyableEffect('q', 12))

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        if (hasMilestone('r', 2)) {
            return new Decimal(1.02)
        }
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E: Reset for enhance points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {

        11: {
            title: "Double Trouble",
            description: "Double your point gain.",
            cost: new Decimal(1),
        },


        12: {
            title: "Compounding Compounders I",
            description: "Increase point gain based on enhance points.",
            cost: new Decimal(2),

            effect() {
                let effect = player[this.layer].points.add(1).pow(0.5)
                if (effect.gte(100000)) {
                    effect = effect.sub(100000).pow(.6).add(100000)
                }
                if (effect.gte(300000)) {
                    if (!hasMilestone('q', 9)) {
                        effect = effect.sub(300000).pow(.6).add(300000)
                    } else {
                        effect = effect.sub(300000).pow(.85).add(300000)
                    }
                    
                }
                if (effect.gte(1e10)) {
                    if (true) {
                        effect = effect.sub(1e10).pow(.7).add(1e10)
                    } else {
                        effect = effect.sub(300000).pow(.6).add(300000)
                    }
                    
                }

                return effect
            },
            
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" } , // Add formatting to the effect
        },
        
        13: {
            title: "Compounding Compounders II",
            description: "Increase enhance point gain based on points.",
            cost: new Decimal(5),
            
            effect() {
                let effect = player.points.add(1).pow(0.15)

                if (effect.gte(500)) {
                    effect = effect.sub(500).pow(.6).add(500)
                }

                if (effect.gte(10000)) {
                    effect = effect.sub(10000).pow(.6).add(10000)
                }

                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        
        14: {
            title: "Scaling Points",
            description: "Increase point gain based on points.",
            cost: new Decimal(10),
            
            effect() {
                let effect = player.points.add(1).pow(0.1)
                
                if (hasUpgrade('e', 16)) effect = player.points.add(1).pow(0.2)
                if (hasUpgrade('e', 21)) effect = player.points.add(1).pow(0.3)
                
                if (effect.gte(10000)) {
                    effect = effect.sub(10000).pow(.65).add(10000)
                }
                if (effect.gte(20000)) {
                    effect = effect.sub(20000).pow(.6).add(20000)
                }
                if (effect.gte(1000000)) {
                    effect = effect.sub(1000000).pow(.6).add(1000000)
                }

                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        15: {
            title: "Double Enhancement",
            description: "Double your enhance point gain.",
            cost: new Decimal(15),
            
        },

        16: {
            title: "Improving Scaling",
            description: "Make Scaling Points better.",
            cost: new Decimal(40),
            
        },

        17: {
            title: "Exponential Gain",
            description: "Points^1.02",
            cost: new Decimal(80),
            
        },
        18: {
            title: "Boost",
            description: "x2 Points + x2 Enhance Points.",
            cost: new Decimal(120),
            
        },

        19: {
            title: "More Rebirth",
            description: "1.33x Rebirth Points",
            cost: new Decimal(50000000),
            unlocked() {
                if (hasMilestone('r', 8)) {return true}
                return false
            },
        },

        //jtjtyj

        21: {
            title: "Improving Scaling II",
            description: "Make Scaling Points better again.",
            cost: new Decimal(500000000),
            unlocked() {
                if (hasMilestone('r', 8)) {return true}
                return false
            },
        },

        22: {
            title: "OP Upgrade I",
            description: "10x Points",
            cost: new Decimal(1000000000),
            unlocked() {
                if (hasMilestone('r', 8)) {return true}
                return false
            },
        },
    },

    milestones: {
        0: {
            requirementDescription: "150 Enhance Points",
            effectDescription: "Unlock a new layer.",
            done() { return player.e.points.gte(150) }
        },
        1: {
            requirementDescription: "1.5e8 Enhance Points",
            effectDescription: "Unlock 2 Rebirth Upgrades.",
            cost: new Decimal(150000000),
            unlocked() {
                if (hasMilestone('r', 8)) {return true}
                return false
            },
            done() { return (player.e.points.gte(150000000) && hasMilestone('r', 8)) }
        },
    },

    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        
        if (layers[resettingLayer].row <= this.row) return;
        
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptMilestones = []
        if (true) keptMilestones.push(0)
        if (hasMilestone('r', 8) && player.e.points.gte(150000000)) keptMilestones.push(1)

        let keptUpgrades = []
        if (hasMilestone('r', 3)) {keptUpgrades.push(11); keptUpgrades.push(12); keptUpgrades.push(13); keptUpgrades.push(14)}
        if (hasMilestone('r', 7)) {keptUpgrades.push(15); keptUpgrades.push(16); keptUpgrades.push(17); keptUpgrades.push(18)}
        if (hasUpgrade('r', 14)) {keptUpgrades.push(19); keptUpgrades.push(21); keptUpgrades.push(22)}
        
        
        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];
        if (hasMilestone('q', 7)) keep.push("upgrades");
        if (hasMilestone('q', 8)) keep.push("milestones");
        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);
      
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].milestones.push(...keptMilestones)
        player[this.layer].upgrades.push(...keptUpgrades)
      },


    passiveGeneration() {
        if (hasMilestone('q', 6)) {return 10}
        if (hasMilestone('q', 0)) {return 1}
        if (hasUpgrade('r', 13)) {return .5}
        if (hasUpgrade('r', 12)) {return .2}
        return 0
    },
})


addLayer("r", {
    name: "rebirth", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#8e4cee",
    requires: new Decimal(200), // Can be a function that takes requirement increases into account
    resource: "rebirth points", // Name of prestige currency
    baseResource: "enhance points", // Name of resource prestige is based on

    baseAmount() {return player.e.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    branches: ['r', "q"],
    gainMult() {
        let mult = new Decimal(1)

        if (hasUpgrade('r', 11)) mult = mult.times(1.33)

        if (hasUpgrade('e', 19)) mult = mult.times(1.33)

        if (hasUpgrade('r', 15)) mult = mult.times(2)

        if (hasUpgrade('q', 11)) mult = mult.times(1.5)

        if (hasMilestone('q', 1)) mult = mult.times(player.q.points.add(1).pow(.5))

        
        if (hasMilestone('q', 13)) mult = mult.times(upgradeEffect('q', 13))

        mult = mult.times(buyableEffect('q', 13))

        if (mult.gte(1e11)) {
            mult = mult.sub(1e11).pow(.8).add(1e11)
        }

        return mult
    },

    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    row: 1, // Row the layer is in on the tree (0 is the first row)

    hotkeys: [
        {key: "r", description: "R: Reset for rebirth points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],


    layerShown() {
        if (!hasMilestone('e', 0)) {    
            return false
        }
        return true
    },

    
    milestones: {
        0: {
            requirementDescription: "1 Rebirth Point",
            effectDescription() {
                let effect = new Decimal(1)
                

	            if (hasMilestone('r', 6)) {
		            effect = player.r.points.add(1).pow(.65)
	            } else {
		            if (hasMilestone('r', 0)) effect = player.r.points.add(1).pow(.6)
	            }

	            if (effect.gte(100000)) {
                    if(hasUpgrade('q', 19)) {
                        effect = effect.sub(100000).pow(.6).add(100000)
                    } else { 
		                effect = effect.sub(100000).pow(.5).add(100000)
                    }
                }
                
                if (effect.gte(new Decimal(1e14))) {
                    effect = effect.sub(new Decimal(1e14)).pow(.8).add(new Decimal(1e14))
                }

                return 'Rebirth points boost points. Currently: ' + format(effect) + 'x'
            },

            done() { return player.r.points.gte(1)},

        },
        1: {
            requirementDescription: "2 Rebirth Points",
            effectDescription: "3x Enhance Points",
            done() { return player.r.points.gte(2) }
        },
        2: {
            requirementDescription: "5 Rebirth Points",
            effectDescription: "Enhance point gain ^1.02",
            done() { return player.r.points.gte(5) }
        },
        3: {
            requirementDescription: "10 Rebirth Points",
            effectDescription: "Keep the first 4 enhance upgrades on rebirth.",
            done() { return player.r.points.gte(10) }
        },
        4: {
            requirementDescription: "35 Rebirth Points",
            effectDescription: "Unlock a rebirth upgrade.",
            done() { return player.r.points.gte(35) }
        },
        5: {
            requirementDescription: "200 Rebirth Points",
            effectDescription: "Unlock a rebirth upgrade.",

            done() { return player.r.points.gte(200) }
        },
        6: {
            requirementDescription: "350 Rebirth Points",
            effectDescription: "Improve first milestone.",

            done() { return player.r.points.gte(350) }
        },
        7: {
            requirementDescription: "750 Rebirth Points",
            effectDescription: "Keep the next 4 enhance upgrades on rebirth.",

            done() { return player.r.points.gte(750) }
        },
        8: {
            requirementDescription: "1,300 Rebirth Points",
            effectDescription: "Unlock 3 more enhance upgrades and 1 enhance milestone.",

            done() { return player.r.points.gte(1300) }
        },
        9: {
            requirementDescription: "100,000 Rebirth Points",
            effectDescription: "Unlock 2 new rebirth upgrades.",

            unlocked() {
                if (hasMilestone('e', 1)) {return true}
                return false
            },

            done() { return player.r.points.gte(100000) }
        },
        10: {
            requirementDescription: "500,000 Rebirth Points",
            effectDescription: "Unlock a new layer.",

            unlocked() {
                if (hasMilestone('r', 9) || hasMilestone('q', 0)) {return true}
                return false
            },
            done() { return player.r.points.gte(500000) }
            
        },
    },

    upgrades: {

        11: {
            title: "Rebirthing Increase",
            description: "1.33x Rebirth Points",
            cost: new Decimal(50),

            unlocked() {
                if (hasMilestone('r', 4)) {return true}
                return false
            }

        },


        12: {
            title: "Generation I",
            description: "Generate enhance points at a rate of 20%.",
            cost: new Decimal(150),

            unlocked() {
                if (hasMilestone('r', 5)) {return true}
                return false
            },

            
        },

        13: {
            title: "Generation II",
            description: "Generate enhance points at a rate of 50%.",
            cost: new Decimal(1000),

            unlocked() {
                if (hasMilestone('e', 1)) {return true}
                return false
            },

            
        },

        14: {
            title: "Keep it going",
            description: "Keep the next 3 enhance upgrades.",
            cost: new Decimal(10000),

            unlocked() {
                if (hasMilestone('e', 1)) {return true}
                return false
            },

            
        },

        15: {
            title: "Rebirthing Increase II",
            description: "2x Rebirth Points",
            cost: new Decimal(50000),

            unlocked() {
                if (hasMilestone('r', 9)) {return true}
                return false
            },

            
        },

        
    },

    passiveGeneration() {
        if (hasMilestone('q', 16)) {return 10}
        if (hasUpgrade('q', 17)) {return 1}
        if (hasMilestone('q', 6)) {return .15}
        return 0
    },

    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        
        if (layers[resettingLayer].row <= this.row) return;
        
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        //let keptMilestones = []
        //if (true) keptMilestones.push(0)
        
        let keptMilestones = []
        
        keptMilestones.push(10)
        
        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];
        if (hasMilestone('q', 7)) keep.push("upgrades");
        if (hasMilestone('q', 8)) keep.push("milestones");
        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);
      
        // Stage 5, add back in the specific subfeatures you saved earlier
        //player[this.layer].milestones.push(...keptMilestones)
        player[this.layer].milestones.push(...keptMilestones)
      },

})


addLayer("q", {
    name: "quark", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4ee1fa",
    requires: new Decimal(100000), // Can be a function that takes requirement increases into account
    resource: "quarks", // Name of prestige currency
    baseResource: "rebirth points", // Name of resource prestige is based on
    baseAmount() {return player.r.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.2, // Prestige currency exponent
    branches: ['q', "s"],
    gainMult() {
        let mult = new Decimal(1)
        if (hasMilestone('q', 2)) {
            mult = mult.times(1.25)
        }

        if (hasMilestone('q', 5)) {
            if (hasUpgrade('q', 16)) {
                mult = mult.times(player.q.points.add(1).pow(.130))
            } else {
                mult = mult.times(player.q.points.add(1).pow(.082))
            }
            
        }

        if (hasMilestone('q', 12)) {
            mult = mult.times(2)
        }


        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "q", description: "Q: Reset for quarks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown() {
        if (hasMilestone('r', 10) || hasMilestone('q', 0)) {
             
            return true
        }
        return false
    },

    milestones: {
        0: { //
            requirementDescription: "1 Quarks",
            effectDescription: 'Generate enhance points at 100% per second',

            done() { return player.q.points.gte(1)},

        },
        1: {
            requirementDescription: "2 Quarks",

            effectDescription() {
                let effect = new Decimal(1)
                
	            if (hasMilestone('q', 1)) effect = player.q.points.add(1).pow(.5)
                
                

                return 'Quarks boost rebirth points at a reduced rate. Currently: ' + format(effect) + 'x'
            },

            done() { return player.q.points.gte(2)},

        },
        2: { //
            requirementDescription: "3 Quarks",
            effectDescription: 'Quarks are 1.25x easier to get.',

            done() { return player.q.points.gte(3)},

        },
        3: { //
            requirementDescription: "5 Quarks",


            effectDescription() {
                let effect = new Decimal(1)
                
	            if (hasMilestone('q', 3)) effect = player.q.points.add(1).pow(.55)
                
                

                return 'Quarks boost enhance points at a reduced rate. Currently: ' + format(effect) + 'x'
            },

            done() { return player.q.points.gte(5)},

        },
        4: { //
            requirementDescription: "10 Quarks",

            effectDescription() {
                let effect = new Decimal(1)
                
	            if (hasMilestone('q', 4)) effect = player.q.points.add(1).pow(.6)
	            if (hasUpgrade('q', 15)) effect = player.q.points.add(1).pow(.8)
                
                if (effect.gte(new Decimal(1e8))) {
                    effect = effect.sub(new Decimal(1e8)).pow(.5).add(new Decimal(1e8))
                }

                return 'Quarks boost points at a reduced rate. Currently: ' + format(effect) + 'x'
            },
            

            done() { return player.q.points.gte(10)},

        },
        5: { //
            requirementDescription: "25 Quarks",

            
            effectDescription() {
                let effect = new Decimal(1)
                if (hasMilestone('q', 5)) {
                    if (hasUpgrade('q', 16)) {
                        effect = player.q.points.add(1).pow(.130)
                    } else {
                        effect = player.q.points.add(1).pow(.082)
                    }
                    
                }
                // Fix softcap add more soft caps test the entire game
                if (effect.gte(new Decimal(10))) {
                    effect = effect.sub(new Decimal(10)).pow(.5).add(new Decimal(10))
                }

                return 'Quarks boost quarks at a reduced rate. Currently: ' + format(effect) + 'x'
            },
            

            
            unlocked() {
                if (hasUpgrade('q', 13)) {return true}
                return false
            },

            done() { return player.q.points.gte(25)},

        },
        6: { //
            requirementDescription: "40 Quarks",
            effectDescription: 'Generate enhance points 10x faster, and generate rebirth points at 15% a second.',

            
            unlocked() {
                if (hasUpgrade('q', 13)) {return true}
                return false
            },

            done() { return player.q.points.gte(40)},

        },

        7: { //
            requirementDescription: "50 Quarks",
            effectDescription: 'Keep all enhance and rebirth upgrades.',

            
            unlocked() {
                if (hasUpgrade('q', 13)) {return true}
                return false
            },

            done() { return player.q.points.gte(50)},

        },
        8: { //
            requirementDescription: "100 Quarks",
            effectDescription() {
                return 'Keep all enhance and rebirth milestones.'
            },
            

            unlocked() {
                if (hasUpgrade('q', 13)) {return true}
                return false
            },

            done() { return player.q.points.gte(100)},

        },
        9: { //
            requirementDescription: "1,500 Quarks",
            effectDescription() {
                return 'Decreases the Compounding Compounders I softcap harshness.'
            },
            

            unlocked() {
                if (hasUpgrade('q', 16)) {return true}
                return false
            },

            done() { return player.q.points.gte(1500)},

        },
        10: { //
            requirementDescription: "2,500 Quarks",
            effectDescription() {
                return 'Unlock a buyable.'
            },
            

            unlocked() {
                if (hasUpgrade('q', 16)) {return true}
                return false
            },

            done() { return player.q.points.gte(2500)},

        },
        11: { //
            requirementDescription: "5,000 Quarks",
            effectDescription() {
                return 'Unlocks another buyable, and makes the first buyable cost cheaper.'
            },
            

            unlocked() {
                if (hasUpgrade('q', 16)) {return true}
                return false
            },

            done() { return player.q.points.gte(5000)},

        },

        12: { //
            requirementDescription: "7,500 Quarks",
            effectDescription() {
                return '2x Quarks'
            },
            

            unlocked() {
                if (hasMilestone('q', 11)) {return true}
                return false
            },

            done() { return player.q.points.gte(7500)},

        },

        13: { //
            requirementDescription: "10,000 Quarks",
            effectDescription() {
                return 'Unlock another buyable, and make the first 2 buyable costs cheaper.'
            },
            

            unlocked() {
                if (hasMilestone('q', 11)) {return true}
                return false
            },

            done() { return player.q.points.gte(10000)},

        },

        14: { //
            requirementDescription() { return (format(new Decimal(1e6)) + " Quarks") },
            effectDescription() {
                return 'Autobuy the other 2 buyables without spending Quarks, and unlock another buyable.'
            },
            

            unlocked() {
                if (hasUpgrade('q', 19)) {return true}
                return false
            },

            done() { return player.q.points.gte(new Decimal(1e6))},

        },
        15: { //
            requirementDescription() { return (format(new Decimal(5e7)) + " Quarks") },
            effectDescription() {
                return 'Unlock a new layer.'
            },
            

            unlocked() {
                if (hasMilestone('q', 14)) {return true}
                return false
            },

            done() { return player.q.points.gte(new Decimal(5e7))},

        },
        16: { //
            requirementDescription() { return (format(new Decimal(5e8)) + " Quarks") },
            effectDescription() {
                return '1.5x Supremity, 10x Rebirth Point Generation.'
            },
            

            unlocked() {
                if (hasMilestone('s', 2)) {return true}
                return false
            },

            done() { if (!hasMilestone('s', 2)) {return false}
                return player.q.points.gte(new Decimal(5e8))},

        },
    },

    upgrades: {

        11: {
            title: "A quark well spent.",
            description: "5x points, 2x enhance points, 1.5x rebirth points.",
            cost: new Decimal(1),

            

        },


        12: {
            title: "Whats this gotta do with quarks?",
            description: "Rebirth points boost enhance points at a reduced rate.",
            cost: new Decimal(5),

            effect() {
                let effect = player.r.points.add(1).pow(.4)
                
                if (effect.gte(100000)) {
                    effect = effect.sub(100000).pow(.85).add(100000)
                }

                if (effect.gte(new Decimal(1e14))) {
                    effect = effect.sub(new Decimal(1e14)).pow(.5).add(new Decimal(1e14))
                }

                return effect
            },
            
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" } , // Add formatting to the effect

            
            unlocked() {
                if (hasMilestone('q', 4)) {return true}
                return false
            },

        },

        
        13: {
            title: "Rebirth Overload",
            description: "Points boost rebirth points at a heavily reduced rate.",
            cost: new Decimal(10),

            effect() {
                let effect = player.points.add(1).pow(.03)
                
                return effect
            },
            
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" } , // Add formatting to the effect

            unlocked() {
                if (hasMilestone('q', 4)) {return true}
                return false
            },

        },

        14: {
            title: "Its raining points",
            description: "10,000x Points",
            cost: new Decimal(200),

            
            unlocked() {
                if (hasMilestone('q', 8)) {return true}
                return false
            },

        },

        15: {
            title: "Milestone Booster I",
            description: "Boost the 10 quark milestone.",
            cost: new Decimal(300),

            
            unlocked() {
                if (hasMilestone('q', 8)) {return true}
                return false
            },

        },

        16: {
            title: "Milestone Booster II",
            description: "Boost the 25 quark milestone.",
            cost: new Decimal(500),

            
            unlocked() {
                if (hasMilestone('q', 8)) {return true}
                return false
            },

        },

        17: {
            title: "Generate Maxima",
            description: "Generate 100% rebirth points per second.",
            cost: new Decimal(9001),

            
            unlocked() {
                if (hasMilestone('q', 13)) {return true}
                return false
            },

        },

        18: {
            title: "Thank Me Later",
            description: "Make the 3rd quark buyable cheaper, and autobuy Quark Point Booster without spending Quarks.",
            cost: new Decimal(15000),

            
            unlocked() {
                if (hasUpgrade('q', 17)) {return true}
                return false
            },

        },
        

        19: {
            title: "Wont miss you!",
            description: "Make the first rebirth milestone softcap less softcappy.",
            cost: new Decimal(50000),

            
            unlocked() {
                if (hasUpgrade('q', 17)) {return true}
                return false
            },

        },
    },
    
    buyables: {
        11: {
            cost() { 
                let cost = new Decimal(350).times(  (getBuyableAmount(this.layer, this.id).add(1).pow(2.5)) ) 
                if (hasMilestone('q', 11)) {
                    cost = cost.pow(.95)
                }
                if (hasMilestone('q', 13)) {
                    cost = cost.pow(.9)
                }
                return cost
            },
            title() {
                let maxed = 10
                if (getBuyableAmount(this.layer, this.id).gte(maxed)) {return "Quark Point Booster (MAXED)"}
                return "Quark Point Booster"
            },
            display() { return "Quarks boost point gain. Currently: " + format(this.effect()) + 'x' + " The cost is " + format(this.cost()) + ' Quarks.'},
            canAfford() {
                let maxed = 10
                if (getBuyableAmount(this.layer, this.id).gte(maxed)) {
                    return false
                }
                return player[this.layer].points.gte(this.cost()) 
            },

            effect() {
                return new Decimal(2).pow(getBuyableAmount(this.layer, this.id))
            },
            
            buy() {
                if (!hasUpgrade('q', 18)) {
                    player[this.layer].points = player[this.layer].points.sub(this.cost())
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            
            unlocked() {
                if (hasMilestone('q', 10)) {
                    return true
                } 
                return false
                
            },
        },
        
        12: {
            cost() { 
                let cost = new Decimal(1500).times(  (getBuyableAmount(this.layer, this.id).add(1).pow(2.3)) ) 
                if (hasMilestone('q', 13)) {
                    cost = cost.pow(.95)
                }
                return cost
            },

            title() {
                let maxed = 10
                if (getBuyableAmount(this.layer, this.id).gte(maxed)) {return "Quark Enhance Point Booster (MAXED)"}
                return "Quark Enhance Point Booster"
            },
            display() { return "Quarks boost enhance point gain. Currently: " + format(this.effect()) + 'x' + " The cost is " + format(this.cost()) + ' Quarks.'},

            canAfford() {
                let maxed = 10
                if (getBuyableAmount(this.layer, this.id).gte(maxed)) {
                    return false
                }
                return player[this.layer].points.gte(this.cost()) 
            },

            effect() {
                return new Decimal(2).pow(getBuyableAmount(this.layer, this.id))
            },
            
            buy() {

                if (!hasMilestone('q', 14)) {
                    player[this.layer].points = player[this.layer].points.sub(this.cost())
                }

                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            
            unlocked() {
                if (hasMilestone('q', 11)) {
                    return true
                } 
                return false
                
            },
        },


        13: {
            cost() { 
                let cost = new Decimal(5000).times(  (getBuyableAmount(this.layer, this.id).add(1).pow(2.3)) ) 
                if (hasUpgrade('q', 18)) {
                    cost = cost.pow(.95)
                }
                return cost
            },

            title() {
                let maxed = 10
                if (getBuyableAmount(this.layer, this.id).gte(maxed)) {return "Quark Rebirth Point Booster (MAXED)"}
                return "Quark Rebirth Point Booster"
            },
            display() { return "Quarks boost rebirth point gain. Currently: " + format(this.effect()) + 'x' + " The cost is " + format(this.cost()) + ' Quarks.'},
            canAfford() {
                let maxed = 10
                if (getBuyableAmount(this.layer, this.id).gte(maxed)) {
                    return false
                }
                return player[this.layer].points.gte(this.cost()) 
            },

            effect() {
                return new Decimal(2).pow(getBuyableAmount(this.layer, this.id))
            },
            
            buy() {

                if (!hasMilestone('q', 14)) {
                    player[this.layer].points = player[this.layer].points.sub(this.cost())
                }
                
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            
            unlocked() {
                if (hasMilestone('q', 13)) {
                    return true
                } 
                return false
                
            },
        },

        14: {
            cost() { 
                let cost = new Decimal(1000000).times(  (getBuyableAmount(this.layer, this.id).add(1).pow(3)) )
                if (true) {
                    cost = cost.pow(1)
                }
                return cost
            },

            title() {
                let maxed = 10
                if (getBuyableAmount(this.layer, this.id).gte(maxed)) {return "Quark Point Booster II (MAXED)"}
                return "Quark Point Booster II"
            },
            display() { return "Quarks boost point gain. Currently: ^" + format(this.effect()) + ". The cost is " + format(this.cost()) + ' Quarks.'},
            canAfford() {
                let maxed = 10
                if (getBuyableAmount(this.layer, this.id).gte(maxed)) {
                    return false
                }
                return player[this.layer].points.gte(this.cost()) 
            },

            effect() {
                let count = getBuyableAmount(this.layer, this.id).div(100)
                return new Decimal(1).add(count)
            },
            
            buy() {

                //if (!hasMilestone('q', 14)) {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                //}
                
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            
            unlocked() {
                if (hasMilestone('q', 14)) {
                    return true
                } 
                return false
                
            },
        },


    },  

    automate() {
        if (hasUpgrade('q', 18)) buyBuyable('q', 11)
        if (hasMilestone('q', 14)) buyBuyable('q', 12)
        if (hasMilestone('q', 14)) buyBuyable('q', 13)
    },


    passiveGeneration() {
        if (hasMilestone('s', 1)) {
            if (player.s.points.gte(10000)) {
                return 100 // Cap at 10000% a second.
            }
            return player.s.points.div(100)
        }
        
        if (hasMilestone('s', 0)) return .05
        return 0
    },
})



addLayer("s", {
    name: "supreme", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Su", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ff875d",
    requires: new Decimal(1e30), // Can be a function that takes requirement increases into account
    resource: "supremity", // Name of prestige currency
    baseResource: "rebirth points", // Name of resource prestige is based on
    baseAmount() {return player.r.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.08, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1)
        if (hasMilestone('q', 16)) {
            mult = mult.times(1.5)
        }

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for supremity", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown() {
        if (hasMilestone('q', 15)) {
             
            return true
        }
        return false
    },

    milestones: {
        0: { //
            requirementDescription() { return (format(new Decimal(2e1)) + " Supremity") },
            effectDescription() {
                return 'Generate quarks at a rate of 5%.'
            },
            

            unlocked() {
                if (true) {return true}
                // return false
            },

            done() { return player.s.points.gte(new Decimal(2e1))},

        },
        1: { //
            requirementDescription() { return (format(new Decimal(5e1)) + " Supremity") },
            effectDescription() {
                return 'Generate quarks based on supremity.'
            },
            

            unlocked() {
                if (true) {return true}
                // return false
            },

            done() { return player.s.points.gte(new Decimal(5e1))},

        },
        2: { //
            requirementDescription() { return (format(new Decimal(7.5e1)) + " Supremity") },
            effectDescription() {
                return 'Unlock a new quark milestone.'
            },
            

            unlocked() {
                if (true) {return true}
                // return false
            },

            done() { return player.s.points.gte(new Decimal(7.5e1))},

        },
    },

    
})