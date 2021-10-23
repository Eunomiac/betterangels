/* ▌██░░ betterangels v0.0.1-prealpha (2021) ║ MIT License ║ https://github.com/Eunomiac/betterangels ░░██▐ */// ████████ IMPORTS ████████
import gsap from "/scripts/greensock/esm/all.js";
import _ from "underscore";
import {
  hyphenateHTMLSync as hyph
} from "hyphen/en/index.js";

// ▮▮▮▮▮▮▮[DATA] Data & References Used by Utility Functions ▮▮▮▮▮▮▮

const noCapWords = [ // Regexp tests that should not be capitalized when converting to title case.
  "above", "after", "at", "below", "by", "down", "for", "from", "in", "onto", "of", "off", "on", "out",
  "to", "under", "up", "with", "for", "and", "nor", "but", "or", "yet", "so", "the", "an", "a"
].map((word) => new RegExp(`\\b${word}\\b`, "gui"));
const capWords = [ // Words that should always be capitalized when converting to sentence case.
  "I", /[^a-z]{3,}|[\.0-9]/gu
].map((word) => (getType(word) === "regexp" ? word : new RegExp(`\\b${word}\\b`, "gui")));
const loremIpsumText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse ultricies 
nibh sed massa euismod lacinia. Aliquam nec est ac nunc ultricies scelerisque porta vulputate odio. 
Integer gravida mattis odio, semper volutpat tellus. Ut elit leo, auctor eget fermentum hendrerit, 
aliquet ac nunc. Suspendisse porta turpis vitae mi posuere molestie. Cras lectus lacus, vulputate a 
vestibulum in, mattis vel mi. Mauris quis semper mauris. Praesent blandit nec diam eget tincidunt. Nunc 
aliquet consequat massa ac lacinia. Ut posuere velit sagittis, vehicula nisl eget, fringilla nibh. Duis 
volutpat mattis libero, a porttitor sapien viverra ut. Phasellus vulputate imperdiet ligula, eget 
eleifend metus tempor nec. Nam eget sapien risus. Praesent id suscipit elit. Sed pellentesque ligula 
diam, non aliquet magna feugiat vitae. Pellentesque ut tortor id erat placerat dignissim. Pellentesque 
ut dui vel leo laoreet sodales nec ac tellus. In hac habitasse platea dictumst. Proin sed ex sed augue 
sollicitudin interdum. Sed id lacus porttitor nisi vestibulum tincidunt. Nulla facilisi. Vestibulum 
feugiat finibus magna in pretium. Proin consectetur lectus nisi, non commodo lectus tempor et. Cras 
viverra, mi in consequat aliquet, justo mauris fringilla tellus, at accumsan magna metus in eros. Sed 
vehicula, diam ut sagittis semper, purus massa mattis dolor, in posuere.`;
const randomWords = [ // A collection of random words for various debugging purposes.
  "aboveboard", "account", "achiever", "acoustics", "act", "action", "activity", "actor", "addition", "adjustment",
  "advertisement", "advice", "afterglow", "afterimage", "afterlife", "aftermath", "afternoon", "afterthought",
  "agreement", "air", "aircraft", "airfield", "airlift", "airline", "airmen", "airplane", "airport", "airtime", "alarm",
  "allover", "allspice", "alongside", "also", "amount", "amusement", "anger", "angle", "animal", "another", "ants",
  "anyhow", "anymore", "anyone", "anyplace", "anytime", "anywhere", "apparatus", "apparel", "appliance", "approval",
  "arch", "argument", "arithmetic", "arm", "army", "around", "art", "ashtray", "attack", "attraction", "aunt",
  "authority", "babies", "baby", "babysitter", "back", "backache", "backbone", "backbreaker", "backdrop", "backfire",
  "background", "backhand", "backlash", "backlog", "backpack", "backside", "backslap", "backslide", "backspace",
  "backspin", "backstroke", "backtrack", "backward", "badge", "bag", "bait", "balance", "ball", "ballroom", "bankbook",
  "bankroll", "base", "baseball", "basin", "basket", "basketball", "bat", "bath", "battle", "beachcomb", "bead", "bear",
  "because", "become", "bed", "bedrock", "bedroll", "bedroom", "beds", "bee", "beef", "beginner", "behavior", "belief",
  "believe", "bell", "bellboy", "bellhop", "bells", "below", "berry", "bike", "bikes", "bird", "birds", "birth",
  "birthday", "bit", "bite", "blackball", "blackberries", "blackbird", "blackboard", "blackjack", "blacklist",
  "blackmail", "blackout", "blacksmith", "blacktop", "blade", "blood", "blow", "blowgun", "bluebell", "blueberry",
  "bluebird", "bluefish", "bluegrass", "blueprint", "board", "boardwalk", "boat", "bodyguard", "bomb", "bone", "book",
  "bookcase", "bookend", "bookkeeper", "bookmark", "bookmobile", "books", "bookseller", "bookshelf", "bookworm", "boot",
  "border", "bottle", "boundary", "bowlegs", "bowtie", "box", "boy", "brainchild", "brake", "branch", "brass", "breath",
  "brick", "bridge", "brother", "bubble", "bucket", "bugspray", "building", "bulb", "burst", "bushes", "business",
  "butter", "butterball", "buttercup", "butterfingers", "buttermilk", "butternut", "butterscotch", "button", "bypass",
  "cabbage", "cabdriver", "cable", "cactus", "cake", "cakes", "calculator", "calendar", "camera", "camp", "can",
  "cancan", "candlelight", "candlestick", "cannon", "cannot", "canvas", "cap", "caption", "car", "card", "cardsharp",
  "care", "carefree", "careworn", "carfare", "carload", "carpenter", "carpool", "carport", "carriage", "cars",
  "carsick", "cart", "cartwheel", "cast", "cat", "cats", "cattle", "catwalk", "cause", "cave", "caveman", "celery",
  "cellar", "cemetery", "cent", "centercut", "chalk", "chance", "change", "channel", "cheese", "cheeseburger",
  "cherries", "cherry", "chess", "chicken", "chickens", "children", "chin", "church", "circle", "clam", "class",
  "clockwise", "cloth", "clover", "club", "coach", "coal", "coast", "coat", "cobweb", "coffeemaker", "coil", "collar",
  "color", "comeback", "committee", "commonplace", "commonwealth", "company", "comparison", "competition", "condition",
  "connection", "control", "cook", "copper", "corn", "cornmeal", "cough", "country", "courthouse", "cover", "cow",
  "cows", "crack", "cracker", "crate", "crayon", "cream", "creator", "creature", "credit", "crewcut", "crib", "crime",
  "crook", "crossbow", "crossbreed", "crosscut", "crossover", "crosswalk", "crow", "crowd", "crown", "cub", "cup",
  "current", "curtain", "curve", "cushion", "dad", "dairymaid", "daisywheel", "daughter", "day", "daybed", "daybook",
  "daybreak", "daydream", "daylight", "daytime", "deadend", "deadline", "death", "debt", "decision", "deer", "degree",
  "design", "desire", "desk", "destruction", "detail", "development", "digestion", "dime", "dinner", "dinosaurs",
  "direction", "dirt", "discovery", "discussion", "dishcloth", "dishpan", "dishwasher", "dishwater", "diskdrive",
  "distance", "distribution", "division", "dock", "doctor", "dog", "dogs", "doll", "dolls", "donkey", "door",
  "doorstop", "downtown", "downunder", "drain", "drawbridge", "drawer", "dress", "drink", "driveway", "driving", "drop",
  "duck", "duckbill", "duckpin", "ducks", "dust", "ear", "earache", "earring", "earth", "earthquake", "earthward",
  "earthworm", "edge", "education", "effect", "egg", "egghead", "eggnog", "eggs", "eggshell", "elbow", "end", "engine",
  "error", "event", "everything", "example", "exchange", "existence", "expansion", "experience", "expert", "eye",
  "eyeballs", "eyecatching", "eyeglasses", "eyelash", "eyelid", "eyes", "eyesight", "eyewitness", "face", "fact",
  "fairies", "fall", "fang", "farm", "fatherland", "fear", "feeling", "field", "finger", "fire", "fireball", "fireboat",
  "firebomb", "firebreak", "firecracker", "firefighter", "firehouse", "fireman", "fireproof", "fireworks", "fish",
  "fishbowl", "fisherman", "fisheye", "fishhook", "fishmonger", "fishnet", "fishpond", "fishtail", "flag", "flame",
  "flavor", "flesh", "flight", "flock", "floor", "flower", "flowers", "fly", "fog", "fold", "food", "foot", "football",
  "foothill", "footlights", "footlocker", "footprints", "forbearer", "force", "forearm", "forebear", "forebrain",
  "forecast", "foreclose", "foreclosure", "foredoom", "forefather", "forefeet", "forefinger", "forefoot", "forego",
  "foregone", "forehand", "forehead", "foreknowledge", "foreleg", "foreman", "forepaws", "foresee", "foreshadow",
  "forestall", "forethought", "foretold", "forever", "forewarn", "foreword", "forget", "fork", "forklift", "form",
  "fowl", "frame", "friction", "friend", "friends", "frog", "frogs", "front", "fruit", "fruitcup", "fuel", "furniture",
  "gate", "gearshift", "geese", "ghost", "giants", "giraffe", "girl", "girls", "glass", "glassmaking", "glove", "gold",
  "goodbye", "goodnight", "government", "governor", "grade", "grain", "grandaunt", "granddaughter", "grandfather",
  "grandmaster", "grandmother", "grandnephew", "grandparent", "grandson", "grandstand", "granduncle", "grape", "grass",
  "grassland", "graveyard", "grip", "ground", "group", "growth", "guide", "guitar", "gumball", "gun", "hair", "haircut",
  "hall", "hamburger", "hammer", "hand", "handbook", "handgun", "handmade", "handout", "hands", "harbor", "harmony",
  "hat", "hate", "head", "headache", "headlight", "headline", "headquarters", "health", "heat", "hereafter", "hereby",
  "herein", "hereupon", "highchair", "highland", "highway", "hill", "himself", "history", "hobbies", "hole", "holiday",
  "home", "homemade", "hometown", "honey", "honeybee", "honeydew", "honeysuckle", "hook", "hookup", "hope", "horn",
  "horse", "horseback", "horsefly", "horsehair", "horseman", "horseplay", "horsepower", "horseradish", "horses", "hose",
  "hospital", "hot", "hour", "house", "houseboat", "household", "housekeeper", "houses", "housetop", "however", "humor",
  "hydrant", "ice", "icicle", "idea", "impulse", "income", "increase", "industry", "ink", "insect", "inside",
  "instrument", "insurance", "intake", "interest", "invention", "iron", "island", "itself", "jail", "jailbait", "jam",
  "jar", "jeans", "jelly", "jellybean", "jellyfish", "jetliner", "jetport", "jewel", "join", "judge", "juice", "jump",
  "jumpshot", "kettle", "key", "keyboard", "keyhole", "keynote", "keypad", "keypunch", "keystone", "keystroke",
  "keyword", "kick", "kiss", "kittens", "kitty", "knee", "knife", "knot", "knowledge", "laborer", "lace", "ladybug",
  "lake", "lamp", "land", "language", "laugh", "leather", "leg", "legs", "letter", "letters", "lettuce", "level",
  "library", "lifeblood", "lifeguard", "lifelike", "lifeline", "lifelong", "lifetime", "lifework", "limelight",
  "limestone", "limit", "line", "linen", "lip", "liquid", "loaf", "lock", "locket", "longhand", "look", "loss", "love",
  "low", "lukewarm", "lumber", "lunch", "lunchroom", "machine", "magic", "maid", "mailbox", "mainline", "man", "marble",
  "mark", "market", "mask", "mass", "match", "matchbox", "meal", "meantime", "meanwhile", "measure", "meat", "meeting",
  "memory", "men", "metal", "mice", "middle", "milk", "mind", "mine", "minister", "mint", "minute", "mist", "mitten",
  "mom", "money", "monkey", "month", "moon", "moonbeam", "moonlight", "moonlit", "moonscape", "moonshine", "moonstruck",
  "moonwalk", "moreover", "morning", "mother", "motion", "motorcycle", "mountain", "mouth", "move", "muscle", "name",
  "nation", "nearby", "neck", "need", "needle", "nerve", "nest", "nevermore", "newsboy", "newsbreak", "newscaster",
  "newsdealer", "newsletter", "newsman", "newspaper", "newsprint", "newsreel", "newsroom", "night", "nightfall",
  "nobody", "noise", "noisemaker", "north", "northeast", "nose", "note", "notebook", "nowhere", "number", "nursemaid",
  "nut", "nutcracker", "oatmeal", "observation", "ocean", "offer", "office", "oil", "oneself", "onetime", "orange",
  "oranges", "order", "oven", "overboard", "overcoat", "overflow", "overland", "pacemaker", "page", "pail", "pan",
  "pancake", "paper", "parcel", "part", "partner", "party", "passbook", "passenger", "passkey", "Passover", "passport",
  "payment", "peace", "pear", "pen", "pencil", "peppermint", "person", "pest", "pet", "pets", "pickle", "pickup",
  "picture", "pie", "pies", "pig", "pigs", "pin", "pinhole", "pinstripe", "pinup", "pinwheel", "pipe", "pizzas",
  "place", "plane", "planes", "plant", "plantation", "plants", "plastic", "plate", "play", "playback", "playground",
  "playhouse", "playthings", "pleasure", "plot", "plough", "pocket", "point", "poison", "pollution", "ponytail",
  "popcorn", "porter", "position", "postcard", "pot", "potato", "powder", "power", "price", "produce", "profit",
  "property", "prose", "protest", "pull", "pump", "punishment", "purpose", "push", "quarter", "quartz", "queen",
  "question", "quicksand", "quiet", "quill", "quilt", "quince", "quiver", "rabbit", "rabbits", "racquetball", "rail",
  "railroad", "railway", "rain", "raincheck", "raincoat", "rainstorm", "rainwater", "rake", "range", "rat", "rate",
  "rattlesnake", "rattletrap", "ray", "reaction", "reading", "reason", "receipt", "recess", "record", "regret",
  "relation", "religion", "repairman", "representative", "request", "respect", "rest", "reward", "rhythm", "rice",
  "riddle", "rifle", "ring", "rings", "river", "riverbanks", "road", "robin", "rock", "rod", "roll", "roof", "room",
  "root", "rose", "route", "rub", "rubberband", "rule", "run", "sack", "sail", "sailboat", "salesclerk", "salt", "sand",
  "sandlot", "sandstone", "saucepan", "scale", "scapegoat", "scarecrow", "scarf", "scene", "scent", "school",
  "schoolbook", "schoolboy", "schoolbus", "schoolhouse", "science", "scissors", "screw", "sea", "seashore", "seat",
  "secretary", "seed", "selection", "self", "sense", "servant", "shade", "shadyside", "shake", "shame", "shape",
  "sharecropper", "sharpshooter", "sheep", "sheepskin", "sheet", "shelf", "ship", "shirt", "shock", "shoe", "shoelace",
  "shoemaker", "shoes", "shop", "shortbread", "show", "showoff", "showplace", "side", "sidekick", "sidewalk", "sign",
  "silk", "silver", "silversmith", "sink", "sister", "sisterhood", "sisters", "sixfold", "size", "skate", "skateboard",
  "skin", "skintight", "skirt", "sky", "skylark", "skylight", "slave", "sleep", "sleet", "slip", "slope", "slowdown",
  "slumlord", "smash", "smell", "smile", "smoke", "snail", "snails", "snake", "snakes", "snakeskin", "sneeze", "snow",
  "snowball", "snowbank", "snowbird", "snowdrift", "snowshovel", "soap", "society", "sock", "soda", "sofa", "softball",
  "somebody", "someday", "somehow", "someone", "someplace", "something", "sometimes", "somewhat", "somewhere", "son",
  "song", "songs", "sort", "sound", "soundproof", "soup", "southeast", "southwest", "soybean", "space", "spacewalk",
  "spade", "spark", "spearmint", "spiders", "spillway", "spokesperson", "sponge", "spoon", "spot", "spring", "spy",
  "square", "squirrel", "stage", "stagehand", "stamp", "standby", "standoff", "standout", "standpoint", "star",
  "starfish", "start", "statement", "station", "steam", "steamship", "steel", "stem", "step", "stepson", "stew",
  "stick", "sticks", "stitch", "stocking", "stockroom", "stomach", "stone", "stop", "stoplight", "stopwatch", "store",
  "story", "stove", "stranger", "straw", "stream", "street", "stretch", "string", "stronghold", "structure",
  "substance", "subway", "sugar", "suggestion", "suit", "summer", "sun", "sunbaked", "sunbathe", "sundial", "sundown",
  "sunfish", "sunflower", "sunglasses", "sunlit", "sunray", "sunroof", "sunup", "supercargo", "supercharge",
  "supercool", "superego", "superfine", "supergiant", "superhero", "superhighways", "superhuman", "superimpose",
  "supermarket", "supermen", "supernatural", "superpower", "superscript", "supersensitive", "supersonic", "superstar",
  "superstrong", "superstructure", "supertanker", "superweapon", "superwoman", "support", "surprise", "sweater",
  "sweetheart", "sweetmeat", "swim", "swing", "system", "table", "tablecloth", "tablespoon", "tabletop", "tableware",
  "tail", "tailcoat", "tailgate", "taillight", "taillike", "tailpiece", "tailspin", "takeoff", "takeout", "takeover",
  "talebearer", "taleteller", "talk", "tank", "tapeworm", "taproom", "taproot", "target", "taskmaster", "taste", "tax",
  "taxicab", "taxpayer", "teaching", "teacup", "team", "teammate", "teamwork", "teapot", "teaspoon", "teenager",
  "teeth", "telltale", "temper", "tendency", "tenderfoot", "tenfold", "tent", "territory", "test", "textbook",
  "texture", "theory", "therefore", "thing", "things", "thought", "thread", "thrill", "throat", "throne", "throwaway",
  "throwback", "thumb", "thunder", "thunderbird", "thunderstorm", "ticket", "tiger", "time", "timekeeper", "timesaving",
  "timeshare", "timetable", "tin", "title", "toad", "toe", "toes", "together", "tomatoes", "tongue", "toolbox", "tooth",
  "toothbrush", "toothpaste", "toothpick", "top", "touch", "touchdown", "town", "township", "toy", "toys", "trade",
  "trail", "train", "trains", "tramp", "transport", "tray", "treatment", "tree", "trees", "trick", "trip", "trouble",
  "trousers", "truck", "trucks", "tub", "turkey", "turn", "turnabout", "turnaround", "turnbuckle", "turndown",
  "turnkey", "turnoff", "turntable", "twig", "twist", "typewriter", "umbrella", "uncle", "underachieve", "underage",
  "underarm", "underbelly", "underbid", "undercharge", "underclothes", "undercover", "undercut", "underdevelop",
  "underestimate", "underexpose", "underfoot", "underground", "underwear", "unit", "upbeat", "upbringing", "upcoming",
  "update", "upend", "upgrade", "upheaval", "uphill", "uphold", "upkeep", "upland", "uplift", "upload", "upmarket",
  "upon", "uppercase", "upperclassman", "uppercut", "uproar", "uproot", "upset", "upshot", "upside", "upstage",
  "upstairs", "upstanding", "upstart", "upstate", "upstream", "uptake", "upthrust", "uptight", "uptime", "uptown",
  "upward", "upwind", "use", "vacation", "value", "van", "vase", "vegetable", "veil", "vein", "verse", "vessel", "vest",
  "view", "visitor", "voice", "volcano", "volleyball", "voyage", "waistline", "walk", "walkways", "wall", "walleyed",
  "wallpaper", "war", "wardroom", "warfare", "warmblooded", "warpath", "wash", "washbowl", "washcloth", "washhouse",
  "washout", "washrag", "washroom", "washstand", "washtub", "waste", "wastebasket", "wasteland", "wastepaper",
  "wastewater", "watch", "watchband", "watchdog", "watchmaker", "watchman", "watchtower", "watchword", "water",
  "watercolor", "watercooler", "watercraft", "waterfall", "waterfront", "waterline", "waterlog", "watermelon",
  "waterpower", "waterproof", "waterscape", "watershed", "waterside", "waterspout", "watertight", "wave", "wavelike",
  "waves", "wax", "waxwork", "way", "waybill", "wayfarer", "waylaid", "wayside", "wayward", "wealth", "weather",
  "weathercock", "weatherman", "weatherproof", "week", "weekday", "weekend", "weeknight", "weight", "whatever",
  "whatsoever", "wheel", "wheelchair", "wheelhouse", "whip", "whistle", "whitecap", "whitefish", "whitewall",
  "whitewash", "widespread", "wilderness", "wind", "window", "wine", "wing", "winter", "wipeout", "wire", "wish",
  "without", "woman", "women", "wood", "woodshop", "wool", "word", "work", "worm", "wound", "wren", "wrench", "wrist",
  "writer", "writing", "yak", "yam", "yard", "yarn", "year", "yoke", "zebra", "zephyr", "zinc", "zipper", "zoo"
];
const numberWords = {
  ones: [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
    "twenty"
  ],
  tens: ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"],
  tiers: ["", "thousand", "m-", "b-", "tr-", "quadr-", "quint-", "sext-", "sept-", "oct-", "non-"]
    .map((prefix) => prefix.replace(/-$/, "illion")),
  bigPrefixes: ["", "un", "duo", "tre", "quattuor", "quin", "sex", "octo", "novem"],
  bigSuffixes: ["", "dec", "vigint", "trigint", "quadragint", "quinquagint", "sexagint", "septuagint", "octogint", "nonagint", "cent"]
    .map((prefix) => (prefix ? `${prefix}illion` : ""))
};
const ordinals = {
  zero: "zeroeth", one: "first", two: "second", three: "third", four: "fourth", five: "fifth", eight: "eighth", nine: "ninth", twelve: "twelfth",
  twenty: "twentieth", thirty: "thirtieth", forty: "fortieth", fifty: "fiftieth", sixty: "sixtieth", seventy: "seventieth", eighty: "eightieth", ninety: "ninetieth"
};
const romanNumerals = {
  grouped: [
    ["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ"],
    ["", "Ⅹ", "ⅩⅩ", "ⅩⅩⅩ", "ⅩⅬ", "Ⅼ", "ⅬⅩ", "ⅬⅩⅩ", "ⅬⅩⅩⅩ", "ⅩⅭ"],
    ["", "Ⅽ", "ⅭⅭ", "ⅭⅭⅭ", "ⅭⅮ", "Ⅾ", "ⅮⅭ", "ⅮⅭⅭ", "ⅮⅭⅭⅭ", "ⅭⅯ"],
    ["", "Ⅿ", "ⅯⅯ", "ⅯⅯⅯ", "Ⅿↁ", "ↁ", "ↁⅯ", "ↁⅯⅯ", "ↁⅯⅯⅯ", "ↁↂ"],
    ["", "ↂ", "ↂↂ", "ↂↂↂ", "ↂↇ", "ↇ", "ↇↂ", "ↇↂↂ", "ↇↂↂↂ", "ↇↈ"],
    ["", "ↈ", "ↈↈ", "ↈↈↈ"]
  ],
  ungrouped: [
    ["", "Ⅰ", "ⅠⅠ", "ⅠⅠⅠ", "ⅠⅤ", "Ⅴ", "ⅤⅠ", "ⅤⅠⅠ", "ⅤⅠⅠⅠ", "ⅠⅩ"],
    ["", "Ⅹ", "ⅩⅩ", "ⅩⅩⅩ", "ⅩⅬ", "Ⅼ", "ⅬⅩ", "ⅬⅩⅩ", "ⅬⅩⅩⅩ", "ⅩⅭ"],
    ["", "Ⅽ", "ⅭⅭ", "ⅭⅭⅭ", "ⅭⅮ", "Ⅾ", "ⅮⅭ", "ⅮⅭⅭ", "ⅮⅭⅭⅭ", "ⅭⅯ"],
    ["", "Ⅿ", "ⅯⅯ", "ⅯⅯⅯ", "Ⅿↁ", "ↁ", "ↁⅯ", "ↁⅯⅯ", "ↁⅯⅯⅯ", "ↁↂ"],
    ["", "ↂ", "ↂↂ", "ↂↂↂ", "ↂↇ", "ↇ", "ↇↂ", "ↇↂↂ", "ↇↂↂↂ", "ↇↈ"],
    ["", "ↈ", "ↈↈ", "ↈↈↈ"]
  ]
};

// ████████ TYPES: Type Checking, Validation, Conversion, Casting ████████

const getType = (ref) => {
  const baseType = Object.prototype.toString.call(ref)
    .slice(8, -1)
    .toLowerCase()
    .trim();
  switch (baseType) {
    case "number": {
      if (isNaN(ref)) { return "NaN" }
      if (/\./.test(`${ref}`)) { return "float" }
      return "int";
    }
    case "object": { return "list" }
    default: {
      if (/function$/.test(baseType)) {
        if (/^class/.test(String(ref))) { return "class" }
        return "function";
      }
    }
  }
  return baseType;
};
const isNumber = (ref) => ["int", "float"].includes(getType(ref));
const isPosInt = (ref) => getType(ref) === "int" && ref >= 0;
const isIterable = (ref) => !["null", "undefined"].includes(getType(ref)) && typeof ref[Symbol.iterator] === "function";
const hasItems = (ref) => {
  ref = getType(ref) === "list" ? Object.keys(ref) : ref;
  return isIterable(ref) && Array.from(ref).length > 0;
};
const areEqual = (...refs) => {
  function checkEquality(ref1, ref2) {
    const [type1, type2] = [getType(ref1), getType(ref2)];
    if (type1 === type2) {
      switch (type1) {
        case "null": case "string": case "number": case "boolean": {
          return ref1 === ref2;
        }
        case "array": case "set": case "list": {
          return _.isEqual(ref1, ref2);
        }
        default: {
          try {
            return JSON.stringify(ref1) === JSON.stringify(ref2);
          } catch {
            return false;
          }
        }
      }
    }
    return false;
  }
  let ref = refs.pop();
  while (refs.length) {
    if (checkEquality(ref, refs[0])) {
      ref = refs.pop();
    } else {
      return false;
    }
  }
  return true;
};

const pFloat = (ref, sigDigits, isStrict = false) => {
  ref = parseFloat(ref);
  sigDigits = parseInt(sigDigits);
  if (isNaN(ref)) { return isStrict ? NaN : 0.0 }
  if (isPosInt(sigDigits)) {
    ref = Math.round(ref * (10 ** sigDigits)) / 10 ** sigDigits;
  }
  return ref;
};
const pInt = (ref, isStrict = false) => {
  ref = pFloat(ref, 0, isStrict);
  return isNaN(ref) ? NaN : Math.round(ref);
};

// ████████ REGEXP: Regular Expressions, Replacing, Matching ████████
const testRegExp = (str, patterns = [], flags = "gui", isTestingAll = false) => patterns.map(
  (pattern) => (getType(pattern) === "regexp"
    ? pattern
    : new RegExp(`\\b${pattern}\\b`, flags))
)[isTestingAll ? "every" : "some"]((pattern) => pattern.test(str));
const regExtract = (ref, pattern, flags = "u") => {
  pattern = new RegExp(pattern, flags.replace(/g/g, ""));
  const isGrouping = /[)(]/.test(pattern.toString());
  const matches = ref.match(pattern) || [];
  return isGrouping ? matches.slice(1) : matches.pop();
};

// ████████ STRINGS: String Parsing, Manipulation, Conversion ████████
// ░░░░░░░ Case Conversion ░░░░░░░
const uCase = (str) => `${str}`.toUpperCase();
const lCase = (str) => `${str}`.toLowerCase();
const sCase = (str) => {
  let [first, ...rest] = `${str}`.split(/\s+/);
  first = testRegExp(first, capWords) ? first : `${uCase(first.charAt(0))}${lCase(first.slice(1))}`;
  if (hasItems(rest)) {
    rest = rest.map((word) => (testRegExp(word, capWords) ? word : lCase(word)));
  }
  return [first, ...rest].join(" ").trim();
};
const tCase = (str) => `${str}`.split(/\s/)
  .map((word, i) => (i && testRegExp(word, noCapWords) ? lCase(word) : sCase(word)))
  .join(" ").trim();
// ░░░░░░░[Formatting]░░░░ Hyphenation, Pluralization, "a"/"an" Fixing ░░░░░░░
const hyphenate = (str, hyphenChar = "\u00AD") => hyph(str, {hyphenChar});
const parseArticles = (str) => `${str}`.replace(/\b(a|A)\s([aeiouAEIOU])/gu, "$1n $2");
const pluralize = (singular, num, plural) => {
  if (pFloat(num) === 1) { return singular }
  return plural ?? `${singular.replace(/y$/, "ie").replace(/s$/, "se")}s`;
};
const oxfordize = (items, useOxfordComma = true) => {
  const lastItem = items.pop();
  return [
    items.join(", "),
    useOxfordComma ? "," : "",
    " and ",
    lastItem
  ].join("");
};
// ========== Numbers: Formatting Numbers Into Strings ===========
const signNum = (num, delim = "") => `${pFloat(num) < 0 ? "-" : "+"}${delim}${Math.abs(pFloat(num))}`;
const padNum = (num, numDecDigits) => {
  const [leftDigits, rightDigits] = `${pFloat(num)}`.split(/\./);
  if (getType(rightDigits) === "int") {
    if (rightDigits.length > numDecDigits) {
      return `${pFloat(num, numDecDigits)}`;
    } else if (rightDigits.length < numDecDigits) {
      return `${leftDigits}.${rightDigits}${"0".repeat(numDecDigits - rightDigits.length)}`;
    } else {
      return `${pFloat(num)}`;
    }
  }
  return `${leftDigits}.${"0".repeat(numDecDigits)}`;
};
const stringifyNum = (num) => {
  // Can take string representations of numbers, either in standard or scientific/engineering notation.
  // Returns a string representation of the number in standard notation.
  if (pFloat(num) === 0) { return "0" }
  num = lCase(num).replace(/[^\d.e+-]/g, "");
  const base = regExtract(num, /^-?[\d.]+/);
  const exp = pInt(regExtract(num, /e([+-]?\d+)$/).pop());
  const baseInts = regExtract(base, /^-?(\d+)/).pop().replace(/^0+/, "");
  const baseDecs = lCase(regExtract(base, /\.(\d+)/).pop()).replace(/0+$/, "");
  const numFinalInts = Math.max(0, baseInts.length + exp);
  const numFinalDecs = Math.max(0, baseDecs.length - exp);

  const finalInts = [
    baseInts.slice(0, numFinalInts),
    baseDecs.slice(0, Math.max(0, exp))
  ].join("") || "0";
  const finalDecs = [
    baseInts.length - numFinalInts > 0
      ? baseInts.slice(baseInts.length - numFinalInts - 1)
      : "",
    baseDecs.slice(baseDecs.length - numFinalDecs)
  ].join("");

  return [
    num.charAt(0) === "-" ? "-" : "",
    finalInts,
    "0".repeat(Math.max(0, numFinalInts - finalInts.length)),
    finalDecs.length ? "." : "",
    "0".repeat(Math.max(0, numFinalDecs - finalDecs.length)),
    finalDecs
  ].join("");
};
const verbalizeNum = (num) => {
  num = stringifyNum(num);
  const getTier = (trioNum) => {
    if (trioNum < numberWords.tiers.length) {
      return numberWords.tiers[trioNum];
    }
    return [
      numberWords.bigPrefixes[(trioNum % 10) - 1],
      numberWords.bigSuffixes[Math.floor(trioNum / 10)]
    ].join("");
  };
  const parseThreeDigits = (trio, tierNum) => {
    if (pInt(trio) === 0) { return "" }
    const digits = `${trio}`.split("").map((digit) => pInt(digit));
    let result = "";
    if (digits.length === 3) {
      const hundreds = digits.shift();
      result += hundreds > 0 ? `${numberWords.ones[hundreds]} hundred` : "";
      if (hundreds && (digits[0] || digits[1])) {
        result += " and ";
      }
    }
    if (pInt(digits.join("")) <= numberWords.ones.length) {
      result += numberWords.ones[pInt(digits.join(""))];
    } else {
      result += `${numberWords.tens[pInt(digits.shift())]}${pInt(digits[0]) > 0 ? `-${numberWords.ones[pInt(digits[0])]}` : ""}`;
    }
    return result;
  };
  const numWords = [];
  if (num.charAt(0) === "-") {
    numWords.push("negative");
  }
  const [integers, decimals] = num.replace(/[,|\s|-]/g, "").split(".");
  const intArray = integers.split("").reverse().join("")
    .match(/.{1,3}/g)
    .map((v) => v.split("").reverse().join(""));
  const intStrings = [];
  while (intArray.length) {
    const theseWords = parseThreeDigits(intArray.pop());
    if (theseWords) {
      intStrings.push(`${theseWords} ${getTier(intArray.length)}`);
    }
  }
  numWords.push(intStrings.join(", ").trim());
  if (getType(decimals) === "int") {
    if (integers === "0") {
      numWords.push("zero");
    }
    numWords.push("point");
    for (const digit of decimals.split("")) {
      numWords.push(numberWords.ones[pInt(digit)]);
    }
  }
  return numWords.join(" ");
};
const ordinalizeNum = (num, isReturningWords = false) => {
  if (isReturningWords) {
    const [numText, suffix] = lCase(verbalizeNum(num)).match(/.*?[-|\s]?(\w*?)$/);
    return numText.replace(
      new RegExp(`${suffix}$`),
      ordinals[suffix] || `${suffix}th`
    );
  }
  const tNum = pInt(num) - 100 * Math.floor(pInt(num) / 100);
  if (/\.|1[1-3]$/.test(`${num}`)) {
    return `${num}th`;
  }
  return `${num}${
    ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][
      pInt(`${num}`.charAt(`${num}`.length - 1))
    ]
  }`;
};
const romanizeNum = (num, isUsingGroupedChars = true) => {
  if (getType(num) === "float") { throw new Error(`Error: Can't Romanize Floats (${num})`) }
  if (num >= 400000) { throw new Error(`Error: Can't Romanize >= 400,000 (${num})`) }
  if (num <= 0) { throw new Error(`Error: Can't Romanize <= 0 (${num})`) }
  const romanRef = romanNumerals[isUsingGroupedChars ? "grouped" : "ungrouped"];
  const romanNum = stringifyNum(num)
    .split("")
    .reverse()
    .map((digit, i) => romanRef[i][pInt(digit)])
    .reverse()
    .join("");
  return isUsingGroupedChars
    ? romanNum.replace(/ⅩⅠ/gu, "Ⅺ").replace(/ⅩⅡ/gu, "Ⅻ")
    : romanNum;
};

