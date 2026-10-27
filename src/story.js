/** Original Syrava story bible. The story follows the state machine, not vice versa.
 * All chapters are fictional. Neither possible futures nor time debts predict life.
 */
import {INVESTIGATION_CHAPTERS} from './story-scenes.js';
import {storyAfterimage} from './story-thread.js';

export const STORY=[
 {id:'prologue',title:'The Museum of Unlived Days',era:'Outside the clock',world:'future',open:()=>true,body:`On the morning you arrive in Neo Elysium, the station has eight platforms. Your ticket is for the ninth.

The paper is warm. Its departure date reads 1889. Its arrival reads 2046. On the reverse is a message in handwriting so close to yours that looking at it makes you uneasy:

DON'T SIGN AWAY TOMORROW BEFORE YOU MEET ME.

Beyond the station windows, the year is 2087. Suspended trains drift between gardens bolted to towers. A delivery robot waits patiently while a little boy argues with a vending machine. High above the streets, the Chronal Exchange announces its latest offer: THREE HOURS TODAY. THE LIFE YOU WANT TOMORROW.

You have no idea what the offer means. You only know that nobody in the crowd seems surprised by it.

At the Museum of Unlived Days, you meet Iris Vale. She has ink on her fingers and a scar on her thumb from opening too many envelopes with a kitchen knife. Before asking your name, she gives you water. Then she notices the ticket and puts down her pen.

“Where did you get that?”

You cannot explain. Iris is quiet for a moment, then pulls a book from beneath the desk. It contains a photograph of the station. Eight platforms. A black margin where the ninth should be.

“Every century has a place where its mistakes are filed,” she says. “Ours is the Exchange. We trade hours here. Not years of life. Hours people could have spent working, resting, waiting, meeting someone. The traders say opportunity can be owned.”

She draws five glass stars from a drawer and arranges them in a circle. One glows when you bring the ticket near it.

“These aren't rewards. They're witnesses. A memory from each place the clock touches.”

Something beneath the floor gives a long mechanical sigh. The station clock, which should be thirteen minutes ahead, begins to tick backward.

Iris looks toward the sound, and for the first time you see fear interrupt her careful composure.

“Before you decide what kind of future you want,” she says, “there's somebody you should meet. They sent that ticket.”

A doorway appears in the wall behind the exhibits. Rain falls on the other side. From somewhere beyond it comes the soft clink of two cups placed on a table.

You have not chosen a future. You have been invited to witness one.`},
 {id:'city',title:'The City of Second Chances',era:'2087',world:'future',open:()=>true,body:`The morning traffic moved above your head in silent ribbons of light. Pedestrians crossed bridges planted with silver moss. Shop windows displayed objects that had never existed in the history you remembered: paper birds powered by sunlight, pocket oracles, rails curved like ribbons across the sky.

On the far side of the river stood the Chronal Exchange. Its advertisement said, SELL THREE HOURS. BUY THE LIFE YOU DESERVE. A line of tired workers extended around the building. People sold an evening of freedom to pay for food. Investors bought the evenings and called the transaction efficient.

Iris walked with you through the queue. She had been born into the Archive, a family sworn to preserve every version of history. Their task was impossible, because each invention erased the photographs of everything it replaced. She showed you a painting of an empty field. Beneath it was a newer painting of a factory, and beneath that a city.

“The field is still there,” she said. “In another memory.”

A child beside the exchange asked how much an hour cost. The clerk said that it depended on which century needed it. The child asked what happened if there were no hours left to sell. No one answered.

Then a messenger arrived carrying a letter addressed to you. Its wax seal bore your handwriting, but the date was 2046.

Iris turned pale. “That is impossible,” she said. “The Other You has never written first.”

The letter contained a single line: DO NOT SIGN FOR TOMORROW UNTIL YOU HAVE MET ME.`},
 {id:'elder',title:'The Apartment Beyond Tomorrow',era:'2046',world:'self',open:s=>s.worldVisits.self>0,body:`The apartment does not resemble a prophecy. It resembles a place somebody was too busy living in to keep tidy.

A blue coat dries on the back of a chair. A book lies face down beside a half-peeled orange. Through the window, rain traces bright lines across a city that is both familiar and entirely different.

The person at the kitchen counter turns when you enter. Their face holds several versions of your expression. They look older, though age isn't the part that unsettles you. It's the way they make room for another chair before you ask.

“You found the ticket,” they say.

There is a kettle on the stove. The person pours two cups of tea, notices that one mug is chipped, and keeps it for themselves. Their smile is small and unexpectedly funny.

“Does that mean I become you?” you ask.

“Not unless you make every choice I made. Please don't. Some of them were remarkably silly.”

They are not the future delivered as fact. They are a possible self, shaped by this world's history and the choices you may still change. You can ask about fame, love, friendship, work, the people you've missed, or nothing at all. They cannot know who you will really become.

“I thought you'd tell me how to win,” you say.

“I can tell you what I wished someone had asked me.” They take a sip and wince because the tea is too hot. “What do you actually want to do with a good day, once you have one?”

On the wall hang three photographs: a tower with your name on it, a workshop crowded with people, and a train disappearing toward open country. One image will become clearer if you change an invention in 1889. Another may fade. The pictures are possibilities, not predictions.

Beneath them sits a fourth photograph, turned face down. A station bench. An open umbrella. Somebody waiting.

“There's a reason I didn't put that one on the wall,” your older self says. “I don't know whose hour went missing. But I know somebody tried to buy it.”

Outside, a train whistle passes through a street that has no rails. The kettle begins to sing again.

“You don't have to solve the whole life tonight,” the stranger tells you. “We can start with a question. Or finish the tea. Both are allowed.”

They pull out the empty chair.

For once, the world waits for you.`},
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
 {id:'night-school',title:'The School That Stayed Open',era:'1889 · The First Spark',world:'past',open:s=>!!s.flags['society-apprentices'],body:`The clocktower had never had a classroom. It had a room where the gears were kept and a room where the owners counted wages. Ada took the second room, unscrewed the bronze plaque from the door, and nailed a blackboard over the empty space.

The first lesson was not about machines. It was about consent. A young apprentice named Nell had spent her childhood helping the factory's timekeeper. She could tell the difference between a hurried clock and a dishonest one just by listening. She could not read the contract that had been used to take her mother's Sundays.

“You can teach her the numbers,” you told Ada.

“I can teach her to ask who wrote them.”

You opened your ledger. Four stored hours waited there. You could spend them on a return train, on a small purchase in the future, or on a classroom that would exist only if someone stayed to teach. The Exchange would happily buy them. The apprentices could only ask.

You placed the hours on Ada's desk. They became four small shadows moving backward across the wood. No one cheered. Nell fetched a piece of chalk. Another child opened a window because the room was too hot.

At noon, Elias Vey's clerk arrived to lock the building. He had a document proving that its next hundred years had already been sold. Ada read the name at the bottom and laid the page on the table.

“The paper says you own the room,” she told him. “It doesn't say you own what they learn in it.”

Nell wrote the first equation on the blackboard, slowly enough that the clerk had to watch. A wrench lay beside her. It would be years before she designed her first machine, and longer before the future recognized the name on it. For now, all she had was a room, a teacher, and an afternoon that belonged to her.`},
 {id:'archive',title:'The Archive of People Who Never Arrived',era:'2087 · Neo Elysium',world:'future',open:s=>!!s.flags['society-archive'],body:`Iris Vale brought you to a narrow building beneath the elevated trains. It had no holograms, no advertisements, and no entrance fee. Someone had painted OPEN DURING EVERY CENTURY above its door. The words were crooked.

Inside, the shelves held photographs of people who had disappeared from official history when someone changed an earlier year. Iris had learned to collect the negative spaces. A street in which a house had never been built. A wedding invitation addressed to a person who had never been born. A note from a conductor explaining that a passenger missed a train seven hours after the timetable said it departed.

“You said the market was only selling time,” you told her.

“That is what a market says when it doesn't want to sell responsibility.”

You could have sold those two hours to pay for a view above the city. Instead, you helped carry the boxes up from the basement. Some contained invoices and contracts; others contained small domestic things: a shopping list, a chipped cup, a child's drawing of a train with too many windows.

Iris handed you a receipt for the work. It showed no amount of money, only the words TWO HOURS RETURNED TO THE PUBLIC RECORD.

You asked if the archive would reveal your private letter to your older self. Iris shook her head. “I archive what happened to the world,” she said. “Not what someone whispered in a room they thought was theirs.”

When you left, the train crossed overhead and a dozen strangers walked into the reading room. A girl carrying an old photograph asked Iris whether the person beside her mother had really existed. Iris pulled up a chair. For once, she did not begin with an answer. She began by listening.`},
 {id:'witness-oath',title:'A Crown of Ordinary Names',era:'The Hollow Crown',world:'dungeon',open:s=>!!s.flags['society-oath'],body:`The Witness met you beneath the throne, where the stones were engraved with numbers. You had mistaken them for the tally of defeated enemies. They were not victories. They were hours taken from people who could not bargain.

A baker's hour. A sailor's. A child on the afternoon of a birthday. A mother waiting at a station. When you pressed a hand against the wall, the numbers became names. Some were worn away by centuries of rain that had never reached the underground chamber.

The Witness asked you to remain until the last name had been read aloud. It would take three hours. You had come to find a power, and three hours seemed an absurd price for a silence nobody would notice.

“Why not take them back by force?” you asked.

“Because the sword is how they were taken in the first place.”

You sat on the steps. The Witness began. Each name made the chamber a little less cold. Once you thought you heard the Warden move beyond the sealed gate, but no blade appeared. There was only the slow rustle of paper and the creak of a chair carrying its weight.

You offered the hours without a contract. The first mark on the wall faded. The second became a thin golden line. The third did not change at all. Some damage, the Witness explained, survives restitution. Repair is an action, not an eraser.

When the reading ended, the Witness placed a blank page in your hand. The crown could now accept another name, but it could no longer assume every traveler had come to steal. The next thing you did would matter more than the spell you knew.`},
 {id:'rescue-corridor',title:'The Pilot Who Opened a Door',era:'2199 · Titan Foundry',world:'mech',open:s=>!!s.flags['society-evacuation'],body:`ATLAS-09 stood upright with its weapons cooling. Commander Sol did not ask you to climb into it. She took you to the workshop behind the hangar, where a civilian transport was missing one wheel and the mechanic had run out of time.

Outside, the defense drones counted every moving vehicle as a threat. The evacuation order they followed had been obsolete for half a century, but obsolete instructions do not feel obsolete to the people they hurt.

“We could blow a path through them,” you said.

“We could,” Sol replied. “And then someone would have to drive the survivors through the wreckage.”

You spent three stored hours carrying batteries, loosening seized bolts, and listening to the mechanic describe the doors that still opened when the power failed. None of this would improve the damage statistics displayed by the mech's cockpit. It would only make it possible for a transport to leave.

A child waiting beside the corridor asked Sol whether the giant machine was frightened. Sol looked up at the helmet hanging above the control seat.

“I hope the pilot is,” she said. “It means they remember what can happen if they are careless.”

At the last minute the old service gate jammed. You could have returned to the control room and fired a cannon at it. Instead, the mechanic showed you a manual release behind a panel. You pulled. The door opened three inches, then five feet, then enough for a vehicle full of people who had stopped expecting anything good.

No one applauded. The transport rolled out under the artificial dawn. When Sol logged the mission, she left the column for enemy kills blank and filled the evacuation column by hand.`},
 {id:'second-cup',title:'The Hour Without a Price',era:'2046 · The Other You',world:'self',open:s=>!!s.flags['society-letter'],body:`Your future self knew the price of everything you had asked about: property, inventions, machine parts, the hours required to open another life. The ledger was spread on the table between two cups of tea. You had imagined this meeting for so long that it felt strange not to arrive with another question about success.

You offered them an hour. Not to borrow information. Not to learn the names of strangers you might love. Just to sit until the rain stopped.

“That costs more than you think,” the older stranger said.

“It costs one hour.”

“No. It costs the certainty that you could have spent it becoming somebody impressive.”

They were not mocking you. They moved the ledger aside and pointed through the window. Far below, someone was holding an umbrella for a person whose hands were full of groceries. A train was late. A child was trying to make a paper boat stay upright in the gutter.

You told your older self about a mistake you had never written down. They listened without granting forgiveness on anyone else's behalf. Then they told you about a small joy. It had no plaque, no prize, no connection to your money, and no reason to survive in a history book.

The clock on the wall reached the next hour. Your future self did not hurry you to the door.

“Do I become you?” you asked.

“Only if you make my choices. I hope you make some better ones.”

You stepped through the portal carrying no secret about tomorrow. For the first time, that felt like getting something valuable back.`},
 ...INVESTIGATION_CHAPTERS,
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
export function chapterById(state,id){const found=STORY.find(c=>c.id===id);if(!found||!found.open(state))return null;return {...found,open:true,body:found.body+storyAfterimage(state,id),number:STORY.indexOf(found)+1};}
export function activeChapter(state){
 const priorities={self:['the-photograph','doubledebt','parallel','missing','letter','elder'],past:['vey-contract','clocktower','invention','ada'],dungeon:['first-promise','warden','hollow'],mech:['titan-blackbox','titan'],future:['epilogue','unpriced-hour','ninth-platform','restoration','exchangebreach','exchange','city']};
 return priorities[state.world].map(id=>chapterById(state,id)).find(Boolean)||chapterById(state,'prologue');
}

