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
            { speaker: "HQ", text: "We're pulling in everyone we can trust. There's a mechanic, Kira Vasquez. Modified her own ship." },
            { speaker: "HQ", text: "Don't let the title fool you. She's good in a fight. Rendezvous at rally point Theta." },
            { speaker: "KIRA", text: "You must be Cole. Let's see what you've got." }
        ],
        asteroidCount: 5,
        asteroidSizes: [3, 2],
        enemies: 2,
        enemySpawnInterval: 360,
        enemyType: 'normal',
        wingmanAvailable: true,
        wingmanType: 'kira',
        objective: "clear",
        surviveTime: null,
        completionDialogue: [
            { speaker: "KIRA", text: "Not bad, flyboy. I'll stick around." },
            { speaker: "HQ", text: "Good. We're going to need all hands for what's coming." }
        ]
    },
    {
        id: 4,
        title: "Supply Run",
        briefing: [
            { speaker: "HQ", text: "Supply convoy needs escort through the belt. Keep them alive for 60 seconds." },
            { speaker: "HQ", text: "It's going to be tight in there. Stay sharp." },
            { speaker: "KIRA", text: "Don't jinx it." }
        ],
        asteroidCount: 6,
        asteroidSizes: [3, 2, 1],
        enemies: 4,
        enemySpawnInterval: 240,
        enemyType: 'normal',
        wingmanAvailable: true,
        wingmanType: 'kira',
        objective: "survive",
        surviveTime: 60,
        completionDialogue: [
            { speaker: "HQ", text: "Convoy is through. Good work." },
            { speaker: "KIRA", text: "Told you not to jinx it." }
        ]
    },
    {
        id: 5,
        title: "Old Friends",
        briefing: [
            { speaker: "HQ", text: "Cole, there's someone who wants to talk to you. Patching through." },
            { speaker: "JAX", text: "Cole. It's been a while." },
            { speaker: "HQ", text: "Jax Morrow. Came out of retirement the moment he heard who we're up against." },
            { speaker: "JAX", text: "Damn right I did. I'm in." }
        ],
        asteroidCount: 4,
        asteroidSizes: [3, 2],
        enemies: 5,
        enemySpawnInterval: 240,
        enemyType: 'normal',
        wingmanAvailable: true,
        wingmanType: 'jax',
        objective: "clear",
        surviveTime: null,
        completionDialogue: [
            { speaker: "JAX", text: "Still got it. Just like old times." },
            { speaker: "HQ", text: "Glad to have you both out there. Stay on comms." }
        ]
    },
    {
        id: 6,
        title: "Syndicate Outpost",
        briefing: [
            { speaker: "HQ", text: "Intel shows a Syndicate outpost in the Kepler belt. Heavy presence." },
            { speaker: "JAX", text: "How heavy?" },
            { speaker: "HQ", text: "Very. But if we take it out, we cripple their supply line. You have the green light." }
        ],
        asteroidCount: 8,
        asteroidSizes: [3, 2, 1],
        enemies: 6,
        enemySpawnInterval: 200,
        enemyType: 'normal',
        wingmanAvailable: true,
        wingmanType: 'jax',
        objective: "clear",
        surviveTime: null,
        completionDialogue: [
            { speaker: "KIRA", text: "Outpost neutralized. That'll slow them down." },
            { speaker: "HQ", text: "Good. But they'll retaliate. Be ready." }
        ]
    },
    {
        id: 7,
        title: "Corrupt Patrol",
        briefing: [
            { speaker: "HQ", text: "Cole... we have a problem. Sector patrol is moving to intercept you." },
            { speaker: "HQ", text: "They were supposed to be on our side. Syndicate bought them out." },
            { speaker: "HQ", text: "I know this isn't what you signed up for. But they're hostile now. Weapons free." },
            { speaker: "JAX", text: "Dirty cops. Wonderful." }
        ],
        asteroidCount: 3,
        asteroidSizes: [3, 2],
        enemies: 6,
        enemySpawnInterval: 180,
        enemyType: 'corrupt',
        wingmanAvailable: true,
        wingmanType: 'kira',
        objective: "clear",
        surviveTime: null,
        completionDialogue: [
            { speaker: "KIRA", text: "They stopped being cops when they took Syndicate money." },
            { speaker: "HQ", text: "She's right. Nobody wanted this, Cole. But it had to be done." }
        ]
    },
    {
        id: 8,
        title: "The Gauntlet",
        briefing: [
            { speaker: "HQ", text: "Final push. The Syndicate is throwing everything they have at us." },
            { speaker: "KIRA", text: "Both of us are with you, Cole." },
            { speaker: "JAX", text: "Whatever's on the other side of this... we face it together." },
            { speaker: "HQ", text: "All of you — this is it. Give them everything. HQ out." }
        ],
        asteroidCount: 8,
        asteroidSizes: [3, 2, 1],
        enemies: 8,
        enemySpawnInterval: 150,
        enemyType: 'normal',
        wingmanAvailable: true,
        wingmanType: 'kira', // both available in sequence
        objective: "clear",
        surviveTime: null,
        completionDialogue: [
            { speaker: "JAX", text: "That's the last of them." },
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