// ░░░░░░░[Content]░░░░ Lorem Ipsum, Random Content Generation ░░░░░░░
const loremIpsum = (numWords = 200) => {
  const lrWordList = loremIpsumText.split(/\n?\s+/g);
  const words = [...lrWordList[randNum(0, lrWordList.length - 1)]];
  while (words.length < numWords) {
    words.push(...lrWordList);
  }
  words.length = numWords;
  return `${sCase(words.join(" ")).trim().replace(/[^a-z\s]*$/ui, "")}.`;
};
const randWord = (numWords = 1, wordList = randomWords) => new Array(numWords).fill(null).map(() => randElem(wordList)).join(" ");
// ░░░░░░░[Localization]░░░░ Simplified Localization Functionality ░░░░░░░
/* const Loc = (locRef, formatDict = {}) => {
  if (/^"?scion\./u.test(JSON.stringify(locRef)) && typeof game.i18n.localize(locRef) === "string") {
    for (const [key, val] of Object.entries(formatDict)) {
      formatDict[key] = Loc(val);
    }
    return game.i18n.format(locRef, formatDict) || "";
  }
  return locRef;
}; */

// ████████ NUMBERS: Number Casting, Mathematics, Conversion ████████
const randNum = (min, max, snap = 0) => gsap.utils.random(min, max, snap);
const randInt = (min, max) => randNum(min, max, 1);
const cycleNum = (num, [min = 0, max = Infinity] = []) => gsap.utils.wrap(min, max, num);
// ░░░░░░░[Angles]░░░░ Angles, Trigonometry ░░░░░░░
const radToDeg = (rad, isConstrained = true) => {
  rad = isConstrained ? rad % (2 * Math.PI) : rad;
  rad *= 180 / Math.PI;
  return rad;
};
const degToRad = (deg, isConstrained = true) => {
  deg = isConstrained ? deg % 360 : deg;
  deg *= Math.PI / 180;
  return deg;
};
const getAngleDelta = (angleStart, angleEnd) => cycleNum(Math.round(angleEnd - angleStart), [-180, 180]);
// ░░░░░░░[Positioning]░░░░ Relationships On 2D Cartesian Plane ░░░░░░░
const getDistance = ({x: x1, y: y1}, {x: x2, y: y2}) => ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
const getAngle = ({x: x0, y: y0}, {x: xT, y: yT}) => radToDeg(Math.atan2(yT - y0, xT - x0)); // range (-180, 180]

