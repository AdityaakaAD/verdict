-- =============================================================================
-- VERDICT — Grand Cases seed (4 cases × 5 chapters)
-- Chapters drop Mon–Fri at 9 PM IST = 15:30 UTC.
-- Week starts are illustrative; update to live week when deploying.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Case 1: "The Algorithm"
-- ---------------------------------------------------------------------------
with c as (
  insert into public.grand_cases (title, premise, category, week_start)
  values (
    'The Algorithm',
    'An AI system recommended a medical treatment for Meera, a 42-year-old teacher with a rare autoimmune condition. She followed the recommendation exactly. The treatment failed catastrophically, leaving her with permanent hearing loss. The AI''s developer, the hospital that deployed it, and the regulator that approved it are all now pointing at each other. Someone is responsible. Five days to find out who.',
    'tech_ai',
    '2026-05-18'
  )
  returning id
)
insert into public.grand_case_chapters
  (case_id, chapter_number, title, content, question, side_a_label, side_b_label, side_a_meaning, side_b_meaning, drops_at, dimension_tags)
select
  c.id,
  ch.chapter_number,
  ch.title,
  ch.content,
  ch.question,
  ch.side_a_label,
  ch.side_b_label,
  ch.side_a_meaning,
  ch.side_b_meaning,
  ch.drops_at,
  ch.dimension_tags
from c, (values
  (
    1,
    'Day 1 — The Decision',
    'Meera was diagnosed in 2024 after a two-year ordeal of misdiagnoses. When her specialist, Dr. Verma, showed her the AI recommendation — a high-dose experimental protocol — she was exhausted, trusting, and desperate. She had never heard of the AI system. The consent form mentioned it in footnote 14 of 22 pages. Dr. Verma said, "The system agrees with my read. That gives me confidence." Meera signed. The treatment began a week later.',
    'Was Meera''s consent genuinely informed?',
    'Yes, informed',
    'Not informed',
    'An adult who reads and signs a consent form has consented.',
    'Consent buried in footnote 14 is consent the system chose not to give.',
    '2026-05-18 15:30:00+00',
    '{"rule_vs_outcome":"b","individual_vs_collective":"a"}'
  ),
  (
    2,
    'Day 2 — The Doctor''s Role',
    'Dr. Verma is a respected specialist with a clean record. He reviewed the AI output thoroughly, cross-referenced it with two clinical papers, and believed it was sound. He disclosed the AI''s involvement verbally — "the system supports this approach" — but did not specify which system, its approval status, or its accuracy rate on this condition class. He believed this was standard practice at the hospital. Seventeen other specialists at the same hospital followed the same protocol that year.',
    'Does the doctor bear primary responsibility?',
    'Primary responsibility',
    'Not primarily responsible',
    'A doctor who relies on a system without disclosing its limits has shifted the risk to his patient.',
    'A specialist who followed institutional protocol and disclosed AI use acted in good faith.',
    '2026-05-19 15:30:00+00',
    '{"rule_vs_outcome":"a","loyalty_vs_honesty":"b"}'
  ),
  (
    3,
    'Day 3 — What the Company Knew',
    'Internal documents obtained by a journalist show that the AI developer — a Bengaluru-based health-tech firm — had flagged a known accuracy gap in its model for autoimmune conditions with Meera''s specific marker. The flag was added to internal documentation eight months before her treatment. It was never communicated to the hospital. The company''s legal team had advised against disclosure, noting the flag was "within acceptable model uncertainty ranges."',
    'Is the company the primary culpable party?',
    'Company is culpable',
    'Company is not primarily culpable',
    'A company that knew a risk and said nothing owned every outcome that followed.',
    'A company that disclosed risk within its own documentation fulfilled a reasonable duty.',
    '2026-05-20 15:30:00+00',
    '{"rule_vs_outcome":"a","head_vs_heart":"a"}'
  ),
  (
    4,
    'Day 4 — The Regulator Approved It',
    'The AI system carried a full certification from the Central Drugs Standard Control Organisation''s new AI-device track. The certification was issued six months before Meera''s treatment. The regulator''s review had access to the same internal accuracy data the company held. Auditors later found the certification was issued without a human specialist reviewing the autoimmune-specific accuracy gap — the review was conducted entirely by the regulator''s own AI screening tool.',
    'Does regulatory approval transfer the moral responsibility?',
    'Approval transfers responsibility',
    'Approval doesn''t transfer it',
    'A patient relying on a certified system relied on the system designed to protect her.',
    'A certificate does not make a known risk disappear.',
    '2026-05-21 15:30:00+00',
    '{"rule_vs_outcome":"b","individual_vs_collective":"b"}'
  ),
  (
    5,
    'Day 5 — Who Pays?',
    'Meera is now partially deaf in one ear, unable to teach, and in legal proceedings that have already cost her three years of savings. The company has offered a settlement of ₹18 lakhs under a non-disclosure agreement. The hospital has referred all inquiries to the company. Dr. Verma has written her a personal letter of apology. The regulator is reviewing its AI certification process. Meera says she will not sign the NDA.',
    'Who bears the greatest moral responsibility for what happened to Meera?',
    'The company',
    'The system — all of them',
    'A company that concealed a known risk caused a knowable harm.',
    'Responsibility distributed across five parties is responsibility no one truly holds.',
    '2026-05-22 15:30:00+00',
    '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'
  )
) as ch(chapter_number, title, content, question, side_a_label, side_b_label, side_a_meaning, side_b_meaning, drops_at, dimension_tags);

