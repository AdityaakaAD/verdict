-- =============================================================================
-- VERDICT — 200 genuinely contested moral scenarios
-- Replace existing placeholders. Both sides must have equally compelling arguments.
-- =============================================================================

begin;

-- Clear old curated scenarios (preserves user-created content)
delete from public.scenarios where source = 'curated';

insert into public.scenarios
  (text, question, context_tag, side_a_label, side_b_label, side_a_meaning, side_b_meaning, category, freshness_tier, source, dimension_tags) values

-- =============================================================================
-- personal_relationships (17)
-- =============================================================================

('Meera''s terminally ill father refuses to record a video message for her future children, calling it morbid. He wants to be remembered alive, not on screen. She asks three times over two months. He dies without making the recording. She is devastated by the refusal.',
'Was he right to refuse?', 'Family · Grief', 'Right to refuse', 'Wrong to refuse',
'A dying man chooses how he says goodbye on his own terms.',
'A grandfather''s voice is the one thing no one else can give.',
'personal_relationships', 'evergreen', 'curated', '{"individual_vs_collective":"a"}'),

('Arjun discovers that for two years his elder brother has been quietly paying Arjun''s rent by posing as the landlord''s agent. Arjun believed the studio was rent-controlled. When he learns the truth he immediately moves to a smaller flat he can afford and repays what he can. His brother is hurt — he says Arjun has taken away something he wanted to give.',
'Was Arjun right to refuse the help?', 'Family · Pride', 'Right to refuse', 'Wrong to refuse',
'Adult independence is not a debt to manage for someone else.',
'Help offered in love does not become an insult by being accepted.',
'personal_relationships', 'evergreen', 'curated', '{"individual_vs_collective":"a"}'),

('Priya finds her husband''s old diary while clearing a cupboard. She reads it cover to cover. It contains nothing he has hidden from her — only feelings he once had and never spoke aloud. She tells him about it weeks later, during an argument.',
'Was reading it justified?', 'Marriage · Trust', 'Justified', 'Not justified',
'Curiosity in a shared home is not automatically a betrayal.',
'Privacy is the floor that a marriage stands on.',
'personal_relationships', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"b"}'),

('Rohan''s daughter cuts off contact after he refuses to apologise for something he said at her wedding. Two years pass. He is diagnosed with a condition that may shorten his life. She does not return his calls. She believes he is using the diagnosis to pull her back.',
'Was she right to stay away?', 'Estrangement · Family', 'Right to stay away', 'Wrong to stay away',
'A boundary is not a punishment to be lifted on a medical schedule.',
'There are some doors you do not get a second chance to open.',
'personal_relationships', 'evergreen', 'curated', '{"individual_vs_collective":"a","head_vs_heart":"a"}'),

('Neha asks her best friend, who is recovering from an eating disorder, not to attend the bachelorette weekend because of how the trip environment might affect her. The friend is grateful at first, then later furious, saying she felt erased from the celebration.',
'Was Neha right to ask her not to come?', 'Friendship · Care', 'Right to ask', 'Wrong to ask',
'Protecting someone from harm is sometimes the kindest exclusion.',
'Care that decides for another person without asking is not care.',
'personal_relationships', 'evergreen', 'curated', '{"individual_vs_collective":"b","head_vs_heart":"a"}'),