// ████████ ARRAYS: Array Manipulation ████████
const randElem = (array) => gsap.utils.random(array);
const randIndex = (array) => randInt(0, array.length - 1);

const makeCycler = (array, index = 0) => {
  // Given an array and a starting index, returns a generator function that can be used
  // to iterate over the array indefinitely, or wrap out-of-bounds index values
  const wrapper = gsap.utils.wrap(array);
  index--;
  return (function* cycler() {
    while (true) {
      index++;
      yield wrapper(index);
    }
  }());
};

// ████████ OBJECTS: Manipulation of Simple Key/Val Objects ████████
// Given an object and a predicate function, returns array of two objects:
//   one with entries that pass, one with entries that fail.
const partition = (obj, predicate = (v, k) => true) => [
  Object.fromEntries(Object.entries(obj).filter(([key, val]) => predicate(val, key))),
  Object.fromEntries(Object.entries(obj).filter(([key, val]) => !predicate(val, key)))
];

// ████████ FUNCTIONS: Function Wrapping, Queuing, Manipulation ████████

// ████████ HTML: Parsing HTML Code, Manipulating DOM Objects ████████

// ░░░░░░░[Arrays & Objects] Array & Object Processing ░░░░░░░
// Arrayify: Ensures value returns as an array containing only truthy objects.
//     Useful when iterating over a map to functions that return falsy values on failure
const Arrayify = (x) => [x].flat().filter((xx) => xx === "" || xx === 0 || Boolean(xx));
const KVPMap = (obj, keyFunc, valFunc) => {

  [valFunc, keyFunc] = [valFunc, keyFunc].filter((x) => ["function", "boolean"].includes(typeof x));
  keyFunc = keyFunc || ((k) => k);
  valFunc = valFunc || ((v) => v);
  return Object.fromEntries(Object.entries(obj).map(([key, val]) => [keyFunc(key, val), valFunc(val, key)]));
};
const KVPFilter = (obj, keyTestFunc, valTestFunc) => {
  [valTestFunc, keyTestFunc] = [valTestFunc, keyTestFunc].filter((x) => ["function", "boolean"].includes(typeof x));
  keyTestFunc = keyTestFunc || (() => true);
  valTestFunc = valTestFunc || (() => true);
  return Object.fromEntries(Object.entries(obj).filter(([key, val]) => keyTestFunc(key) && valTestFunc(val)));
};
const KVPForEach = (obj, func) => Object.entries(obj).forEach(([key, val]) => func(val, key));
const parseSearchFunc = (qObj, searchFunc) => {
  const [objType, funcType] = [qObj, searchFunc].map(getType);
  if (["list", "array"].includes(objType)) {
    if (funcType === "function") { return searchFunc }
    if (objType === "list" && searchFunc in qObj) { return ([key]) => key === searchFunc }
    if (funcType === "regexp") {
      if (objType === "list") { return ([, val]) => searchFunc.test(val) }
      return (val) => searchFunc.test(val);
    }
    if (funcType === "int") {
      if (objType === "list") { return ([, val]) => val === Object.values(qObj)[pInt(searchFunc)] }
      return (elem, i) => (i = pInt(searchFunc));
    }
    if (["first", "last", "random"].includes(searchFunc)) {
      return parseSearchFunc(qObj, {
        first: 0,
        last: Object.values(qObj).length - 1,
        random: Math.floor(Math.random() * Object.values(qObj).length)
      }[searchFunc]);
    }
    searchFunc = JSON.stringify(searchFunc);
    if (objType === "list") { return ([, val]) => JSON.stringify(val) === searchFunc }
    return (val) => JSON.stringify(val) === searchFunc;
  }
  return searchFunc;
};
const Remove = (qObj, searchFunc) => {
  if (getType(qObj) === "list") {
    const remKey = Object.entries(qObj).find(parseSearchFunc(qObj, searchFunc));
    if (remKey) {
      const {[remKey]: remVal} = qObj;
      delete qObj[remKey];
      return remVal;
    }
  } else if (getType(qObj) === "array") {
    const index = qObj.findIndex(parseSearchFunc(qObj, searchFunc));
    if (index >= 0) {
      let remVal;
      for (let i = 0; i <= qObj.length; i++) {
        if (i === index) {
          remVal = qObj.shift();
        } else {
          qObj.push(qObj.shift());
        }
      }
      return remVal;
    }
  }
  return false;
};
const Replace = (qObj, searchFunc, repVal) => {
  const qType = getType(qObj);
  let repKey;
  if (qType === "list") {
    [repKey] = Object.entries(qObj).find(parseSearchFunc(qObj, searchFunc)) || [false];
    if (repKey === false) { return false }
  } else if (qType === "array") {
    repKey = qObj.findIndex(parseSearchFunc(qObj, searchFunc));
    if (repKey === -1) { return false }
  }
  if (getType(repVal) === "function") {
    qObj[repKey] = repVal(qObj[repKey], repKey);
  } else {
    qObj[repKey] = repVal;
  }
  return true;
};

