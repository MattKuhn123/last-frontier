// --- Mission Definitions ---
export const missions = [
    {
        id: 1,
        title: "Routine Patrol",
        briefing: [
            { speaker: "HQ", text: "Cole, patrol sector 7-G. Routine sweep." },
            { speaker: "HQ", text: "Should be quiet out there. Clear the debris and report back." }
        ],
        asteroidCount: 4,
        asteroidSizes: [3],
        enemies: 0,
        enemySpawnInterval: 0,
        enemyType: 'normal',
        wingmanAvailable: false,
        wingmanType: null,
        objective: "clear",
        surviveTime: null,
        completionDialogue: [
            { speaker: "HQ", text: "Sector clear. Clean work, Cole." },
            { speaker: "HQ", text: "Head back in. We've got another assignment brewing." }
        ]
    },
    {
        id: 2,
        title: "The Attack",
        briefing: [
            { speaker: "HQ", text: "Cole, we're picking up unknown contacts in your sector." },
            { speaker: "HQ", text: "Confirmed Syndicate signatures. This is not a drill. Engage at will." }
        ],
        asteroidCount: 3,
        asteroidSizes: [3, 2],
        enemies: 3,
        enemySpawnInterval: 300,
        enemyType: 'normal',
        wingmanAvailable: false,
        wingmanType: null,
        objective: "clear",
        surviveTime: null,
        completionDialogue: [
            { speaker: "HQ", text: "Hostiles down. Good shooting." },
            { speaker: "HQ", text: "What the Syndicate was doing out here... we don't know yet. Return to base." }
        ]
    },
    {
        id: 3,
        title: "Rally Point",
        briefing: [
            { speaker: "HQ", text: "We're assigning you a wingman. Callsign Sierra. Rendezvous at rally point Theta." },
            { speaker: "HQ", text: "Sierra is combat-rated. Let them do their job." },
            { speaker: "SIERRA", text: "Sierra on station. Ready." }
        ],
        asteroidCount: 5,
        asteroidSizes: [3, 2],
        enemies: 2,
        enemySpawnInterval: 360,
        enemyType: 'normal',
        wingmanAvailable: true,
        wingmanType: 'sierra',
        objective: "clear",
        surviveTime: null,
        completionDialogue: [
            { speaker: "SIERRA", text: "Sector clear. Holding position." },
            { speaker: "HQ", text: "Good. We're going to need all hands for what's coming." }
        ]
    },
    {
        id: 4,
        title: "Supply Run",
        briefing: [
            { speaker: "HQ", text: "Supply convoy needs escort through the belt. Keep them alive for 60 seconds." },
            { speaker: "HQ", text: "It's going to be tight in there. Stay sharp." },
            { speaker: "SIERRA", text: "Sierra standing by." }
        ],
        asteroidCount: 6,
        asteroidSizes: [3, 2, 1],
        enemies: 4,
        enemySpawnInterval: 240,
        enemyType: 'normal',
        wingmanAvailable: true,
        wingmanType: 'sierra',
        objective: "survive",
        surviveTime: 60,
        completionDialogue: [
            { speaker: "HQ", text: "Convoy is through. Good work." },
            { speaker: "SIERRA", text: "Confirmed. All clear." }
        ]
    },
    {
        id: 5,
        title: "Reinforcements",
        briefing: [
            { speaker: "HQ", text: "Cole, we're assigning additional support. Callsign Tango." },
            { speaker: "HQ", text: "Tango specializes in hostile engagement. They'll prioritize enemy contacts." },
            { speaker: "TANGO", text: "Tango reporting. On your wing." }
        ],
        asteroidCount: 4,
        asteroidSizes: [3, 2],
        enemies: 5,
        enemySpawnInterval: 240,
        enemyType: 'normal',
        wingmanAvailable: true,
        wingmanType: 'tango',
        objective: "clear",
        surviveTime: null,
        completionDialogue: [
            { speaker: "TANGO", text: "Contacts eliminated." },
            { speaker: "HQ", text: "Solid work out there. Stay on comms." }
        ]
    },
    {
        id: 6,
        title: "Syndicate Outpost",
        briefing: [
            { speaker: "HQ", text: "Intel shows a Syndicate outpost in the Kepler belt. Heavy presence." },
            { speaker: "HQ", text: "If we take it out, we cripple their supply line. You have the green light." },
            { speaker: "TANGO", text: "Copy. Weapons hot." }
        ],
        asteroidCount: 8,
        asteroidSizes: [3, 2, 1],
        enemies: 6,
        enemySpawnInterval: 200,
        enemyType: 'normal',
        wingmanAvailable: true,
        wingmanType: 'tango',
        objective: "clear",
        surviveTime: null,
        completionDialogue: [
            { speaker: "SIERRA", text: "Outpost neutralized." },
            { speaker: "HQ", text: "Good. But they'll retaliate. Be ready." }
        ]
    },
    {
        id: 7,
        title: "Corrupt Patrol",
        briefing: [
            { speaker: "HQ", text: "Cole... we have a problem. Sector patrol is moving to intercept you." },
            { speaker: "HQ", text: "They were supposed to be on our side. Syndicate bought them out." },
            { speaker: "HQ", text: "They're hostile now. Weapons free." },
            { speaker: "SIERRA", text: "Understood." }
        ],
        asteroidCount: 3,
        asteroidSizes: [3, 2],
        enemies: 6,
        enemySpawnInterval: 180,
        enemyType: 'corrupt',
        wingmanAvailable: true,
        wingmanType: 'sierra',
        objective: "clear",
        surviveTime: null,
        completionDialogue: [
            { speaker: "SIERRA", text: "All hostiles down." },
            { speaker: "HQ", text: "Nobody wanted this, Cole. But it had to be done." }
        ]
    },
    {
        id: 8,
        title: "The Gauntlet",
        briefing: [
            { speaker: "HQ", text: "Final push. The Syndicate is throwing everything they have at us." },
            { speaker: "SIERRA", text: "Sierra ready." },
            { speaker: "TANGO", text: "Tango ready." },
            { speaker: "HQ", text: "All units — this is it. Give them everything. HQ out." }
        ],
        asteroidCount: 8,
        asteroidSizes: [3, 2, 1],
        enemies: 8,
        enemySpawnInterval: 150,
        enemyType: 'normal',
        wingmanAvailable: true,
        wingmanType: 'sierra',
        objective: "clear",
        surviveTime: null,
        completionDialogue: [
            { speaker: "TANGO", text: "Area secure." },
            { speaker: "HQ", text: "Cole... we've found him. The Syndicate leader. Transmitting coordinates now." },
            { speaker: "HQ", text: "This is a solo run. No backup in range. It's all on you." }
        ]
    },
    {
        id: 9,
        title: "The Syndicate Boss",
        briefing: [
            { speaker: "HQ", text: "One contact on sensors. Big signature. That's him, Cole." },
            { speaker: "BOSS", text: "Cole. I've been watching you. Impressive." },
            { speaker: "HQ", text: "Don't listen to him. Stay focused." },
            { speaker: "BOSS", text: "You and I aren't so different. But you'll see that soon enough." }
        ],
        asteroidCount: 2,
        asteroidSizes: [2, 1],
        enemies: 0,
        enemySpawnInterval: 0,
        enemyType: 'normal',
        wingmanAvailable: false,
        wingmanType: null,
        objective: "boss",
        surviveTime: null,
        completionDialogue: [] // handled by boss choice
    }
];
