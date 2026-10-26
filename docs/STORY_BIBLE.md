# ELSEWHERE · The Clock That Borrowed a Life

**Genre:** original speculative science fantasy, psychological role-play, VR exploration, character-driven adventure. The pitch is not "fight everything." It is **"What if every hour you earned had to belong to someone, and every portal connected the consequences of spending it?"**

## The central question

The Chronal Exchange calls time a currency, but the currency is not literal life expectancy. It represents opportunity, remembered experience, labor, chance and commitments inside the fictional universe. A stolen hour can erase a conversation, delay a rescue or close a shop. Returning it can repair part of the world, but not undo every personal consequence. The simulation retains this causal record.

You wake in **Neo Elysium 2087** with a ticket to a station that has not been built yet. In the museum of unlived days, **Iris Vale** offers five memory stars. At the Chronal Exchange, workers sell their spare time to afford a home; investors accumulate promises without understanding the people who made them. Someone has sent a warning from **2046**: "Do not sign for tomorrow until you have met me."

Through a quiet portal, you meet **The Other You**, not a prophecy but a dramatized branch. They ask about sleep, friendship and the price of ambition before discussing a photograph that no longer shows who was in it. In **1889**, the practical inventor **Ada Voss** can help build three technologies no one in her century should possess. Aether Cell, Clockwork Oracle, and Skyrail Drive each solve a problem and create a different structure of power. Patent it, gift it or sell it; Iris will remember what changed, and your future self may no longer be the same person.

The fourth portal opens into the **Hollow Crown**, where the Warden is less an evil boss than a custodian of stolen hours. Choose Phase Shift, Gravity Weaving or Storm Calling and solve a power-specific three-rune cipher. Each repeated attack teaches the Warden a counter. Defeat is possible, but so is mercy if you honored promises and did not steal. The fifth portal enters **Titan Foundry 2199**, where Commander Sol asks whether the player can pilot a gigantic machine without becoming a person who sees every problem as an enemy.

As you gather memory stars, the **Prime/Echo gate** offers an irreversible split. Both realities share the act of forking, but their later money, inventions, alliances, hour balances and personal histories diverge. The goal is not to prove one reality is best. The story culminates when you decide what wealth, the world or yourself is owed.

## The original authored chapters and the living-world arcs

The authored chapter bodies, including the heists and five newly unlocked living-world missions, their unlock predicates and in-game presentation live in [`src/story.js`](../src/story.js): *The Museum of Unlived Days*, *The City of Second Chances*, *The Apartment Beyond Tomorrow*, *The Girl Who Fixed Tomorrow*, *A Patent for the Sun*, *The Bank of Missing Hours*, *The Kingdom Without Yesterday*, *A Villain With a Memory*, *The Giant That Wanted to Stop*, *The Photograph With Two Shadows*, *The Door That Refused to Choose*, *The Letter You Were Afraid to Send*, and *What the Last Hour Bought*.

### Drama comes from consequences

- **Hour heist, 1889:** Take six hours from the clocktower. The workforce loses a morning, Ada's affinity falls, paradox grows and your future self remembers the erased photograph.
- **Hour heist, 2046:** Take five hours from a parallel self, acquire debt, and watch The Other You recall a missing conversation.
- **Hour heist, 2087:** Take seven hours from the Exchange. Iris learns that a stranger missed an important train because of you.
- **Warden theft:** The opponent remembers being robbed, even when you later return to negotiate.
- **Restitution:** Return six hours to the world, lower paradox and earn a chance at trust. It does not manufacture a clean slate.
- **Parallel consequence:** Patent in Prime, share in Echo, and visit two versions of the same city. Actors in one life cannot automatically know what happened in another.

### Three endings

**Empire:** You become a famous magnate. The richest version of you is forced to look at the people their great invention displaced.

**Legacy:** You make knowledge available and leave an inheritance that the city can build upon even after your name disappears.

**Wanderer:** You refuse a definitive life, leaving the last door open. The story accepts that not every question must have a final answer.

## The gameplay philosophy

A VR-first future should replace menus gradually with objects: draw a time receipt from a clocktower, place an invention blueprint on Ada's workbench, take an actual seat across from an older self, interact with an hourglass exchange, raise a shield with a physical arm gesture, or open a portal by aligning memory stars. These are **design objectives**, not claims about features already implemented. The current build implements portals, ray/controller selection, locomotion, deterministic story actions, tactical choices and procedural 3D previews; hand presence, advanced physics and full-body combat need development.

Avoid real-world wealth promises, historical certainty or predictions of users' real futures. "Time" remains a fictional in-game resource. All characters and assets must be original or properly licensed.

## Private conversations beyond scripted encounters

Every world has an authored local text-response system for its own actors: Iris, Ada, the Witness, the Warden and Sol. They respond to themes such as debt, friendship, invention, danger and purpose. The short, bounded dialogue history is part of the encrypted game state for the currently active parallel branch. If you ask the same question repeatedly, the actor recognizes the repetition; if you steal hours or share an invention, the actor's remembered events modify their words. They cannot answer arbitrary questions with generative intelligence, browse, change wealth or read the other branch. A future local open-weight model may improve spontaneity without sending data off-device, but **is not implemented here**.

## The living-world story arcs (playable)

The chronal economy lets NPCs take their own small story steps after the player makes distinct meaningful choices. These are not cloud-generated NPC scripts. Each character retains a bounded per-branch record of its progress. The player can then participate in five quests, paying fictional time to unlock changes in trust, stars and relationships:

- **The School That Stayed Open:** invest four hours in Ada's students and their right to learn, rather than extracting those hours from their lives.
- **The Archive of People Who Never Arrived:** help Iris preserve casualties from altered histories without making private letters public.
- **A Crown of Ordinary Names:** sit with the Witness and acknowledge lost hours to reduce paradox rather than simply overpowering the Warden.
- **The Pilot Who Opened a Door:** help Sol lead civilians to safety with a mechanic's tool rather than a weapon.
- **The Hour Without a Price:** spend an hour with a possible future self for its own sake, without buying certainty.

These chapters are unlocked by completing their corresponding missions. Return trips through portals preserve changes and do not advance agendas on their own.