export default {
  gsap
  // // ████████ GETTERS: Basic Data Retrieval ████████
  // get GMID() { return game.users.find((user) => user.isGM)?.id ?? false },
  //

  // // ████████ GSAP: GSAP Functions ████████
  // get(...args) { return gsap.getProperty(...args) },
  // set(...args) { return gsap.set(...args) },

  // // ▮▮▮▮▮▮▮[GSAP.UTILS]▮▮▮▮▮▮▮
  // random(...args) { return gsap.utils.random(...args) },
  // distribute(...args) { return gsap.utils.distribute(...args) },
  // splitColor(...args) { return gsap.utils.splitColor(...args) },
  // mapRange(...args) { return gsap.utils.mapRange(...args) },
  //
  //

  // // ████████ MATH ████████
  // cycle,
  // pad,
  // sign,
  // round,
  // radToDeg,
  // getDistance,
  // getAngle,
  // getAngleDelta,
  //
  // // ████████ DOM: DOM Elements ████████

  //
  // // ████████ STRINGS: String Parsing ████████
  // // ▮▮▮▮▮▮▮[FORMATS] Conversion Between Various String Formats ▮▮▮▮▮▮▮
  // formatAsClass: (str) => `${str}`.replace(/([A-Z])|\s/g, "-$1").replace(/^-/, "").trim().toLowerCase(),
  //
  // // ▮▮▮▮▮▮▮[COLORS] Color String Conversion & Manipulation ▮▮▮▮▮▮▮
  // joinColor: (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`,
  //
  //
  // // ████████ ARRAYS: Array Manipulation ████████
  // makeCycler
  //
};