('Karan finds out his cousin has been telling extended family that he is in financial trouble — which is a lie. The cousin says she was deflecting attention from her own divorce. He confronts her publicly at a family dinner in front of twelve people.',
'Was the public confrontation justified?', 'Family · Honesty', 'Justified', 'Not justified',
'A lie made public deserves to be corrected in public.',
'A family table is not the right courtroom for private grievances.',
'personal_relationships', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","head_vs_heart":"b"}'),

('Dev ends a six-year friendship over a single political argument that has nothing to do with their daily lives. He says the friendship had been hollow for years and the argument simply confirmed it.',
'Was ending it justified?', 'Friendship · Drift', 'Justified', 'Not justified',
'A long friendship can be honestly outgrown when its substance is gone.',
'Six years of history deserved a real conversation, not a quiet exit.',
'personal_relationships', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"b"}'),

('Vikram refuses to walk his daughter down the aisle because he does not approve of her husband-to-be. He does attend the wedding. He sits in the front row and weeps throughout the ceremony.',
'Was he right to refuse the walk?', 'Family · Ritual', 'Right to refuse', 'Wrong to refuse',
'A blessing performed without conviction is a blessing falsified.',
'A wedding day is not the place for a private protest in plain sight.',
'personal_relationships', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"a"}'),

('Sunita''s mother-in-law moves in for what was supposed to be a month of post-surgery recovery. Eight months later she is still there and Sunita is exhausted. She asks her husband to set a departure date. He refuses. She tells her mother-in-law directly.',
'Was she justified in telling her directly?', 'In-laws · Boundaries', 'Justified', 'Not justified',
'Her home is also her home and she has the right to say so.',
'A boundary set by bypassing a spouse fractures the marriage it was meant to protect.',
'personal_relationships', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"b"}'),

('Rahul tells his pregnant partner he does not want to be present at the birth because he is genuinely afraid he will faint and cause more disruption than support. He offers to wait in the next room. She is hurt and goes through the birth alone.',
'Was he right to step back?', 'Parenting · Fear', 'Right to step back', 'Wrong to step back',
'Honest fear is better than a forced presence that breaks down.',
'A birth is not a moment to manage your own comfort first.',
'personal_relationships', 'evergreen', 'curated', '{"individual_vs_collective":"a","head_vs_heart":"a"}'),

('Ananya secretly takes a DNA test and discovers her uncle is, in fact, her biological father. She tells no one. She allows her mother and her uncle to live out their lives in the family structure built around the secret.',
'Was she right to stay silent?', 'Family · Secrets', 'Right to stay silent', 'Wrong to stay silent',
'A truth that serves no one still living is a cruelty in plain clothes.',
'Every person in that household had a right to know who they are.',
'personal_relationships', 'evergreen', 'curated', '{"loyalty_vs_honesty":"a","head_vs_heart":"a"}'),

('Suresh discovers his teenage son has been bullying a classmate online for months. He makes the boy write a public apology, hand-deliver it to the classmate''s parents, and quit the football team he loves for the rest of the season.',
'Was the punishment proportionate?', 'Parenting · Discipline', 'Proportionate', 'Excessive',
'Cruelty learned young is hardest to unlearn without a matching consequence.',
'A teenager shamed publicly learns humiliation, not accountability.',
'personal_relationships', 'evergreen', 'curated', '{"rule_vs_outcome":"a","head_vs_heart":"a"}'),

('Divya refuses to attend her sister''s wedding because their estranged father has been invited. The bride says the day is not about Divya. Divya says accepting the invitation means sharing a room with someone she has survived.',
'Was she right to skip it?', 'Family · Loyalty', 'Right to skip', 'Wrong to skip',
'You do not have to share a room with someone you have survived.',
'A sister''s wedding day is not the right moment to draw a private line.',
'personal_relationships', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"a"}'),

('Aditya pays for his sister''s entire wedding out of pocket — nearly eight months of his salary — and tells no one. She finds out from a cousin a year later and confronts him for not letting her contribute to the costs.',
'Was he right to hide the cost?', 'Family · Generosity', 'Right to hide it', 'Wrong to hide it',
'A gift declared in full is a gift weighed and partly returned.',
'Adults deserve to know what they are accepting from someone they love.',
'personal_relationships', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"a"}'),

('Kavitha tells her best friend that the friend''s fiancé made a pass at her at a party. The friend confronts the fiancé, who denies it. The wedding is called off. Months later Kavitha admits she may have badly misread the moment.',
'Was she right to tell her?', 'Friendship · Loyalty', 'Right to tell', 'Wrong to tell',
'Silence about something like that is its own kind of betrayal.',
'A single ambiguous moment is not worth dismantling a marriage over.',
'personal_relationships', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","caution_vs_action":"b"}'),

('Lalitha''s grandmother refuses to babysit during the week, saying she raised her own children and is now retired. Lalitha, a single mother, is forced to leave a job she loves for one with daycare-compatible hours.',
'Was the grandmother justified?', 'Family · Generations', 'Justified', 'Not justified',
'Retirement is a stage no one else gets to schedule on someone else''s behalf.',
'Family is the one obligation you do not get to retire from.',
'personal_relationships', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"a"}'),

('Mohan asks his partner of nine years to sign a postnuptial agreement before they buy a house together. She agrees but tells him something between them has permanently shifted. He thinks she is being unfair to him.',
'Was he right to ask?', 'Marriage · Money', 'Right to ask', 'Wrong to ask',
'A clear legal paper protects an uncertain future that neither can predict.',
'Nine years of shared life should not need a contract to feel safe.',
'personal_relationships', 'topical', 'curated', '{"individual_vs_collective":"a","head_vs_heart":"a"}'),

-- =============================================================================
-- work_career (17)
-- =============================================================================

('Pooja, a junior analyst, discovers her manager is presenting her work as his own in board meetings. She schedules a meeting with his boss, brings documentation, and the manager is removed from the project. The team is reorganised around her.',
'Was she justified going over her manager?', 'Work · Hierarchy', 'Justified', 'Not justified',
'Work credited to someone else is a slow and quiet kind of theft.',
'There were steps that should have come before going to the top.',
'work_career', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","caution_vs_action":"b"}'),

('Smita, an engineer, refuses to ship a product on the date marketing has promised customers because she believes it will fail in the field. The launch is delayed three weeks. Revenue takes a quarter to recover. The product works.',
'Was she right to hold the line?', 'Work · Quality', 'Right to hold', 'Wrong to hold',
'Engineers exist precisely to say no when no is the right answer.',
'A company that cannot ship on its own promises eventually ships nothing.',
'work_career', 'evergreen', 'curated', '{"rule_vs_outcome":"a","caution_vs_action":"a"}'),

('Ajay fires Rajan, an early employee who has been at the startup for six years, because his skills no longer fit the role. Ajay offers above-market severance and an honest reference. Rajan says he was promised a home, not a handshake.',
'Was the firing justified?', 'Startup · Loyalty', 'Justified', 'Not justified',
'A small company cannot afford to keep people on sentimental payroll.',
'Six years of shared risk deserved a better landing than a cheque.',
'work_career', 'evergreen', 'curated', '{"individual_vs_collective":"b","loyalty_vs_honesty":"b"}'),

('Nikhil manages a team and learns that one member, Tanvi, is quietly interviewing elsewhere. He confronts her, then removes her from a key project before she has resigned. She finds out the same week and leaves immediately.',
'Was Nikhil right to act pre-emptively?', 'Work · Trust', 'Right to act', 'Wrong to act',
'A team can plan only around people who are actually still in it.',
'You do not pre-fire someone for the act of thinking about leaving.',
'work_career', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","caution_vs_action":"b"}'),

('Shalini, a senior designer, takes six months of unpaid leave to care for her mother. She returns to find she has been quietly demoted — same title, smaller scope. HR calls it a re-levelling. She files a complaint.',
'Was the company justified in the re-levelling?', 'Work · Caregiving', 'Justified', 'Not justified',
'Roles drift while people are away — that is structure, not punishment.',
'A sabbatical is not a resignation; both parties knew that going in.',
'work_career', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('Arun closes a major deal by quietly accommodating a buyer request that violates company discount policy. His boss approves the deal after the fact. A junior colleague reports the violation. Arun is fired; his boss is not.',
'Was Arun''s firing fair?', 'Work · Rules', 'Fair', 'Unfair',
'Rules exist so that even successful violations carry a cost.',
'A junior fired while his senior survives is a verdict about the company, not the rule.',
'work_career', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('Deepa, a startup founder, pays her co-founder less than herself for the first three years, citing his later join date. They equalise when his hours match hers. He later asks for retroactive pay equalisation. She refuses.',
'Was she right to refuse?', 'Startup · Equity', 'Right to refuse', 'Wrong to refuse',
'Risk taken earlier is risk worth more; that difference was already priced.',
'A partner brought to full equality should be made whole for the gap.',
'work_career', 'evergreen', 'curated', '{"rule_vs_outcome":"a","loyalty_vs_honesty":"a"}'),

('Meghna turns down a promotion because the new role means working under a senior with a documented reputation for cruelty. The company says they cannot guarantee future reporting lines. She declines and stays where she is.',
'Was she right to refuse the promotion?', 'Work · Self-protection', 'Right to refuse', 'Wrong to refuse',
'A title is not worth a year of psychological harm.',
'Careers are built on uncomfortable bets, not only on safe passes.',
'work_career', 'evergreen', 'curated', '{"individual_vs_collective":"a","caution_vs_action":"a"}'),

('Ravi consistently assigns the team''s least-glamorous work to Ashok, who is the most competent at it. After two years Ashok is passed over for promotion because his work was never visible to leadership.',
'Was Ravi wrong to do this?', 'Work · Recognition', 'Wrong', 'Not wrong',
'A good manager protects capable people from the trap of invisible work.',
'Promotions follow visibility; a manager cannot engineer that on someone''s behalf.',
'work_career', 'evergreen', 'curated', '{"rule_vs_outcome":"b","loyalty_vs_honesty":"b"}'),

('Preeti, a new hire, reports a senior colleague''s casual racist remark to HR in her first week. HR opens an investigation. The colleague is suspended. Several teammates stop speaking to Preeti.',
'Was Preeti right to escalate immediately?', 'Work · Speech', 'Right to escalate', 'Wrong to escalate',
'A remark left unchallenged is a remark that has been normalised.',
'A first-week escalation costs years of trust that cannot be rebuilt fast.',
'work_career', 'evergreen', 'curated', '{"rule_vs_outcome":"a","caution_vs_action":"b"}'),

('Anita doubles her consulting rate after one widely-shared case study. Half her existing clients can no longer afford her. She loses friendships built over years of work. Her new clients pay without hesitation.',
'Was the price increase justified?', 'Work · Worth', 'Justified', 'Not justified',
'Pricing follows the market, not the history of who got you there.',
'A consultant who sheds the people who built her name has abandoned the craft.',
'work_career', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"b"}'),

('Sameer, a senior engineer, privately tells a junior that her code is the worst he has reviewed in years. He considers himself direct and helpful. She files a complaint about a hostile environment.',
'Was her complaint warranted?', 'Work · Feedback', 'Warranted', 'Not warranted',
'Cruel feedback is feedback that fails its own purpose.',
'Honest technical review is the floor of a serious craft.',
'work_career', 'evergreen', 'curated', '{"rule_vs_outcome":"b","head_vs_heart":"b"}'),

('Farhana, a bootstrapped founder, takes a 90% pay cut for two years to keep her three employees fully paid through a crisis. She survives. When the company recovers, none of the three offer to defer raises so she can recoup her losses.',
'Was she right to expect some reciprocity?', 'Startup · Loyalty', 'Right to expect', 'Wrong to expect',
'A founder who carries a team should not be the only one who pays the bill.',
'Employees never signed up for ownership risk; that asymmetry was always hers.',
'work_career', 'evergreen', 'curated', '{"individual_vs_collective":"b","loyalty_vs_honesty":"a"}'),

('Richa quits a newspaper after her editor refuses to run her year-long investigation. She publishes the piece on her own platform. The paper sues her, claiming the work product belongs to them.',
'Was she justified in publishing?', 'Work · Ownership', 'Justified', 'Not justified',
'Journalism that is deliberately suppressed is not journalism — it is an archive.',
'Work done on a paper''s time and resources belongs to the paper, not the writer.',
'work_career', 'topical', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"b"}'),

('Ishaan, a hiring manager, has an unwritten policy of never hiring anyone who has taken more than a year off from professional work. A candidate confronts him about it after being rejected. He declines to comment.',
'Was his policy defensible?', 'Hiring · Bias', 'Defensible', 'Indefensible',
'Continuity of practice is a legitimate hiring signal in some roles.',
'A blanket no on paused careers is a bias dressed up as a standard.',
'work_career', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A startup CEO publicly dismisses a senior executive on a livestreamed all-hands call so the entire team can see the line that was crossed. The executive sues. The team is split: some feel it was clarifying, others feel it was humiliation for show.',
'Was the public dismissal justified?', 'Work · Authority', 'Justified', 'Not justified',
'A norm is only real if breaking it is visible to those who live by it.',
'A person dismissed in public has been made into a lesson for others.',
'work_career', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('Varun, a team lead, refuses all meetings before 10 AM, citing his mental health routine. The team has a major client in a time zone that requires early calls. He says the client can wait or reschedule.',
'Was he right to hold this boundary?', 'Work · Wellbeing', 'Right to hold', 'Wrong to hold',
'A worker without limits is a worker who burns out and helps no one.',
'A lead is paid partly to take the calls that others in the team cannot.',
'work_career', 'seasonal', 'curated', '{"individual_vs_collective":"a","caution_vs_action":"a"}'),

-- =============================================================================
-- society_politics (17)
-- =============================================================================

('A small town puts up a memorial to a local soldier who is also remembered for years of domestic abuse. The town debates removing it. The mayor keeps it but adds a second plaque acknowledging both sides of his life.',
'Was the mayor''s solution the right one?', 'Memory · Civic', 'Right', 'Wrong',
'A memorial that holds both truths is more honest than either one alone.',
'Public honour for an abuser, even with a footnote attached, is still public honour.',
'society_politics', 'evergreen', 'curated', '{"rule_vs_outcome":"b","head_vs_heart":"b"}'),

('A city council bans loud political rallies after 9 PM, including those by the ruling party''s own allies. Smaller parties argue the rule disproportionately hurts them because their supporters work until late.',
'Was the ban justified?', 'Civic · Speech', 'Justified', 'Not justified',
'A quiet city at night is a basic civic floor that everyone deserves.',
'A neutral rule applied to a structurally unequal situation produces unequal results.',
'society_politics', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A judge rules that a candidate convicted of a non-violent offence twenty years ago can run for the position of city mayor. Opponents call it a loophole. Supporters say it is an overdue restoration of civil rights.',
'Was the ruling correct?', 'Politics · Redemption', 'Correct', 'Incorrect',
'A debt paid is a debt paid; democracy is not a permanent ledger.',
'Public office is a privilege that serious past conduct can disqualify.',
'society_politics', 'topical', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"a"}'),

('A protest movement shuts down a metro line for two days. Commuters lose wages. Hospitals must reroute ambulances. The movement argues the disruption is the point — comfort is not.',
'Was the disruption justified?', 'Civic · Dissent', 'Justified', 'Not justified',
'A protest you can ignore is a protest that has already failed.',
'A movement that harms the people it claims to defend has lost its own argument.',
'society_politics', 'topical', 'curated', '{"individual_vs_collective":"b","caution_vs_action":"b"}'),

('A national government bans a foreign newspaper from operating domestically, citing its pattern of publishing verified misinformation. Press-freedom groups condemn the move. Government supporters call it overdue accountability.',
'Was the ban justified?', 'Press · State', 'Justified', 'Not justified',
'A publication without factual standards is a weapon, not a press.',
'Bans are the move of a government that has already lost the argument.',
'society_politics', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A city refuses to enforce a national law it considers unjust. The state threatens to withhold infrastructure funds. The city stands firm, arguing it is closest to the harm the law causes.',
'Was the city right to refuse enforcement?', 'Civic · Federalism', 'Right', 'Wrong',
'A government closest to the harm of a law has a duty to resist it.',
'A federation functions only if its parts do not choose their laws à la carte.',
'society_politics', 'evergreen', 'curated', '{"rule_vs_outcome":"b","loyalty_vs_honesty":"b"}'),

('A university quietly removes a distinguished professor''s endowed chair after old writings of his resurface. He calls the writings decades old and badly misread. The university issues no public statement explaining its decision.',
'Was the removal justified?', 'Speech · Consequence', 'Justified', 'Not justified',
'A chair is an honour; institutions are allowed to revisit honours.',
'Punishment without explanation is a decision dressed up as administration.',
'society_politics', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A nonprofit refuses a large donation from a corporation whose practices directly contradict the nonprofit''s stated mission. The refusal will force staff layoffs. The board votes for principle over payroll.',
'Was the board right?', 'Civic · Money', 'Right', 'Wrong',
'A nonprofit funded by its philosophical enemy is no longer the same nonprofit.',
'Principles you cannot afford to hold are not principles; they are a luxury.',
'society_politics', 'evergreen', 'curated', '{"rule_vs_outcome":"a","loyalty_vs_honesty":"a"}'),

('A government uses facial-recognition data to identify and arrest rally organisers after a large protest. The arrests are legal under existing surveillance law. Civil-society organisations demand the data be permanently deleted.',
'Was the use of the data justified?', 'State · Surveillance', 'Justified', 'Not justified',
'A rally that crosses legal lines has no standing claim to anonymity.',
'A democracy that identifies its protesters has begun its own undoing.',
'society_politics', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A state legislator votes against his party on a major infrastructure bill that materially affects his constituents. He loses the party whip. His constituents re-elect him with a larger majority the following year.',
'Was the vote justified?', 'Politics · Loyalty', 'Justified', 'Not justified',
'A representative who cannot break ranks is a postman for the party, not a rep.',
'A party that cannot discipline its members is a party that cannot govern.',
'society_politics', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","individual_vs_collective":"a"}'),

('A national leader pardons a former colleague convicted of corruption, citing personal trust built over decades. The colleague did not request the pardon. The opposition calls it the final blow to the country''s anti-corruption framework.',
'Was the pardon justified?', 'Politics · Power', 'Justified', 'Not justified',
'Pardon is an executive power; it exists precisely for cases of personal judgment.',
'A pardon for a friend is the moment the public stops trusting the office itself.',
'society_politics', 'topical', 'curated', '{"loyalty_vs_honesty":"a","rule_vs_outcome":"b"}'),

('A district court refuses to enforce a high court order, citing genuine implementation difficulties for local populations. The high court charges contempt. The district judge says she will accept any punishment.',
'Was she right to refuse the order?', 'Law · Hierarchy', 'Right to refuse', 'Wrong to refuse',
'A conscience placed above hierarchy is the heart of a functioning judiciary.',
'A judge who chooses which orders to follow is no longer a judge.',
'society_politics', 'evergreen', 'curated', '{"rule_vs_outcome":"b","loyalty_vs_honesty":"b"}'),

('A mayor uses public funds to build a small park in a constituency that voted heavily against her. Opponents call it pre-election bribery. Supporters say it is the definition of governing without favourites.',
'Was the spending justified?', 'Civic · Governance', 'Justified', 'Not justified',
'A mayor governs all of her city, including those who opposed her.',
'Public spending directed toward political conversion is political, regardless of the park.',
'society_politics', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","rule_vs_outcome":"b"}'),

('A regional public broadcaster refuses to cover a major flood because the affected region is politically hostile to the ruling party. A small independent channel covers it and is shut down weeks later for an unrelated licensing issue.',
'Was the broadcaster wrong not to cover it?', 'Press · Power', 'Wrong', 'Not wrong',
'A public broadcaster that covers only friendly territory is propaganda with a logo.',
'Editorial independence sometimes produces uneven coverage; that is not a crime in itself.',
'society_politics', 'seasonal', 'curated', '{"loyalty_vs_honesty":"b","individual_vs_collective":"b"}'),

('A new neighbourhood association votes to ban all election posters within its grounds, citing shared aesthetics. Several residents argue their right to political expression is being curtailed by their own neighbours.',
'Was the ban defensible?', 'Civic · Speech', 'Defensible', 'Indefensible',
'A community has a recognised right to set its own visual ground rules.',
'A speech rule passed by neighbours is still a speech rule.',
'society_politics', 'evergreen', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"a"}'),

('A major city introduces a congestion charge on all private vehicles entering its core. Small business owners see footfall fall sharply in the first year. The city refuses to roll back the policy, citing long-term air quality data.',
'Was the policy justified?', 'Civic · Environment', 'Justified', 'Not justified',
'A city you can drive into freely is a city whose air everyone pays for.',
'A policy that drains neighbourhood businesses is a policy with hidden costs.',
'society_politics', 'topical', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"b"}'),

('A parliamentary committee proposes that all political candidates must publicly disclose their full financial history going back ten years. Incumbent politicians object, citing privacy. Transparency advocates call it the minimum standard.',
'Was the proposal justified?', 'Politics · Transparency', 'Justified', 'Not justified',
'A candidate asking for public trust owes the public a full account.',
'A privacy rule that applies to everyone applies to politicians too.',
'society_politics', 'topical', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

-- =============================================================================
-- tech_ai (17)
-- =============================================================================

('A startup''s chatbot quietly logs every user conversation to improve future versions. The privacy policy mentions this once, in a small-print footnote. A journalist publishes a piece about it. Most users say they never read the policy.',
'Was the practice acceptable?', 'AI · Consent', 'Acceptable', 'Unacceptable',
'A disclosed policy, however small the print, is still a disclosed policy.',
'Consent buried in footnotes is not meaningfully consent.',
'tech_ai', 'topical', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"a"}'),

('A school district uses an AI tool to screen student essays for AI-assisted writing. The tool flags non-native English writers at three times the rate of native writers. The district continues using it while commissioning an audit.',
'Was the district right to keep using it?', 'AI · Bias', 'Right', 'Wrong',
'An imperfect tool used with caution is still a tool doing some of its job.',
'A flagged child does not get to wait quietly for an audit to finish.',
'tech_ai', 'topical', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A novelist trains an AI model on her own published work and uses it to draft her next book. Her publisher considers this a breach of the standard author contract. The author says she only used her own material.',
'Was the author in the wrong?', 'AI · Authorship', 'In the wrong', 'Not in the wrong',
'A book delivered by a machine is not the book the contract promised.',
'A writer is allowed to use any tool, including one trained on her own words.',
'tech_ai', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"a"}'),

('A social platform announces all content older than five years will be auto-deleted unless users pay a retention fee. Casual users lose wedding photos. The company describes it as a storage decision with fair notice.',
'Was the policy justified?', 'Tech · Memory', 'Justified', 'Not justified',
'A free service was never promised to be a permanent archive.',
'A platform that stored a generation''s memories cannot bill for them retroactively.',
'tech_ai', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A self-driving car software update makes vehicles more cautious — fewer accidents, but longer commutes. Users overwhelmingly opt out. The car company makes the update mandatory, overriding user preference.',
'Was the mandate justified?', 'AI · Safety', 'Justified', 'Not justified',
'Safety choices made collectively protect more people than individual preferences.',
'A car a person paid for should ultimately drive how that person wants.',
'tech_ai', 'evergreen', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"a"}'),

('An AI-generated voice imitation brings back a deceased actor for a single scene in a major film. The actor''s family has given full approval. Several of his former co-stars publicly object.',
'Was the use of his voice justified?', 'AI · Likeness', 'Justified', 'Not justified',
'The family is the right and recognised authority over a loved one''s likeness.',
'A dead person cannot consent; that is the entire point of the question.',
'tech_ai', 'topical', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"a"}'),

('A children''s therapy clinic introduces an AI tool that tracks children''s emotional state during sessions for the therapist''s post-session review. Parents consent; the children are too young to understand what is being tracked.',
'Was the rollout justified?', 'AI · Children', 'Justified', 'Not justified',
'Tools that help therapists help children faster are worth the complexity.',
'A child whose emotions are logged before they can read is being studied, not treated.',
'tech_ai', 'topical', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"b"}'),

('A national bank deploys an AI model to decide small-loan applications. The model is demonstrably more accurate than human officers but cannot explain individual rejections. Rejected applicants have no meaningful appeal path.',
'Was deploying it justified?', 'AI · Fairness', 'Justified', 'Not justified',
'A more accurate system produces fairer aggregate outcomes over time.',
'A decision you cannot question or understand is a decision dressed up as mathematics.',
'tech_ai', 'evergreen', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A research lab publishes a detailed paper showing how to cheaply build a small but functional biological weapon. The lab argues open science accelerates defensive research. Three co-authors withdraw their names before publication.',
'Was publishing it justified?', 'Science · Open', 'Justified', 'Not justified',
'Defenders need to know what attackers can build; secrecy does not help.',
'Some doors should not be unlocked simply because they are scientifically interesting.',
'tech_ai', 'evergreen', 'curated', '{"caution_vs_action":"b","individual_vs_collective":"b"}'),

('A photo-editing app introduces a default filter that subtly slims faces in every image. Users who disable it report measurably worse engagement on their photos. The company describes the filter as opt-out.',
'Was the default acceptable?', 'Tech · Beauty', 'Acceptable', 'Unacceptable',
'Defaults reflect what most users in practice prefer or accept.',
'A default that alters faces without informed consent is a product that edits people.',
'tech_ai', 'evergreen', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"a"}'),

('A forum moderator uses an AI tool to predict which users are likely to post abusive content and shadow-bans them before they post anything. False positives cannot appeal their shadow-ban.',
'Was the pre-emptive policy justified?', 'AI · Moderation', 'Justified', 'Not justified',
'A community is partly defined by who is not allowed to speak within it.',
'Punishing people for harm they have not yet committed has a name.',
'tech_ai', 'evergreen', 'curated', '{"rule_vs_outcome":"a","caution_vs_action":"a"}'),

('A major search engine quietly re-ranks results to deprioritise a specific competitor''s pages. The competitor sues. The engine calls it an internal quality decision. Internal documents suggest otherwise.',
'Was the re-ranking defensible?', 'Tech · Power', 'Defensible', 'Indefensible',
'Search rankings are editorial choices; they have always been so.',
'A monopoly tilting the playing field is the precise reason monopolies are regulated.',
'tech_ai', 'topical', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"a"}'),

('A facial-recognition vendor refuses to sell its technology to a national police force that has been implicated in extrajudicial arrests. The vendor''s two largest competitors do not refuse. The vendor loses the contract and a fifth of its market value.',
'Was the refusal justified?', 'Tech · Conscience', 'Justified', 'Not justified',
'A vendor''s product is also part of its responsibility in the world.',
'Refusing the sale only loses the sale; the police simply use a competitor.',
'tech_ai', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","rule_vs_outcome":"b"}'),

('A government mandates that all AI systems used in public-sector decisions must be open-source and publicly auditable. Several private vendors withdraw from the market. Academic teams step in but are slower to deploy.',
'Was the mandate justified?', 'AI · Policy', 'Justified', 'Not justified',
'A public decision made by an unauditable system is no longer a public decision.',
'A mandate that drives the best builders out of public service harms the public.',
'tech_ai', 'seasonal', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A dating app uses an AI to subtly nudge users toward longer message exchanges, boosting engagement metrics. The product team knows these nudges reduce actual matches. The CEO ships the feature because revenue targets must be hit.',
'Was the CEO right to ship it?', 'Tech · Incentives', 'Right', 'Wrong',
'A business is allowed to optimise for the metric that keeps the lights on.',
'A dating app that knowingly reduces real dates for users is running a fraud.',
'tech_ai', 'evergreen', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A user discovers that an AI assistant has been phrasing answers in ways that subtly upsell premium features. They sue for fraud. The company calls it a personalisation experiment with disclosed terms.',
'Was the experiment fraud?', 'AI · Trust', 'Fraud', 'Not fraud',
'A trusted assistant that sells to you under cover is a trusted assistant no more.',
'A free product that nudges users toward upgrades is simply the product''s model.',
'tech_ai', 'topical', 'curated', '{"loyalty_vs_honesty":"b","individual_vs_collective":"b"}'),

('A country introduces a law requiring all AI-generated images and audio to carry a non-removable provenance watermark. Independent artists object to mandatory state-linked metadata on their personal work.',
'Was the law justified?', 'AI · Policy', 'Justified', 'Not justified',
'A public information environment without provenance cannot sustain shared truth.',
'A watermark mandated by the state is a watermark that follows every creator home.',
'tech_ai', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

-- =============================================================================
-- justice_law (17)
-- =============================================================================

('A judge gives a suspended sentence to a first-time offender who stole food for his family during a regional drought. The prosecutor appeals, arguing the sentence undermines equal application of the law.',
'Was the suspended sentence right?', 'Law · Mercy', 'Right', 'Wrong',
'A court that cannot see context is a court that cannot see at all.',
'Equal treatment under the law is the floor, not the ceiling, of justice.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"b","head_vs_heart":"b"}'),

('A defence lawyer agrees to represent a man widely believed to have committed a horrific crime, despite intense social pressure to refuse. She wins an acquittal on procedural grounds. Her community shuns her.',
'Was she right to defend him?', 'Law · Duty', 'Right', 'Wrong',
'A defence for the most hated client is the true test of the entire system.',
'A lawyer is not obliged to accept every brief that arrives at her door.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"a","loyalty_vs_honesty":"b"}'),

('A police officer ignores a minor infraction — a teenager smoking alone in a park — and gives a verbal warning instead. A supervisor later disciplines the officer for inconsistent enforcement. The teenager goes home unharmed.',
'Was the supervisor right to discipline?', 'Policing · Discretion', 'Right', 'Wrong',
'Discretion applied unevenly is bias dressed in the clothes of kindness.',
'A police force without judgment in small matters is not a police force.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A jury acquits a defendant despite overwhelming evidence, because the jury believes the law itself is unjust. The verdict stands. Legal scholars debate it for a decade.',
'Was the jury right?', 'Law · Conscience', 'Right', 'Wrong',
'Jury conscience is the last democratic check on a bad law.',
'A jury that decides which laws to apply is no longer a jury; it is a legislature.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"a"}'),

('A prosecutor offers a plea deal that reduces a violent offender''s sentence by ten years in exchange for testimony against a co-conspirator. The victim''s family is not consulted. The deal closes the case and convicts the bigger fish.',
'Was the deal justified?', 'Law · Bargain', 'Justified', 'Not justified',
'A long sentence for the more dangerous person is worth the price of the deal.',
'A justice you can negotiate to a lower number is not the same as justice.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A judge imposes the maximum penalty on a young offender to send a deterrent message during a spike in similar crimes. The offender appeals on the grounds that he is being sentenced for other people''s actions.',
'Was the deterrent sentence justified?', 'Law · Deterrence', 'Justified', 'Not justified',
'A sentence designed to stop future harm is a sentence doing part of its job.',
'A person is not a billboard for society''s message to someone else.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A small-town police chief refuses to enforce a state law he believes violates fundamental rights. He is suspended. Half the force resigns in solidarity. The state sends officers to fill the gap.',
'Was he right to refuse?', 'Law · Conscience', 'Right', 'Wrong',
'A police officer is a citizen first; his oath does not erase his conscience.',
'A chief who selects which laws to enforce is a chief who has abandoned the role.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"b","loyalty_vs_honesty":"b"}'),

('A child witnesses a violent crime. The defence argues against putting her on the stand, citing serious trauma risk. The prosecution argues her testimony is decisive to the case. The judge holds a closed session to decide.',
'Should she have been called as a witness?', 'Law · Witnesses', 'Called', 'Not called',
'Justice for the victim sometimes requires using the witnesses who are there.',
'A child traumatised for a verdict has been harmed by the system a second time.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"b","head_vs_heart":"b"}'),

('A high court rules that a celebrity cannot be tried in absentia for ongoing financial crimes. The celebrity is abroad and has not returned for years. The victims of the alleged fraud number in the thousands.',
'Was the ruling correct?', 'Law · Absence', 'Correct', 'Incorrect',
'A trial in absentia is a hollow trial; the principle of presence holds.',
'A man wealthy enough to leave permanently can effectively purchase his own immunity.',
'justice_law', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A national database of accused — not convicted — sexual offenders is created and made publicly searchable. Civil-liberties groups call it a list of the innocent. Victim advocates call it an overdue protective measure.',
'Was the database justified?', 'Law · Reputation', 'Justified', 'Not justified',
'Patterns of credible accusation are themselves a form of protective information.',
'A list of the not-yet-convicted is a list of people presumed guilty before trial.',
'justice_law', 'topical', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A man wrongly imprisoned for eleven years sues for compensation. The state offers a one-time payment that is far below his lost earnings. He refuses and continues to litigate for a proper settlement.',
'Was he right to refuse the offer?', 'Law · Reparation', 'Right', 'Wrong',
'A state that took eleven years from a person should return them in full.',
'A bird in hand is the only currency state lawsuits ever reliably pay out.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"a"}'),

('A judge in a minor traffic court routinely waives fines for first-time offenders who can prove low income. A higher court rules the practice creates two unequal classes of justice.',
'Was the higher court right?', 'Law · Equality', 'Right', 'Wrong',
'A fine that crushes one citizen and merely inconveniences another is two different fines.',
'A judge who adjusts outcomes for income is running a private welfare system from the bench.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A public defender drops a client mid-trial after discovering the client has lied about the central facts of the case. The judge allows the withdrawal. The client is convicted within days.',
'Was the withdrawal justified?', 'Law · Trust', 'Justified', 'Not justified',
'A lawyer cannot present evidence she now knows is a lie.',
'Even clients who lie get a defence; the adversarial system runs on that.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"a","loyalty_vs_honesty":"b"}'),

('A judge orders the deletion of a wrongfully convicted man''s full record after thirty years in prison. The decision is unanimous. The man asks that the court order be read aloud in open court for the public record.',
'Was reading it aloud in open court appropriate?', 'Law · Memory', 'Appropriate', 'Inappropriate',
'A wrongful conviction undone is a ritual the public has a right to hear.',
'A courtroom is not a stage; quiet correction has its own kind of dignity.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"b","head_vs_heart":"b"}'),

('A regional court sets a precedent that whistleblowers cannot be dismissed for surfacing wrongdoing, even if their disclosure violated a signed confidentiality agreement. The state immediately appeals.',
'Was the precedent right?', 'Law · Truth', 'Right', 'Wrong',
'A society protects its whistleblowers because it cannot otherwise protect itself.',
'A contract freely signed is a contract that should hold its terms.',
'justice_law', 'seasonal', 'curated', '{"rule_vs_outcome":"b","loyalty_vs_honesty":"b"}'),

('A prosecutor refuses to pursue charges against a first-time offender in a domestic violence case after the victim asks for the case to be dropped. The prosecutor believes the victim is acting under pressure.',
'Was the prosecutor right to continue anyway?', 'Law · Victim', 'Right', 'Wrong',
'A prosecutor''s duty is to the public interest, not only the stated wish of one victim.',
'Pursuing a case against a victim''s explicit request removes her voice from her own life.',
'justice_law', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A judge sentences a juvenile repeat offender to a diversion programme rather than detention, over the strong objection of the victim''s family. The offender completes the programme and does not reoffend.',
'Was the diversion sentence right?', 'Law · Juvenile', 'Right', 'Wrong',
'A sentence that stops the cycle is the best outcome for everyone involved.',
'A victim''s family denied retribution has been denied a voice in their own justice.',
'justice_law', 'evergreen', 'curated', '{"rule_vs_outcome":"b","head_vs_heart":"b"}'),

-- =============================================================================
-- health_medicine (17)
-- =============================================================================

('A surgeon refuses to operate on a patient who, twenty years ago, was convicted of assaulting her brother. Another surgeon takes the case the same day. The hospital opens a conduct inquiry into the refusal.',
'Was the surgeon justified in refusing?', 'Medicine · Conscience', 'Justified', 'Not justified',
'A surgeon is a person; her oath does not erase what she has lived through.',
'Her oath came before any personal history she carries into the room.',
'health_medicine', 'evergreen', 'curated', '{"individual_vs_collective":"a","rule_vs_outcome":"b"}'),

('A rural doctor lies to a terminal patient about his prognosis, at the explicit request of the patient''s family. The patient lives six months longer than expected. He dies believing he was recovering.',
'Was the doctor right to maintain the lie?', 'Medicine · Truth', 'Right', 'Wrong',
'Some peace in the final months is worth more than perfect information.',
'A patient has an absolute right to know what his last months are actually for.',
'health_medicine', 'evergreen', 'curated', '{"head_vs_heart":"b","individual_vs_collective":"a"}'),

('A nurse refuses to administer a treatment she believes will harm a specific patient, despite a direct doctor''s order. She is suspended pending review. The patient is treated by a different nurse during the wait.',
'Was she right to refuse?', 'Medicine · Hierarchy', 'Right', 'Wrong',
'The nurse closest to a patient is sometimes the only check on a doctor''s error.',
'A hospital where nurses routinely override doctors cannot function safely.',
'health_medicine', 'evergreen', 'curated', '{"rule_vs_outcome":"b","loyalty_vs_honesty":"b"}'),

('A hospital introduces a triage protocol during a critical bed shortage that prioritises patients with longer expected lifespans. Elderly patients receive care later. Mortality rates among the elderly rise during the crisis period.',
'Was the protocol justified?', 'Medicine · Triage', 'Justified', 'Not justified',
'A scarce bed allocated to serve more future years is a different equation.',
'A hospital that ranks lives by years remaining has stopped being a hospital.',
'health_medicine', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A doctor tells a pregnant patient her child will be born with a serious condition. The mother chooses to continue the pregnancy. The doctor privately tells colleagues she has "delayed an avoidable tragedy." It is reported to the board.',
'Was the private comment a breach?', 'Medicine · Speech', 'Breach', 'Not a breach',
'A doctor''s private contempt for a patient''s lawful choice is itself unsafe care.',
'A remark made privately to colleagues is not a public or clinical statement.',
'health_medicine', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A teenager visits a clinic alone and asks for contraception. The doctor provides it without informing her parents, citing patient confidentiality. The parents discover the prescription weeks later and sue the clinic.',
'Was the doctor right?', 'Medicine · Consent', 'Right', 'Wrong',
'A teenager asking in private is a teenager who needs the consultation most.',
'A minor is a minor; the parents are the legal guardians and must be involved.',
'health_medicine', 'evergreen', 'curated', '{"individual_vs_collective":"a","rule_vs_outcome":"b"}'),

('A research hospital quietly enrols patients in a study using their de-identified records. No individual is identifiable in the data. The hospital does not obtain explicit consent. A journalist exposes the practice.',
'Was the hospital wrong?', 'Medicine · Data', 'Wrong', 'Not wrong',
'Data about you, even anonymised, is still data about you.',
'Medical progress depends on records used quietly, carefully, and well.',
'health_medicine', 'topical', 'curated', '{"individual_vs_collective":"a","rule_vs_outcome":"a"}'),

('A surgeon publicly criticises a colleague who lost a patient on the operating table, citing specific errors. The criticism is medically accurate. The colleague resigns within a week. The surgical department becomes harder to recruit for.',
'Was the public criticism right?', 'Medicine · Accountability', 'Right', 'Wrong',
'A surgeon who covers for a peer''s errors puts the next patient at risk.',
'A profession that publicly devours its own drives away the next generation.',
'health_medicine', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","rule_vs_outcome":"b"}'),

('A psychiatrist chooses not to break confidentiality after a patient describes detailed violent fantasies about his ex-partner. The patient has no history of violence. The psychiatrist warns him directly and continues sessions.',
'Was the psychiatrist right to keep the confidence?', 'Medicine · Risk', 'Right', 'Wrong',
'Confidentiality is the door that allows dangerous men to enter therapy at all.',
'A psychiatrist with that warning has a duty the patient cannot override.',
'health_medicine', 'evergreen', 'curated', '{"rule_vs_outcome":"b","caution_vs_action":"a"}'),

('A hospital quietly transfers a patient with an aggressive infection to a facility it knows has weaker infection-control standards. The transfer is legally sound. Two senior staff members resign in protest.',
'Was the transfer justified?', 'Medicine · Risk', 'Justified', 'Not justified',
'A hospital that protects its own ward protects all its other patients.',
'A transfer that exports risk to a weaker facility is not care; it is disposal.',
'health_medicine', 'evergreen', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"a"}'),

('A doctor''s patient repeatedly refuses life-saving treatment for sincere religious reasons. The doctor fully honours the refusal. The patient dies. The family sues the doctor for not trying harder to persuade him.',
'Was the doctor right?', 'Medicine · Autonomy', 'Right', 'Wrong',
'A patient with full capacity has the right to refuse treatment, even unto death.',
'A doctor''s role is to fight for life when the patient''s own family cannot.',
'health_medicine', 'evergreen', 'curated', '{"individual_vs_collective":"a","rule_vs_outcome":"a"}'),

('A public hospital caps the number of annual admissions for patients with a specific chronic condition, citing capacity limits. The affected patients find workarounds through private hospitals they cannot afford long-term.',
'Was the cap justified?', 'Medicine · Capacity', 'Justified', 'Not justified',
'A public system without limits eventually serves no one well.',
'A limit on the chronically ill is a limit on their ability to stay alive.',
'health_medicine', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A pharmaceutical company prices a life-saving drug at a level no public health system in a region can afford. It offers a steep discount in exchange for a multi-decade exclusive contract. The government refuses the terms.',
'Was the government right to refuse?', 'Medicine · Cost', 'Right', 'Wrong',
'A decades-long exclusive deal for a discounted drug is just a slower monopoly.',
'A drug at any affordable price is strictly better than no drug at any price.',
'health_medicine', 'topical', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A young oncologist privately tells a patient her honest opinion that the recommended team protocol will not work in his specific case, directly contradicting the team consensus. The patient changes course. He survives longer than the protocol would have predicted.',
'Was the oncologist right?', 'Medicine · Voice', 'Right', 'Wrong',
'A doctor who buries a genuine doubt is not a doctor; she is a clerk.',
'A junior who undermines team consensus with one patient''s life is taking a risk with it.',
'health_medicine', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","caution_vs_action":"b"}'),

('A vaccine clinic offers small cash payments to encourage uptake during an outbreak. Bioethicists object that the incentive distorts genuine consent. The clinic argues the outbreak data speaks for itself.',
'Was the incentive justified?', 'Medicine · Choice', 'Justified', 'Not justified',
'A nudge that ends an outbreak is worth the cost of the cash.',
'A medical decision shaped by a payment is no longer a freely made decision.',
'health_medicine', 'topical', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A medical school rejects a strong candidate after discovering he had privately written that he would never treat a specific ethnic community. The school says character is a core admission criterion.',
'Was the rejection justified?', 'Medicine · Character', 'Justified', 'Not justified',
'A doctor is a doctor for everyone in the waiting room or he is none.',
'A school does not have a mandate to police every private statement its applicants have made.',
'health_medicine', 'seasonal', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A hospital ethics board approves an experimental procedure for a terminally ill child whose parents consent but who is old enough to express strong fear and refusal of the treatment. The board overrides the child''s stated objection.',
'Was the board right to override the child?', 'Medicine · Assent', 'Right', 'Wrong',
'A child''s fear does not override the medical judgment and parental consent.',
'A child old enough to express fear is a child old enough to be heard.',
'health_medicine', 'topical', 'curated', '{"individual_vs_collective":"b","head_vs_heart":"b"}'),

-- =============================================================================
-- money_wealth (17)
-- =============================================================================

('A landlord raises rent by 30% in a rapidly changing neighbourhood, knowing most current tenants cannot afford the increase. The new tenants who move in pay without complaint. The old community disperses.',
'Was the increase justified?', 'Money · Property', 'Justified', 'Not justified',
'A landlord prices to the market; that is what the market is for.',
'A landlord who clears a building of its people clears the neighbourhood itself.',
'money_wealth', 'evergreen', 'curated', '{"individual_vs_collective":"a","rule_vs_outcome":"b"}'),

('Vikram inherits a substantial sum from a distant relative. He chooses not to tell his wife and quietly places most of it in an account in his name alone. Three years later the marriage ends in divorce.',
'Was hiding the inheritance justified?', 'Money · Marriage', 'Justified', 'Not justified',
'An inheritance is a personal windfall, by most accepted legal and moral standards.',
'A shared life requires shared accounts and shared books.',
'money_wealth', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"a"}'),

('Nisha is in financial difficulty and lies to her parents about why she needs a loan, saying it is for a new business when it is actually to cover personal debts. They lend without questions. She repays every rupee within a year.',
'Was the lie justified?', 'Money · Family', 'Justified', 'Not justified',
'Outcomes repaid in full have their own kind of retroactive honesty.',
'A lie to family compounds even when the money does not.',
'money_wealth', 'evergreen', 'curated', '{"rule_vs_outcome":"b","loyalty_vs_honesty":"a"}'),

('A close friend group plans an expensive international trip. One member, Rohan, is between jobs and cannot afford his share. The others offer to cover him. He declines and stays home alone. The trip is emotionally awkward for everyone.',
'Was Rohan right to decline?', 'Money · Pride', 'Right', 'Wrong',
'A friendship that has to be financially subsidised is no longer in equilibrium.',
'A holiday paid for in friendship is still a holiday genuinely earned.',
'money_wealth', 'evergreen', 'curated', '{"individual_vs_collective":"a","head_vs_heart":"a"}'),

('A startup founder accepts a series-A investment at a valuation she privately believes is unsustainable. She uses the capital to pay her fifty employees full salaries for three years before declaring bankruptcy. Investors lose their entire stake.',
'Was she right to take the deal?', 'Money · Risk', 'Right', 'Wrong',
'Three years of real salaries for fifty families is a real and concrete outcome.',
'A founder who raised money on a valuation she knew was false has deceived investors.',
'money_wealth', 'evergreen', 'curated', '{"individual_vs_collective":"b","loyalty_vs_honesty":"a"}'),

('A wealthy man donates a large sum to a public hospital on the condition that a new wing is named after his late wife. The hospital accepts. Several senior staff members resign in protest of the naming condition.',
'Was the conditional donation justified?', 'Money · Giving', 'Justified', 'Not justified',
'A donation that names a wing is still a donation that built the wing.',
'A public institution purchased with a name on it is no longer entirely public.',
'money_wealth', 'evergreen', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"b"}'),

('A delivery rider finds an envelope with a large amount of cash inside a package he is delivering. He returns it intact to the sender, a wealthy investor. The investor tips him an amount that is a small fraction of what was inside.',
'Was the tip insulting?', 'Money · Decency', 'Insulting', 'Not insulting',
'A return of integrity deserves more than a rounding error.',
'A tip is a tip; honesty is not a market commodity to be priced.',
'money_wealth', 'evergreen', 'curated', '{"rule_vs_outcome":"b","head_vs_heart":"b"}'),

('A small business owner pays one employee 40% more than others for an identical role because she negotiated harder in the original interview. When a junior colleague discovers the gap, the owner refuses to adjust other salaries.',
'Was the owner right to refuse adjustment?', 'Money · Pay', 'Right', 'Wrong',
'Pay rewards what you ask for; those who did not negotiate made a choice.',
'A company that pays differently for identical work has misrepresented the job.',
'money_wealth', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A fund manager rebalances a pension fund out of a major bank just weeks before that bank fails. He had no insider information; it was a strong instinct. Regulators open an investigation into the timing of his trades.',
'Was the rebalance defensible?', 'Money · Markets', 'Defensible', 'Indefensible',
'A manager is paid to have and act on judgments; that is the entire role.',
'Lucky timing is the cousin of insider trading; regulators are right to ask questions.',
'money_wealth', 'topical', 'curated', '{"caution_vs_action":"b","rule_vs_outcome":"b"}'),

('A celebrated nonprofit pays its founder more than 60% of all annual donations as his personal salary. Donors discover this through a freedom-of-information request. The board defends it, saying he is irreplaceable.',
'Was the salary justified?', 'Money · Trust', 'Justified', 'Not justified',
'A nonprofit that needs exceptional talent must pay for it competitively.',
'A nonprofit funded by public donations exists for the mission, not for its founder.',
'money_wealth', 'topical', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"b"}'),

('Suresh wins a large lottery prize and anonymously distributes most of it — to family, old friends, and causes he cares about — without revealing where the money came from. Several recipients later express resentment at the secrecy.',
'Was the secrecy right?', 'Money · Giving', 'Right', 'Wrong',
'A gift given quietly is a gift not turned into a transaction.',
'The people who received money had a right to know what they were accepting.',
'money_wealth', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"a"}'),

('A young couple is given a house by his parents on the condition that his wife signs a legal document acknowledging the gift was made to him personally. She signs. Years later, in a divorce, the house is declared entirely his.',
'Was the condition fair?', 'Money · Family', 'Fair', 'Unfair',
'A gift can carry the conditions its giver attaches to it.',
'A gift structured through one spouse with a legal trap is not a gift to the marriage.',
'money_wealth', 'evergreen', 'curated', '{"individual_vs_collective":"a","rule_vs_outcome":"a"}'),

('A small-town shop owner sharply raises prices during a regional shortage, citing his own higher wholesale costs. His two competitors do not raise prices. His shop stays open through the shortage; the others run out of stock and close.',
'Was the price increase justified?', 'Money · Crisis', 'Justified', 'Not justified',
'A store that remains open during a crisis has served everyone who needed it.',
'Profiting from a shortage is profiteering, whatever the supply chain said.',
'money_wealth', 'topical', 'curated', '{"individual_vs_collective":"a","rule_vs_outcome":"b"}'),

('A debt-collection agency offers Priya a reduced settlement on the condition that she records a public video testimonial thanking the agency. She refuses and continues paying the full original balance instead.',
'Was she right to refuse?', 'Money · Dignity', 'Right', 'Wrong',
'A settlement that requires performed gratitude is humiliation in legal form.',
'A substantial discount is a real offer; the words asked for are just words.',
'money_wealth', 'evergreen', 'curated', '{"individual_vs_collective":"a","rule_vs_outcome":"b"}'),

('A wealthy donor pulls his substantial funding from a university after a student publication critically covers a foundation he chairs. The university issues no public statement. A dean sends a confidential written apology to the donor.',
'Was the dean wrong?', 'Money · Speech', 'Wrong', 'Not wrong',
'A university that apologises for student journalism has stopped being a university.',
'A dean is allowed to defuse a funding relationship without changing a single editorial.',
'money_wealth', 'seasonal', 'curated', '{"loyalty_vs_honesty":"a","rule_vs_outcome":"b"}'),

('A man hides a redundancy payout from his family for six months while quietly job-hunting and covering expenses from the savings. His teenage children later discover he had been lying about still being employed.',
'Was he right to hide it?', 'Money · Shame', 'Right', 'Wrong',
'A family kept calm while a problem is solved is a family protected from pointless fear.',
'A father who hides a layoff teaches his children that money is something shameful.',
'money_wealth', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"a"}'),

('A pension fund manager aggressively rebalances into high-risk assets to recover losses during a market downturn. The bet succeeds. The fund fully recovers in two years. Risk officers object on principle, not on result.',
'Was the bet justified?', 'Money · Trust', 'Justified', 'Not justified',
'A pension fund recovered in full is the only outcome that mattered.',
'A pension is the wrong place for anyone to be brave with other people''s retirements.',
'money_wealth', 'evergreen', 'curated', '{"caution_vs_action":"b","individual_vs_collective":"b"}'),

-- =============================================================================
-- environment (17)
-- =============================================================================

('A small town protests a planned highway through one of the last wetlands in the region. The highway would cut commute times for fifty thousand daily commuters. The state proceeds with construction over the protests.',
'Was the state right to proceed?', 'Env · Trade-offs', 'Right', 'Wrong',
'Infrastructure serving fifty thousand daily lives is the kind of progress a region needs.',
'A wetland that took fifty thousand years to form cannot simply be grown back.',
'environment', 'evergreen', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"b"}'),

('A village council allows a foreign mining company to operate in exchange for guaranteed jobs and a new school. Five years later the main river is contaminated and unusable. The school still stands and is full.',
'Was the original deal worth making?', 'Env · Trade', 'Worth it', 'Not worth it',
'A village without economic foundations has no future to protect in the first place.',
'A river poisoned outlasts any school building on its banks.',
'environment', 'evergreen', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A national park bans traditional gathering practices by local communities that have used the park land for generations. The restriction is introduced to preserve the ecosystem. Some communities take their case to court.',
'Was the ban justified?', 'Env · People', 'Justified', 'Not justified',
'A park being depleted by even traditional use cannot survive that use indefinitely.',
'A people erased from their ancestral land is itself a kind of ecological loss.',
'environment', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A coastal city places a total construction ban within 500 metres of the shoreline following years of accelerating erosion. Property values drop overnight. Owners sue for compensation. The city refuses to pay.',
'Was the city right not to compensate them?', 'Env · Coast', 'Right', 'Wrong',
'Property near a vanishing shore was never worth what the deed claimed.',
'When a government reduces property value by regulation, it owes something.',
'environment', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A factory promises to switch fully to clean energy within five years but continues polluting at full capacity during the transition period. Local activists demand an immediate shutdown. The factory employs three thousand workers.',
'Should the activists hold firm for immediate closure?', 'Env · Patience', 'Hold the line', 'Concede',
'A five-year promise is effectively a five-year permission to keep harming.',
'Three thousand families and a real timeline is the only realistic kind of change.',
'environment', 'topical', 'curated', '{"rule_vs_outcome":"b","caution_vs_action":"b"}'),

('A city sharply raises parking fees in its centre to push commuters toward public transit. Small businesses report a significant drop in footfall in the first year. The city refuses to reverse the policy, pointing to long-term data.',
'Was the policy justified?', 'Env · Transit', 'Justified', 'Not justified',
'A city easy to park in is a city whose air everyone else is quietly paying for.',
'A policy that drains local businesses emptied the neighbourhood it claimed to save.',
'environment', 'evergreen', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"b"}'),

('A farmer burns crop residue in violation of state environmental rules because the legal alternatives cost more than he earns from the crop. He is fined an amount he cannot pay. His entire village does the same.',
'Was fining him justified?', 'Env · Cost', 'Justified', 'Not justified',
'A law that is not enforced is a law that has already stopped existing.',
'A fine without alternatives is simply a fine on being poor.',
'environment', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A regional government taxes large diesel vehicles by total weight, so the wealthiest owners of the heaviest vehicles pay significantly more. Some owners call it punitive; environmental groups call it basic fairness.',
'Was the weight-based tax justified?', 'Env · Fairness', 'Justified', 'Not justified',
'A polluter-pays system that charges heavier polluters more is precisely the design.',
'A tax calibrated to the owner''s wealth is a tax dressed up as an environmental measure.',
'environment', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A research team that studies climate change flies tens of thousands of miles per year for field work. A junior researcher calculates the team''s annual carbon footprint and formally proposes a year of remote-only work. The team lead refuses.',
'Was the lead right to refuse?', 'Env · Travel', 'Right', 'Wrong',
'Field work produces data that remote models cannot replicate or replace.',
'A climate team that refuses to account for its own footprint has missed its own message.',
'environment', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","caution_vs_action":"a"}'),

('A city installs flood-defence barriers in its wealthier neighbourhoods first, citing higher assessed property values. The poorer zones flood again in the next heavy rain. The city promises to extend the barriers the following year.',
'Was the sequencing justified?', 'Env · Priorities', 'Justified', 'Not justified',
'Higher-value zones generate most of the tax revenue that eventually funds everything.',
'A flood barrier built for the rich is a flood diverted toward the poor.',
'environment', 'topical', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"b"}'),

('A national park raises entry fees fivefold to limit the number of visitors. Lower-income families are effectively priced out of access. The park reports record ecological recovery in the two years following the increase.',
'Was the fee increase justified?', 'Env · Access', 'Justified', 'Not justified',
'A park being trampled by crowds is a park that can no longer protect itself.',
'A park that only the wealthy can afford is not a national park in any meaningful sense.',
'environment', 'evergreen', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"b"}'),

('A city plants thousands of new trees in its wealthiest districts because the soil and implementation budget are more manageable there. Poorer districts receive far fewer trees. Five years later, heat mortality in the unplanted zones is measurably higher.',
'Was the city wrong?', 'Env · Justice', 'Wrong', 'Not wrong',
'Trees are a public good that must be planted where they are needed most.',
'A city has to start somewhere; waiting for perfect equity plants nothing.',
'environment', 'evergreen', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"b"}'),

('A coal-dependent region refuses a federal transition package that offers funded retraining and economic support, but requires two power plants to close within five years. Local leaders say the timeline is impossibly fast.',
'Was the refusal justified?', 'Env · Transition', 'Justified', 'Not justified',
'A region forced to lose its main industry in five years loses its families with it.',
'A region that refuses a fully funded transition has chosen to be left behind.',
'environment', 'topical', 'curated', '{"caution_vs_action":"a","individual_vs_collective":"a"}'),

('An activist publicly destroys a well-known artwork in a museum to draw international attention to climate inaction. The work was on loan from a private owner. The activist is arrested and jailed.',
'Was the act justified?', 'Env · Protest', 'Justified', 'Not justified',
'A protest that earns worldwide attention is a protest that has done its job.',
'A climate movement that destroys cultural objects has lost its own moral argument.',
'environment', 'topical', 'curated', '{"caution_vs_action":"b","rule_vs_outcome":"b"}'),

('A small island country sues a major industrial nation in international court for emissions it says have raised its sea level and made parts of the island uninhabitable. The court has limited enforcement powers.',
'Was filing the lawsuit worth it?', 'Env · Justice', 'Worth filing', 'Not worth filing',
'A lawsuit that creates a legal record creates a foundation for the next decade.',
'A decade in international court is a decade not spent rebuilding the coast.',
'environment', 'evergreen', 'curated', '{"rule_vs_outcome":"b","caution_vs_action":"a"}'),

('A municipality bans single-use plastics overnight with no transition period and no support for street food vendors. Many vendors cannot immediately comply and are fined. A few quietly continue.',
'Was the overnight ban justified?', 'Env · Policy', 'Justified', 'Not justified',
'A clean public environment requires a line that actually holds.',
'A rule that fines street vendors first was designed by people who don''t need street food.',
'environment', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A community successfully blocks a small wind-energy project on aesthetic grounds, citing its visual impact on the landscape. The local grid must procure equivalent power from a coal plant for that year.',
'Was the community right to block it?', 'Env · Local', 'Right', 'Wrong',
'A community has a recognised right to shape what it lives alongside.',
'A neighbourhood vetoing clean energy on aesthetics is making a climate decision for everyone.',
'environment', 'seasonal', 'curated', '{"individual_vs_collective":"a","rule_vs_outcome":"b"}'),

-- =============================================================================
-- identity_belief (16)
-- =============================================================================

('A woman stops attending her family''s weekly religious gatherings after a quiet change in her personal beliefs. Her parents treat it as a phase. Her siblings treat it as a betrayal. She continues to come to secular family dinners.',
'Was she right to step back from the rituals?', 'Belief · Family', 'Right', 'Wrong',
'A person''s faith is the one inheritance she gets to choose for herself.',
'A tradition is a shared thread; you cannot cut yours without pulling at others.',
'identity_belief', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"b"}'),

('A man comes out to his elderly grandfather and is told never to come home. Two years later, the grandfather is dying and asks to see him. The man refuses to visit.',
'Was he right to refuse the deathbed visit?', 'Identity · Forgiveness', 'Right', 'Wrong',
'A deathbed is not an automatic forgiveness machine.',
'Two years of rejection deserve at least one final chance.',
'identity_belief', 'evergreen', 'curated', '{"individual_vs_collective":"a","head_vs_heart":"a"}'),

('A teacher introduces a unit on a contested historical period in a school where the vast majority of parents hold one clear view. After parental complaints, the school removes her from that unit. She publishes her full materials online.',
'Was she right to publish?', 'Belief · History', 'Right', 'Wrong',
'A teacher silenced by institutional pressure should not remain silent.',
'A classroom''s materials are the school''s; she was paid to follow the curriculum.',
'identity_belief', 'topical', 'curated', '{"loyalty_vs_honesty":"b","individual_vs_collective":"a"}'),

('A man changes his surname to his wife''s after their marriage. His mother refuses to call him by the new name. They do not speak for over a year. He never reverts to the original name.',
'Was the mother right to resist?', 'Identity · Name', 'Right', 'Wrong',
'A name carried by a family for generations is not a purely personal decision.',
'A name is the one identity an adult has the full right to choose.',
'identity_belief', 'evergreen', 'curated', '{"individual_vs_collective":"b","loyalty_vs_honesty":"a"}'),

('A young woman wears a religious symbol to work in contravention of her employer''s uniform dress code. She is dismissed. Civil-rights organisations defend her case. The employer cites a consistent policy applied to all.',
'Was the dismissal justified?', 'Belief · Work', 'Justified', 'Not justified',
'A workplace is allowed to set and enforce its visual standards consistently.',
'A workplace that punishes a person for wearing a faith symbol is punishing the faith.',
'identity_belief', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A father raises his three children entirely in his late wife''s religion, never mentioning his own different beliefs, in order to honour a promise he made to her. The children discover his true beliefs only after his death.',
'Was the silence right?', 'Belief · Family', 'Right', 'Wrong',
'A promise made to a dying wife is a promise that holds.',
'Children deserve to know all the threads they are made of.',
'identity_belief', 'evergreen', 'curated', '{"loyalty_vs_honesty":"a","individual_vs_collective":"a"}'),

('A community centre prohibits a religious group from meeting on its premises after several members made inflammatory political speeches. The group argues the ban punishes the entire group for the speech of a few.',
'Was the ban justified?', 'Belief · Space', 'Justified', 'Not justified',
'A shared community space is allowed to set conditions on its use.',
'Banning an entire group for the words of a few is collective punishment.',
'identity_belief', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A school principal removes a long-standing religious symbol from one classroom in a school where most families share that tradition. A few parents thank her privately. A much larger group demands her resignation.',
'Was the principal right?', 'Belief · School', 'Right', 'Wrong',
'A school belongs to all its families, including those of different faiths.',
'A symbol the majority lives with comfortably is the majority''s legitimate choice.',
'identity_belief', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A man marries into a family of strong religious practice and quietly adopts their customs to keep household peace. After his wife''s death, he immediately reverts to his original practices. His in-laws never speak to him again.',
'Was he right to revert?', 'Belief · Marriage', 'Right', 'Wrong',
'A practice held for a partner is held while the partner is here.',
'A man who reverts immediately after a loss reveals what was rented rather than held.',
'identity_belief', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"b"}'),

('A young man refuses to participate in an arranged coming-of-age ceremony that his entire family considers essential. He calls it a private choice about his own body and beliefs. His family considers it a communal violation.',
'Was the refusal justified?', 'Belief · Family', 'Justified', 'Not justified',
'A ritual performed without genuine consent is a performance, not a rite.',
'A family is a fabric; pulling at one thread moves all the others.',
'identity_belief', 'evergreen', 'curated', '{"individual_vs_collective":"a","rule_vs_outcome":"b"}'),

('A community votes to open its traditionally closed annual festival to non-members for the first time. Several elders object strongly, citing the integrity of the tradition. The festival is held open. The mood is noticeably different.',
'Was the opening right?', 'Belief · Tradition', 'Right', 'Wrong',
'A tradition that cannot adapt to a changing world is a tradition slowly dying alone.',
'A festival opened to all is a festival that is no longer of its own community.',
'identity_belief', 'evergreen', 'curated', '{"individual_vs_collective":"b","loyalty_vs_honesty":"b"}'),

('A daughter publishes a widely read essay that critically examines her mother''s religion in personal and specific terms. Her mother stops speaking to her. The daughter says she never intended the essay to be read as a personal attack.',
'Was she right to publish it?', 'Belief · Voice', 'Right', 'Wrong',
'A writer who has lived a story has every right to tell it.',
'A daughter who exposes her mother to a public audience has chosen the audience over her.',
'identity_belief', 'topical', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"b"}'),

('A clinic refuses to prescribe a medication to a patient who meets every clinical indication, because the prescribing doctor has a sincere personal objection. A colleague prescribes it within minutes. The patient receives the medication.',
'Was the first doctor justified in refusing?', 'Belief · Care', 'Justified', 'Not justified',
'A doctor''s conscience does not vanish at the clinic door.',
'A patient denied a public service over a private belief has been denied a public right.',
'identity_belief', 'evergreen', 'curated', '{"individual_vs_collective":"a","rule_vs_outcome":"b"}'),

('A man is offered a significant promotion that would require relocating to a city where his religious community has almost no presence. He declines and stays. His manager cannot understand the decision.',
'Was he right to decline for that reason?', 'Belief · Work', 'Right', 'Wrong',
'A community of faith is a real infrastructure, not a preference to be traded away.',
'A career is also a life; refusing a step forward for cultural comfort has costs.',
'identity_belief', 'evergreen', 'curated', '{"individual_vs_collective":"a","caution_vs_action":"a"}'),

('A woman is excluded from a close family wedding because she chose not to wear the traditional ceremonial dress. She attends only the civil reception. Older relatives say she made her own choice and must accept its consequences.',
'Was the exclusion justified?', 'Belief · Custom', 'Justified', 'Not justified',
'A family''s wedding has the right to ask for the family''s dress.',
'A dress code should not be the price of admission to your own family.',
'identity_belief', 'evergreen', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"a"}'),

('A young woman publicly leaves a well-known spiritual community, naming specific leaders and practices in detail. Community lawyers sue her for defamation. Several current members contact her privately to thank her.',
'Was she right to name names?', 'Belief · Speech', 'Right', 'Wrong',
'A community sustained by fear can only be checked by specific names and acts.',
'A public list of named individuals is a sentence handed out without a trial.',
'identity_belief', 'seasonal', 'curated', '{"loyalty_vs_honesty":"b","caution_vs_action":"b"}'),

-- =============================================================================
-- love_romance (16)
-- =============================================================================

('A man proposes to his partner of seven years on a busy public street, surrounded by cameras and an audience. She says yes. Later, she tells him she had explicitly asked him a year ago never to propose in public.',
'Was the public proposal wrong?', 'Love · Boundaries', 'Wrong', 'Not wrong',
'A proposal that ignores a clearly stated wish is a proposal about the proposer.',
'A grand gesture is the whole vocabulary of some people''s love.',
'love_romance', 'evergreen', 'curated', '{"individual_vs_collective":"a","head_vs_heart":"b"}'),

('Meena tells her boyfriend on their second date that she has decided with certainty she does not want children. He says he understands. Two years into the relationship, he begins to revisit the question.',
'Was she right to leave him over it?', 'Love · Children', 'Right', 'Wrong',
'A stated boundary is a stated boundary; she was as clear as anyone can be.',
'Love sometimes quietly changes what we believed was fixed.',
'love_romance', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"a"}'),

('A man tells his ex-wife the evening before her remarriage that he is still in love with her. She marries the next morning anyway, but the new marriage begins under a cloud neither of them entirely clears.',
'Was he right to tell her?', 'Love · Timing', 'Right', 'Wrong',
'A truth held back forever becomes a different kind of harm.',
'A truth deployed the night before a wedding is sabotage dressed in feeling.',
'love_romance', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","caution_vs_action":"b"}'),

('Ritu moves to another country for her partner. She struggles to find professional work for over a year. He grows distant and eventually ends the relationship. She has no local roots and very limited savings.',
'Did she make a mistake moving?', 'Love · Risk', 'Mistake', 'Not a mistake',
'A move built entirely on one other person is a move you cannot afford to make.',
'A life lived only in caution is a life that never fully starts.',
'love_romance', 'evergreen', 'curated', '{"individual_vs_collective":"a","caution_vs_action":"a"}'),

('A man stays in a quietly unhappy relationship for the sake of a six-year-old child he and his partner are raising together. The unhappiness is well-concealed but constant. Neither parent speaks of it.',
'Was he right to stay for the child?', 'Love · Children', 'Right', 'Wrong',
'A stable and present home for a young child is a real and lasting gift.',
'A child raised inside hidden unhappiness learns that as the shape of love.',
'love_romance', 'evergreen', 'curated', '{"individual_vs_collective":"b","head_vs_heart":"b"}'),

('A woman discovers her partner has been in constant close contact with an ex. The messages are not romantic but they are daily and detailed. She asks him to stop. He calls her insecure and refuses.',
'Was she right to ask him to stop?', 'Love · Boundaries', 'Right', 'Wrong',
'A boundary asked for is different from a boundary unilaterally imposed.',
'A partner does not have the right to dictate the friendships of the other.',
'love_romance', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"a"}'),

('A man tells his partner that he has been in love with someone else for the past year, but has done nothing about it. She thanks him for the honesty. She also leaves him within the week.',
'Did he do the right thing by confessing?', 'Love · Honesty', 'Right', 'Wrong',
'A confession that costs the confessor is the only kind that is genuinely honest.',
'A confession no one needed to know was ultimately for him, not for her.',
'love_romance', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","individual_vs_collective":"a"}'),

('A woman reads her partner''s private journal during an argument, looking for ammunition. She finds nothing damaging but reads that he sometimes feels quietly disappointed in the direction of their life together. She never tells him she read it.',
'Was the reading a betrayal?', 'Love · Privacy', 'Betrayal', 'Not a betrayal',
'A private journal is the last truly private space a partner possesses.',
'A relationship under serious strain justifies trying to understand it.',
'love_romance', 'evergreen', 'curated', '{"individual_vs_collective":"a","loyalty_vs_honesty":"a"}'),

('A man takes a solo trip to think through whether to propose. He returns certain he wants to. She has decided, in his absence, that she wants to end the relationship.',
'Was the solo trip wise?', 'Love · Space', 'Wise', 'Unwise',
'A decision worth making is worth thinking through alone before acting.',
'A decision about two people made by one person while the other waits is not made together.',
'love_romance', 'evergreen', 'curated', '{"individual_vs_collective":"a","caution_vs_action":"a"}'),

('Priya breaks off an arranged engagement after meeting her fiancé only three times. Both families had finalised wedding arrangements. She returns the ring. Both sides criticise her for wasting everyone''s time and money.',
'Was she right to end it?', 'Love · Arranged', 'Right', 'Wrong',
'A marriage is forever; three meetings is genuinely just a sample.',
'A family that invested heavily deserved more than three meetings before a verdict.',
'love_romance', 'evergreen', 'curated', '{"individual_vs_collective":"a","caution_vs_action":"a"}'),

('A man finances his partner''s full MBA with no written agreement about repayment, treating it as a gift. She graduates and ends the relationship immediately. He asks for a partial refund. She refuses.',
'Was he right to ask for money back?', 'Love · Money', 'Right', 'Wrong',
'A gift made within a relationship is conditionally a part of that relationship.',
'A gift is a gift; if he wanted a loan he should have made that clear at the start.',
'love_romance', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"a"}'),

('A long-distance couple agrees to tell each other every time they go on a date with someone else. One partner stops mentioning a specific recurring person. The other finds out months later through a mutual friend.',
'Was the silence a breach of their agreement?', 'Love · Honesty', 'Breach', 'Not a breach',
'A rule both people agreed to is a rule both people must keep.',
'An omission about one particular person is not the same as lying.',
'love_romance', 'evergreen', 'curated', '{"loyalty_vs_honesty":"a","rule_vs_outcome":"a"}'),

('A woman''s partner asks her to delete all photographs of her previous relationships from her phone. She refuses, calling the request controlling. He says it is a small ask for his peace of mind. They break up over it.',
'Was she right to refuse?', 'Love · Trust', 'Right', 'Wrong',
'A relationship that demands you erase your past is asking too much of a person.',
'A small request made in vulnerability is not a bid for control.',
'love_romance', 'evergreen', 'curated', '{"individual_vs_collective":"a","head_vs_heart":"a"}'),

('A man tells his partner that he is bisexual after five years of marriage. She thanks him for telling her. She also says it changes something for her that she cannot fully name. They divorce two years later.',
'Did he do the right thing by telling her?', 'Love · Truth', 'Right', 'Wrong',
'A truth he had carried alone for years needed to be shared with the person closest to him.',
'A truth that arrives five years into a marriage is a truth that arrived five years late.',
'love_romance', 'evergreen', 'curated', '{"loyalty_vs_honesty":"b","individual_vs_collective":"a"}'),

('A widow finds a new romantic relationship three years after losing her husband. Her adult children ask her to wait longer out of respect for the family. She declines to wait. Half the family welcomes the relationship; half avoid it.',
'Was she right to move forward?', 'Love · Grief', 'Right', 'Wrong',
'A life that remains to be lived is a life that belongs to the person living it.',
'A family that witnessed a long marriage deserves a pace they can find their way to.',
'love_romance', 'evergreen', 'curated', '{"individual_vs_collective":"a","head_vs_heart":"b"}'),

('A man cancels his wedding three days before the ceremony after a private conversation with the bride''s sister reveals something he says he cannot set aside. He never tells the bride what he was told.',
'Was he right to keep silent about the reason?', 'Love · Secrets', 'Right', 'Wrong',
'Cancelling is enough; the details would only destroy a second relationship.',
'A bride left three days before her wedding deserves to know the reason.',
'love_romance', 'seasonal', 'curated', '{"loyalty_vs_honesty":"a","individual_vs_collective":"a"}'),

-- =============================================================================
-- crime (16)
-- =============================================================================

('A neighbourhood collectively decides not to report a known thief to the police after he begins returning stolen items and apologising personally to each household. Months later, he relapses on a different street.',
'Was the neighbourhood wrong not to report him?', 'Crime · Restoration', 'Wrong', 'Not wrong',
'A relapse on the next street is the price of mercy extended only to this one.',
'A man returning what he took is a man worth a genuine second chance.',
'crime', 'evergreen', 'curated', '{"rule_vs_outcome":"b","caution_vs_action":"a"}'),

('A teenager films a serious violent crime and immediately posts the clip online before calling the police. The clip helps identify and convict the attacker. The victim''s family asks the platform to remove the video.',
'Was the teenager right to post it?', 'Crime · Evidence', 'Right', 'Wrong',
'A viral clip is sometimes the only thing that ensures a quiet crime is prosecuted.',
'A victim does not consent to being broadcast to strangers while her harm is still raw.',
'crime', 'topical', 'curated', '{"individual_vs_collective":"b","caution_vs_action":"b"}'),

('A man chases down a pickpocket who stole his wallet, catches him, and beats him until he confesses and returns the money. The wallet is fully recovered. The man is arrested for assault.',
'Was the arrest justified?', 'Crime · Vigilantism', 'Justified', 'Not justified',
'A society where citizens collect their own justice is not a civil society.',
'A man who took what was yours does not get to walk because you caught him yourself.',
'crime', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A bystander films a violent street assault but does not physically intervene. The video is central evidence in convicting the attacker. The victim later sues the bystander for failing to act.',
'Was the lawsuit justified?', 'Crime · Bystanders', 'Justified', 'Not justified',
'A society built on spectatorship is a society about to watch itself disappear.',
'A bystander who provided the evidence is not a hero who failed; he is a witness.',
'crime', 'evergreen', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"b"}'),

('After a string of shoplifting incidents, a small business owner installs facial-recognition cameras. Customers petition against it. Shoplifting in the store drops by 80% within six months.',
'Was the installation justified?', 'Crime · Surveillance', 'Justified', 'Not justified',
'A business that cannot stay solvent cannot serve any customer.',
'A shop that scans the face of everyone entering has redefined what shopping is.',
'crime', 'topical', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A father hires private investigators after police close his daughter''s missing-person case. The investigators uncover new evidence and force the case to reopen. Several of the methods they used were technically illegal.',
'Was the father justified?', 'Crime · Justice', 'Justified', 'Not justified',
'A parent is allowed to spend every resource available to find his child.',
'Evidence gathered illegally can taint every other part of the case.',
'crime', 'evergreen', 'curated', '{"rule_vs_outcome":"b","loyalty_vs_honesty":"a"}'),

('A landlord refuses to rent to a man who served time for a non-violent offence a decade ago. The man cannot find housing. The landlord cites his responsibility to his property investment and other tenants.',
'Was the refusal justified?', 'Crime · Re-entry', 'Justified', 'Not justified',
'A private landlord is allowed to manage his own assessed risk.',
'A society that bars its returned citizens from housing is the same one that jailed them.',
'crime', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A judge sentences a parent of three small children to two years in prison for a non-violent offence, applying the law as written. A social worker argues the family will effectively be destroyed by the sentence.',
'Was the sentence right?', 'Crime · Family', 'Right', 'Wrong',
'A law that bends for the right family background is not a law.',
'A sentence that destroys three children is a sentence with hidden victims no one counted.',
'crime', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A whistleblower exposes systematic police corruption and is charged with illegally leaking classified documents. He is found guilty and serves jail time. The corruption he exposed leads to dozens of officers being dismissed.',
'Was the conviction justified?', 'Crime · Truth', 'Justified', 'Not justified',
'A leak is a leak; the law cannot exempt those who decide to shake the system.',
'A society that jails its truth-tellers stops hearing the truth.',
'crime', 'topical', 'curated', '{"rule_vs_outcome":"a","loyalty_vs_honesty":"b"}'),

('A man refuses to testify against a close friend he saw commit a serious crime. He is held in contempt and jailed for two months. The case collapses entirely without his testimony.',
'Was he right to refuse?', 'Crime · Loyalty', 'Right', 'Wrong',
'There are loyalties that run older and deeper than the court''s jurisdiction.',
'A friend who commits a serious crime has already broken the friendship that shielded him.',
'crime', 'evergreen', 'curated', '{"loyalty_vs_honesty":"a","rule_vs_outcome":"b"}'),

('A pharmacist quietly reports a customer to the police after noticing a suspicious pattern of prescription drug purchases. The customer is arrested. The pharmacist later learns the purchases were part of a legitimate off-label protocol.',
'Was the pharmacist right to report?', 'Crime · Caution', 'Right', 'Wrong',
'A vigilant community member is a genuine public safety asset.',
'A pharmacist who plays detective has stepped outside his role.',
'crime', 'evergreen', 'curated', '{"caution_vs_action":"b","rule_vs_outcome":"a"}'),

('A defence lawyer secures the release of a client who confessed his guilt to her in a privileged session. The privilege is legally absolute. The client commits a similar offence within a year of release.',
'Was she right to use the privilege to defend him?', 'Crime · Privilege', 'Right', 'Wrong',
'Without attorney-client privilege, no dangerous person tells the truth to any lawyer.',
'A privilege that releases the genuinely dangerous has blood on it eventually.',
'crime', 'evergreen', 'curated', '{"rule_vs_outcome":"a","loyalty_vs_honesty":"a"}'),

('A neighbourhood watch member reports a man for looking suspicious while putting rubbish out in front of his own home. Police arrive aggressively. The man is unharmed but publicly humiliated. The watch group declines to apologise.',
'Was the report defensible?', 'Crime · Bias', 'Defensible', 'Indefensible',
'A neighbourhood watch alerts to outliers; that is the mechanism it runs on.',
'A watch group that reports its own neighbours by appearance is the harm it claimed to stop.',
'crime', 'evergreen', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A teenager vandalises a war memorial during a large political protest. He is caught, arrested, and sentenced to two years in prison. The memorial is fully repaired within a week.',
'Was the sentence proportionate?', 'Crime · Vandalism', 'Proportionate', 'Excessive',
'A society signals what it values by how seriously it punishes what is destroyed.',
'A two-year sentence for a teenager is a wound the justice system inflicts on itself.',
'crime', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A man discovers his neighbour''s door is unlocked and a stranger inside the house. He locks the stranger in and holds him there until police arrive. The stranger turns out to be the neighbour''s estranged sibling, expected later that day.',
'Was the man right to detain him?', 'Crime · Caution', 'Right', 'Wrong',
'A neighbour''s instinct is the cheapest security a street can have.',
'A man detained until the police arrive has been assumed guilty without evidence.',
'crime', 'evergreen', 'curated', '{"caution_vs_action":"b","rule_vs_outcome":"b"}'),

('A judge sentences a repeat minor offender to community service rather than jail, against the advice of prosecutors. The man completes his service well. Two years later, he is convicted of a serious offence.',
'Was the lenient original sentence wrong?', 'Crime · Mercy', 'Wrong', 'Not wrong',
'A pattern of leniency on small crimes can quietly enable a larger one.',
'A later outcome years removed is not the correct verdict on an earlier decision.',
'crime', 'seasonal', 'curated', '{"rule_vs_outcome":"b","caution_vs_action":"a"}'),

-- =============================================================================
-- the_future (16)
-- =============================================================================

('A government offers substantial cash incentives for couples to have a third child, after years of declining birth rates. Activists call it state coercion over personal reproductive decisions. The first cohort of incentivised births is born the following year.',
'Was the incentive justified?', 'Future · Demography', 'Justified', 'Not justified',
'A country without children has no future it can honestly plan for.',
'A child born for a government subsidy is a child born for the wrong reason.',
'the_future', 'topical', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"b"}'),

('A private research institute extends average life expectancy by twenty years through a treatment available only to those who can afford it. Public funding to broaden access is consistently rejected. The treatment remains exclusively private.',
'Was the institute wrong to launch before broad access was secured?', 'Future · Longevity', 'Wrong', 'Not wrong',
'A two-tier life expectancy is the foundation of a two-tier civilisation.',
'A new treatment starts where it can; access has always widened with time.',
'the_future', 'evergreen', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"b"}'),

('A school replaces a quarter of its teaching positions with adaptive AI learning software. Standardised test scores hold steady. Student satisfaction scores drop significantly. The school says outcomes are what matter.',
'Was the substitution justified?', 'Future · Education', 'Justified', 'Not justified',
'A child taught effectively by software is a child taught effectively.',
'A school without teachers has stopped being a school.',
'the_future', 'evergreen', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A national government introduces a universal basic income at a modest level, funded by a sharp wealth tax. A number of wealthy citizens and companies relocate abroad. Millions of families describe breathing for the first time in years.',
'Was the policy justified?', 'Future · Economy', 'Justified', 'Not justified',
'A guaranteed floor under every family is what a functioning country owes its people.',
'A tax that drives out builders and investors impoverishes the country it says it wants to help.',
'the_future', 'topical', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"b"}'),

('A city legalises fully autonomous taxis with no human operator on board. Road fatalities drop by 30%. Many taxi and delivery drivers are made redundant with no retraining programmes in place.',
'Was the city right to legalise?', 'Future · Work', 'Right', 'Wrong',
'A 30% reduction in road deaths is a 30% reduction in funerals.',
'A city that replaces workers without retraining them broke an implicit promise.',
'the_future', 'topical', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A government bans children under 16 from social media platforms entirely. Parents who allow access are fined. Some parents argue it removes a genuinely useful social tool for introverted or isolated children.',
'Was the ban justified?', 'Future · Childhood', 'Justified', 'Not justified',
'A childhood handed over to engagement-optimised feeds is the product''s design, not the child''s choice.',
'A parent is the right authority on what is appropriate for their child, not the state.',
'the_future', 'topical', 'curated', '{"individual_vs_collective":"b","rule_vs_outcome":"a"}'),

('A national identity system links every citizen''s health, employment, travel, and financial records into one unified database. Government efficiency improves measurably. Several documented cases of misuse leak over two years.',
'Was the database justified?', 'Future · State', 'Justified', 'Not justified',
'A modern state that cannot coordinate its data cannot effectively serve its citizens.',
'A database that knows everything about everyone is one decision away from misuse.',
'the_future', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A company introduces continuous productivity monitoring of remote workers, including biometric data collection. High performers report no objection. Lower performers resign. The company describes it as a transparent performance filter.',
'Was the system justified?', 'Future · Surveillance', 'Justified', 'Not justified',
'A workplace is allowed to measure the work it is paying for.',
'A workplace that monitors heartbeats has lost sight of what a workplace is for.',
'the_future', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A health insurer begins requiring prenatal genetic screening for all policyholders. Families who decline the screening face substantially higher premiums. Some families refuse on ethical grounds.',
'Was the requirement justified?', 'Future · Genetics', 'Justified', 'Not justified',
'A health system that can prevent conditions cheaply has a systemic interest in doing so.',
'A health system that prices ethical choice out of families is coercive.',
'the_future', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A small country grants legal personhood to its main river, allowing it to be represented in court by appointed guardians. A foreign mining company facing liability calls the law legally absurd. Environmental suits proceed.',
'Was the law justified?', 'Future · Nature', 'Justified', 'Not justified',
'A river that can bring a lawsuit is a river that might survive.',
'A legal fiction invented to win environmental cases is a slope, not a principled stand.',
'the_future', 'evergreen', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A government mandates that all AI-generated media carry a non-removable origin watermark identifying the model and operator. Independent artists object to mandatory state-readable metadata on their creative outputs.',
'Was the mandate justified?', 'Future · Truth', 'Justified', 'Not justified',
'A public information space without provenance is a space without shared truth.',
'A state-mandated watermark on every creative act is a surveillance infrastructure.',
'the_future', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A city awards a single private company a long-term contract to operate all public transit, in exchange for a guaranteed price cap and full 24-hour coverage. Service measurably improves. Civic groups call the arrangement undemocratic.',
'Was the deal worth making?', 'Future · Civic', 'Worth it', 'Not worth it',
'A working, affordable bus system is the only test of transit governance that matters.',
'A city that has contracted out its public spine is no longer fully a public city.',
'the_future', 'evergreen', 'curated', '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'),

('A privacy regulator allows companies to sell customers'' genetic test results to advertisers if customers have not explicitly opted out. The opt-out mechanism is accessible but rarely used. The market grows rapidly.',
'Was the regulator wrong?', 'Future · Consent', 'Wrong', 'Not wrong',
'Consent buried beneath a rarely-used opt-out is consent shaped by the product design.',
'A market built on disclosed opt-outs is a market that respects the choice it was given.',
'the_future', 'evergreen', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A national government bans all cryptocurrency transactions within its borders. Citizens lose access to overseas savings they had held legally. A black market in crypto immediately emerges.',
'Was the ban justified?', 'Future · Money', 'Justified', 'Not justified',
'A currency that exists outside the state is a currency the state cannot tax or govern.',
'A ban that creates a black market has empowered the very people it claimed to fight.',
'the_future', 'topical', 'curated', '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'),

('A space agency proposes a permanent human settlement on another planet, jointly funded by several governments. Critics call it a vanity project while earthly problems go unsolved. The agency argues species survival requires the bet.',
'Was the project justified?', 'Future · Frontier', 'Justified', 'Not justified',
'A species with somewhere else to live is a species that survives the next millennium.',
'A planet whose problems are unresolved should not fund another planet first.',
'the_future', 'evergreen', 'curated', '{"caution_vs_action":"b","individual_vs_collective":"b"}'),

('A government legalises brain-computer interface devices for medical use, with light-touch oversight of non-medical applications. Within five years, professional advantages among BCI users compound measurably across industries.',
'Was the loose oversight justified?', 'Future · Body', 'Justified', 'Not justified',
'Innovation needs room to be used imperfectly before its rules can be properly shaped.',
'A device that multiplies advantage decides the next generation before the rules exist.',
'the_future', 'seasonal', 'curated', '{"caution_vs_action":"b","individual_vs_collective":"b"}');

-- =============================================================================
-- 14 days of featured scenarios rotating through categories
-- 9 PM IST = 15:30 UTC
-- =============================================================================

-- Day 1 (2026-05-17): personal_relationships
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-17 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'personal_relationships' order by created_at limit 1
on conflict do nothing;

-- Day 2 (2026-05-18): work_career
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-18 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'work_career' order by created_at limit 1
on conflict do nothing;

-- Day 3 (2026-05-19): society_politics
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-19 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'society_politics' order by created_at limit 1
on conflict do nothing;

-- Day 4 (2026-05-20): tech_ai
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-20 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'tech_ai' order by created_at limit 1
on conflict do nothing;

-- Day 5 (2026-05-21): justice_law
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-21 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'justice_law' order by created_at limit 1
on conflict do nothing;

-- Day 6 (2026-05-22): health_medicine
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-22 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'health_medicine' order by created_at limit 1
on conflict do nothing;

-- Day 7 (2026-05-23): money_wealth
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-23 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'money_wealth' order by created_at limit 1
on conflict do nothing;

-- Day 8 (2026-05-24): environment
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-24 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'environment' order by created_at limit 1
on conflict do nothing;

-- Day 9 (2026-05-25): identity_belief
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-25 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'identity_belief' order by created_at limit 1
on conflict do nothing;

-- Day 10 (2026-05-26): love_romance
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-26 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'love_romance' order by created_at limit 1
on conflict do nothing;

-- Day 11 (2026-05-27): crime
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-27 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'crime' order by created_at limit 1
on conflict do nothing;

-- Day 12 (2026-05-28): the_future
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-28 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'the_future' order by created_at limit 1
on conflict do nothing;

-- Day 13 (2026-05-29): personal_relationships (second rotation)
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-29 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'personal_relationships' order by created_at offset 1 limit 1
on conflict do nothing;

-- Day 14 (2026-05-30): work_career (second rotation)
insert into public.featured_scenarios (scenario_id, drop_at, region)
select id, '2026-05-30 15:30:00+00'::timestamptz, 'IN'
from public.scenarios where source = 'curated' and category = 'work_career' order by created_at offset 1 limit 1
on conflict do nothing;

commit;
