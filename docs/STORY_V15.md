# ELSEWHERE · The Ninth Platform
## Narrative revision · Act I–V · v1.5

**Logline**: A traveler receives a ticket from a possible future self and discovers that a corporation has made an industry of selling the hours people haven't chosen to give. Across five timelines, the traveler can become powerful, wealthy or anonymous, but must decide what it means to remember someone without claiming their life as property.

**Emotional promise**: Wonder first. Mystery second. Human connection throughout. No player is diagnosed, punished for stopping, or promised a better real future.

## The dramatic spine

The Chronal Exchange's slogan says **EVERY HOUR BELONGS TO SOMEONE**. Early in the story it sounds like a warning. Later, the player discovers that the Exchange has removed half the original oath: **NO ONE MAY OWN AN HOUR THAT ANOTHER HAS NOT CHOSEN TO GIVE**. The missing text is the mechanical and ethical key to the mystery, not a slogan that forces the player to choose a morally approved ending.

The player arrives in 2087 with a ticket marked 1889 / 2046. Iris Vale, the archivist, recognizes it as a record of a missing platform. The ticket sends the traveler to an intimate encounter with **The Other You**. An old photograph suggests someone was waiting at Platform Nine. Ada Voss's 1889 contract reveals how one man's grief became a predatory economic system. The Hollow Witness remembers the original oath; the mech's black box shows what happens when contractual ownership becomes machine logic. The station holds one last hour that never legally entered the market.

**Elias Vey** is not an evil corporation given legs. His sister **Mara** was misreported missing from the time ledger, and his desperate attempt to buy a second chance created a system that denied others their own choices. Mara's private diary confirms she continued to live beyond that hour. Iris protects the diary while preserving the public evidence. Grief explains Vey's motive, but does not excuse coercion.

**Iris** begins as a collector of evidence and learns that preservation has limits: she must sometimes refuse to publish personal information. **Ada** resists single-owner inventions while acknowledging the hard work behind them. **The Witness and the Warden** share a promise but disagree about whether holding people in place can keep them safe. **Sol** inherits the contract centuries later as an automated targeting order and can choose to override it. **The Other You** is neither an omniscient adviser nor a guaranteed future. They are a warmly imperfect character who asks interesting questions and sometimes simply offers tea.

## Act structure

| Act | Core experience | Player agency | Question |
| --- | --- | --- | --- |
| I · The Invitation | Museum, 2087; apartment, 2046 | Accept the first portal, talk or sit quietly, inspect a photograph | What is a future allowed to promise? |
| II · The Offer | Ada's workshop, 1889 | Build cell, oracle or rail; patent, share or auction | Who can own an idea that changes a century? |
| III · The Missing Passenger | Platform Nine, contract, optional dungeon and black box | Examine records in any order, choose which evidence to carry | Whose hour went missing, and who is permitted to tell that story? |
| IV · A World That Remembers | Consequence-driven skyline, NPC responses, optional Prime/Echo fork | Trade fictional hours, fight or seek mercy, protect strangers, compare two branches | Can a mistake be acknowledged without declaring a life ruined? |
| V · An Unpriced Hour | Gather three clues after deciding the invention's fate, return to 2087 | Record the evidence, then choose Empire, Legacy or Wanderer separately | What do you want to leave open for somebody else? |

### In-game, testable narrative triggers

- `story-photograph` · 2046: inspect the facedown photograph, unlock *Two Shadows, One Umbrella*.
- `story-contract` · 1889: reveal the witness clause, unlock *A Clause for the Person Who Waited*.
- `story-witness` · Hollow Crown: read the original oath, unlock *The Guardian Before the Armor*.
- `story-blackbox` · 2199 (after training): discover the targeting order, unlock *The Order the Titan Refused*.
- `story-platform` · 2087 (after visiting 2046): find Platform Nine, unlock *The Station Between the Years*.
- `story-unpriced` · 2087 (requires three discoveries **and** an invention ownership decision): read the converging evidence, unlock *The Hour Nobody Could Buy*.

Investigation is **optional** and does not block the existing First Crossing tutorial, other quests, dungeon battle, or the three endings. Players can find evidence in different orders. The final chapter accepts any three of the five discoveries. No investigation mints currency, time, stars or achievements, and each can be completed only once per branch. Discovered chapters remain in the private journal.

### Branch-specific prose

The original *A Patent for the Sun* now adds an authored ending specific to **Patent**, **Gift** or **Auction**, naming the actual invention the player chose. The city and apartment change their prose based on ownership. Borrowing from tomorrow produces a temporary additional scene in 2046; repayment stops displaying that debt afterimage. Victory and mercy generate different Warden passages. A defended city receives an aftermath scene that values its mechanics and evacuees, not only combat. Empire, Legacy and Wanderer have distinct closing pages. Each is derived from the **active local branch**, so switching Prime/Echo does not leak consequences from one life into another.

### Tone and writing rules

- Use concrete sensory details (a chipped cup, copper dust, handwritten ledgers), not abstract speeches every minute.
- Let people disagree reasonably. Ada and Vey have personal histories; neither is a cardboard mouthpiece.
- Keep space between dramatic peaks: a bakery, a joke about a chipped mug, a quiet railway platform, a mechanic painting a shuttle.
- Never make the imagined future self assert facts about the real player's future or private life.
- Introduce time as **fictional labor, attention, opportunity and promises**, not actual lifespan, dopamine, serotonin or a clinical intervention.
- Avoid treating wealth as a moral failing or sharing as compulsory. The narrative reflects social consequences of every ownership choice without choosing for the player.
- The game stores clue flags, world history and bounded actor memories inside the existing encrypted vault. It does not send story investigation to external services.
- Allow a player to leave any scene at any moment. Optional chapters never become an engagement trap.

## A sample intimate exchange

**You:** “Am I going to become happy?”

**The Other You:** “There were days I laughed so hard I forgot the kettle was boiling. There were harder days too. I couldn't promise you which would come. I could offer you this chair. Would you rather tell me about today, or hear about the very ordinary thing I did this morning?”

**You:** “The ordinary thing.”

**The Other You:** “I burnt the toast. Then I gave half of the unburnt piece to a neighbor who had just moved in. It sounds like nothing, which is how I know I would have overlooked it when I was younger.”

This is **sample direction for future performances**, not proof that the optional on-device model can generate it reliably. The game already has authored local replies and new story-aware topic responses; unrestricted generative conversation still needs real tests.

## Critical QA before submission

1. On a fresh vault, follow First Crossing without ever investigating and finish the tutorial; there must be no soft lock.
2. Investigate the photograph, contract and Platform Nine; verify that the final unpriced-hour action appears after an ownership decision and exactly three clues.
3. Replay each clue action; it must reject duplication and grant no resources.
4. Fork Prime/Echo before finding Platform Nine; the second branch must not inherit the discovery.
5. Patent in one branch and share in the other; read the invention and apartment scenes to verify different text.
6. Borrow future hours, inspect the apartment, repay the debt, inspect again; the debt vignette must disappear.
7. Ask Ada about Vey and the older self about the photograph before and after discovery; responses must not spoil unrevealed information.
8. Inspect on desktop/Quest: readable paragraphs, accessible choice buttons, clear chapter titles and unhurried pacing. User testing and actual headset performance are **not yet verified** by code tests.