// // NUMBER FUNCTIONS: Parsing
// export const  pInt = (num) => parseInt(`${Math.round(parseFloat(`${num}`) || 0)}`);
// export const  pFloat = (num, sigDigits = 2) => Math.round((parseFloat(`${num}`) || 0) * 10 ** sigDigits) / 10 ** sigDigits;
// export const Rand = (n1, n2) => Math.round(Math.random() * (Math.max( pInt(n2),  pInt(n1)) - Math.min( pInt(n2),  pInt(n1)))) + Math.min( pInt(n2),  pInt(n1));
//

// // ARRAY FUNCTIONS: Last
// export const Last = (arr) => (Array.isArray(arr) && arr.length ? arr[arr.length - 1] : undefined);
// export const Flip = (arr) => Clone(arr).reverse();
// /* MUTATOR */ export const Insert = (arr, val, index) => {
//   arr[ pInt(index)] = val;
//   return arr;
// };
// /* MUTATOR */ export const Change = (arr, findFunc = (e, i, a) => true, changeFunc = (e, i, a) => e) => {
//   const index = arr.findIndex(findFunc);
//   if (index >= 0) {
//     arr[index] = changeFunc(arr[index], index, arr);
//     return arr;
//   } else {
//     return false;
//   }
// };
// export const Remove = (arr, findFunc = (e, i, a) => true) => {
//   const index = arr.findIndex(findFunc);
//   if (index >= 0) {
//     const elem = arr[index];
//     delete arr[index];
//     for (let i = index; i < arr.length - 1; i++) {
//       arr[i] = arr[i + 1];
//     }
//     arr.length -= 1;
//     return elem;
//   }
//   return false;
// };

