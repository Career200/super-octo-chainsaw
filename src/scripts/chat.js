const usernames = [
  "Echo-9",
  "FrostByte",
  "N1mBus",
  "RedSpectre",
  "Blink",
  "Molot",
  "Jazz",
  "Rook",
  "VX-42",
  "Cypher-1",
  "Dagger",
  "Kite",
  "Quasar",
  "Zero",
  "Fox3",
  "Vanta",
];
const codedMessages = [
  "pkiic aceimz",
  "vbnop qwejzk coir",
  "jklmn rtzv bpwe",
  "uqoi nbfqe zxlpr",
  "trqpe iuxlz",
  "ezrrp uqvn xiet",
  "olxji blwtu kqnev",
  "zqeer jmxnb fwlpt",
  "mqnwu cevlt rxpi",
  "xvtru kqzmi neowq",
  "akzzp jqxle bzvto",
  "wrnpo dzvjq ylmti",
  "rtyev xlpzq",
  "qwmne jziuv",
];

const englishMessages = [
  "affirmative.",
  "signal clean, proceed.",
  "holding position until visual.",
  "can’t reach Nexus, fallback protocol?",
  "we’re not alone here.",
  "copy. running bypass now.",
  "mission parameters just changed.",
  "who greenlit this drop?",
  "we’re in the clear.",
  "abort mission",
  "i have you on open comms. don't dp that people.",
  "unit *****, clear comms please.",
  "alias you pisshead connect already.",
];

let warningCount = 0;

const input = document.querySelector("input");

input.addEventListener("input", () => {
  input.value = input.value.replace(
    /[^a-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/g,
    ""
  );
});

const chatBox = document.getElementById("ops-chat");

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function trimOverflowingMessages(container) {
  while (container.scrollHeight > container.clientHeight) {
    if (container.firstChild) {
      container.removeChild(container.firstChild);
    } else {
      break;
    }
  }
}

function addChatMessage(user, message) {
  const chatUser = user || randomItem(usernames);
  const isEnglish = Math.random() < 0.2;
  const chatMessage =
    message ||
    (isEnglish ? randomItem(englishMessages) : randomItem(codedMessages));

  const timestamp = new Date().toLocaleTimeString("en-GB", { hour12: false });
  const line = `[${timestamp}] <${chatUser}> ${chatMessage}`;

  const lineEl = document.createElement("div");
  lineEl.textContent = line;
  chatBox.appendChild(lineEl);
  chatBox.scrollTop = chatBox.scrollHeight;
  // sometimes a message follows immediately after another
  if (Math.random() < 0.2) {
    setTimeout(() => {
      addChatMessage();
    }, Math.random() * 1000 + 1000);
  }
  trimOverflowingMessages(chatBox);
}

const chatFeedInterval = setInterval(() => {
  addChatMessage();
}, Math.random() * 10000 + 30000);

function startChatFeed() {
  addChatMessage();
  setTimeout(() => {
    addChatMessage();
  }, Math.random() * 1000 + 2000);
  // start interval
}

const fixedUsername = "YOU";
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("chat-input");

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = inputEl.value.trim();
  if (!val) return;

  const timestamp = new Date().toLocaleTimeString("en-GB", { hour12: false });
  const line = `[${timestamp}] <${fixedUsername}> ${val}`;

  const lineEl = document.createElement("div");
  lineEl.textContent = line;
  chatBox.appendChild(lineEl);
  chatBox.scrollTop = chatBox.scrollHeight;

  inputEl.value = "";

  // user is warned if they send a message
  // on the second message they are caught and redirected to the death screen
  const message = Math.random() < 0.9 ? "user 0469 reauth now" : undefined;
  if (message) {
    warningCount++;
    if (warningCount > 1) {
      disableChat();
      return;
    }
  }
  setTimeout(() => {
    addChatMessage(message ? "CSec" : undefined, message);
  }, 250);

  trimOverflowingMessages(chatBox);
});

// if the user was warned 2 times, death
const disableChat = () => {
  formEl.remove();
  inputEl.remove();
  setTimeout(() => {
    document.body.innerHTML = "";
    const bones = document.createElement("div");
    bones.innerHTML = `<pre>     .... NO! ...                  ... MNO! ...
   ..... DIE!! ...................... MDIEO! ...
 ..... MMNO! ......................... MDIEO!! .
.... MDIENNOO!   MMDIEMMMMMPPPOII!   MNNO!!!! .
 ... !O! DIE! MMMMMMMDIEMMMPPPOOOII!! NO! ....
    ...... ! MMDIEMMMMMMMMDIEPOOOOIII! ! ...
   ........ MMMMMMMMMMMMPPPPPOOOOOOII!! .....
   ........ MMDIEOOOOOOPPPPPPPPOOOOMII! ...
    ....... MMMMM..    ODIEMP    .,OMI! ....
     ...... MMMM::   o.,OPMP,.o   ::I!! ...
         .... NNM:::.,,OOPM!P,.::::!! ....
          .. MDIENNNOOOOPMO!!IIPPO!!O! .....
         ... MMMMMDIENOO:!!:!!IPPPPOO! ....
           .. MMMMMNNOOMMNDIEIPPPOO!! ......
          ...... MDIENNMMNNNIIIOO!..........
       ....... MN MOMDIENNDIEIIO! OO ..........
    ......... MNO! IiiiiiiiiiiiI OOOO ...........
  ...... NNN.DIE! . O!!!!!!!!!O . OONO NO! ........
   .... MNNNNNO! ...OOOOOODIEOO .  DIENON!........
   ...... MDIENO! .. PDIEPPPPP .. MMNON!........
      ...... OO! ................. ON! .......
         ................................</pre>`;
    document.body.appendChild(bones);
  }, 2000);

  clearInterval(chatFeedInterval);
  chatBox.innerHTML = "Chat disabled.";
};

startChatFeed();
