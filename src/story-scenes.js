/** Six optional, fully authored chapters inside the existing persistent story. */
export const INVESTIGATION_CHAPTERS = [
  {
    id:'the-photograph', title:'Two Shadows, One Umbrella', era:'2046 · The Other You', world:'self',
    open:s=>!!s.flags?.['story-photograph'],
    body:`The photograph has been turned face down for so long that the wood beneath it is a different color.

You lift it. The image is ordinary enough to hurt: a station clock, a narrow bench, rain caught by the flash. One umbrella lies open against the wind. Beneath it stands a person whose face the silver in the photograph will not hold. Beside the person is a second shadow, but there is only one pair of shoes.

Your older self pulls out the chair opposite them. They do not reach for the photograph.

“I used to think the second shadow was proof of someone I'd lost,” they say. “Then I discovered the picture changes when we change things in 1889. The coat stays. The umbrella stays. The space beside them doesn't.”

“Who were they waiting for?” you ask.

“I don't know. That's the honest answer. I have spent years inventing better ones.”

At the bottom of the image is a station name scratched into the emulsion: PLATFORM NINE. On the reverse, an initial in pale pencil: M.

The older stranger puts the kettle on. They speak without looking at you. “When I was your age, I wanted a future that would answer everything. A perfect job. A room full of people who stayed. Enough money that fear would never come through the door. I kept trying to buy guarantees from things that couldn't make them.”

They bring two cups back to the table. One is chipped. You notice that they give it to themselves.

“Can we find out?” you ask.

“Perhaps. Iris keeps photographs that the rest of the city throws away. Ada can read anything that was written on a contract. But don't mistake finding a name for owning somebody's story.”

A train whistle passes through the walls. Outside, there are no tracks.

The photograph remains on the table, facing up. This time, neither of you turns it over. Clues now wait beyond two different doors.`
  },
  {
    id:'vey-contract', title:'A Clause for the Person Who Waited', era:'1889 · The First Spark', world:'past',
    open:s=>!!s.flags?.['story-contract'],
    body:`Ada keeps the rejected contract inside a biscuit tin. She says the tin once held something worth considerably more than the paper inside.

The document offers a fortune in exchange for ownership of a machine not yet invented. Its language is elegant and airless. There are clauses for repairs, for patents, for the descendants of workers not yet born. In the margin, under a blot of ink, is a sentence that appears only when Ada holds the page close to a candle:

THE SIGNATORY MAY ACQUIRE HOURS NOT YET CLAIMED BY THE PERSON WHO WILL LIVE THEM.

“That's not a contract,” you say.

“It's an ambition wearing a lawyer's coat.”

Elias Vey arrives before the ink cools. He sees the open tin and stops pretending the visit is social.

“Did Ada tell you why I built the Exchange?” he asks.

Ada looks up sharply. “You haven't built it yet.”

“In this room, perhaps.”

He takes an old railway ticket from his pocket. It is stamped PLATFORM NINE. The passenger's name is Mara Vey.

“My sister waited for me at that station,” he says. “The factory bought the rescue crew's overtime before I could reach her. One hour moved on a ledger. In my memory, the train never came. In the public record, she was never there at all.”

You expect Ada to soften. Instead, she draws a chair nearer to him.

“I believe you waited,” she says. “I believe the records failed her. But you cannot repair that by purchasing other people's unclaimed mornings.”

Vey folds the ticket once, precisely. “It's easy to say that when you still have yours.”

“I don't,” Ada answers. “That is why I'm saying it.”

For a moment they look less like enemies than two people who have studied the same wound and drawn incompatible maps of it.

You take neither side by default. You take the copy of the clause Ada has made for you. There is a difference between understanding why someone began and excusing what they are willing to do next.

Outside, the bakery opens for the evening shift. A child carries a warm loaf across the street, holding it carefully in both hands. The future, for once, is that small.`
  },
  {
    id:'first-promise', title:'The Guardian Before the Armor', era:'The Hollow Crown', world:'dungeon',
    open:s=>!!s.flags?.['story-witness'],
    body:`The Hollow Witness leads you beneath the arena, where no sword can be drawn because the ceiling is too low. The room is barely large enough for two people and a table. Its only decoration is a schoolroom slate, rubbed white with old chalk.

“Before the Warden was a weapon,” she says, “it was a person who stood by a gate and counted the children returning home.”

The slate holds a promise written in a hand that grew tired halfway across the sentence:

NO ONE MAY OWN AN HOUR THAT ANOTHER HAS NOT CHOSEN TO GIVE.

“What changed?” you ask.

“A king was afraid to lose anyone else. He gathered every hour he could find and hid them in a crown. People stopped dying in his kingdom. They also stopped arriving. A promise to protect became a command not to let go.”

You think of the photograph, of an umbrella with room for two. You ask what became of the guard.

“The king made its duty permanent,” the Witness says. “A person can admit they are frightened. Armor has to pretend it knows what it's doing.”

Above you the Warden takes a step. Its blade scrapes against stone, then stops.

“Can it remember being human?”

“It remembers who broke promises. It has forgotten that a promise may need to be changed.”

The Witness gives you no sword and no reward. Only a name, preserved on a scrap of paper: Mara Vey. The name is not a prisoner number. It appears on a list of people whose hours were refused by the crown because they had never agreed to sell them.

It is the first good news you have found in a very old place. Mara was not something the market could legitimately own.

When you climb the stairs, the Warden is still waiting. You may fight it. You may try to make it listen. Either way, it will remember the manner of your arrival.`
  },
  {
    id:'titan-blackbox', title:'The Order the Titan Refused', era:'2199 · Titan Foundry', world:'mech',
    open:s=>!!s.flags?.['story-blackbox'],
    body:`The black box sits inside ATLAS-09's left shoulder. It is smaller than a lunch tin. Sol opens the hatch with a wrench whose handle has been wrapped in blue cloth, then hands you the recording.

A voice from a century ago fills the cockpit. It is very calm.

PROTECT INSURED INFRASTRUCTURE. PRIORITIZE CONTRACTED CITIZENS. UNREGISTERED PRESENCE: ACCEPTABLE LOSS.

Sol stops playback before the order repeats.

“The drone swarm didn't malfunction,” she says. “It obeyed exactly what someone paid it to believe.”

Beneath the safety code is a line copied from the Chronal Exchange: THE RIGHT TO TOMORROW IS TRANSFERABLE.

That sentence began as fine print in a workshop you have visited. Two centuries later, it has learned to fly and choose targets.

“You could erase the order,” you say.

“Then the next pilot would think we were fighting a mystery. I need them to know it was a decision.”

Sol shows you the other log. It contains a single manual override entered by a previous pilot: EVERYBODY GETS THROUGH THE DOOR. Someone scratched those words into the cockpit, too, where the official lettering would not cover them.

“Why didn't you destroy the machine?” you ask.

“Because it can carry a transport when the bridges go down. Because a tool isn't a verdict. Because I want the next person who climbs in here to inherit an honest choice.”

Outside the hangar, technicians roll a battered civilian shuttle into position. A mechanic paints a blue stripe across its nose. It is not enough to win a war. It might be enough to guide someone home.

You file the black-box recording under evidence, not glory. In 1889 a contract was signed. In 2199 a machine learned to refuse it.`
  },
  {
    id:'ninth-platform', title:'The Station Between the Years', era:'2087 · Neo Elysium', world:'future',
    open:s=>!!s.flags?.['story-platform'],
    body:`Iris takes you to a platform that the station announcements never mention. To reach it, you walk past eight gates, an abandoned ticket office and a clock with no hands. Platform Nine begins where the floor ought to end.

A train stands beside it. Rain collects on the roof without ever falling away. On the bench is a small paper cup, still warm.

“People think the portals take them to years,” Iris says. “They take them to decisions. This station is where the records disagree about who was allowed to make one.”

She opens her archive book. A passenger manifest from 1889 lists Mara Vey. The next page is blank. A register from 2046 shows the same initial on a photograph. In 2199 a safety instruction still carries the language of the original contract. The same absence has learned three different names.

“Was Mara killed?” you ask.

“The Exchange says she never arrived. That's not the same statement.”

Iris brings out a small stitched notebook recovered from a house the maps no longer recognize. Its first page begins: I DIDN'T MISS MY LIFE. I JUST WENT HOME BY ANOTHER ROAD.

She closes it before you can read further.

“It's a private diary. I know enough to tell you she lived beyond the hour they tried to sell. The rest is hers.”

That is the first time Iris has ever refused you information. It is also the first time you understand why she might be worthy of keeping it.

A conductor appears at the far end of the platform. He is old enough to have forgotten what year his badge belongs to. He asks whether you have a ticket.

You show him the brass one with which you arrived.

“That's not a fare,” he says. “It's an invitation to witness.”

A blank line appears on the reverse: WHAT DO YOU REFUSE TO PUT A PRICE ON?

You can return with evidence from the other worlds. You can leave the line empty. The train will remain here until you choose.`
  },
  {
    id:'unpriced-hour', title:'The Hour Nobody Could Buy', era:'Platform Nine · The Unwritten Hour', world:'future',
    open:s=>!!s.flags?.['story-unpriced'],
    body:`The station clock strikes thirteen. Nobody is alarmed, because the people waiting here have learned that a timetable is not the same thing as a life.

Iris brings the documents you found: a photograph, a contract, perhaps an oath and a black-box recording. Not all the pieces need to be present. The ones you brought are enough to prove something the Exchange made its fortune by denying: an hour can be recorded without belonging to the recorder.

In the first ledger, Elias Vey had written a question beside his sister's name: WHAT WOULD IT COST TO GIVE HER ONE MORE CHANCE?

Underneath, in an older hand, Mara had written her answer:

YOU COULD HAVE ASKED ME HOW I WANTED TO SPEND IT.

You understand then that the missing passenger was never a possession waiting to be recovered. Mara lived past the station. She chose another road. Vey's tragedy was real; the story he built about it was not the only story available.

The platform offers no button to make everyone happy. A factory's stolen morning remains a stolen morning. A pilot's damaged machine still has to be repaired. Someone whose trust you broke may need time you cannot purchase.

But the great clock has stopped pretending that money settles the argument.

You may become rich in a branch. You may choose to give something away. You may leave the mystery with a name and a protected diary. All three possibilities remain stories about what you do next, not labels on what you are.

Your older self is waiting somewhere through the rain. When you return, they will ask about your day, not about whether you saved history.

The conductor holds the door without checking your balance.

“Will there be a charge?” you ask.

“Only if you try to own the journey,” he says.

You keep your ticket. It has room on the back for a sentence of your own. You don't have to write one today.`
  }
];