-- ---------------------------------------------------------------------------
-- Case 2: "The Whistleblower"
-- ---------------------------------------------------------------------------
with c as (
  insert into public.grand_cases (title, premise, category, week_start)
  values (
    'The Whistleblower',
    'Priya is a senior environmental analyst at a major paper-and-pulp company. Over six months of work she has discovered that the company''s pollution reports to the ministry are systematically understating toxic discharge by a factor of four. A river runs through three villages near the plant. She has two children, a mortgage, and a mother in a care facility. Five days to decide what she should do.',
    'environment',
    '2026-05-25'
  )
  returning id
)
insert into public.grand_case_chapters
  (case_id, chapter_number, title, content, question, side_a_label, side_b_label, side_a_meaning, side_b_meaning, drops_at, dimension_tags)
select
  c.id,
  ch.chapter_number,
  ch.title,
  ch.content,
  ch.question,
  ch.side_a_label,
  ch.side_b_label,
  ch.side_a_meaning,
  ch.side_b_meaning,
  ch.drops_at,
  ch.dimension_tags
from c, (values
  (
    1,
    'Day 1 — What She Found',
    'The discharge numbers in the ministry''s portal are generated automatically from the company''s internal systems. Priya discovered that a calculation script, modified eighteen months ago, divides the output figure by four before uploading. The original script still runs internally and produces the true figure. She has screenshots, timestamps, and the email thread in which a senior manager reviewed and approved the modification. The manager is now the VP of Operations.',
    'Should Priya act on what she found?',
    'She must act',
    'She needs more time',
    'Evidence this clear creates a duty that waiting doesn''t change.',
    'A decision this consequential deserves time to verify every detail.',
    '2026-05-25 15:30:00+00',
    '{"caution_vs_action":"b","loyalty_vs_honesty":"b"}'
  ),
  (
    2,
    'Day 2 — She Tries Internally',
    'Priya sends a confidential note to the company''s Chief Compliance Officer — a woman she has always respected. The CCO calls her in within 24 hours. She listens carefully, asks good questions, then says: "Priya, I''m going to be honest with you. This is bigger than my authority. I''m going to escalate within the group. Please don''t do anything until you hear from me." She does not hear from the CCO for eleven days. When she follows up, the CCO says only: "It''s being handled."',
    'Should she trust the internal process and wait?',
    'Trust and wait',
    'Internal process has failed',
    'An institution given a chance to fix itself deserves the chance.',
    'Eleven days of silence after a compliance flag is the institution''s answer.',
    '2026-05-26 15:30:00+00',
    '{"caution_vs_action":"a","loyalty_vs_honesty":"b"}'
  ),
  (
    3,
    'Day 3 — Her Colleagues Knew',
    'While waiting, Priya speaks quietly to a colleague who has worked in the data team for six years. The colleague tells her: "Everyone in this team has known for at least a year. The last person who asked questions about it was let go." He shows her his own redundancy notice from three months ago — effective in six weeks. He asks her not to involve him. Priya now knows she is not the first and that the company is aware the data team knows.',
    'Does knowing her colleagues knew change her obligation?',
    'It changes everything',
    'Her obligation is unchanged',
    'A cover-up that silenced others is a cover-up that cannot be waited out.',
    'What others knew or didn''t does not change what she must decide for herself.',
    '2026-05-27 15:30:00+00',
    '{"loyalty_vs_honesty":"b","individual_vs_collective":"b"}'
  ),
  (
    4,
    'Day 4 — What She Has to Lose',
    'Priya''s husband is between jobs. Her daughter starts college in September. Her mother''s care costs ₹40,000 a month. The company''s NDA, which she signed at onboarding, explicitly covers "proprietary environmental and process data." A lawyer friend tells her the NDA would likely not hold in court if she goes to a government body rather than the press — but the case would take years and the legal bills would start immediately. Going to the press would be faster but legally riskier.',
    'Does her personal situation change whether she should act?',
    'Personal cost matters',
    'Personal cost is irrelevant',
    'A person cannot be asked to martyr their family for a principle.',
    'The river runs through villages whether or not Priya can afford a lawyer.',
    '2026-05-28 15:30:00+00',
    '{"individual_vs_collective":"a","head_vs_heart":"b"}'
  ),
  (
    5,
    'Day 5 — The Data Goes Public Anyway',
    'While Priya is still deciding, an anonymous leak reaches a national news outlet. The story runs the next morning, citing internal documents that match what Priya found but include additional detail she never accessed. Someone else in the company leaked independently. Ministry officials are calling for an inquiry. The VP of Operations has been placed on leave. The company''s stock has dropped 14%. Priya''s name is not in the story. She has not yet decided what to do.',
    'Now that the story is out, should Priya go on the record?',
    'She should go on record',
    'She should stay silent',
    'A witness with evidence has a duty to make it official, not just public.',
    'Her silence was her own decision; someone else made the public one.',
    '2026-05-29 15:30:00+00',
    '{"loyalty_vs_honesty":"b","caution_vs_action":"b"}'
  )
) as ch(chapter_number, title, content, question, side_a_label, side_b_label, side_a_meaning, side_b_meaning, drops_at, dimension_tags);

