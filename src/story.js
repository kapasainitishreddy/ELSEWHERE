/** Original Syrava story bible. The story follows the state machine, not vice versa.
 * All chapters are fictional. Neither possible futures nor time debts predict life.
 */
export const STORY=[
 {id:'prologue',title:'The Museum of Unlived Days',era:'Outside the clock',world:'future',open:()=>true,body:`The last museum in Neo Elysium had no doors, only a turnstile shaped like the number eight.

Above it, one sentence glowed in a language no one admitted to knowing: EVERY HOUR BELONGS TO SOMEONE.

You woke beneath the turnstile with a brass ticket in your hand. It was stamped for a railway station that would not exist for another sixty years. The city around you rose in shining terraces, over a sea kept black by artificial night. In one tower, flowers opened in the rain. In another, a thousand machines recited the names of people no longer living.

A woman behind an archive desk watched you study the ticket. Her name was Iris Vale. She offered neither welcome nor explanation, only a glass of water and a question.

“What would you do if you could buy yesterday?”

“Undo something,” you said.

“Everybody says that. The market depends on it.”

She explained that in her city, an hour was both an amount of time and a claim upon a life. It could be earned for work, lent against tomorrow, lost in the past, or stolen from someone who could never prove the theft. None of the hours were literal years of life. They were opportunities, attention, labor, promises. That distinction had once protected people. Then the banks learned to write contracts about feelings.

Iris placed five star-shaped pieces of glass on the desk. Only one was illuminated. “These are transit memories,” she said. “An ordinary door opens into a place. These open into a consequence.”

The floor trembled. Somewhere beneath the museum, a giant clock began counting backward.

“You have no right to the future,” Iris told you. “That is why you are free to make one.”`},
 {id:'city',title:'The City of Second Chances',era:'2087',world:'future',open:()=>true,body:`The morning traffic moved above your head in silent ribbons of light. Pedestrians crossed bridges planted with silver moss. Shop windows displayed objects that had never existed in the history you remembered: paper birds powered by sunlight, pocket oracles, rails curved like ribbons across the sky.

On the far side of the river stood the Chronal Exchange. Its advertisement said, SELL THREE HOURS. BUY THE LIFE YOU DESERVE. A line of tired workers extended around the building. People sold an evening of freedom to pay for food. Investors bought the evenings and called the transaction efficient.

Iris walked with you through the queue. She had been born into the Archive, a family sworn to preserve every version of history. Their task was impossible, because each invention erased the photographs of everything it replaced. She showed you a painting of an empty field. Beneath it was a newer painting of a factory, and beneath that a city.

“The field is still there,” she said. “In another memory.”

A child beside the exchange asked how much an hour cost. The clerk said that it depended on which century needed it. The child asked what happened if there were no hours left to sell. No one answered.

Then a messenger arrived carrying a letter addressed to you. Its wax seal bore your handwriting, but the date was 2046.

Iris turned pale. “That is impossible,” she said. “The Other You has never written first.”

The letter contained a single line: DO NOT SIGN FOR TOMORROW UNTIL YOU HAVE MET ME.`},
 {id:'elder',title:'The Apartment Beyond Tomorrow',era:'2046',world:'self',open:s=>s.worldVisits.self>0,body:`The portal opened into the smell of tea, rain, and a room that had been lived in carefully. A lamp stood by the window. Beside it was a chair with a worn cushion and a photograph turned facedown.

The person sitting opposite you was older, but not by any reliable arithmetic. Some lines around their eyes belonged to years you might never have. A tiny scar crossed their hand. They hid it when they noticed you looking.

“You must be me,” you said.

“No,” the stranger replied. “I am what one of your choices allowed.”

You expected answers about who you would love, whether you would become wealthy, and who would leave. Instead they asked what you had eaten, whether you had slept, and whether you had spoken to a friend without needing anything.

“When I was young, I imagined success as a room in which nobody could tell me no,” the stranger said. “Then I built that room. It took years to notice I was alone in it.”

They showed you three photographs. In one, you stood on the roof of a building bearing your name. In another, you were one face among hundreds at the opening of a free library. In the third, there was only an empty road disappearing into the mountains.

“Which one is true?” you asked.

“They all contain something true. None of them is certain.”

A clock on the wall missed a beat. Your older self flinched.

“Someone borrowed an hour from me,” they whispered. “Perhaps it was you. Perhaps it was the version of you that never arrived.”

Before leaving, you noticed the facedown photograph had no image on its back, only a message: THE PAST CAN OWE YOU. YOU CAN OWE IT BACK.`},
 {id:'ada',title:'The Girl Who Fixed Tomorrow',era:'1889',world:'past',open:s=>s.worldVisits.past>0,body:`Ada Voss repaired watches in a city that believed clocks belonged to men who could afford them. Her workshop smelled of hot copper, candle wax, and bread from the bakery downstairs.

When you arrived carrying a schematic from the future, she did not call you a magician. She asked whether you had stolen it.

“Perhaps from time,” you said.

“Then time is going to want it back.”

Ada had spent six years building a clock that could remember the moments in which it stopped. Her mother had died in a factory fire after the owner advanced the workday without advancing the wages. Ada believed that time was never neutral. Someone always decided whose minutes mattered.

Together you could build a clean-energy cell, an impossible calculating machine, or a propulsion engine. Every device would alter the lives of strangers who had not agreed to your intervention. Ada insisted that no invention was innocent merely because it worked.

That night you heard shouting outside. An investor named Elias Vey had come to purchase her workshop. He carried an offer written in the new currency: one hundred years of contracted labor, paid forward by generations who had not yet been born.

Ada refused. Vey smiled as though refusal were a technical problem.

“You can be rich,” he told you, looking over her shoulder. “You only need to decide who deserves to wait.”

Ada placed the broken clock in your hand. Its hands moved in opposite directions.

“Whatever you do,” she said, “don't let them patent the morning.”`},
 {id:'invention',title:'A Patent for the Sun',era:'1889 to 2087',world:'past',open:s=>!!s.invention&&!!s.fate,body:`Your invention did not enter history with a thunderclap. It entered as a small demonstration, performed in a workshop between two wet streets. A few people laughed. One called it fraud. Then the machine worked, and the laughter changed into silence.

Elias Vey offered to buy the rights before the witnesses had gone home. Ada stood beside you, hands trembling, waiting to hear what kind of person you would become.

There were three doors. Patent the discovery and build an empire. Auction it to the highest bidder and accept whatever that buyer would do. Give the design to everyone and let a thousand strangers improve it without asking your permission.

No future arrived without casualties. Factories closed. New ones opened. Investors became rulers or became irrelevant. A person alive in 1889 could not see the faces of the people affected in 2087. You could, and that knowledge made you powerful but not wise.

When the portal reopened, Neo Elysium had shifted. Towers moved. Names vanished from memorials. A machine you remembered as impossible appeared on an advertisement for children's toys.

Iris compared two photographs and found that one no longer belonged to anyone's memory but hers.

“What did you buy?” she asked.

You looked at your hands. You had no answer ready.

She gave you the photographs anyway. “Keep both. A person who changes a century should be required to remember the century they changed.”`},
 {id:'exchange',title:'The Bank of Missing Hours',era:'The Chronal Exchange',world:'future',open:s=>s.chronal.transactions.length>0,body:`Beneath Neo Elysium was a market with no clocks. The traders were afraid to see how long they had waited.

At each stall, an hour wore a different price. An hour of courage was more expensive than an hour of sleep. An hour of a famous person's attention cost more than a poor person's working day. The exchange called this mathematics. Iris called it hunger with better handwriting.

You placed an hour on the scale. It appeared as a transparent coin, containing the pale outline of a room. When you touched it, you heard laughter from a day you did not remember.

The broker explained the rules. Three hours could be traded at the price of the century you stood in. Buying them back cost more. You could borrow from tomorrow, but you would owe twelve for eight. Yesterday was cheaper to borrow from, because it could not easily complain. Theft was possible in the realm of the Hollow Crown, where unclaimed time gathered around the throne.

“Can I become rich doing this?” you asked.

“You can become rich doing anything,” the broker said. “The difficulty is remaining a person who recognizes what wealth has changed.”

Ada's broken clock clicked in your pocket. You saw that every trade left a mark behind: a promise, a memory, a grievance, or a debt.

You could still walk away. That was the one hour the market could not list for sale.`},
 {id:'hollow',title:'The Kingdom Without Yesterday',era:'An age that never ended',world:'dungeon',open:s=>s.worldVisits.dungeon>0,body:`The first thing you noticed was that your footsteps arrived a moment before your feet. The second was that the stars above the dungeon were buried inside the stone.

The kingdom of the Hollow Crown had been created when a dying ruler purchased every unspent hour his subjects possessed. For seven years nobody aged, nobody left, and nobody made anything new. Children never reached adulthood. Lovers never grew old together. The ruler called it mercy.

The Hollow Witness had once been the royal historian. She remembered the names of every citizen, though their faces had faded. She said the Warden was not a monster born from cruelty. It was the king's last promise made into armor: no hour could escape the vault unless the thief also carried its cost.

Three runes stood before you. One was a moon, one a crown, and one a star. Each power spoke the solution in a different language of movement: slipping between seconds, bending gravity, or calling the storm.

Behind the seal waited the Warden. Its armor was carved from unspoken apologies. You could defeat it. You could protect what it guarded. You could even steal from it, though the theft would become another thing it remembered.

The Witness touched the first rune. “No one wins by taking every hour,” she said.

“Then why is there a crown?” you asked.

“Because someone always wants to own the answer.”`},
 {id:'warden',title:'A Villain With a Memory',era:'The Hollow Crown',world:'dungeon',open:s=>!!s.power,body:`The Warden had been waiting in a chamber full of unused time. Its weapon was a blade so thin it could cut the interval between a choice and its consequence.

“You have crossed the forbidden centuries,” it said. “Tell me which ones you intend to keep.”

You expected a battle in which each side repeated the same attack until one fell. Instead the Warden watched. It recognized the way you moved. It noted whether you had stolen hours, whether you protected the people whose futures your inventions altered, whether you had taken magic without asking what it would cost.

The Witness said you could not truly defeat the Warden by forgetting what it had protected. Even if its armor shattered, the burden would fall to someone else.

When the seal opened, time became a corridor rather than a line. In the corridor stood several versions of your own shadow, each carrying an object you had chosen in another world. A patent. A letter. A pilot's helmet. A coin holding a missing afternoon.

The Warden lowered its blade for the length of one breath.

“If you take my hours,” it said, “you will become their keeper. What will you do when someone else comes to take them from you?”

There was no single correct answer. There was only the next action, and the person you would be when it was remembered.`},
 {id:'titan',title:'The Giant That Wanted to Stop',era:'2199',world:'mech',open:s=>s.worldVisits.mech>0,body:`The hangar of Titan Foundry was wider than any cathedral and quieter than a library. ATLAS-09 stood in the center, one foot inside a dry riverbed carved into the floor. Its armor showed repairs made by pilots who had never met one another.

Commander Sol handed you a helmet. Across its visor were written the names of everyone who had walked out of the city during the last evacuation. Those who did not make it were not listed, Sol said, because the count had never finished.

The titan synchronized to your movement with a shudder of heavy steel. On the horizon, hostile drones cut the dark sky into narrow red lines. You could fire a pulse, raise a shield, vent an overheating reactor, or retreat behind the city's remaining defenses. Every shot saved time for the people escaping, and each shot burned a little of the machine that kept you alive.

“I wanted to be famous when I became a pilot,” Sol admitted through the radio. “Then I met the people who would never learn my name.”

The enemy was not a nation or an army. It was a failed autonomous defense swarm still following an evacuation order that had expired fifty years ago. Its instructions had survived the people who wrote them.

You could destroy the drones and gain fame, but Sol asked you to remember that the true goal was to keep the corridor open.

Sometimes the greatest act of power was knowing precisely when to stop fighting.`},
 {id:'missing',title:'The Photograph With Two Shadows',era:'2046',world:'self',open:s=>s.chronal.futureDebt>0||s.chronal.pastDebt>0||s.chronal.paradox>0,body:`The second time you entered the apartment, the furniture was almost the same. The plant near the window had lost a leaf. The photograph on the table showed two silhouettes where there had been one.

Your older self remembered a morning they could no longer describe. They remembered being late, hearing a train, and feeling that somebody else had finished a conversation in their place.

“There is a price for taking time from your past,” they said. “Not because time is angry. Because memory holds a life together, and a hole in memory changes the shape of everything around it.”

You could repay what you had borrowed. You could leave the debt behind and accept the damaged photograph. You could open a parallel reality, where one version of you had borrowed the hour and another had not.

Your older self did not tell you which choice would make you happy. They had learned that certainty was an expensive lie.

They offered you tea, then asked something you had not expected.

“When you become rich, will you buy more time or will you give someone else theirs back?”

Outside, the city kept its own counsel. Inside, the clock made one clean sound, and for a moment nothing was missing.`},
 {id:'parallel',title:'The Door That Refused to Choose',era:'Prime / Echo',world:'self',open:s=>s.parallel.forked,body:`The star fragments began to hum when you held them near the apartment door. A second handle appeared beside the first. There was no lock, only a label written in your own handwriting: THE LIFE THAT SAID NO.

You opened it and found the same room, the same rain, and a different letter on the table. The other version of you had made a choice you had refused to make. The city beyond the window reflected that choice in its towers, its advertisements, its missing names.

Iris appeared in the doorway carrying two archive books. One was called Prime. The other was Echo. Both books were full, though neither contained the same ending.

“You can live in two stories,” she said. “But you cannot spend the money from one in the other. And you cannot pretend that a mistake in one was erased by doing better in the next.”

That was the miracle, and also the rule. The worlds were separate, but your awareness traveled between them. In Prime you could claim an invention. In Echo you could give it away. In one life you could repay the hours. In another you could carry the debt.

The older self in each room would remember only the version of the story that belonged there.

You stepped through. For one terrible, beautiful instant, you understood why people told stories at all: to hold more than one possible life in the same pair of hands.`},
 {id:'letter',title:'The Letter You Were Afraid to Send',era:'A possible tomorrow',world:'self',open:s=>!!s.letter,body:`You wrote the letter slowly. It did not contain a map to guaranteed success or the name of a person who would love you. It contained a promise, and the name of someone you wanted to be kind to.

The paper was private. No archivist saw it. No exchange assigned it a market value. Even the future self was allowed to read it only when you chose to share it in your own private world.

On the next visit, the letter lay near the window. The older stranger held it in both hands, as though its weight had surprised them.

“I cannot promise that I did all of this,” they said. “I cannot even promise that I became the person you imagined. But the version of us who wrote these words wanted something good. That matters.”

For a long time neither of you spoke.

You began to understand that privacy was not a locked room used for hiding shame. It was the freedom to try on a thought before the world had the right to judge it. A private memory could be revised, forgiven, or set down. It did not have to become a product or a public performance.

Outside, rain dissolved the reflection of the city. Your older self put the letter in a drawer without making a copy.

“Some things,” they said, “should belong only to the person who lived them.”`},
 {id:'clocktower',title:'The Clocktower That Forgot Morning',era:'1889',world:'past',open:s=>!!s.flags['time-heist-past'],body:`The first sound was the factory bell. The second was its echo arriving before the bell had finished ringing.

You knew exactly how many hours you had taken. The clocktower's brass face was missing six of them, but the workers down the street did not know why the factory gate had opened in darkness. They had been robbed of a morning without losing a single minute on the schedule.

Ada came outside wearing the same oil-stained coat she had worn when you first met her. She looked at your fingers, where gold dust from the Exchange still clung.

"Did it make you rich?" she asked.

"Not yet."

"Then why did you do it?"

You expected anger. What she offered was arithmetic. Six hours distributed among hundreds of people became a thousand small losses. A son missed breakfast with his father. A woman arrived too late to say goodbye to a patient. A baker's dough rose before anyone remembered kneading it.

"You see a balance," Ada said. "I see the people standing on the other side of the counter."

She showed you her ledger. It had six blank lines. You offered to write the money you had gained beside them.

"Money is not the same as a morning," she replied. "I thought a traveler from the future might know that."

In another reality, the bell rang correctly. You could enter that one and pretend this mistake belonged to someone else. But Ada would still stand in this street, holding a book with six missing entries.

At sunset you returned to the clocktower, and for the first time understood that the most expensive thing a person could steal was an ordinary day.`},
 {id:'doubledebt',title:'The Hour You Took From Yourself',era:'Two versions of 2046',world:'self',open:s=>!!s.flags['time-heist-self'],body:`In the apartment there were now two cups of tea. One was empty, though you had arrived alone.

The Other You held a note in their hand. It was written in your handwriting, but the ink had run in the rain and several sentences had vanished. They did not seem angry at first. They seemed embarrassed, as if they had forgotten something important in front of a guest.

"I used to know what we said the first time we met," they told you. "Now I know only that it mattered."

The Chronal Exchange called the transaction a transfer between legally equivalent identities. Five hours had moved from another possible version of your life into your account. The ledger recorded no victim, only two versions of the same signature.

"They think a person cannot steal from themselves," the stranger said. "I think they have never had to live beside someone they used to be."

You saw their hand move toward the old photograph and stop. The face beside them had disappeared. No one knew whether the missing person was a friend, a lover, or a stranger who had needed help. That was the cruel precision of stolen time. It removed the context as neatly as it removed the hour.

You could keep what you had taken. You could spend it on the Echo gate. You could try to return six hours and accept that memory might never come back exactly the same.

"Do not tell me you will be better in another timeline," your other self said. "Tell me what you are going to do in this one."`},
 {id:'exchangebreach',title:'Seven Hours That Never Existed',era:'2087',world:'future',open:s=>!!s.flags['time-heist-future'],body:`The breach at the Exchange did not set off an alarm. It set off seven of them in seven different districts, all at different hours of the day.

Iris found you in the public plaza watching the skyline flicker through incompatible versions of itself. In one, the clean-energy towers rose like white trees. In another, the towers had no windows. In a third, the towers were not there at all.

"You stole from the future," she said. "Did you imagine the future would be empty?"

You explained the calculation. Seven hours had left the Exchange, more than enough to pay the toll of a second life. No money had moved. No vault had been broken. Nobody had seen you touch the clock.

Iris took you to a rail platform. A woman sat there holding a ticket for a train that had already departed. She had lost an hour and a chance to meet someone at the hospital. The train was gone. The person she was traveling to see was gone too.

"Your market has no crimes against the clock," Iris said. "It has crimes against the people who are trusting it."

A second skyline opened beyond the platform, its towers bright and undamaged. The Echo reality was calling. It promised that you could leave this city behind without ever looking at the platform again.

For the first time, a portal felt less like freedom and more like a door you might use to avoid an apology.

The woman looked up from her ticket. She did not ask who you were. She asked whether the next train would still run on time. You could not answer.`},
 {id:'restoration',title:'The Impossible Receipt',era:'Every century',world:'future',open:s=>!!s.flags['time-atone'],body:`When you returned six hours to the ledger, every clock in the city paused for the smallest fraction of a second. Most people never noticed. A child who had been crying stopped. The clocktower in 1889 struck a note it had lost. The Warden felt an old ache move toward forgiveness.

Iris stamped the receipt and did not smile.

"Do you expect this to put the world back?"

"I hoped it might."

"Good," she said. "Hope is useful. It is not a substitute for knowing what happened."

The Exchange marked the transaction complete. The archives did not. The missing morning was still a missing morning. The traveler who had missed her train still remembered waiting. Ada's ledger kept the old entries with their blank spaces, because erasing the wound would also erase the lesson.

But something had changed. The next person at the counter asked to return an hour instead of borrowing one. A second customer listened. The clerk, who had spent a lifetime being paid to count, took a chair and let the queue wait.

Later, in the apartment, your older self showed you the damaged photograph. The faces were visible again. One corner remained white.

"I remember a little more," they said. "Not because you bought the right to forget what you did, but because you returned and admitted it was yours."

Through the window you saw two parallel doors, Prime and Echo. Both led somewhere possible. Neither could make the past innocent.

You carried the receipt in your pocket. Its ink said PAID. Your hands knew a better word: BEGUN.`},
 {id:'epilogue',title:'What the Last Hour Bought',era:'The Unwritten End',world:'future',open:s=>!!s.ending,body:`The last gate stood where the first museum had stood, but its sign had changed. Now it read: YOU ARE NOT THE SUM OF YOUR PURCHASES.

Iris met you beneath the turnstile. She asked whether you had done everything you wanted to do. You thought of Ada watching a machine come alive, the Witness keeping a kingdom's difficult memories, Commander Sol waiting for the evacuation lights, and a stranger in an apartment who might someday resemble you.

You had bought and sold imaginary hours, but the most important moments had not been transactions at all. A refusal. A promise returned. A person who remembered that you had come back. A door opened for somebody else.

The Archive offered you three endings. Become an empire and let the city learn your name. Become a legacy and leave the lights on for strangers. Become a wanderer and keep one door unmarked, so the person you might become could choose again.

The museum did not select for you. Neither did the older self. You reached toward the panel with the knowledge that there would be lives you never lived, and consequences you could never foresee.

Then you chose.

Somewhere a clock stopped borrowing from tomorrow. Somewhere another began.

On the other side of the gate, the sky was full of stars you had not yet named.`}
];
export function availableChapters(state){return STORY.map((chapter,index)=>({id:chapter.id,title:chapter.title,era:chapter.era,world:chapter.world,open:!!chapter.open(state),number:index+1}));}
export function chapterById(state,id){const found=STORY.find(c=>c.id===id);if(!found||!found.open(state))return null;return {...found,number:STORY.indexOf(found)+1};}
export function activeChapter(state){
 const priorities={self:['doubledebt','parallel','missing','letter','elder'],past:['clocktower','invention','ada'],dungeon:['warden','hollow'],mech:['titan'],future:['epilogue','restoration','exchangebreach','exchange','city']};
 return priorities[state.world].map(id=>chapterById(state,id)).find(Boolean)||chapterById(state,'prologue');
}

