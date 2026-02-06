// --- Mission Definitions ---
export const missions = [
    {
        id: 1,
        title: "Routine Patrol",
        briefing: [
            { speaker: "HQ", text: "Cole, patrol sector 7-G. Routine sweep." },
            { speaker: "COLE", text: "Copy. Moving in." }
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
            { speaker: "COLE", text: "Just another day." }
        ]
    },
    {
        id: 2,
        title: "The Attack",
        briefing: [
            { speaker: "HQ", text: "Cole, we're picking up unknown contacts in your sector." },
            { speaker: "COLE", text: "Hostiles? Out here?" },
            { speaker: "HQ", text: "Confirmed. Syndicate signatures. Engage at will." }
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
            { speaker: "COLE", text: "Hostiles down. What the hell was the Syndicate doing out here?" },
            { speaker: "HQ", text: "Unknown. Return to base. We need to talk." }
        ]
    },
    {
        id: 3,
        title: "Rally Point",
        briefing: [
            { speaker: "HQ", text: "We're pulling in everyone we can trust. There's a mechanic, Kira Vasquez. She's good in a fight." },
            { speaker: "COLE", text: "A mechanic?" },
            { speaker: "HQ", text: "She modified her own ship. Trust me. Rendezvous at rally point Theta." },
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
            { speaker: "COLE", text: "Glad to have you, Kira." }
        ]
    },
    {
        id: 4,
        title: "Supply Run",
        briefing: [
            { speaker: "HQ", text: "Supply convoy needs escort through the belt. Keep them alive for 60 seconds." },
            { speaker: "COLE", text: "60 seconds in that mess? Easy." },
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
            { speaker: "COLE", text: "Jax? I thought you retired." },
            { speaker: "JAX", text: "Came out of retirement when I heard who we're fighting. I'm in." }
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
            { speaker: "COLE", text: "Better than old times." }
        ]
    },
    {
        id: 6,
        title: "Syndicate Outpost",
        briefing: [
            { speaker: "HQ", text: "Intel shows a Syndicate outpost in the Kepler belt. Heavy presence." },
            { speaker: "JAX", text: "How heavy?" },
            { speaker: "HQ", text: "Very. But if we take it out, we cripple their supply line." },
            { speaker: "COLE", text: "Then we take it out." }
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
            { speaker: "COLE", text: "Patrol? They're on our side." },
            { speaker: "HQ", text: "Not anymore. Syndicate bought them. They're coming for you." },
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
            { speaker: "COLE", text: "Didn't sign up to fight cops." },
            { speaker: "KIRA", text: "They stopped being cops when they took Syndicate money." },
            { speaker: "HQ", text: "She's right. Focus on the mission." }
        ]
    },
    {
        id: 8,
        title: "The Gauntlet",
        briefing: [
            { speaker: "HQ", text: "Final push. The Syndicate is throwing everything they have at us." },
            { speaker: "KIRA", text: "Both of us are with you, Cole." },
            { speaker: "JAX", text: "Whatever's on the other side of this... we face it together." },
            { speaker: "COLE", text: "Together. Let's end this." }
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
            { speaker: "HQ", text: "Cole... we've found him. The Syndicate leader. Transmitting coordinates." },
            { speaker: "COLE", text: "It's time." }
        ]
    },
    {
        id: 9,
        title: "The Syndicate Boss",
        briefing: [
            { speaker: "COLE", text: "I see him. One ship. Big one." },
            { speaker: "BOSS", text: "Cole. I've been watching you. Impressive." },
            { speaker: "COLE", text: "Save it." },
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
