/* Read Anyone in 30 Seconds */
(function () {
  "use strict";

  const KEY = "cyrus-read-anyone-v1";
  const TABS = [
    { id: "identify", label: "Identify" },
    { id: "sayit", label: "Say it" },
    { id: "practice", label: "Practice" },
    { id: "today", label: "Today" },
    { id: "playbook", label: "Playbook" },
  ];

  const NEEDS = [
    { id: "significance", name: "Significance", lean: "Wants to matter", icon: "★", color: "#F0C35A", glow: "rgba(240,195,90,0.28)", listen: "Talks about what they built, their impact, or standing out.", mightSay: ["I built that from scratch.", "People still come to me for this."], do: "Name their specific impact. Then ask what they are proudest of.", avoid: "A vague 'that's amazing' or stealing the story with your own win.", line: "That took real building. What are you proudest of?", question: "Do others see me as making an impact?" },
    { id: "approval", name: "Approval", lean: "Wants to get it right", icon: "✓", color: "#7EB6FF", glow: "rgba(126,182,255,0.28)", listen: "Checks in, seeks reassurance, plays themselves down before they start.", mightSay: ["Is that okay?", "I am sure I will mess it up."], do: "Give clear, specific validation. Say what is good and why.", avoid: "Vague praise, or jumping in with a fix before they feel sure.", line: "You handled that well — especially [the specific bit].", question: "Am I doing this right?" },
    { id: "acceptance", name: "Acceptance", lean: "Wants to belong", icon: "◈", color: "#3DDC97", glow: "rgba(61,220,151,0.28)", listen: "We, us, our. Teams, groups, who is in and who is out.", mightSay: ["We all get on really well.", "I do not want to crash a group."], do: "Use shared language. Make room for them. Talk about the 'we'.", avoid: "Making it all about you, or leaving them on the edge of the circle.", line: "You would fit with the people I have in mind for this.", question: "Do I belong here?" },
    { id: "intelligence", name: "Intelligence", lean: "Wants to be seen as smart", icon: "◉", color: "#C9A0FF", glow: "rgba(201,160,255,0.28)", listen: "Mentions expertise, research, how it works. Tests whether you know it too.", mightSay: ["When I was at university…", "Walk me through the method."], do: "Ask for their expert view, and mean it. Let them explain.", avoid: "Talking over them, or dumbing it down.", line: "I would like your read on this — you know this terrain.", question: "Do others see me as sharp?" },
    { id: "pity", name: "Hardship", lean: "Wants it known it has been hard", icon: "◐", color: "#E0A878", glow: "rgba(224,168,120,0.28)", listen: "Talks about what they have been through. Seeks a moment of recognition.", mightSay: ["You would not believe my week.", "Nobody sees what I deal with."], do: "Confirm it was hard. Pause so they feel heard. Then gently move on.", avoid: "It is not that bad, at least, or instantly problem-solving.", line: "That sounds like a heavy stretch. I am glad you said it.", question: "Do others realise how hard this has been?" },
    { id: "power", name: "Power", lean: "Wants to steer", icon: "◇", color: "#FF7A6E", glow: "rgba(255,122,110,0.28)", listen: "Directs the conversation, wants the final say, asks for the headline.", mightSay: ["Just give me the headline.", "Here is how we are doing it."], do: "Be short and clear. Let them make the call. Offer options, not a lecture.", avoid: "Long preambles, or wrestling them for control.", line: "Two options. You choose which we run with.", question: "Do I have the final say?" },
  ];

  const STYLES = [
    { id: "direct", name: "Direct", color: "#FF7A6E", how: "Fast, task-first, wants the point.", adapt: "Lead with the headline. Cut the warmup. End with a clear next step." },
    { id: "spark", name: "Spark", color: "#F0C35A", how: "Fast, people-first, big energy, ideas.", adapt: "Match the energy a little. Let them talk. Be lively, then land one clear point." },
    { id: "careful", name: "Careful", color: "#7EB6FF", how: "Slower, task-first, wants accuracy.", adapt: "Slow down. Give them time. Bring the why and the detail, then pause." },
    { id: "warm", name: "Warm", color: "#3DDC97", how: "Slower, people-first, checks how everyone feels.", adapt: "Soften your pace. Start with them as a person. Then the task." },
  ];

  const SIT = { stranger: "Meeting a stranger", networking: "Networking", business: "Business or sales", family: "Friends and family", online: "Online messages" };

  const SIMPLE_FEELINGS = ["heard", "understood", "comfortable", "liked", "trusted", "respected"];
  const SAY_FEELINGS = [
    { id: "heard", label: "Heard" },
    { id: "understood", label: "Understood" },
    { id: "comfortable", label: "Comfortable" },
    { id: "liked", label: "Liked" },
    { id: "trusted", label: "Trusted" },
    { id: "respected", label: "Respected" },
    { id: "reassured", label: "Reassured" },
    { id: "included", label: "Included" },
    { id: "important", label: "Important" },
    { id: "smart", label: "Smart" },
    { id: "control", label: "In control" },
    { id: "reconciled", label: "Reconciled" },
    { id: "appreciated", label: "Appreciated" },
    { id: "curious", label: "Curious" },
  ];
  const SAY_SITS = [
    { id: "all", label: "Any moment" },
    { id: "opener", label: "Opener" },
    { id: "rapport", label: "Rapport" },
    { id: "disagree", label: "Disagree" },
    { id: "close", label: "Close" },
  ];
  const TIPS = {
    slownod: "A slow nod at emotional moments. Fast nods feel like hurry up.",
    tilt: "Slight head tilt while they talk — tell me more.",
    highlight: "Briefly show their feeling on your face and voice, then relax.",
    lean: "Lean in a little when they say something that matters.",
    smile: "A relaxed smile that reaches the eyes.",
    soft: "Drop your volume a touch. People often relax when you do.",
    match: "Start near their pace and volume, then lead a notch at a time. Obvious copying backfires.",
    pause: "Pause just before and after the key words.",
    slowdown: "Slow right down on the one line that matters.",
    melody: "Add melody; end the key sentence on a slightly lower note.",
    palmsup: "Open, visible palms to invite them in.",
    palmsdown: "Palms down for a firm, calm point.",
    askstop: "Ask, then stop talking. Let the silence work.",
    computer: "Hand to chin or a slight tilt — you are taking it in.",
    warm: "Keep the same warm tone through the hard part.",
    congruent: "Face matches the message: serious when serious, bright for good news."
  };
  const FEELING_TIPS = {
    heard: ["computer", "slownod", "pause"],
    understood: ["highlight", "slownod", "soft"],
    liked: ["smile", "tilt", "match"],
    trusted: ["melody", "slowdown", "pause"],
    respected: ["melody", "palmsdown", "pause"],
    comfortable: ["soft", "match", "palmsup"],
    reassured: ["warm", "slowdown", "soft"],
    included: ["palmsup", "smile", "lean"],
    important: ["pause", "lean", "melody"],
    smart: ["askstop", "lean", "computer"],
    control: ["palmsup", "askstop", "melody"],
    reconciled: ["warm", "congruent", "match"],
    appreciated: ["pause", "warm", "smile"],
    curious: ["melody", "lean", "askstop"]
  };
  const SRC = {
    NM: { label: "Working notes (listening prompts)" },
    NG: { label: "Working notes" },
    NP: { label: "Working notes" },
    NS: { label: "Working notes" },
    VVEC: { label: "Vanessa: conversation starters", url: "https://www.scienceofpeople.com/conversation-starters-topics/" },
    VVEL: { label: "Vanessa: how to be likable", url: "https://www.scienceofpeople.com/likable/" },
    VVEA: { label: "Vanessa: listening cues", url: "https://www.scienceofpeople.com/listening-skills/" },
    VVER: { label: "Vanessa: how to read people", url: "https://www.scienceofpeople.com/how-to-read-people/" },
    VGR: { label: "Vinh: build rapport", url: "https://vinhgiang.com/blog/how-to-build-rapport-with-absolutely-anyone" },
    VGS: { label: "Vinh: small talk", url: "https://vinhgiang.com/blog/how-to-make-small-talk" },
    VGB: { label: "Vinh: body language for charisma", url: "https://vinhgiang.com/blog/5-body-language-tips-to-become-more-charismatic" },
    VGF: { label: "Vinh: constructive feedback", url: "https://vinhgiang.com/blog/how-to-give-constructive-feedback-without-destroying-confidence" },
    VGA: { label: "Vinh: sincere apology", url: "https://vinhgiang.com/blog/the-art-of-the-apology-how-to-apologize-sincerely-to-anyone" },
    VGP: { label: "Vinh: projecting without sounding angry", url: "https://vinhgiang.com/blog/how-to-project-your-voice-without-shouting-or-sounding-angry" },
    V24: { label: "Vanessa on The Diary of a CEO (2024)", url: "https://www.youtube.com/watch?v=VHUrdELKjDw" },
    V26: { label: "Vanessa on The Diary of a CEO (2026)", url: "https://www.youtube.com/watch?v=q2cg1gEYWJQ" },
    VG: { label: "Vinh on The Diary of a CEO (2025)", url: "https://www.youtube.com/watch?v=oIiv_335yus" },
    C24: { label: "Chase on The Diary of a CEO (2024)", url: "https://www.youtube.com/watch?v=RvjR9GM2kX8" },
    C26: { label: "Chase on The Diary of a CEO (2026)", url: "https://www.youtube.com/watch?v=9uSXOr-AdAU" },
    CS: { label: "Chase: YouTube Short on the six needs", url: "https://www.youtube.com/shorts/YzJI8GTHteQ" },
    VGQ: { label: "Vinh: how to enter conversations", url: "https://www.youtube.com/watch?v=-X13GINFYOY" },
    VVC: { label: "Vanessa: memorable compliments", url: "https://www.youtube.com/watch?v=MOre3dRqHlA" },
    EK: { label: "Paul Ekman Group: the seven universal emotions", url: "https://www.paulekman.com/universal-emotions/" },
    NCI: { label: "NCI six social needs (secondary write-up)", url: "https://merlinobrecht.com/behavior-profiling/the-six-social-needs/" },
    VIG1: { label: "Vanessa, Instagram: a better opener than “nice to meet you”", url: "https://www.instagram.com/vvanedwards/reel/DSvJHzLDula/" },
    VTK1: { label: "Vanessa, TikTok: likable makes you more credible", url: "https://www.tiktok.com/@vvanedwards/video/7699563694350421279" },
    VTK2: { label: "Vanessa, TikTok: leave a conversation gracefully", url: "https://www.tiktok.com/@vvanedwards/video/7696611449283611935" },
    VTK4: { label: "Vanessa, TikTok: curious before critical", url: "https://www.tiktok.com/@vvanedwards/video/7698857415135071518" },
    VTK5: { label: "Vanessa, TikTok: people watch you less than you think", url: "https://www.tiktok.com/@vvanedwards/video/7697376668339555614" },
    VTK6: { label: "Vanessa, TikTok: change your energy first", url: "https://www.tiktok.com/@vvanedwards/video/7699181704648461599" },
    VX2: { label: "Vanessa, X: learn one new thing about the person", url: "https://x.com/vvanedwards/status/2095555287851913413" },
    VX3: { label: "Vanessa, X: send the thank-you you have been putting off", url: "https://x.com/vvanedwards/status/2113352794451120522" },
    GIG1: { label: "Vinh, Instagram: “Yes, and”, “tell me more”, “the one thing is”", url: "https://www.instagram.com/askvinh/p/DLC7Ae2xYFn/" },
    GIG2: { label: "Vinh, Instagram: listening is a superpower", url: "https://www.instagram.com/askvinh/p/De8pSzdDNLd/" },
    GTK1: { label: "Vinh, TikTok: end on a downward pitch", url: "https://www.tiktok.com/@askvinh/video/7258996715020094728" },
    GTK2: { label: "Vinh, TikTok: follow the threads", url: "https://www.tiktok.com/@askvinh/video/7699530755352923413" },
    GTK3: { label: "Vinh, TikTok: playfulness connects", url: "https://www.tiktok.com/@askvinh/video/7700263406732872978" },
    GTK4: { label: "Vinh, TikTok: reframe a painful story", url: "https://www.tiktok.com/@askvinh/video/7700073827564277010" }
  };


  const SCENARIOS = [
    { id: "s1", sit: "stranger", sitLabel: SIT.stranger, setup: "In a café, the owner lingers after bringing your order.", quote: "I actually built this place with my brother. Took us three years.", need: "significance", options: [{ id: "significance", line: "Three years is a serious build. What are you proudest of?" }, { id: "approval", line: "I am sure it will be fine. You are doing great." }, { id: "pity", line: "That must have been awful. Three years of struggle." }], why: "They led with what they built. Acknowledge the impact, then invite the story.", good: "Name the specific achievement, then ask a follow-up.", bad: "Pity or generic reassurance misses what they are offering you." },
    { id: "s2", sit: "networking", sitLabel: SIT.networking, setup: "At a small trade event, someone you have just met says:", quote: "We all go to the same Thursday meetup. It is a really close group.", need: "acceptance", options: [{ id: "acceptance", line: "A close group is rare. How did you all find each other?" }, { id: "power", line: "Who runs it? I will speak to them directly." }, { id: "intelligence", line: "Interesting. What is the organisational model?" }], why: "We, all, close group — belonging is the thread. Ask about the we, do not hijack it.", good: "Lean into the group and let them invite you closer.", bad: "Taking over, or turning it into a systems lecture, leaves them out of the circle." },
    { id: "s3", sit: "business", sitLabel: SIT.business, setup: "A busy buyer has given you five minutes.", quote: "Just give me the headline. I will decide from there.", need: "power", options: [{ id: "power", line: "Two options, thirty seconds each. You pick which we run with." }, { id: "acceptance", line: "I really want us to feel like a team on this." }, { id: "approval", line: "Is it okay if I start with a bit of background first?" }], why: "They want to steer and they told you how. Short options, they decide.", good: "Headline, options, their call.", bad: "A long warmup or asking permission fights the pace they set." },
    { id: "s4", sit: "family", sitLabel: SIT.family, setup: "A friend is about to try something new and looks unsure.", quote: "I am sure I will mess this up. Is it okay if I try it this way?", need: "approval", options: [{ id: "approval", line: "Yes. Trying it this way is a solid call — here is why it works." }, { id: "significance", line: "People will really respect you for this." }, { id: "power", line: "Just decide and get on with it." }], why: "They are checking they have it right. Specific reassurance, not a pep talk about status, and not a shove.", good: "Clear yes, plus one concrete reason.", bad: "Pushing them to be bolder skips the thing they actually asked for." },
    { id: "s5", sit: "online", sitLabel: SIT.online, setup: "A thoughtful reply lands in your inbox.", quote: "When I did my master's I wrote a paper on exactly this. Happy to walk you through the method.", need: "intelligence", options: [{ id: "intelligence", line: "I would like that. What is the one thing most people get wrong?" }, { id: "acceptance", line: "We should all get together and chat sometime." }, { id: "pity", line: "A master's sounds exhausting. Hope you are okay." }], why: "They offered expertise. Ask a sharp question and let them teach.", good: "Invite the expert view, then listen.", bad: "Sympathy or vague social plans ignore the gift they just put on the table." },
    { id: "s6", sit: "family", sitLabel: SIT.family, setup: "A relative calls, and the usual brightness is missing.", quote: "You would not believe the week I have had. Nobody sees what I am dealing with.", need: "pity", options: [{ id: "pity", line: "That sounds like a heavy week. I am glad you told me." }, { id: "power", line: "Right. Here is what you should do tomorrow." }, { id: "approval", line: "I am sure you handled it perfectly." }], why: "They want the hardness recognised first. Confirm, pause, then later you can help.", good: "Name the weight. Let the silence sit. Do not fix yet.", bad: "A plan, or 'you did great', skips the feeling under the words." },
    { id: "s7", sit: "business", sitLabel: SIT.business, setup: "A potential client is explaining what they actually want.", quote: "I do not want another product. I want something that actually makes a difference.", need: "significance", options: [{ id: "significance", line: "Making a difference is the point. What would 'it mattered' look like for you?" }, { id: "intelligence", line: "Let me show you the technical spec in detail." }, { id: "acceptance", line: "A lot of people like you buy this." }], why: "They are talking about impact, not features or belonging. Speak to the difference they want to make.", good: "Hold the word 'difference' and ask them to paint it.", bad: "A spec sheet or 'people like you' talks past what they just said." },
    { id: "s8", sit: "stranger", sitLabel: SIT.stranger, setup: "You have joined a small circle at a party.", quote: "Is everyone here already friends? I do not want to crash a group.", need: "acceptance", options: [{ id: "acceptance", line: "You are not crashing it. Come in — we were just talking about…" }, { id: "significance", line: "This is a really important room to be in." }, { id: "intelligence", line: "Interesting question. Group dynamics are fascinating." }], why: "They are asking if they belong. Make room, quickly and warmly.", good: "Invite them in and hand them a thread to hold.", bad: "Status talk or a sociology lesson leaves them still on the edge." },
    { id: "s9", sit: "networking", sitLabel: SIT.networking, setup: "Someone steps into a loose conversation and takes the lead.", quote: "Here is how we should do the intro round. Keep it to twenty seconds each.", need: "power", options: [{ id: "power", line: "Clear. You kick us off, then we will follow your format." }, { id: "approval", line: "Are you sure that is the right way? I do not want to get it wrong." }, { id: "pity", line: "You seem stressed about how this will go." }], why: "They want to steer. Let them. Do not fight for the room and do not pathologise it.", good: "Agree the format, hand them the start.", bad: "Challenging their call, or labelling their feeling, creates a wrestle." },
    { id: "s10", sit: "business", sitLabel: SIT.business, setup: "A careful client is looking at your numbers.", quote: "Walk me through the methodology. I want to understand how you got to that figure.", need: "intelligence", options: [{ id: "intelligence", line: "Gladly. I will show the steps, then I would like your view on the assumption." }, { id: "power", line: "Trust me, the number is right. Shall we just proceed?" }, { id: "acceptance", line: "Our other clients do not usually ask this." }], why: "They want to think it through. Invite their mind in. Do not rush the close.", good: "Show the working, then ask for their read.", bad: "'Trust me' or 'other people do not ask' feels like a shut door." },
    { id: "s11", sit: "online", sitLabel: SIT.online, setup: "A friend messages after a difficult conversation they had at work.", quote: "Did I handle that okay? I keep replaying it.", need: "approval", options: [{ id: "approval", line: "Yes — the way you stayed calm on that one point was exactly right." }, { id: "power", line: "Stop replaying it. You are in charge, move on." }, { id: "significance", line: "You really showed them who is important." }], why: "They want to know they got it right. Be specific about what worked.", good: "A clear yes, tied to one concrete moment.", bad: "Telling them to toughen up, or inflating it into status, misses the ask." },
    { id: "s12", sit: "online", sitLabel: SIT.online, setup: "A longer-than-usual message arrives in the evening.", quote: "It has been a brutal few months, if I am honest.", need: "pity", options: [{ id: "pity", line: "A brutal stretch. Thank you for saying it. I am here." }, { id: "intelligence", line: "Have you looked at the literature on burnout?" }, { id: "significance", line: "At least it will make a great story later." }], why: "They opened with the hardness. Meet that first. Advice can wait.", good: "Recognise it, thank them, stay.", bad: "A reading list or a silver lining is a dodge." },
    { id: "s13", sit: "networking", sitLabel: SIT.networking, setup: "Someone is telling you about a project they started.", quote: "I put this on the map. Before me, nobody in town was doing it.", need: "significance", options: [{ id: "significance", line: "You put it on the map — that is no small thing. How did you see the gap?" }, { id: "acceptance", line: "We should all work as a group on this." }, { id: "approval", line: "Do you think you did it the right way?" }], why: "Before me, on the map — they want the unique impact seen.", good: "Repeat the impact in their words, then a follow-up.", bad: "Folding them into a group, or questioning their method, undercuts the moment." },
    { id: "s14", sit: "stranger", sitLabel: SIT.stranger, setup: "A seat-neighbour on a train starts talking after a delay is announced.", quote: "Honestly, this is typical of my month. Nothing has gone smoothly.", need: "pity", options: [{ id: "pity", line: "It sounds like the month has been stacking up. That is a lot." }, { id: "power", line: "You should complain properly. I would." }, { id: "intelligence", line: "Delay patterns on this line are actually quite predictable." }], why: "The delay is the surface. The month is the feeling. Meet the feeling.", good: "Label the weight of the month, lightly.", bad: "Advice or a lecture on timetables makes them feel unheard." },
    { id: "s15", sit: "business", sitLabel: SIT.business, setup: "You are closing a meeting and they lean back.", quote: "If we do this, I need to be the one who signs it off.", need: "power", options: [{ id: "power", line: "Agreed. I will put the options in front of you, and you sign off." }, { id: "acceptance", line: "We can all sign it off together as a group." }, { id: "pity", line: "It sounds like you do not feel trusted." }], why: "They told you the condition: they steer the decision. Honour it.", good: "Confirm their sign-off. Keep your role as the person who prepares the choice.", bad: "Sharing the decision, or analysing their emotion, will feel like a takeover." },
    { id: "s16", sit: "family", sitLabel: SIT.family, setup: "A sibling is talking about a new circle of friends.", quote: "I finally feel like I am part of something. They actually include me.", need: "acceptance", options: [{ id: "acceptance", line: "That feeling of being included — I am really glad you have it." }, { id: "significance", line: "You should be the one leading that group." }, { id: "intelligence", line: "Why do you think they chose you?" }], why: "Part of something, included — belonging is the need in the room.", good: "Celebrate the inclusion in their words.", bad: "Pushing them to lead, or analysing why, can make the belonging feel conditional." },
  ];

  const LEVELS = [
    { name: "Warm-up", min: 0 },
    { name: "Noticer", min: 60 },
    { name: "Reader", min: 180 },
    { name: "Connector", min: 360 },
    { name: "Natural", min: 600 },
  ];

  const SOURCES = [
    ["It Doesn't Hurt to Ask (Huang et al., 2017)", "Harvard Business School", "https://www.hbs.edu/faculty/Pages/item.aspx?num=52115"],
    ["Universal dimensions of social cognition: warmth and competence (Fiske, Cuddy & Glick, 2007)", "Trends in Cognitive Sciences", "https://doi.org/10.1016/j.tics.2006.11.005"],
    ["First impressions after a 100-ms exposure (Willis & Todorov, 2006)", "Psychological Science", "https://doi.org/10.1111/j.1467-9280.2006.01750.x"],
    ["Thin slices of expressive behavior (Ambady & Rosenthal, 1992)", "Psychological Bulletin", "https://doi.org/10.1037/0033-2909.111.2.256"],
    ["The liking gap in conversations (Boothby et al., 2018)", "Psychological Science", "https://doi.org/10.1177/0956797618783714"],
    ["Do conversations end when people want them to? (Mastroianni et al., 2021)", "PNAS", "https://doi.org/10.1073/pnas.2011809118"],
    ["Accuracy of deception judgments (Bond & DePaulo, 2006)", "Personality and Social Psychology Review", "https://doi.org/10.1207/s15327957pspr1003_2"],
    ["The chameleon effect (Chartrand & Bargh, 1999)", "Journal of Personality and Social Psychology", "https://doi.org/10.1037/0022-3514.76.6.893"],
    ["Putting feelings into words (Lieberman et al., 2007)", "Psychological Science", "https://doi.org/10.1111/j.1467-9280.2007.01916.x"],
    ["The sound of intellect (Schroeder & Epley, 2015)", "Psychological Science", "https://doi.org/10.1177/0956797615572906"],
    ["Can charisma be taught? (Antonakis, Fenley & Liechti, 2011)", "AMLE", "https://doi.org/10.5465/amle.10.3.zqr374"],
    ["How to Win Friends and Influence People — key principles", "Dale Carnegie", "https://www.dalecarnegie.co.uk/10-ways-to-win-friends-and-influence-people/"],
    ["Never Split the Difference", "Chris Voss, Black Swan Group", "https://www.blackswanltd.com/"],
    ["Captivate and Cues", "Vanessa Van Edwards, Science of People", "https://www.scienceofpeople.com/"],
    ["Vinh Giang — rapport and voice", "vinhgiang.com", "https://vinhgiang.com/blog/how-to-build-rapport-with-absolutely-anyone"],
    ["Chase Hughes on The Diary of a CEO (2024)", "YouTube", "https://www.youtube.com/watch?v=RvjR9GM2kX8"],
  ];

  const PRINCIPLES = [
    { id: "first", title: "The first moments", teaser: "Impressions form faster than a sentence. Warmth, then competence.", html: "<p>Faces can be judged in as little as 100 milliseconds (Willis and Todorov, 2006). Brief slices of behaviour can pick up a few visible traits, such as how outgoing someone is — but not a full profile (Ambady and Rosenthal, 1992). The popular 'first seven seconds' is a coaching shorthand, not a lab number. What to do with that window: open body, visible hands, a real smile, their name, then listen. On a video call, camera on at hello, sit so your upper body and hands show (Van Edwards; Vinh Giang).</p><p>Vanessa Van Edwards frames charisma as high warmth plus high competence. That is a sensible coaching frame, not a research finding. Drop any precise percentage you have heard for it; the two dimensions themselves are well established.</p>" },
    { id: "hooks", title: "Attention hooks", teaser: "Use their name. Be specific. Ask a question with a story in it.", html: "<p>Dale Carnegie: become genuinely interested, smile, remember names, be a good listener, talk in terms of the other person's interests, and make them feel important — sincerely (<em>How to Win Friends and Influence People</em>). A person's name, he wrote, is to that person the sweetest sound in any language.</p><ul class='bullets'><li>Swap 'nice to meet you' plus your pitch for a specific, true observation, or 'Working on anything exciting?' (Van Edwards).</li><li>Ask one or two follow-ups — 'What was that like?' 'How did that happen?' — before you change the subject (Huang et al., 2017; West et al., 2025).</li><li>Variety holds attention: melody, pace, volume and a pause on the line that matters (Vinh Giang). End a key sentence on a slightly lower note.</li><li>Put the phone away. Full attention cannot be faked for long.</li></ul>" },
    { id: "cues", title: "Warmth and competence cues", teaser: "Look open. Sound calm. Make one clear point.", html: "<ul class='bullets'><li>Warmth: their name, a real smile, interest in them, a slightly open posture, palms visible when you invite them in.</li><li>Competence: a short, clear point, a composed pace, a calm finish. Chase Hughes's coaching aim: be the most comfortable person in the room.</li><li>Hands help you find words and help them understand (Hostetter, 2011). Keep them visible, mostly between navel and eyes (Vinh, via Mark Bowden's 'power sphere' — coach's view).</li><li>Move a little slower than the room if you are rushing (Chase, coach's view). Fear speeds the body up.</li></ul>" },
    { id: "body", title: "Body language", teaser: "A shift means something changed. It does not mean they are lying.", html: "<p>Across many studies, people spotted lies only about 54% of the time, barely better than a coin toss (Bond and DePaulo, 2006). Vanessa's line is the right one: there is no Pinocchio's nose. A cue is a sign to dig deeper, not a verdict.</p><p>Chase's five Cs before you read anything into behaviour: Change from their normal, Context, Clusters (one gesture means little), Culture, and treat Checklists as least important. If you sense discomfort, ask — 'Is this a comfortable area to talk about?' — rather than diagnosing.</p>" },
    { id: "voice", title: "Voice", teaser: "Your voice turns a first look into a first belief.", html: "<p>People who heard a job candidate's pitch rated them as more competent than people who only read the same words (Schroeder and Epley, 2015). Vinh's toolkit: melody, rate, volume, tonality and pause. Slow down on the one sentence that matters. Let your face colour your voice. A new vocal habit will feel fake only because it is unfamiliar — say 'unfamiliar' and keep going. Charisma can be trained (Antonakis, Fenley and Liechti, 2011).</p>" },
    { id: "mirror", title: "Mirroring", teaser: "Subtle and natural helps. Obvious copying backfires.", html: "<p>People unconsciously mimic each other, and being subtly mimicked can increase liking (Chartrand and Bargh, the chameleon effect). Deliberate, obvious copying can look odd and may backfire. Vinh's version: match their energy, pace and volume first, then gently lead. Start near them, not at full stage energy.</p><p>Chris Voss uses a verbal mirror: repeat the last one to three words, then stop. It is a prompt to say more, not a trick to catch them out (<em>Never Split the Difference</em>, Voss and Raz, 2016).</p>" },
    { id: "label", title: "Labelling", teaser: "Name the feeling. Let them correct you.", html: "<p>Voss's label is a calm guess at the emotion: 'It seems like…' or 'It sounds like…'. Then be quiet. Putting feelings into words can itself reduce their intensity (Lieberman et al., 2007). Vanessa's cousin of this: name a feeling ('Are you upset?') and let them correct you. You want 'that's right', not a debate.</p><p>Use this to help them feel understood, not to steer them into a yes. Chase's statement-style elicitation is built for intelligence work and can feel manipulative in ordinary life. For everyday connection, follow the research: ask genuine questions.</p>" },
    { id: "ask", title: "Questions and listening", teaser: "Be interested rather than interesting.", html: "<p>Follow-up questions are the strongest habit here (Huang et al., 2017). A 2025 study found follow-ups and validation predicted connection between strangers (West et al., 2025). After a chat, people usually liked you more than you think — the liking gap (Boothby et al., 2018). So say it, if it is true: 'I really enjoyed that.'</p><ul class='bullets'><li>Listen to understand, not to reload. Paraphrase: 'So the deadline moved and you are juggling two projects.'</li><li>Hear the feeling under the words. 'You never call' is often about feeling unappreciated, not about the phone log (Chase, coach's view).</li><li>Keep your turn short, then hand it back. Vanessa's 15–45 second rule is a rule of thumb, not a lab result.</li><li>End on purpose. Conversations rarely stop when both people want them to (Mastroianni et al., 2021). A warm close: something in the future, a specific kindness, then you go.</li></ul>" },
    { id: "follow", title: "Follow-up", teaser: "Proof you listened is the whole game.", html: "<ul class='bullets'><li>Message the same day if you can, and mention the specific thing they said: 'I kept thinking about what you said about the Thursday meetup.'</li><li>Do the thing you promised. Consistency is how rapport becomes trust.</li><li>Online, warmth has to be written. Tone is easy to misread, so be a little clearer and a little kinder than you would in person. If it gets tense, switch to a call.</li><li>Disagreements go better spoken than written (Bevis et al., 2026, as cited in the source notes). Start with 'I think we both want…' and use 'yes, and' rather than 'yes, but'.</li></ul>" },
  ];

  function londonDay() {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  }
  function yesterday(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
  }
  function emptySave() { return { xp: 0, streak: 0, lastActive: "", lastDaily: "", plays: 0, correct: 0, favs: [] }; }
  function loadSave() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return emptySave();
      const s = Object.assign(emptySave(), JSON.parse(raw));
      if (!Array.isArray(s.favs)) s.favs = [];
      return s;
    } catch (e) { return emptySave(); }
  }
  function writeSave(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } }
  function needOf(id) { return NEEDS.find(function (n) { return n.id === id; }); }
  function styleOf(pace, focus) {
    if (pace === "fast" && focus === "task") return STYLES[0];
    if (pace === "fast" && focus === "people") return STYLES[1];
    if (pace === "slow" && focus === "task") return STYLES[2];
    return STYLES[3];
  }
  function todayNeed(day) { return NEEDS[Number(day.replace(/-/g, "")) % NEEDS.length]; }
  function levelOf(xp) {
    let cur = LEVELS[0], next = LEVELS[1];
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].min) { cur = LEVELS[i]; next = LEVELS[i + 1] || LEVELS[i]; }
    }
    const span = Math.max(1, next.min - cur.min);
    const into = Math.min(span, Math.max(0, xp - cur.min));
    return { name: cur.name, next: next.name, nextMin: next.min, prog: cur.name === "Natural" && xp >= 600 ? 1 : into / span };
  }
  function shuffle(arr, seed) {
    const a = arr.slice();
    let s = seed || 1;
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = s % (i + 1);
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function q(s) { return "“" + esc(s) + "”"; }

  function deckFor(day, filter) {
    const seed = Number(day.replace(/-/g, "")) + 17;
    const base = filter ? SCENARIOS.filter(function (s) { return s.need === filter; }) : SCENARIOS;
    const pool = base.length >= 6 ? base : SCENARIOS;
    return shuffle(pool, seed).slice(0, 8);
  }

  const state = {
    tab: "identify",
    save: emptySave(),
    ready: false,
    id: { step: 0, pace: null, focus: null, need: null },
    pr: { i: 0, picked: null, combo: 0, score: 0, done: false, deck: [], filter: null },
    td: { i: 0, picked: null, hits: 0, finished: false, justDone: false },
    playOpen: "first",
    say: { need: null, feeling: null, sit: "all", moreFeel: false, showAll: false, showFavs: false, copied: null, copyTimer: 0, seed: 1, phrases: [], loaded: false, error: false },
  };

  function persist(next) { state.save = next; writeSave(next); }
  function award(xp, opts) {
    opts = opts || {};
    const d = londonDay();
    const save = state.save;
    let streak = save.streak;
    if (save.lastActive !== d) streak = save.lastActive === yesterday(d) ? save.streak + 1 : 1;
    persist({
      xp: save.xp + xp,
      streak: streak,
      lastActive: d,
      lastDaily: opts.daily ? d : save.lastDaily,
      plays: save.plays + 1,
      correct: save.correct + (opts.correct ? 1 : 0),
      favs: Array.isArray(save.favs) ? save.favs : [],
    });
  }

  function resetIdentify() { state.id = { step: 0, pace: null, focus: null, need: null }; }
  function resetPractice(filter) {
    const day = londonDay();
    state.pr = { i: 0, picked: null, combo: 0, score: 0, done: false, deck: deckFor(day, filter || null), filter: filter || null };
  }
  function resetToday(already) {
    state.td = { i: 0, picked: null, hits: 0, finished: !!already, justDone: false };
  }

  function on(root) {
    root.addEventListener("click", function (e) {
      const t = e.target.closest("[data-act]");
      if (!t) return;
      const act = t.getAttribute("data-act");
      const val = t.getAttribute("data-val");
      handle(act, val);
    });
  }

  function handle(act, val) {
    if (act === "tab") {
      state.tab = val;
      if (val === "practice" && state.pr.deck.length === 0) resetPractice(state.pr.filter);
      render();
      window.scrollTo(0, 0);
      return;
    }
    if (act === "id-start") { state.id.step = 1; render(); return; }
    if (act === "id-pace") { state.id.pace = val; state.id.step = 2; render(); return; }
    if (act === "id-focus") { state.id.focus = val; state.id.step = 3; render(); return; }
    if (act === "id-need") {
      state.id.need = val;
      state.id.step = 4;
      award(8);
      render();
      return;
    }
    if (act === "id-reset") { resetIdentify(); render(); return; }
    if (act === "id-practice") {
      state.tab = "practice";
      resetPractice(state.id.need && state.id.need !== "any" ? state.id.need : null);
      render();
      window.scrollTo(0, 0);
      return;
    }
    if (act === "pr-choose") {
      const card = state.pr.deck[state.pr.i];
      if (!card || state.pr.picked) return;
      state.pr.picked = val;
      const ok = val === card.need;
      const gain = ok ? 12 + Math.min(8, state.pr.combo * 2) : 4;
      state.pr.score += gain;
      state.pr.combo = ok ? state.pr.combo + 1 : 0;
      award(gain, { correct: ok });
      render();
      return;
    }
    if (act === "pr-next") {
      if (state.pr.i + 1 >= state.pr.deck.length) state.pr.done = true;
      else { state.pr.i += 1; state.pr.picked = null; }
      render();
      return;
    }
    if (act === "pr-restart") { resetPractice(state.pr.filter); render(); return; }
    if (act === "td-choose") {
      const daily = todayNeed(londonDay());
      const cards = SCENARIOS.filter(function (s) { return s.need === daily.id; }).slice(0, 3);
      const card = cards[state.td.i];
      if (!card || state.td.picked) return;
      state.td.picked = val;
      if (val === card.need) state.td.hits += 1;
      render();
      return;
    }
    if (act === "td-next") {
      const daily = todayNeed(londonDay());
      const cards = SCENARIOS.filter(function (s) { return s.need === daily.id; }).slice(0, 3);
      if (state.td.i + 1 >= cards.length) {
        state.td.finished = true;
        state.td.justDone = true;
        if (state.save.lastDaily !== londonDay()) award(20 + state.td.hits * 6, { daily: true, correct: state.td.hits > 0 });
      } else { state.td.i += 1; state.td.picked = null; }
      render();
      return;
    }
    if (act === "play-toggle") {
      state.playOpen = state.playOpen === val ? null : val;
      render();
      return;
    }
    if (act === "id-sayit") {
      state.tab = "sayit";
      state.say.need = val || state.id.need || "any";
      state.say.showFavs = false;
      state.say.showAll = false;
      render();
      window.scrollTo(0, 0);
      return;
    }
    if (act === "say-need") {
      state.say.need = val;
      state.say.showAll = false;
      state.say.showFavs = false;
      render();
      return;
    }
    if (act === "say-feeling") {
      state.say.feeling = val;
      state.say.showAll = false;
      state.say.showFavs = false;
      render();
      return;
    }
    if (act === "say-sit") {
      state.say.sit = val;
      state.say.showAll = false;
      render();
      return;
    }
    if (act === "say-morefeel") {
      state.say.moreFeel = !state.say.moreFeel;
      render();
      return;
    }
    if (act === "say-more") {
      state.say.showAll = true;
      render();
      return;
    }
    if (act === "say-shuffle") {
      state.say.seed += 1;
      state.say.showAll = false;
      render();
      return;
    }
    if (act === "say-reset") {
      state.say.need = null;
      state.say.feeling = null;
      state.say.sit = "all";
      state.say.showAll = false;
      state.say.showFavs = false;
      render();
      return;
    }
    if (act === "say-favs") {
      state.say.showFavs = !state.say.showFavs;
      render();
      return;
    }
    if (act === "say-fav") {
      const favs = (state.save.favs || []).slice();
      const i = favs.indexOf(val);
      if (i >= 0) favs.splice(i, 1);
      else favs.unshift(val);
      persist(Object.assign({}, state.save, { favs: favs }));
      render();
      return;
    }
    if (act === "say-copy") {
      const phrase = (state.say.phrases || []).find(function (p) { return p.id === val; });
      const text = phrase ? phrase.text : "";
      function copied() {
        if (state.say.copyTimer) clearTimeout(state.say.copyTimer);
        state.say.copied = val;
        state.say.copyTimer = setTimeout(function () {
          state.say.copied = null;
          render();
        }, 1600);
        render();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(copied).catch(function () { fallbackCopy(text); copied(); });
      } else {
        fallbackCopy(text);
        copied();
      }
      return;
    }
    if (act === "say-retry") {
      state.say.loaded = false;
      state.say.error = false;
      render();
      loadPhrases();
      return;
    }
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (e) { /* copy optional */ }
  }

  function hashStr(s) {
    let h = 0;
    const str = String(s);
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  function tipFor(p) {
    const ids = FEELING_TIPS[p.feeling] || ["pause"];
    return TIPS[ids[hashStr(p.id) % ids.length]] || TIPS.pause;
  }

  function sourceLabels(keys) {
    return (keys || []).map(function (k) {
      const s = SRC[k];
      if (!s) return esc(k);
      if (s.url) return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + "</a>";
      return esc(s.label);
    }).join(" · ");
  }

  function matchPhrases(need, feeling, sit) {
    const pool = state.say.phrases || [];
    if (!feeling) return [];
    const needId = need && need !== "any" ? need : null;
    const sitId = sit && sit !== "all" ? sit : null;
    const seen = {};
    const out = [];
    function add(filter, loose, tag) {
      pool.forEach(function (p) {
        if (seen[p.id] || !filter(p)) return;
        seen[p.id] = true;
        out.push({ p: p, loose: loose, tag: tag });
      });
    }
    if (needId) {
      add(function (p) { return p.feeling === feeling && p.need === needId && (!sitId || p.situation === sitId); }, false, "");
      if (out.length < 3 && sitId) {
        add(function (p) { return p.feeling === feeling && p.need === needId; }, true, "sit relaxed");
      }
      if (out.length < 3) {
        add(function (p) { return p.feeling === feeling && p.need === "any" && (!sitId || p.situation === sitId); }, true, "more general");
      }
      if (out.length < 3) {
        add(function (p) { return p.feeling === feeling && p.need === "any"; }, true, "more general");
      }
      if (out.length < 3) {
        add(function (p) { return p.need === needId; }, true, "nearby feeling");
      }
    } else {
      add(function (p) { return p.feeling === feeling && p.need === "any" && (!sitId || p.situation === sitId); }, false, "");
      if (out.length < 3 && sitId) {
        add(function (p) { return p.feeling === feeling && p.need === "any"; }, true, "sit relaxed");
      }
      if (out.length < 3) {
        add(function (p) { return p.feeling === feeling; }, true, "more general");
      }
    }
    return out;
  }

  function chip(text, color) {
    return '<span class="chip"' + (color ? ' style="border-color:' + color + ';color:' + color + '"' : "") + ">" + esc(text) + "</span>";
  }
  function btn(label, act, val, primary) {
    return '<button type="button" class="btn' + (primary ? " primary" : "") + '" data-act="' + act + '"' + (val ? ' data-val="' + esc(val) + '"' : "") + ">" + esc(label) + "</button>";
  }
  function choice(label, hint, act, val, cls) {
    return '<button type="button" class="choice' + (cls ? " " + cls : "") + '" data-act="' + act + '" data-val="' + esc(val) + '"><b>' + esc(label) + "</b>" + (hint ? "<small>" + esc(hint) + "</small>" : "") + "</button>";
  }
  function badge(n, sm) {
    return '<div class="badge' + (sm ? " sm" : "") + '" style="color:' + n.color + ";background:" + n.glow + '">' + esc(n.icon) + "</div>";
  }
  function bar(v) { return '<div class="bar"><i style="width:' + Math.round(Math.min(1, Math.max(0, v)) * 100) + '%"></i></div>'; }
  function stat(k, v) { return '<div class="stat"><b>' + esc(v) + "</b><span>" + esc(k) + "</span></div>"; }

  function hero() {
    const save = state.save;
    const lvl = levelOf(save.xp);
    const tabs = TABS.map(function (t) {
      return '<button type="button" class="tab' + (state.tab === t.id ? " is-on" : "") + '" data-act="tab" data-val="' + t.id + '">' + esc(t.label) + "</button>";
    }).join("");
    const stats = state.ready ? (
      '<div class="stats">' +
        stat("Level", lvl.name) +
        stat("XP", String(save.xp)) +
        stat("Streak", save.streak ? save.streak + "d" : "—") +
        stat("Reads", String(save.plays)) +
        '<div class="level-wrap"><div class="level-meta"><span>' + esc(lvl.name) + "</span><span>" +
          (lvl.name === "Natural" ? "Max" : "Next: " + esc(lvl.next) + " at " + lvl.nextMin) +
        "</span></div>" + bar(lvl.prog) + "</div></div>"
    ) : "";
    return (
      '<header class="hero">' +
        '<div class="kicker">A listening habit, not a party trick</div>' +
        "<h1>Read anyone in 30 seconds</h1>" +
        '<p class="lede">Spot what they are leaning towards right now. Speak so the conversation feels easy for them. You are not typing a person. You are listening harder.</p>' +
        stats +
        '<nav class="tabs" aria-label="Sections">' + tabs + "</nav>" +
      "</header>"
    );
  }

  function identify() {
    const id = state.id;
    let body = "";
    if (id.step === 0) {
      body =
        chip("The 30-second read") +
        "<h2>Three quick looks. Then a reveal.</h2>" +
        '<p class="muted">Watch how they talk, then what their words keep coming back to. Most people show a mix. This is a prompt for this moment, not a stamp they have to wear.</p>' +
        '<div class="actions">' + btn("Start a read", "id-start", "", true) + "</div>" +
        '<p class="note">Coach\'s view on the six needs. If you are not sure, you will be able to say so.</p>';
    } else if (id.step === 1) {
      body =
        '<div class="anim">' + chip("1 of 3 · Pace") +
        "<h2>How are they talking right now?</h2>" +
        '<div class="row-gap">' +
          choice("Fast and punchy", "They get to the point, jump in, do not linger.", "id-pace", "fast") +
          choice("Slower and careful", "They take their time, think it through, leave space.", "id-pace", "slow") +
        "</div></div>";
    } else if (id.step === 2) {
      body =
        '<div class="anim">' + chip("2 of 3 · Focus") +
        "<h2>What do they keep coming back to?</h2>" +
        '<div class="row-gap">' +
          choice("The task, the result, the decision", "They want the thing done, or the facts.", "id-focus", "task") +
          choice("The people, the feeling, the room", "They notice who is included and how it feels.", "id-focus", "people") +
        "</div></div>";
    } else if (id.step === 3) {
      body =
        '<div class="anim">' + chip("3 of 3 · The lean") +
        "<h2>What is coming through in their words?</h2>" +
        '<p class="muted">Pick the strongest lean. If nothing is clear, say so.</p>' +
        '<div class="row-gap two">' +
          NEEDS.map(function (n) { return choice(n.icon + "  " + n.name, n.lean, "id-need", n.id); }).join("") +
        "</div>" +
        '<div style="margin-top:10px">' + choice("Not sure yet", "Stay curious. Ask one more follow-up.", "id-need", "any") + "</div></div>";
    } else if (id.step === 4 && id.pace && id.focus) {
      const style = styleOf(id.pace, id.focus);
      const picked = id.need && id.need !== "any" ? needOf(id.need) : null;
      body =
        '<div class="anim-slow center">' + chip("The reveal") +
        '<div style="margin:18px 0 10px">' + (picked ? badge(picked) : '<div style="font-size:42px;margin:8px 0">…</div>') +
        "<h2>" + (picked ? esc(picked.name) + " · " + esc(picked.lean) : "Stay curious") + "</h2>" +
        '<div style="color:' + style.color + ';font-weight:650">' + esc(style.name) + " style · " + esc(style.how) + "</div></div>" +
        '<div class="card" style="text-align:left">' +
          '<div class="kicker" style="margin-bottom:8px">How to make it easy for them</div>' +
          "<p>" + esc(style.adapt) + "</p>" +
          (picked
            ? "<p><b style='color:" + picked.color + "'>Speak to the lean:</b> " + esc(picked.do) + "</p>" +
              "<p><b>Try:</b> " + q(picked.line) + "</p>" +
              '<p class="muted"><b>Avoid:</b> ' + esc(picked.avoid) + "</p>"
            : "<p>Do not force a type. Ask one follow-up — “What was that like?” — and listen for the next sentence. People who ask follow-up questions are liked more (Huang et al., 2017).</p>") +
        "</div>" +
        '<div class="actions" style="justify-content:center">' +
          btn("Get a line", "id-sayit", id.need || "any", true) +
          btn("Practise this", "id-practice") +
          btn("Read someone else", "id-reset") +
        "</div>" +
        '<p class="note">Most people show a mix. If you find yourself announcing a type out loud, you have gone too far. Ask, do not diagnose.</p></div>';
    }
    return '<section class="panel">' + body + "</section>";
  }

  function practice() {
    if (!state.pr.deck.length) resetPractice(state.pr.filter);
    const pr = state.pr;
    if (pr.done) {
      return '<section class="panel center anim">' + chip("Round complete") +
        "<h2>Nice work.</h2>" +
        '<p class="muted">You banked ' + pr.score + " XP this round. The real test is one conversation today.</p>" +
        '<div class="stats" style="justify-content:center">' + stat("XP this round", String(pr.score)) + "</div>" +
        '<div class="actions" style="justify-content:center">' + btn("Play another round", "pr-restart", "", true) + "</div></section>";
    }
    const card = pr.deck[pr.i];
    if (!card) return '<section class="panel"><p>No cards in this set.</p></section>';
    const locked = !!pr.picked;
    const correct = pr.picked === card.need;
    const opts = card.options.map(function (o) {
      let cls = "";
      if (locked && o.id === card.need) cls = "is-right";
      else if (locked && pr.picked === o.id && o.id !== card.need) cls = "is-wrong";
      return '<button type="button" class="choice ' + cls + '" data-act="pr-choose" data-val="' + esc(o.id) + '"' + (locked ? " disabled" : "") + ">" + esc(o.line) + "</button>";
    }).join("");
    const fb = locked
      ? '<div class="feedback ' + (correct ? "ok" : "no") + '"><div class="lead">' + (correct ? "Yes. That is the lean." : "Close — here is the lean.") + "</div><p>" + esc(card.why) + "</p><p class='muted'>" + esc(correct ? card.good : card.bad) + "</p><div class='actions'>" + btn(pr.i + 1 >= pr.deck.length ? "See your score" : "Next card", "pr-next", "", true) + "</div></div>"
      : "";
    return '<section class="panel">' +
      '<div class="between">' + chip("Practice · " + (pr.i + 1) + " of " + pr.deck.length) +
      '<div class="muted" style="font-size:13px">Score ' + pr.score + (pr.combo > 1 ? "  ·  combo ×" + pr.combo : "") + "</div></div>" +
      bar((pr.i + (locked ? 1 : 0)) / pr.deck.length) +
      '<div class="card" style="margin-top:18px"><div class="kicker">' + esc(card.sitLabel) + "</div>" +
      '<p class="muted">' + esc(card.setup) + "</p>" +
      "<blockquote class='quote'>" + q(card.quote) + "</blockquote></div>" +
      '<p style="margin:16px 0 8px;font-weight:650">Which line makes this easier for them?</p>' +
      '<div class="row-gap">' + opts + "</div>" + fb +
    "</section>";
  }

  function today() {
    const day = londonDay();
    const daily = todayNeed(day);
    const already = state.save.lastDaily === day;
    const cards = SCENARIOS.filter(function (s) { return s.need === daily.id; }).slice(0, 3);
    const td = state.td;
    let drill = "";
    if (td.finished) {
      drill = '<div class="anim" style="margin-top:16px"><div class="callout"><strong>' + (td.justDone ? "Daily complete." : "Today is already banked.") + "</strong>" +
        (td.justDone ? ("You earned today's XP. Now go use " + esc(daily.name) + " once in the real world.") : "Come back tomorrow for a new type. Your streak is safe.") +
        "</div><div class='actions'>" + btn("More practice", "tab", "practice") + "</div></div>";
    } else if (cards[td.i]) {
      const card = cards[td.i];
      const locked = !!td.picked;
      const opts = card.options.map(function (o) {
        let cls = "";
        if (locked && o.id === card.need) cls = "is-right";
        else if (locked && td.picked === o.id && o.id !== card.need) cls = "is-wrong";
        return '<button type="button" class="choice ' + cls + '" data-act="td-choose" data-val="' + esc(o.id) + '"' + (locked ? " disabled" : "") + ">" + esc(o.line) + "</button>";
      }).join("");
      drill = "<h3>Daily drill · " + (td.i + 1) + " of " + cards.length + "</h3>" +
        '<p class="muted">' + esc(card.setup) + "</p>" +
        "<blockquote class='quote' style='border-left-color:" + daily.color + ";background:" + daily.glow + "'>" + q(card.quote) + "</blockquote>" +
        '<div class="row-gap" style="margin-top:12px">' + opts + "</div>" +
        (locked ? "<div style='margin-top:12px'><p class='muted'>" + esc(card.why) + "</p>" + btn(td.i + 1 >= cards.length ? "Collect today's XP" : "Next", "td-next", "", true) + "</div>" : "");
    }
    return '<section class="panel">' +
      chip("Today's type · " + day, daily.color) +
      '<div class="flex-need">' + badge(daily) +
        '<div class="copy"><h2 style="margin:0 0 4px">' + esc(daily.name) + "</h2>" +
        "<div style='color:" + daily.color + ";font-weight:650'>" + esc(daily.lean) + "</div>" +
        '<p class="muted" style="margin:8px 0 0">Listen for this today. Do not name it. Just adapt so the conversation feels easier for them.</p></div></div>' +
      '<div class="card" style="margin-top:18px">' +
        '<div class="kicker" style="margin-bottom:8px">Listen for</div><p>' + esc(daily.listen) + "</p>" +
        '<div class="kicker" style="margin-bottom:8px">They might say</div><p>' + daily.mightSay.map(q).join("  ·  ") + "</p>" +
        '<div class="kicker" style="margin-bottom:8px">Your move</div><p>' + esc(daily.do) + " Try: " + q(daily.line) + "</p>" +
      "</div>" +
      '<div style="margin-top:18px"><h3>Today\'s mission</h3><p class="muted" style="margin-top:0">In one real conversation, listen for ' + esc(daily.name.toLowerCase()) + ". Ask one follow-up, then speak to it. No announcing the type.</p></div>" +
      drill +
    "</section>";
  }

  function playbook() {
    const rows = PRINCIPLES.map(function (p) {
      const on = state.playOpen === p.id;
      return '<div class="playrow"><button type="button" data-act="play-toggle" data-val="' + p.id + '"><span><span class="t">' + esc(p.title) + '</span><span class="s">' + esc(p.teaser) + '</span></span><span class="pm">' + (on ? "−" : "+") + "</span></button>" +
        (on ? '<div class="body">' + p.html + "</div>" : "") + "</div>";
    }).join("");
    const needRows = NEEDS.map(function (n) {
      return "<tr><td>" + esc(n.icon + " " + n.name + " — " + n.lean) + "</td><td>" + esc(n.listen) + "</td><td>" + esc(n.do) + "</td><td>" + esc(n.avoid) + "</td></tr>";
    }).join("");
    const styleRows = STYLES.map(function (s) {
      return "<tr><td>" + esc(s.name) + "</td><td>" + esc(s.how) + "</td><td>" + esc(s.adapt) + "</td></tr>";
    }).join("");
    const sits = [
      ["Stranger", "Open small, then follow up.", "A genuine hello, a specific observation, then 'What brought you here?' Ask two follow-ups before you offer your story. If they are quiet, drop your volume for the first minute."],
      ["Networking", "Be interested, then useful.", "Skip the pitch. 'Working on anything exciting?' Remember the name. Close with a clear exit and, if it was real, a follow-up that mentions what they said."],
      ["Business or sales", "Their pace, their decision.", "Prepare so you do not ask what you should already know. Lead with warmth, then a headline. If they want the point, give options and let them choose. Empathy first, fix second. No pressure close."],
      ["Friends and family", "Hear the feeling under the words.", "Label lightly, then pause. Do not produce the call log when the point is 'I felt forgotten'. Say what you enjoyed. They probably liked the chat more than you think."],
      ["Online messages", "Write the warmth you cannot show.", "Use their name, mention the specific thing, keep it short. Mirrors and labels still work in text: 'It sounds like the week has been heavy.' If it gets tense, pick up the phone."],
    ].map(function (r) {
      return "<article><div class='lead'>" + esc(r[0]) + "</div><h3>" + esc(r[1]) + "</h3><p>" + esc(r[2]) + "</p></article>";
    }).join("");
    const uses = ["Their name, once or twice, naturally", "What was that like? How did that happen? Tell me more.", "It seems like… / It sounds like… then silence", "I really enjoyed that — if true", "Yes, and… / I think we both want…", "A specific thank-you that proves you listened"];
    const avoids = ["You are a [type] person — never say this", "Obvious copying of their gestures or accent", "Fake common ground ('I love fly fishing too' when you do not)", "Yes, but… (it wipes out what came before)", "You are wrong. At least. It is not that bad.", "Talking yourself down after you have made a clear point", "Using any of this to pressure a yes"];
    const flags = [
      "In them: a sudden close-down, shorter answers, eyes on the door. Something shifted. Ask, do not push.",
      "In you: you are waiting to talk, forcing a type, inventing common ground, or steering harder than you are listening.",
      "Cultural differences matter. Directness, eye contact and formality are not universal. If you are unsure, ask respectfully.",
      "Body language is a poor lie detector. Do not play detective.",
      "If you would be uncomfortable with someone using the same move on you, do not use it.",
    ];
    const steps = [
      ["Every day, five minutes", "Open Today. Do the three-card drill. Then use that lean in one real conversation. Evening: one line in a note — what I tried, what happened."],
      ["Week 1 — Follow up twice", "In three conversations, ask two follow-ups before you change the subject or tell your own story. This is the highest-evidence habit."],
      ["Week 2 — Warmth first", "Plan one warm opener and one clear point. Use their name. End one conversation on purpose."],
      ["Week 3 — Match, then lead", "For the first minute, come closer to their pace and volume. Then ask one better question. Try the Identify flow after real chats, not during them."],
      ["Week 4 — Voice and close", "Slow down on the one sentence that matters. Send two 'I enjoyed our chat about…' messages, only if true. Re-run a Practice round and notice what is now automatic."],
    ];
    const myths = [
      "'93% of communication is non-verbal' is a misreading of Mehrabian. He said it does not apply to everyday conversation. Words matter.",
      "You cannot reliably profile someone's needs, fears and decision style in a few minutes. Chase's Six-Minute X-Ray has no published validation. Use the needs as prompts, not stamps.",
      "You cannot spot liars from microexpressions or a single cue (Bond and DePaulo, 2006; Jordan et al., 2019).",
      "Power poses changing your hormones did not replicate. Open posture may help you feel a bit steadier. That is all.",
      "Hold loosely any exact figures — 60–70% eye contact, an 82% warmth number, a precise words-per-minute target. Treat them as illustrations.",
    ];
    const sources = SOURCES.map(function (s) {
      return '<a href="' + esc(s[2]) + '" target="_blank" rel="noopener noreferrer">' + esc(s[0]) + "<small>" + esc(s[1]) + "</small></a>";
    }).join("");
    return '<section class="panel" style="padding-top:8px">' +
      '<div class="section"><h2>The short version</h2>' +
      '<div class="callout"><strong>Warmth first. Then competence. Then listen harder than you talk.</strong>People size you up on two questions: can I trust you, and can I rely on you (Fiske, Cuddy and Glick, 2007). Lead with interest, their name and a real smile, then make one clear point. The best-evidenced habit in this whole guide is simple: ask follow-up questions before you tell your own story (Huang et al., 2017). Need a line for this moment? Open the Say it tab.</div><div class="actions">' + btn("Open Say it", "tab", "sayit", true) + "</div></div>" +
      '<div class="section"><h2>Universal principles</h2><p class="cap">Punchy first. Open a row when you want the why and the source.</p>' + rows + "</div>" +
      '<div class="section"><h2>Cheat sheet</h2><p class="cap">The six needs are listening prompts from Chase Hughes, not a tested model and never a label. Most people show a mix.</p>' +
      '<div class="table-wrap"><table><thead><tr><th>Need</th><th>Listen for</th><th>Do</th><th>Avoid</th></tr></thead><tbody>' + needRows + "</tbody></table></div></div>" +
      '<div class="section"><h2>Match their style</h2><p class="cap">Observable pace and focus. Adapt a little, stay yourself.</p>' +
      '<div class="table-wrap"><table><thead><tr><th>Style</th><th>What you see</th><th>Adapt by</th></tr></thead><tbody>' + styleRows + "</tbody></table></div></div>" +
      '<div class="section"><h2>Everyday situations</h2><div class="sit">' + sits + "</div></div>" +
      '<div class="section"><h2>Words to use, and to leave alone</h2><div class="split">' +
        '<div class="box use"><h3>Use</h3><ul>' + uses.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
        '<div class="box avoid"><h3>Avoid</h3><ul>' + avoids.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
      "</div></div>" +
      '<div class="section"><h2>Red flags — in them, and in you</h2><ul class="bullets">' + flags.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="section"><h2>A short practice plan</h2><p class="cap">One thing at a time, in Vinh\'s \'pick one\' spirit. The daily challenge on this site is the habit loop. If a week does not stick, repeat it.</p>' +
      "<ol class='steps'>" + steps.map(function (s) { return "<li><b>" + esc(s[0]) + "</b>" + esc(s[1]) + "</li>"; }).join("") + "</ol>" +
      "<p>Optional longer path: pool-speed movement, fewer fillers, melody, then 'ask, don\\'t guess'. Charisma is a set of habits, not a new personality.</p></div>" +
      '<div class="section"><h2>Myths to drop</h2><ul class="bullets">' + myths.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="section"><h2>Sources</h2><div class="sources">' + sources + "</div>" +
      '<p class="note">Also drawn from personal notes combining Van Edwards, Vinh Giang and Chase Hughes, including evidence checks that flag coach\'s-view claims and unsupported numbers.</p></div>' +
    "</section>";
  }

  function sayit() {
    const s = state.say;
    const favs = state.save.favs || [];
    if (!s.loaded && !s.error) {
      return '<section class="panel">' + chip("Say it") + "<h2>Lines that fit this moment.</h2>" +
        '<p class="muted">Loading the phrase bank…</p></section>';
    }
    if (s.error) {
      return '<section class="panel">' + chip("Say it") + "<h2>Lines that fit this moment.</h2>" +
        '<p class="muted">The phrase bank did not load. Check your connection and try again.</p>' +
        '<div class="actions">' + btn("Try again", "say-retry", "", true) + "</div></section>";
    }

    const feelingList = s.moreFeel ? SAY_FEELINGS : SAY_FEELINGS.filter(function (f) { return SIMPLE_FEELINGS.indexOf(f.id) >= 0; });
    const needChoices = [{ id: "any", name: "Not sure", lean: "General lines that suit anyone", color: "var(--gold)", icon: "○" }].concat(NEEDS);

    function pickBtn(label, hint, act, val, on, color) {
      return '<button type="button" class="choice' + (on ? " is-on" : "") + '"' +
        (color && on ? ' style="border-color:' + color + '"' : "") +
        ' data-act="' + act + '" data-val="' + esc(val) + '"><b>' + esc(label) + "</b>" +
        (hint ? "<small>" + esc(hint) + "</small>" : "") + "</button>";
    }

    const needRow = '<div class="say-picks">' + needChoices.map(function (n) {
      return pickBtn((n.icon ? n.icon + "  " : "") + n.name, n.lean, "say-need", n.id, s.need === n.id, n.color);
    }).join("") + "</div>";

    const feelRow = '<div class="say-picks">' + feelingList.map(function (f) {
      return pickBtn(f.label, "", "say-feeling", f.id, s.feeling === f.id);
    }).join("") +
      '<button type="button" class="choice' + (s.moreFeel ? " is-on" : "") + '" data-act="say-morefeel"><b>' +
      (s.moreFeel ? "Fewer feelings" : "More feelings") + "</b><small>" +
      (s.moreFeel ? "Hide the extra eight." : "Show eight more, such as included or in control.") +
      "</small></button></div>";

    const sitRow = '<div class="say-sits">' + SAY_SITS.map(function (x) {
      return '<button type="button" class="sit-chip' + (s.sit === x.id ? " is-on" : "") + '" data-act="say-sit" data-val="' + x.id + '">' + esc(x.label) + "</button>";
    }).join("") + "</div>";

    let results = "";
    if (s.showFavs) {
      const favPhrases = favs.map(function (id) {
        return (s.phrases || []).find(function (p) { return p.id === id; });
      }).filter(Boolean);
      if (!favPhrases.length) {
        results = '<p class="muted">No saved lines yet. Tap the star on a card to keep it on this device.</p>';
      } else {
        results = favPhrases.map(function (p) { return phraseCard({ p: p, loose: false, tag: "" }); }).join("");
      }
    } else if (!s.need || !s.feeling) {
      results = '<p class="muted">Pick a lean and a feeling. You will get lines and a delivery tip. Only say what you mean.</p>';
    } else {
      let matched = matchPhrases(s.need, s.feeling, s.sit);
      matched = shuffle(matched, s.seed + hashStr(s.need + "|" + s.feeling + "|" + s.sit));
      const total = matched.length;
      const shown = s.showAll ? matched : matched.slice(0, 3);
      const looseNote = shown.some(function (m) { return m.loose; })
        ? '<p class="note">A few of these are a looser match — labelled on the card. Still only say what you mean.</p>'
        : "";
      if (!shown.length) {
        results = '<p class="muted">Nothing in the bank for this mix yet. Try another feeling, or set the moment to Any.</p>';
      } else {
        results = looseNote + shown.map(phraseCard).join("") +
          '<div class="actions">' +
            btn("Shuffle", "say-shuffle") +
            (total > 3 && !s.showAll ? btn("Show all " + total, "say-more") : "") +
            btn("Start over", "say-reset") +
          "</div>";
      }
    }

    function phraseCard(m) {
      const p = m.p;
      const fav = favs.indexOf(p.id) >= 0;
      const copied = s.copied === p.id;
      const sit = SAY_SITS.find(function (x) { return x.id === p.situation; });
      const needObj = p.need === "any" ? null : needOf(p.need);
      const tags = [];
      if (m.tag) tags.push(m.tag);
      if (sit && s.sit === "all") tags.push(sit.label);
      if (p.need === "any" && s.need && s.need !== "any") tags.push("more general");
      return '<article class="say-card anim">' +
        '<div class="between" style="margin-bottom:8px">' +
          '<div class="say-tags">' + tags.filter(function (t, i, a) { return a.indexOf(t) === i; }).map(function (t) {
            return '<span class="chip">' + esc(t) + "</span>";
          }).join("") + "</div>" +
          '<div class="say-tools">' +
            '<button type="button" class="icon-btn' + (fav ? " is-on" : "") + '" data-act="say-fav" data-val="' + esc(p.id) + '" aria-label="' + (fav ? "Remove from saved lines" : "Save this line") + '" title="' + (fav ? "Saved" : "Save") + '">' + (fav ? "★" : "☆") + "</button>" +
          "</div>" +
        "</div>" +
        '<button type="button" class="say-line" data-act="say-copy" data-val="' + esc(p.id) + '">' +
          "<span>" + esc(p.text) + "</span>" +
          '<small>' + (copied ? "Copied" : "Tap to copy") + "</small>" +
        "</button>" +
        '<div class="say-tip"><b>How to say it.</b> ' + esc(tipFor(p)) + "</div>" +
        '<div class="say-meta">' +
          (needObj ? '<span style="color:' + needObj.color + '">' + esc(needObj.icon + " " + needObj.name) + "</span> · " : "") +
          sourceLabels(p.sources) +
        "</div>" +
      "</article>";
    }

    return '<section class="panel">' +
      '<div class="between">' + chip("Say it") +
        btn((s.showFavs ? "All lines" : "Saved · " + favs.length), "say-favs") +
      "</div>" +
      "<h2>" + (s.showFavs ? "Your saved lines." : "Tap a lean and a feeling. Get a line.") + "</h2>" +
      '<p class="muted">Listening prompts, not a label. Only say what you mean.</p>' +
      (s.showFavs ? "" :
        '<div class="say-step"><div class="kicker">1 · What are they leaning towards?</div>' + needRow + "</div>" +
        '<div class="say-step"><div class="kicker">2 · How should they feel?</div>' + feelRow + "</div>" +
        '<div class="say-step"><div class="kicker">3 · Optional moment</div>' + sitRow + "</div>"
      ) +
      '<div class="say-results">' + results + "</div>" +
    "</section>";
  }

  function render() {
    const root = document.getElementById("app");
    const body =
      state.tab === "identify" ? identify() :
      state.tab === "sayit" ? sayit() :
      state.tab === "practice" ? practice() :
      state.tab === "today" ? today() : playbook();
    root.innerHTML =
      '<div class="app"><div class="shell">' + hero() + body + "</div>" +
      '<p class="footer-note">This is to make conversations easier for them, never to push people. Add it to your home screen from the browser share menu. Progress is saved on this device.</p></div>';
  }

  function loadPhrases() {
    fetch("phrases.json")
      .then(function (r) {
        if (!r.ok) throw new Error("phrases " + r.status);
        return r.json();
      })
      .then(function (data) {
        state.say.phrases = Array.isArray(data) ? data : [];
        state.say.loaded = true;
        state.say.error = false;
        if (state.tab === "sayit") render();
      })
      .catch(function () {
        state.say.loaded = true;
        state.say.error = true;
        if (state.tab === "sayit") render();
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    state.save = loadSave();
    state.ready = true;
    const day = londonDay();
    if (state.save.lastDaily === day) state.td.finished = true;
    resetPractice(null);
    const root = document.getElementById("app");
    on(root);
    render();
    loadPhrases();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline optional */ });
    }
  });
})();