// // const testArray = [0, 1, 2, 3, 4, 5];
// // const findFunc = (e, i) => i > 3;
// // const changeFunc = (e) => e + 3;
// // console.log(Remove(testArray, findFunc, changeFunc));
// // console.log(testArray);
//

// // OBJECT FUNCTIONS: Dot Notation, MapObject, MakeDictionary
// export const KeyMapObj = (obj, keyFunc = (x) => x, valFunc = undefined) => {
//   /*
//    * An object-equivalent Array.map() function, which accepts mapping functions to transform both keys and values.
//    *      If only one function is provided, it's assumed to be mapping the values and will receive (v, k) args.
//    */
//   [valFunc, keyFunc] = [valFunc, keyFunc].filter((x) => typeof x === "function" || typeof x === "boolean");
//   keyFunc = keyFunc || ((k) => k);
//   valFunc = valFunc || ((v) => v);
//   const newObj = {};
//   Object.entries(obj).forEach(([key, val]) => {
//     newObj[keyFunc(key, val)] = valFunc(val, key);
//   });
//   return newObj;
// };
// export const Clone = (obj) => {
//   let cloneObj;
//   try {
//     cloneObj = JSON.parse(JSON.stringify(obj));
//   } catch (err) {
//     // THROW({obj, err}, "ERROR: U.Clone()");
//     cloneObj = {...obj};
//   }
//   return cloneObj;
// };
// export const Merge = (target, source, {isMergingArrays = true, isOverwritingArrays = true} = {}) => {
//   target = Clone(target);
//   const isObject = (obj) => obj && typeof obj === "object";