-- ---------------------------------------------------------------------------
-- Case 3: "The Inheritance"
-- ---------------------------------------------------------------------------
with c as (
  insert into public.grand_cases (title, premise, category, week_start)
  values (
    'The Inheritance',
    'Ramesh died at 74 leaving a handwritten will that named his eldest son Vikram as sole beneficiary of the family home in Pune — a property now worth ₹1.8 crore. His two daughters, Ananya and Shalini, and his youngest son, Dev, are contesting the will. The house is the only significant asset. The will was witnessed but not notarized, which in Maharashtra creates a grey zone. Five days to determine what is fair.',
    'personal_relationships',
    '2026-06-01'
  )
  returning id
)
insert into public.grand_case_chapters
  (case_id, chapter_number, title, content, question, side_a_label, side_b_label, side_a_meaning, side_b_meaning, drops_at, dimension_tags)
select
  c.id,
  ch.chapter_number,
  ch.title,
  ch.content,
  ch.question,
  ch.side_a_label,
  ch.side_b_label,
  ch.side_a_meaning,
  ch.side_b_meaning,
  ch.drops_at,
  ch.dimension_tags
from c, (values
  (
    1,
    'Day 1 — The Will',
    'Ramesh wrote the will two years before his death in his own hand, in Marathi, in a small notebook. He named Vikram because "he was always here." Vikram is the eldest and did live in the house with his family throughout Ramesh''s illness, managing his care, his medications, and his doctor''s visits. The daughters both live abroad; Dev lives in Nagpur. None of the other three children had visited in the last year of Ramesh''s life.',
    'Should the will be honoured as written?',
    'Honour the will',
    'Contest the will',
    'A man''s final written word is the clearest expression of his intent.',
    'A will written without legal counsel and contested by three children deserves judicial review.',
    '2026-06-01 15:30:00+00',
    '{"rule_vs_outcome":"a","individual_vs_collective":"a"}'
  ),
  (
    2,
    'Day 2 — Ananya''s Claim',
    'Ananya is the eldest daughter. She has documents showing she sent money to the family every month for eleven years — a total of approximately ₹42 lakhs — including payments for the house''s structural repairs in 2019 and 2021. She says she couldn''t visit more because of her visa situation and a demanding job, but she contributed financially more than anyone. She has receipts. She is now asking for a proportional share based on contribution.',
    'Does financial contribution over 11 years create a claim on the inheritance?',
    'Financial claim is valid',
    'Financial history doesn''t override the will',
    'Eleven years of documented support built what she is now excluded from.',
    'A gift given is a gift given; it cannot be recovered as inheritance.',
    '2026-06-02 15:30:00+00',
    '{"rule_vs_outcome":"b","individual_vs_collective":"a"}'
  ),
  (
    3,
    'Day 3 — The Debt',
    'A family friend reveals something none of the siblings knew: Ramesh owed Vikram ₹14 lakhs. Vikram had lent him the money nine years ago to settle a business dispute, and the debt was never repaid. Vikram has a signed acknowledgement from his father. He had never told his siblings. He says he didn''t tell them because his father asked him not to. He now says the inheritance is, in part, repayment of that debt.',
    'Does a documented unpaid debt change the moral weight of the inheritance?',
    'Debt changes the picture',
    'Debt is separate from inheritance',
    'A son who lent money to his father and cared for him has compounded claims.',
    'A private debt kept secret for nine years cannot now be used to reframe a contested will.',
    '2026-06-03 15:30:00+00',
    '{"loyalty_vs_honesty":"a","rule_vs_outcome":"a"}'
  ),
  (
    4,
    'Day 4 — Dev''s Sacrifice',
    'Dev, the youngest, has barely spoken in the proceedings until now. He comes forward with a letter from Ramesh dated three years ago — a year before the will — in which Ramesh wrote that he intended to divide the house equally among all four children. Dev says he had respected his father''s private decision to change his mind with the later will, but the letter proves that equal division was the original intent. He also reveals he had turned down a job in Dubai twelve years ago to stay close to the family.',
    'Does an earlier letter expressing intent matter if the will supersedes it?',
    'Earlier intent should count',
    'The will is what counts',
    'A man''s original and witnessed intent is as valid as a later revision.',
    'A will is a will because it is the final expression, not the first.',
    '2026-06-04 15:30:00+00',
    '{"rule_vs_outcome":"a","loyalty_vs_honesty":"b"}'
  ),
  (
    5,
    'Day 5 — The Choice',
    'A mediator has proposed two options: Option A — Vikram gets the house, compensates his sisters ₹15 lakhs each from its future sale, and formally forgives the ₹14 lakh debt. Option B — The house is sold, the debt is deducted, and the remainder divided equally four ways. Vikram''s family, who have been living there, would have to leave under Option B. The siblings have 30 days to decide before the court imposes its own solution.',
    'Which option is more just?',
    'Option A — Vikram keeps it',
    'Option B — Equal division',
    'Presence and care over eleven years of illness earns what documents alone do not.',
    'A house is not a reward for proximity; equal blood deserves equal ground.',
    '2026-06-05 15:30:00+00',
    '{"individual_vs_collective":"a","rule_vs_outcome":"b"}'
  )
) as ch(chapter_number, title, content, question, side_a_label, side_b_label, side_a_meaning, side_b_meaning, drops_at, dimension_tags);