//   if (!isObject(target) || !isObject(source)) {
//     return source;
//   }

//   Object.keys(source).forEach((key) => {
//     const targetValue = target[key];
//     const sourceValue = source[key];

//     if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
//       if (isOverwritingArrays) {
//         target[key] = sourceValue;
//       } else if (isMergingArrays) {
//         target[key] = targetValue.map((x, i) => (sourceValue.length <= i ? x : Merge(x, sourceValue[i], {isMergingArrays, isOverwritingArrays})));
//         if (sourceValue.length > targetValue.length) {
//           target[key] = target[key].concat(sourceValue.slice(targetValue.length));
//         }
//       } else {
//         target[key] = targetValue.concat(sourceValue);
//       }
//     } else if (isObject(targetValue) && isObject(sourceValue)) {
//       target[key] = Merge({...targetValue}, sourceValue, {isMergingArrays, isOverwritingArrays});
//     } else {
//       target[key] = sourceValue;
//     }
//   });

//   return target;
// };
// export const Filter = (obj, testFunc = (v, k) => true) => Object.keys(obj).reduce((newObj, key) => Object.assign(newObj, testFunc(obj[key], key) ? {[key]: obj[key]} : {}), {});
// export const Expand = (obj) => {
//   const expObj = {};
//   for (let [key, val] of Object.entries(obj)) {
//     if (getType(val) === "Object") {
//       val = Expand(val);
//     }
//     setProperty(expObj, key, val);
//   }
//   return expObj;
// };
// export const Flatten = (obj) => {
//   const flatObj = {};
//   for (const [key, val] of Object.entries(obj)) {
//     if (getType(val) === "Object") {
//       if (isObjectEmpty(val)) {
//         flatObj[key] = val;
//       } else {
//         for (const [subKey, subVal] of Object.entries(Flatten(val))) {
//           flatObj[`${key}.${subKey}`] = subVal;
//         }
//       }
//     } else {
//       flatObj[key] = val;
//     }
//   }
//   return flatObj;
// };
// export const SumVals = (...objs) => {
//   const valKey = objs.pop();
//   if (typeof valKey === "object") {
//     objs.push(valKey);
//   }
//   return objs.reduce(
//     (tot, obj) => tot + Object.values(obj).reduce((subTot, val) => subTot + (typeof val === "object" && valKey in val ? val[valKey] : val), 0),
//     0
//   );
// };
// export const MakeDict = (objRef, valFunc = (v) => v, keyFunc = (k) => k) => {
//   const newDict = {};
//   for (const key of Object.keys(objRef)) {
//     const val = objRef[key];
//     const newKey = keyFunc(key, val);
//     let newVal = valFunc(val, key);
//     if (typeof newVal === "object" && !Array.isArray(newVal)) {
//       const newValProp = ((nVal) => ["label", "name", "value"].find((x) => x in nVal))(newVal);
//       newVal = newValProp && newVal[newValProp];
//     }
//     if (["string", "number"].includes(typeof newVal)) {
//       newDict[newKey] = Loc(newVal);
//     }
//   }
//   return newDict;
// };

// export const NestedValues = (obj, flatVals = []) => {
//   if (obj && typeof obj === "object") {
//     for (const key of Object.keys(obj)) {
//       const val = obj[key];
//       if (val && typeof val === "object") {
//         flatVals.push(...NestedValues(val));
//       } else {
//         flatVals.push(val);
//       }
//     }
//     return flatVals;
//   }
//   return [obj].flat();
// };
//

// const numToText = (num, isTitleCase = false) => {
//   const numString = `${num}`;
//   const parseThreeDigits = (v) => {
//     const digits = _.map(v.toString().split(""), (vv) => parseInt(vv));
//     let result = "";
//     if (digits.length === 3) {
//       const hundreds = digits.shift();
//       result += hundreds > 0 ? `${numberWords.low[hundreds]} hundred` : "";
//       if (digits[0] + digits[1] > 0) { result += " and " } else { return result.toLowerCase() }
//     }
//     if (parseInt(digits.join("")) <= numberWords.low.length) { result += numberWords.low[parseInt(digits.join(""))] } else { result += numberWords.tens[parseInt(digits.shift())] + (parseInt(digits[0]) > 0 ? `-${numberWords.low[parseInt(digits[0])]}` : "") }
//     return result.toLowerCase();
//   };
//   const isNegative = numString.charAt(0) === "-";
//   const [integers, decimals] = numString.replace(/[,|\s|-]/gu, "").split(".");
//   const intArray = _.map(
//     integers
//       .split("")
//       .reverse()
//       .join("")
//       .match(/.{1,3}/g),
//     (v) => v
//       .split("")
//       .reverse()
//       .join("")
//   ).reverse();
//   const [intStrings, decStrings] = [[], []];
//   while (intArray.length) { intStrings.push(`${parseThreeDigits(intArray.shift())} ${numberWords.tiers[intArray.length]}`.toLowerCase().trim()) }
//   if (VAL({number: decimals})) {
//     decStrings.push(" point");
//     for (const digit of decimals.split("")) { decStrings.push(numberWords.low[parseInt(digit)]) }
//   }
//   const numText = (isNegative ? "negative " : "") + intStrings.join(", ") + decStrings.join(" ");
//   return isTitleCase ? tCase(numText) : sCase(numText);
// };
// const textToNum = (num) => {
//   const [tenText, oneText] = num.split("-");
//   if (VAL({string: tenText}, "textToNum")) {
//     return Math.max(
//       0,
//       _.indexOf(
//         _.map(numberWords.tens, (v) => v.toLowerCase()),
//         tenText.toLowerCase()
//       ) * 10,
//       _.indexOf(
//         _.map(numberWords.low, (v) => v.toLowerCase()),
//         tenText.toLowerCase()
//       )
//     ) + VAL({string: oneText})
//       ? Math.max(
//         0,
//         _.indexOf(
//           _.map(numberWords.low, (v) => v.toLowerCase()),
//           oneText.toLowerCase()
//         )
//       )
//       : 0;
//   }
//   return 0;
// };
// const ellipsisText = (text, maxLength) => {
//   if (`${text}`.length > maxLength) { return `${text.slice(0, maxLength - 3)}…` }
//   return text;
// };
// const numToRomanNum = (num, isGroupingSymbols = true) => {
//   if (isNaN(num)) { return NaN }
//   const digits = String(pInt(num)).split("");
//   const key = romanNumerals[isGroupingSymbols ? "grouped" : "ungrouped"];
//   let roman = "",
//       i = 3;
//   while (i--) { roman = (key[pInt(digits.pop()) + i * 10] || "") + roman }
//   return isGroupingSymbols
//     ? (Array(pInt(digits.join("")) + 1).join("M") + roman).replace(/ⅩⅠ/gu, "Ⅺ").replace(/ⅩⅡ/gu, "Ⅻ")
//     : Array(pInt(digits.join("")) + 1).join("M") + roman;
// };
// const ordinal = (num, isFullText = false) => {
//   /* Converts any number by adding its appropriate ordinal ("2nd", "3rd", etc.) */
//   if (isFullText) {
//     const [numText, suffix] = numToText(num).match(/.*?[-|\s](\w*?)$/u);
//     return numText.replace(new RegExp(`${suffix}$`, "u"), "") + ordinals[suffix] || `${suffix}th`;
//   }
//   const tNum = parseInt(num) - 100 * Math.floor(parseInt(num) / 100);
//   if ([11, 12, 13].includes(tNum)) { return `${num}th` }

//   return `${num}${["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][num % 10]}`;
// };

// // OBJECT MANIPULATION: Manipulating arrays, mapping objects
// const kvpMap = (obj, kFunc, vFunc) => {
//   const newObj = {};
//   _.each(obj, (v, k) => {
//     newObj[kFunc ? kFunc(k, v) : k] = vFunc ? vFunc(v, k) : v;
//   });
//   return newObj;
// };
// const removeFirst = (array, element) => array.splice(array.findIndex((v) => v === element));
// const pullElement = (array, checkFunc = (_v = true, _i = 0, _a = []) => { checkFunc(_v, _i, _a) }) => {
//   const index = array.findIndex((v, i, a) => checkFunc(v, i, a));
//   return index !== -1 && array.splice(index, 1).pop();
// };
// const pullIndex = (array, index) => pullElement(array, (v, i) => i === index);
// const parseToObj = (val, delim = ",", keyValDelim = ":") => {
//   /* Converts an array or comma-delimited string of parameters ("key:val, key:val, key:val") into an object. */
//   const [obj, args] = [{}, []];
//   if (VAL({string: val})) { args.push(...val.split(delim)) } else if (VAL({array: val})) { args.push(...val) } else { return THROW(`Cannot parse value '${jStrC(val)}' to object.`, "parseToObj") }
//   for (const kvp of _.map(args, (v) => v.split(new RegExp(`\\s*${keyValDelim}\\s*(?!\\/)`, "u")))) { obj[kvp[0].toString().trim()] = parseInt(kvp[1]) || kvp[1] }
//   return obj;
// };
// const classToObject = (classRef, {
//   pick = undefined,
//   omit = [],
//   excludeUndefined = true,
//   excludeFunctions = true
// } = {}) => {
//   const originalClass = classRef || {};
//   const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(originalClass));
//   return keys.reduce((classAsObj, key) => {
//     if ((!excludeUndefined || originalClass[key] !== undefined)
//        && (!excludeFunctions || typeof originalClass[key] !== "function")
//        && (pick === undefined || [pick].flat().includes(key))
//        && !omit.includes(key)) { classAsObj[key] = originalClass[key] }
//     return classAsObj;
//   }, {});
// };
// const getLast = (array) => (array.length ? array[array.length - 1] : null);
//

// // SEARCH & VALIDATION: Match checking, Set membership checking, type validation.
// const looseMatch = (first, second) => {
//   if (VAL({string: [first, second]}, "looseMatch", true)) { return first.toLowerCase() === second.toLowerCase() }
//   return false;
// };
// const fuzzyMatch = (first, second) => {
//   if (VAL({string: [first, second]}, "fuzzyMatch", true)) {
//     return (
//       first
//         .toLowerCase()
//         .replace(/\W+/gu, "")
//         .includes(second.toLowerCase().replace(/\W+/gu, ""))
//           || second
//             .toLowerCase()
//             .replace(/\W+/gu, "")
//             .includes(first.toLowerCase().replace(/\W+/gu, ""))
//     );
//   }
//   return false;
// };
// const isInExact = (needle, haystack = ALLSTATS) => {
//   // D.Alert(JSON.stringify(haystack))
//   // Looks for needle in haystack using fuzzy matching, then returns value as it appears in haystack.
//   try {
//     // STEP ZERO: VALIDATE NEEDLE & HAYSTACK
//     // NEEDLE --> Must be STRING
//     // HAYSTACK --> Can be ARRAY, LIST or STRING
//     if (VAL({string: needle}) || VAL({number: needle})) {
//       // STEP ONE: BUILD HAYSTACK.
//       // HAYSTACK = ARRAY? --> HAY = ARRAY
//       // HAYSTACK = LIST? ---> HAY = ARRAY (Object.keys(H))
//       // HAYSTACK = STRING? -> HAY = H

//       if (haystack && haystack.gramSizeLower) { return isIn(needle, haystack) }
//       const hayType = (VAL({array: haystack}) && "array") || (VAL({list: haystack}) && "list") || (VAL({string: haystack}) && "string");
//       let ndl = needle.toString(),
//           hay,
//           match;
//       switch (hayType) {
//         case "array":
//           hay = [...haystack];
//           break;
//         case "list":
//           hay = Object.keys(haystack);
//           break;
//         case "string":
//           hay = haystack;
//           break;
//         default:
//           return THROW(`Haystack must be a string, a list or an array (${typeof haystack}): ${JSON.stringify(haystack)}`, "IsIn");
//       }
//       // STEP TWO: SEARCH HAY FOR NEEDLE USING PROGRESSIVELY MORE FUZZY MATCHING. SKIP "*" STEPS IF ISFUZZYMATCHING IS FALSE.
//       // STRICT: Search for exact match, case sensitive.
//       // LOOSE: Search for exact match, case insensitive.
//       // *START: Search for match with start of haystack strings, case insensitive.
//       // *END: Search for match with end of haystack strings, case insensitive.
//       // *INCLUDE: Search for match of needle anywhere in haystack strings, case insensitive.
//       // *REVERSE INCLUDE: Search for match of HAYSTACK strings inside needle, case insensitive.
//       // FUZZY: Start again after stripping all non-word characters.
//       if (hayType === "array" || hayType === "list") {
//         for (let i = 0; i <= 1; i++) {
//           let thisNeedle = ndl,
//               thisHay = hay;
//           match = _.findIndex(thisHay, (v) => thisNeedle === v) + 1; // Adding 1 means "!match" passes on failure return of -1.
//           if (match) { break }
//           thisHay = _.map(
//             thisHay,
//             (v) => ((v || v === 0) && (VAL({string: v}) || VAL({number: v}) ? v.toString().toLowerCase() : v)) || "§¥£"
//           );
//           thisNeedle = thisNeedle.toString().toLowerCase();
//           match = _.findIndex(thisHay, (v) => thisNeedle === v) + 1;
//           if (match) { break }
//           // Now strip all non-word characters and try again from the top.
//           ndl = ndl.replace(/\W+/gu, "");
//           hay = _.map(hay, (v) => (VAL({string: v}) || VAL({number: v}) ? v.toString().replace(/\W+/gu, "") : v));
//         }
//         return match && hayType === "array" ? haystack[match - 1] : haystack[Object.keys(haystack)[match - 1]];
//       } else {
//         for (let i = 0; i <= 1; i++) {
//           match = hay === ndl && ["", hay];
//           if (match) { break }
//           const thisNeedleRegExp = new RegExp(`^(${ndl})$`, "iu");
//           match = hay.match(thisNeedleRegExp);
//           if (match) { break }
//           // Now strip all non-word characters and try again from the top.
//           ndl = ndl.replace(/\W+/gu, "");
//           hay = hay.replace(/\W+/gu, "");
//         }
//         return match && match[1];
//       }
//     }
//     return THROW(`Needle must be a string: ${D.JSL(needle)}`, "isIn");
//   } catch (errObj) {
//     return THROW(`Error locating '${D.JSL(needle)}' in ${D.JSL(haystack)}'`, "isIn", errObj);
//   }
// };
// const isIn = (needle, haystack, isExact = false) => {
//   let dict;
//   if (isExact) { return isInExact(needle, haystack) }
//   if (!haystack) {
//     dict = STATE.REF.STATSDICT;
//   } else if (haystack.add) {
//     dict = haystack;
//   } else {
//     dict = Fuzzy.Fix();
//     for (const str of haystack) { dict.add(str) }
//   }
//   const result = dict.get(needle);
//   return result && result[0][1];
// };