-- ---------------------------------------------------------------------------
-- Case 4: "The Coach"
-- ---------------------------------------------------------------------------
with c as (
  insert into public.grand_cases (title, premise, category, week_start)
  values (
    'The Coach',
    'Arjun was the most promising junior sprinter at a Hyderabad athletics academy for six years. At 17, his coach, Mr. Krishnan, did not select him for the State Championship trials — choosing a younger boy with a month less of training instead. Arjun never recovered his form. He quit the sport at 19. At 24, he has filed a formal complaint with the state athletics board, alleging that the selection was driven by favouritism based on caste. Five days to decide what happened.',
    'justice_law',
    '2026-06-08'
  )
  returning id
)
insert into public.grand_case_chapters
  (case_id, chapter_number, title, content, question, side_a_label, side_b_label, side_a_meaning, side_b_meaning, drops_at, dimension_tags)
select
  c.id,
  ch.chapter_number,
  ch.title,
  ch.content,
  ch.question,
  ch.side_a_label,
  ch.side_b_label,
  ch.side_a_meaning,
  ch.side_b_meaning,
  ch.drops_at,
  ch.dimension_tags
from c, (values
  (
    1,
    'Day 1 — The Accusation',
    'Arjun''s complaint states that in the month before the trial selection, Mr. Krishnan began giving him fewer training slots, paired him with slower athletes, and stopped his individual coaching sessions — all without explanation. The younger boy selected, Rajan, shared Mr. Krishnan''s caste community. Arjun and Rajan had identical personal-best times within 0.08 seconds at the time of selection. Arjun was older, more experienced, and had a longer consistent record.',
    'Does the circumstantial evidence support a claim of bias?',
    'Bias is plausible',
    'Insufficient evidence of bias',
    'A pattern of reduced opportunities before a selection decision is more than coincidence.',
    'Circumstantial evidence about a coach''s scheduling is not evidence of discriminatory intent.',
    '2026-06-08 15:30:00+00',
    '{"rule_vs_outcome":"b","head_vs_heart":"a"}'
  ),
  (
    2,
    'Day 2 — The Coach''s Record',
    'Mr. Krishnan has coached at the academy for nineteen years. Of his fourteen State Championship selections, eight have been from communities different from his own. Two of his former athletes are now national-team members. Athletes who have trained under him describe him as demanding but fair. The academy director says there has never been a complaint against him before. He has provided a written account of his decision: "Rajan showed better recovery data in the final assessment week."',
    'Does his nineteen-year record make bias less likely?',
    'Record suggests no bias',
    'Record doesn''t rule out bias',
    'A coach who selected across communities for nineteen years has demonstrated what his pattern is.',
    'A clean history does not protect a single decision from scrutiny.',
    '2026-06-09 15:30:00+00',
    '{"rule_vs_outcome":"a","caution_vs_action":"a"}'
  ),
  (
    3,
    'Day 3 — Arjun''s Account',
    'Arjun testifies before the board. He describes a specific incident three weeks before selection: Mr. Krishnan invited six athletes to a strategy session at his home. Arjun was not invited. He learned about it from another athlete the following day. When he asked Mr. Krishnan, he was told it was "an informal chat, nothing official." The athletes who attended were Rajan and four others. None of them share Mr. Krishnan''s caste community. Arjun alone was excluded.',
    'Does the excluded meeting change the picture?',
    'The meeting is significant',
    'One exclusion proves nothing',
    'An informal strategy session before selection that excluded only one athlete is not informal.',
    'A single excluded invitation, for any reason, cannot bear the weight of a career-ending allegation.',
    '2026-06-10 15:30:00+00',
    '{"head_vs_heart":"b","rule_vs_outcome":"b"}'
  ),
  (
    4,
    'Day 4 — Other Students Speak',
    'Two former athletes come forward to the board. One says she observed Mr. Krishnan consistently offering Rajan correction and encouragement while "letting Arjun figure things out himself" in the months before the selection. The other — who left the academy five years ago — says Mr. Krishnan once told him that "hunger comes from the community, not just the individual" — a remark he interpreted as caste-coded. Mr. Krishnan denies making the remark and says it is being misrepresented.',
    'Does testimony from two former athletes shift the balance?',
    'It shifts the balance',
    'Secondhand accounts are unreliable',
    'Two independent accounts of preferential treatment constitute a pattern.',
    'Testimony recalled years later about coaching style and overheard remarks is not reliable evidence.',
    '2026-06-11 15:30:00+00',
    '{"rule_vs_outcome":"b","head_vs_heart":"a"}'
  ),
  (
    5,
    'Day 5 — The Pattern Becomes Clear',
    'The board''s own investigation finds that over Mr. Krishnan''s last five selection decisions, athletes from his own community were selected three times when two other athletes had comparable or better recorded times. The statistical gap is noted but the board says it is "inconclusive" without direct evidence of intent. Mr. Krishnan is not found guilty of discrimination. He is issued a "formal advisement on transparency in selection criteria." Arjun''s complaint is closed. He calls it a whitewash.',
    'Was the board''s outcome just?',
    'The outcome was just',
    'The outcome failed Arjun',
    'A board that found no direct evidence of intent cannot convict on statistical patterns alone.',
    'A system that sees a pattern across five selections and issues an advisement has protected itself, not the athlete.',
    '2026-06-12 15:30:00+00',
    '{"rule_vs_outcome":"a","individual_vs_collective":"b"}'
  )
) as ch(chapter_number, title, content, question, side_a_label, side_b_label, side_a_meaning, side_b_meaning, drops_at, dimension_tags);

commit;
