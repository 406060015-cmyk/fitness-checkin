const STORAGE_KEY = "fitlog-state-v2";
const LEGACY_KEY = "fitlog-state-v1";
const CLOUD_ROW_ID = "global";
const CLOUD_TABLE = "fitlog_state";
const CLOUD_SAVE_DELAY = 900;

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const todayKey = () => toDateKey(new Date());

const defaultState = {
  currentUserId: "",
  viewingUserId: "",
  users: []
};

const fields = [
  "breakfast",
  "lunch",
  "dinner",
  "snacks",
  "calories",
  "weight",
  "workoutType",
  "workoutMinutes",
  "dailyNotes"
];

const foodDatabase = [
  { name: "米饭", aliases: ["白米饭", "rice"], caloriesPer100g: 116 },
  { name: "糙米饭", aliases: ["brown rice"], caloriesPer100g: 111 },
  { name: "燕麦", aliases: ["oat", "oats"], caloriesPer100g: 389 },
  { name: "鸡蛋", aliases: ["egg"], caloriesPer100g: 143 },
  { name: "鸡胸肉", aliases: ["鸡肉", "chicken"], caloriesPer100g: 165 },
  { name: "牛肉", aliases: ["beef"], caloriesPer100g: 250 },
  { name: "三文鱼", aliases: ["salmon"], caloriesPer100g: 208 },
  { name: "鱼肉", aliases: ["fish"], caloriesPer100g: 128 },
  { name: "虾", aliases: ["shrimp"], caloriesPer100g: 99 },
  { name: "西兰花", aliases: ["broccoli"], caloriesPer100g: 34 },
  { name: "青菜", aliases: ["蔬菜", "vegetable"], caloriesPer100g: 28 },
  { name: "红薯", aliases: ["sweet potato"], caloriesPer100g: 86 },
  { name: "土豆", aliases: ["potato"], caloriesPer100g: 77 },
  { name: "香蕉", aliases: ["banana"], caloriesPer100g: 89 },
  { name: "苹果", aliases: ["apple"], caloriesPer100g: 52 },
  { name: "牛奶", aliases: ["milk"], caloriesPer100g: 54 },
  { name: "酸奶", aliases: ["yogurt"], caloriesPer100g: 72 },
  { name: "全麦面包", aliases: ["面包", "bread"], caloriesPer100g: 247 },
  { name: "面条", aliases: ["noodle", "noodles"], caloriesPer100g: 137 },
  { name: "沙拉", aliases: ["salad"], caloriesPer100g: 60 },
  { name: "坚果", aliases: ["nuts"], caloriesPer100g: 607 },
  { name: "牛油果", aliases: ["avocado"], caloriesPer100g: 160 }
];

const exerciseGuides = [
  {
    name: "深蹲",
    aliases: ["squat", "腿", "臀", "下肢"],
    goal: "strength",
    bodyParts: ["臀腿", "股四头肌", "核心"],
    bestTime: "力量训练日中段，热身后进行；饭后至少 60-90 分钟。",
    duration: "3-5 组，每组 8-12 次",
    cues: ["双脚约肩宽，脚尖自然外展", "下蹲时膝盖跟随脚尖方向", "背部保持中立，核心收紧", "起身时脚掌均匀发力"],
    mistakes: ["膝盖内扣", "弓背塌腰", "重量过大导致动作变形"]
  },
  {
    name: "俯卧撑",
    aliases: ["push up", "胸", "手臂", "上肢"],
    goal: "strength",
    bodyParts: ["胸部", "肱三头肌", "肩前束", "核心"],
    bestTime: "上肢训练日或居家短训练；早晚都可，避免睡前高强度做到力竭。",
    duration: "3-4 组，每组 8-15 次",
    cues: ["身体从头到脚保持一条直线", "手掌在胸两侧，肘部约 45 度", "下降到胸部接近地面", "推起时不要耸肩"],
    mistakes: ["塌腰", "半程动作", "肘部完全横向打开"]
  },
  {
    name: "硬拉",
    aliases: ["deadlift", "背", "臀", "腿后侧"],
    goal: "strength",
    bodyParts: ["臀部", "腘绳肌", "下背", "背阔肌"],
    bestTime: "力量训练前半段，精神集中时做；避免疲劳后大重量硬拉。",
    duration: "3-5 组，每组 3-8 次",
    cues: ["杠铃贴近小腿", "髋部向后折叠，不是先蹲下", "背部中立，肩胛稳定", "髋膝同步伸展站直"],
    mistakes: ["弓背拉起", "杠铃离身体太远", "用腰猛拽"]
  },
  {
    name: "平板支撑",
    aliases: ["plank", "核心", "腹"],
    goal: "strength",
    bodyParts: ["核心", "腹横肌", "肩稳定"],
    bestTime: "训练收尾或短时核心激活；饭后不建议立刻做。",
    duration: "3-4 组，每组 30-60 秒",
    cues: ["肘在肩正下方", "骨盆微后倾，腹部收紧", "头颈自然延伸", "保持稳定呼吸"],
    mistakes: ["塌腰", "臀部抬太高", "憋气硬撑"]
  },
  {
    name: "跑步",
    aliases: ["running", "慢跑", "有氧", "cardio"],
    goal: "cardio",
    bodyParts: ["心肺", "小腿", "臀腿"],
    bestTime: "早晨轻松跑或傍晚耐力跑都适合；高强度跑避开空腹和睡前。",
    duration: "20-45 分钟，初学者以能说短句的强度为宜",
    cues: ["身体微微前倾", "步频稳定，落点靠近身体重心", "肩颈放松", "逐渐加量，每周增量不超过约 10%"],
    mistakes: ["一开始速度过快", "忽略热身和放松", "疼痛时硬撑"]
  },
  {
    name: "HIIT 间歇训练",
    aliases: ["hiit", "燃脂", "减脂", "间歇"],
    goal: "fat-loss",
    bodyParts: ["全身", "心肺", "核心"],
    bestTime: "下午或傍晚状态较好时；每周 2-3 次即可，避免连续高强度。",
    duration: "15-25 分钟，动作 30 秒 + 休息 30 秒循环",
    cues: ["先完成动态热身", "动作质量优先于速度", "间歇时让心率下降", "训练后补水和拉伸"],
    mistakes: ["每天高强度", "没有热身", "动作变形仍继续冲强度"]
  },
  {
    name: "瑜伽拉伸",
    aliases: ["yoga", "拉伸", "恢复", "柔韧"],
    goal: "mobility",
    bodyParts: ["髋", "肩背", "腿后侧", "脊柱"],
    bestTime: "早晨唤醒身体或晚间放松；力量训练后做低强度拉伸。",
    duration: "15-30 分钟，每个姿势保持 30-60 秒",
    cues: ["动作进入时缓慢", "保持均匀呼吸", "拉伸感即可，不追求疼痛", "左右两侧均衡"],
    mistakes: ["弹震式拉伸", "憋气", "疼痛还继续压"]
  },
  {
    name: "划船训练",
    aliases: ["row", "划船", "背部", "哑铃划船"],
    goal: "strength",
    bodyParts: ["背阔肌", "菱形肌", "肱二头肌"],
    bestTime: "背部训练日中段；推类训练后可作为平衡动作。",
    duration: "3-4 组，每组 8-12 次",
    cues: ["先稳定躯干", "肘部向后拉，不是耸肩", "顶峰收缩 1 秒", "下放时控制速度"],
    mistakes: ["用身体甩重量", "耸肩代偿", "只用手臂发力"]
  }
];

const exercisePoseMap = {
  "深蹲": {
    title: "髋膝同步下蹲",
    position: "0% 0%"
  },
  "俯卧撑": {
    title: "身体保持直线",
    position: "33.333% 0%"
  },
  "硬拉": {
    title: "背部中立髋折叠",
    position: "66.666% 0%"
  },
  "平板支撑": {
    title: "核心收紧不塌腰",
    position: "100% 0%"
  },
  "跑步": {
    title: "身体微前倾",
    position: "0% 100%"
  },
  "HIIT 间歇训练": {
    title: "动作质量优先",
    position: "33.333% 100%"
  },
  "瑜伽拉伸": {
    title: "缓慢进入姿势",
    position: "66.666% 100%"
  },
  "划船训练": {
    title: "肘部向后拉",
    position: "100% 100%"
  }
};

let state = loadState();
let chartRange = 14;
let pendingPhotoEstimate = null;
let cloudClient = null;
let cloudSaveTimer = null;
let isApplyingCloudState = false;

const el = {
  authScreen: document.querySelector("#authScreen"),
  appShell: document.querySelector("#appShell"),
  authMemberCount: document.querySelector("#authMemberCount"),
  authEntryCount: document.querySelector("#authEntryCount"),
  authStageCount: document.querySelector("#authStageCount"),
  authTabs: document.querySelectorAll("[data-auth-tab]"),
  loginForm: document.querySelector("#loginForm"),
  registerForm: document.querySelector("#registerForm"),
  loginAccount: document.querySelector("#loginAccount"),
  loginPassword: document.querySelector("#loginPassword"),
  loginMessage: document.querySelector("#loginMessage"),
  registerName: document.querySelector("#registerName"),
  registerAccount: document.querySelector("#registerAccount"),
  registerPassword: document.querySelector("#registerPassword"),
  registerAvatar: document.querySelector("#registerAvatar"),
  registerMessage: document.querySelector("#registerMessage"),
  currentAvatar: document.querySelector("#currentAvatar"),
  currentUserName: document.querySelector("#currentUserName"),
  currentAccountName: document.querySelector("#currentAccountName"),
  avatarUpload: document.querySelector("#avatarUpload"),
  logoutBtn: document.querySelector("#logoutBtn"),
  personList: document.querySelector("#personList"),
  memberCount: document.querySelector("#memberCount"),
  activePersonName: document.querySelector("#activePersonName"),
  currentDateLabel: document.querySelector("#currentDateLabel"),
  entryDate: document.querySelector("#entryDate"),
  entryForm: document.querySelector("#entryForm"),
  saveEntryBtn: document.querySelector("#saveEntryBtn"),
  foodPanel: document.querySelector("#foodPanel"),
  foodSearch: document.querySelector("#foodSearch"),
  foodGrams: document.querySelector("#foodGrams"),
  foodResults: document.querySelector("#foodResults"),
  foodTotal: document.querySelector("#foodTotal"),
  foodPhoto: document.querySelector("#foodPhoto"),
  foodPhotoPreview: document.querySelector("#foodPhotoPreview"),
  photoEstimateTitle: document.querySelector("#photoEstimateTitle"),
  photoEstimateText: document.querySelector("#photoEstimateText"),
  applyPhotoEstimateBtn: document.querySelector("#applyPhotoEstimateBtn"),
  foodLog: document.querySelector("#foodLog"),
  exerciseSearch: document.querySelector("#exerciseSearch"),
  exerciseGoal: document.querySelector("#exerciseGoal"),
  exerciseResults: document.querySelector("#exerciseResults"),
  todayCalories: document.querySelector("#todayCalories"),
  todayMinutes: document.querySelector("#todayMinutes"),
  latestWeight: document.querySelector("#latestWeight"),
  streakDays: document.querySelector("#streakDays"),
  weekMinutes: document.querySelector("#weekMinutes"),
  weightDelta: document.querySelector("#weightDelta"),
  stageCount: document.querySelector("#stageCount"),
  historyList: document.querySelector("#historyList"),
  clearEntryBtn: document.querySelector("#clearEntryBtn"),
  weightChart: document.querySelector("#weightChart"),
  rangeButtons: document.querySelectorAll("[data-range]"),
  addStageBtn: document.querySelector("#addStageBtn"),
  stageForm: document.querySelector("#stageForm"),
  cancelStageBtn: document.querySelector("#cancelStageBtn"),
  stageList: document.querySelector("#stageList"),
  exportBtn: document.querySelector("#exportBtn"),
  viewerNotice: document.querySelector("#viewerNotice"),
  profileAvatar: document.querySelector("#profileAvatar"),
  profileMode: document.querySelector("#profileMode"),
  profileName: document.querySelector("#profileName"),
  profileSummary: document.querySelector("#profileSummary"),
  profileBadges: document.querySelector("#profileBadges"),
  calorieLeaderboard: document.querySelector("#calorieLeaderboard"),
  leaderboardTop: document.querySelector("#leaderboardTop")
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return normalizeState(JSON.parse(saved));
    } catch {
      return structuredClone(defaultState);
    }
  }

  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy);
      const users = (parsed.people || []).map((person, index) => ({
        id: person.id || crypto.randomUUID(),
        name: person.name || `成员${index + 1}`,
        account: index === 0 ? "demo" : `member${index + 1}`,
        password: "1234",
        avatar: "",
        entries: person.entries || {},
        stages: person.stages || []
      }));
      const migrated = normalizeState({
        currentUserId: users[0]?.id || "",
        viewingUserId: users[0]?.id || "",
        users
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      return structuredClone(defaultState);
    }
  }

  return structuredClone(defaultState);
}

function normalizeState(nextState) {
  const normalized = {
    ...structuredClone(defaultState),
    ...nextState,
    users: Array.isArray(nextState.users) ? nextState.users : []
  };
  normalized.users = normalized.users.map((user, index) => ({
    id: user.id || crypto.randomUUID(),
    name: user.name || `成员${index + 1}`,
    account: user.account || `member${index + 1}`,
    password: user.password || "1234",
    passwordHash: user.passwordHash || "",
    avatar: user.avatar || "",
    entries: user.entries || {},
    stages: user.stages || []
  })).filter((user) => !(user.name === "我" && user.account === "demo"));
  if (!normalized.users.some((user) => user.id === normalized.currentUserId)) {
    normalized.currentUserId = "";
  }
  if (!normalized.users.some((user) => user.id === normalized.viewingUserId)) {
    normalized.viewingUserId = normalized.currentUserId || normalized.users[0]?.id || "";
  }
  return normalized;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  scheduleCloudSave();
}

function getCloudClient() {
  if (cloudClient) return cloudClient;
  const config = window.FITLOG_SUPABASE || {};
  if (!config.url || !config.anonKey || !window.supabase?.createClient) return null;
  cloudClient = window.supabase.createClient(config.url, config.anonKey);
  return cloudClient;
}

async function hashPassword(password) {
  if (!window.crypto?.subtle) return "";
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function passwordMatches(user, password) {
  if (user.password && user.password === password) return true;
  if (!user.passwordHash) return false;
  return user.passwordHash === await hashPassword(password);
}

function cloudUser(user) {
  return {
    id: user.id,
    name: user.name,
    account: user.account,
    passwordHash: user.passwordHash || "",
    avatar: user.avatar || "",
    entries: user.entries || {},
    stages: user.stages || []
  };
}

function cloudStatePayload() {
  return {
    users: state.users.map(cloudUser)
  };
}

function mergeCloudUsers(cloudUsers, localUsers) {
  const merged = new Map();
  [...localUsers, ...cloudUsers].forEach((user) => {
    const key = user.account || user.id;
    const previous = merged.get(key) || {};
    merged.set(key, {
      ...previous,
      ...user,
      password: user.password || previous.password || "",
      passwordHash: user.passwordHash || previous.passwordHash || "",
      entries: {
        ...(previous.entries || {}),
        ...(user.entries || {})
      },
      stages: [...(previous.stages || []), ...(user.stages || [])]
        .filter((stage, index, list) => list.findIndex((item) => item.id === stage.id) === index)
    });
  });
  return [...merged.values()];
}

function applyCloudState(cloudPayload) {
  if (!cloudPayload || !Array.isArray(cloudPayload.users)) return;
  const currentAccount = currentUser()?.account || "";
  const viewingAccount = viewedUser()?.account || currentAccount;
  const merged = mergeCloudUsers(cloudPayload.users, state.users);
  state = normalizeState({
    ...state,
    users: merged
  });
  state.currentUserId = state.users.find((user) => user.account === currentAccount)?.id || state.currentUserId;
  state.viewingUserId = state.users.find((user) => user.account === viewingAccount)?.id || state.currentUserId || state.users[0]?.id || "";
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function loadCloudState() {
  const client = getCloudClient();
  if (!client) return;
  const { data, error } = await client.from(CLOUD_TABLE).select("state").eq("id", CLOUD_ROW_ID).maybeSingle();
  if (error) {
    console.warn("Cloud sync load failed", error);
    return;
  }
  if (data?.state) {
    isApplyingCloudState = true;
    applyCloudState(data.state);
    isApplyingCloudState = false;
    render();
  }
}

function scheduleCloudSave() {
  if (isApplyingCloudState || !getCloudClient()) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(() => {
    saveCloudState();
  }, CLOUD_SAVE_DELAY);
}

async function saveCloudState() {
  const client = getCloudClient();
  if (!client) return;
  const payload = {
    id: CLOUD_ROW_ID,
    state: cloudStatePayload(),
    updated_at: new Date().toISOString()
  };
  const { error } = await client.from(CLOUD_TABLE).upsert(payload, { onConflict: "id" });
  if (error) console.warn("Cloud sync save failed", error);
}

function subscribeCloudState() {
  const client = getCloudClient();
  if (!client) return;
  client
    .channel("fitlog-state")
    .on("postgres_changes", { event: "*", schema: "public", table: CLOUD_TABLE }, (payload) => {
      if (payload.new?.state) {
        isApplyingCloudState = true;
        applyCloudState(payload.new.state);
        isApplyingCloudState = false;
        render();
      }
    })
    .subscribe();
}

function currentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || null;
}

function viewedUser() {
  return state.users.find((user) => user.id === state.viewingUserId) || currentUser() || state.users[0] || null;
}

function isOwnerView() {
  return Boolean(state.currentUserId && state.currentUserId === state.viewingUserId);
}

function selectedDate() {
  return el.entryDate.value || todayKey();
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(new Date(`${dateString}T00:00:00`));
}

function numberValue(value) {
  if (value === "" || value === null || value === undefined) return "";
  const num = Number(value);
  return Number.isFinite(num) ? num : "";
}

function escapeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function avatarMarkup(user, extraClass = "") {
  const name = escapeText(user?.name?.slice(0, 1) || "F");
  if (user?.avatar) {
    return `<img class="avatar ${extraClass}" src="${user.avatar}" alt="${escapeText(user.name)}头像">`;
  }
  return `<div class="avatar ${extraClass}" aria-hidden="true">${name}</div>`;
}

function setAvatar(element, user, extraClass) {
  element.className = `avatar ${extraClass}`;
  element.textContent = "";
  element.removeAttribute("src");
  element.removeAttribute("alt");
  if (user?.avatar && element.tagName === "IMG") {
    element.src = user.avatar;
    element.alt = `${user.name}头像`;
    return;
  }
  if (user?.avatar) {
    const img = document.createElement("img");
    img.id = element.id;
    img.className = `avatar ${extraClass}`;
    img.src = user.avatar;
    img.alt = `${user.name}头像`;
    element.replaceWith(img);
    return;
  }
  if (element.tagName === "IMG") {
    const div = document.createElement("div");
    div.id = element.id;
    div.className = `avatar ${extraClass}`;
    div.setAttribute("aria-hidden", "true");
    div.textContent = user?.name?.slice(0, 1) || "F";
    element.replaceWith(div);
    return;
  }
  element.setAttribute("aria-hidden", "true");
  element.textContent = user?.name?.slice(0, 1) || "F";
}

function renderAuthStats() {
  const entryCount = state.users.reduce((sum, user) => sum + Object.keys(user.entries || {}).length, 0);
  const stageCount = state.users.reduce((sum, user) => sum + (user.stages || []).length, 0);
  el.authMemberCount.textContent = state.users.length;
  el.authEntryCount.textContent = entryCount;
  el.authStageCount.textContent = stageCount;
}

function render() {
  renderAuthStats();
  const user = currentUser();
  if (!user) {
    el.authScreen.hidden = false;
    el.appShell.hidden = true;
    return;
  }

  el.authScreen.hidden = true;
  el.appShell.hidden = false;
  renderApp();
}

function renderApp() {
  const owner = currentUser();
  const person = viewedUser();
  if (!owner || !person) return;

  el.currentDateLabel.textContent = formatDate(selectedDate());
  el.activePersonName.textContent = isOwnerView() ? `${person.name}的今日打卡` : `${person.name}的成果主页`;
  el.currentUserName.textContent = owner.name;
  el.currentAccountName.textContent = `@${owner.account}`;
  el.memberCount.textContent = `${state.users.length} 人`;
  setAvatar(el.currentAvatar, owner, "avatar-large");
  el.currentAvatar = document.querySelector("#currentAvatar");
  setAvatar(el.profileAvatar, person, "avatar-hero");
  el.profileAvatar = document.querySelector("#profileAvatar");

  renderProfile(person);
  renderPeople();
  renderForm();
  renderFoodTools();
  renderExerciseGuides();
  renderStats();
  renderCalorieLeaderboard();
  renderHistory();
  renderStages();
  renderOwnerControls();
  drawChart();
}

function renderOwnerControls() {
  const editable = isOwnerView();
  el.viewerNotice.hidden = editable;
  el.saveEntryBtn.hidden = !editable;
  el.addStageBtn.hidden = !editable;
  el.clearEntryBtn.hidden = !editable;
  el.foodSearch.disabled = !editable;
  el.foodGrams.disabled = !editable;
  el.foodPhoto.disabled = !editable;
  el.applyPhotoEstimateBtn.hidden = !editable;
  fields.forEach((field) => {
    document.querySelector(`#${field}`).disabled = !editable;
  });
  document.querySelectorAll("#stageForm input, #stageForm textarea, #stageForm button").forEach((node) => {
    node.disabled = !editable;
  });
  if (!editable) {
    el.stageForm.hidden = true;
  }
}

function renderProfile(person) {
  const entries = sortedEntries(person);
  const latest = [...entries].reverse().find((item) => numberValue(item.entry.weight) !== "");
  const minutes = entries.reduce((sum, item) => sum + (Number(item.entry.workoutMinutes) || 0), 0);
  const calories = entries.reduce((sum, item) => sum + (Number(item.entry.calories) || 0), 0);
  el.profileMode.textContent = isOwnerView() ? "个人主页" : "成员主页";
  el.profileName.textContent = person.name;
  el.profileSummary.textContent = latest
    ? `最近体重 ${Number(latest.entry.weight).toFixed(1)} kg，累计运动 ${minutes} 分钟。`
    : "还没有体重记录，完成第一次打卡后这里会自动生成成果摘要。";
  el.profileBadges.innerHTML = [
    `打卡 ${entries.length} 天`,
    `运动 ${minutes} 分钟`,
    `热量 ${calories} kcal`,
    `阶段 ${person.stages.length} 条`
  ]
    .map((text) => `<span class="pill">${text}</span>`)
    .join("");
}

function renderPeople() {
  el.personList.innerHTML = "";
  state.users.forEach((person) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `person-button${person.id === state.viewingUserId ? " active" : ""}`;
    button.innerHTML = `
      ${avatarMarkup(person)}
      <span>
        <strong>${escapeText(person.name)}</strong>
        <small>${person.id === state.currentUserId ? "个人主页" : "查看成果"}</small>
      </span>
    `;
    button.addEventListener("click", () => {
      state.viewingUserId = person.id;
      saveState();
      render();
    });
    el.personList.append(button);
  });
}

function renderForm() {
  const entry = viewedUser().entries[selectedDate()] || {};
  fields.forEach((field) => {
    document.querySelector(`#${field}`).value = entry[field] ?? "";
  });
}

function currentEntry() {
  const person = viewedUser();
  person.entries[selectedDate()] = person.entries[selectedDate()] || {};
  person.entries[selectedDate()].foodItems = person.entries[selectedDate()].foodItems || [];
  person.entries[selectedDate()].foodPhotos = person.entries[selectedDate()].foodPhotos || [];
  return person.entries[selectedDate()];
}

function readonlyEntry() {
  return viewedUser().entries[selectedDate()] || {};
}

function calculateFoodCalories(entry) {
  return (entry.foodItems || []).reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
}

function syncCaloriesFromFoods(entry) {
  const foodCalories = calculateFoodCalories(entry);
  entry.calories = foodCalories || numberValue(document.querySelector("#calories").value) || "";
  document.querySelector("#calories").value = entry.calories;
}

function renderFoodTools() {
  const entry = readonlyEntry();
  const foodCalories = calculateFoodCalories(entry);
  el.foodTotal.textContent = `${foodCalories} kcal`;
  renderFoodResults();
  renderFoodLog(entry);

  const latestPhoto = [...(entry.foodPhotos || [])].reverse()[0];
  if (latestPhoto) {
    el.foodPhotoPreview.innerHTML = `<img src="${latestPhoto.photo}" alt="${escapeText(latestPhoto.name)}">`;
    el.photoEstimateTitle.textContent = latestPhoto.name;
    el.photoEstimateText.textContent = `已加入今日记录，估算 ${latestPhoto.calories} kcal。`;
  } else if (!pendingPhotoEstimate) {
    el.foodPhotoPreview.innerHTML = `<span>照片预览</span>`;
    el.photoEstimateTitle.textContent = "等待上传";
    el.photoEstimateText.textContent = "上传后会根据文件名关键词和常见餐盘模型给出热量估算。";
  }
}

function renderFoodResults() {
  const query = el.foodSearch.value.trim().toLowerCase();
  const grams = Number(el.foodGrams.value) || 100;
  const matches = foodDatabase
    .filter((food) => {
      if (!query) return true;
      const haystack = [food.name, ...food.aliases].join(" ").toLowerCase();
      return haystack.includes(query);
    })
    .slice(0, 6);

  el.foodResults.innerHTML = matches
    .map((food) => {
      const calories = Math.round((food.caloriesPer100g * grams) / 100);
      return `
        <button class="food-result" type="button" data-food="${escapeText(food.name)}">
          <span>
            <strong>${escapeText(food.name)}</strong>
            <small>${food.caloriesPer100g} kcal / 100g</small>
          </span>
          <b>${calories} kcal</b>
        </button>
      `;
    })
    .join("");
}

function renderFoodLog(entry) {
  const items = entry.foodItems || [];
  if (!items.length) {
    el.foodLog.innerHTML = `<div class="empty compact-empty">今天还没有添加食物</div>`;
    return;
  }

  el.foodLog.innerHTML = items
    .map((item) => `
      <div class="food-log-item">
        <span>
          <strong>${escapeText(item.name)}</strong>
          <small>${item.grams ? `${item.grams}g` : item.source || "估算"}</small>
        </span>
        <b>${Number(item.calories) || 0} kcal</b>
        ${isOwnerView() ? `<button type="button" data-remove-food="${item.id}" aria-label="删除${escapeText(item.name)}">×</button>` : ""}
      </div>
    `)
    .join("");
}

function addFoodItem(food, grams, source = "搜索添加") {
  if (!isOwnerView()) return;
  const entry = currentEntry();
  const calories = Math.round((food.caloriesPer100g * grams) / 100);
  entry.foodItems.push({
    id: crypto.randomUUID(),
    name: food.name,
    grams,
    calories,
    source
  });
  syncCaloriesFromFoods(entry);
  saveState();
  render();
}

function estimateFoodFromPhoto(fileName) {
  const normalized = fileName.toLowerCase();
  const matched = foodDatabase.find((food) => {
    const names = [food.name, ...food.aliases].map((name) => name.toLowerCase());
    return names.some((name) => normalized.includes(name));
  });

  if (matched) {
    const grams = 220;
    return {
      name: `照片识别：${matched.name}`,
      baseFood: matched,
      grams,
      calories: Math.round((matched.caloriesPer100g * grams) / 100),
      confidence: "根据文件名关键词匹配"
    };
  }

  return {
    name: "照片估算：普通一餐",
    baseFood: null,
    grams: 1,
    calories: 550,
    confidence: "未识别具体食物，按常见正餐估算"
  };
}

function exercisePoseStyle(name) {
  const pose = exercisePoseMap[name] || exercisePoseMap["深蹲"];
  return `background-image: url('./assets/exercise/character-exercise-sheet.png'); background-position: ${pose.position};`;
}

function renderExerciseGuides() {
  const query = el.exerciseSearch.value.trim().toLowerCase();
  const goal = el.exerciseGoal.value;
  const matches = exerciseGuides
    .filter((guide) => goal === "all" || guide.goal === goal)
    .filter((guide) => {
      if (!query) return true;
      const haystack = [
        guide.name,
        guide.goal,
        guide.bestTime,
        ...guide.aliases,
        ...guide.bodyParts,
        ...guide.cues
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .slice(0, 8);

  if (!matches.length) {
    el.exerciseResults.innerHTML = `<div class="empty compact-empty">没有找到匹配的运动指导</div>`;
    return;
  }

  el.exerciseResults.innerHTML = matches
    .map((guide) => `
      <article class="guide-card">
        <div class="guide-visual" role="img" aria-label="${escapeText(guide.name)}正确动作示范图" style="${exercisePoseStyle(guide.name)}">
          <span>${escapeText((exercisePoseMap[guide.name] || {}).title || guide.name)}</span>
        </div>
        <div class="guide-card-head">
          <div>
            <h3>${escapeText(guide.name)}</h3>
            <p>${escapeText(guide.duration)}</p>
          </div>
          ${isOwnerView() ? `<button class="secondary-button" type="button" data-apply-exercise="${escapeText(guide.name)}">写入今日</button>` : ""}
        </div>
        <div class="guide-parts">
          ${guide.bodyParts.map((part) => `<span class="pill">${escapeText(part)}</span>`).join("")}
        </div>
        <div class="guide-section">
          <strong>最佳锻炼时间</strong>
          <p>${escapeText(guide.bestTime)}</p>
        </div>
        <div class="guide-section">
          <strong>正确方式</strong>
          <ul>${guide.cues.map((cue) => `<li>${escapeText(cue)}</li>`).join("")}</ul>
        </div>
        <div class="guide-section warning">
          <strong>避免错误</strong>
          <p>${escapeText(guide.mistakes.join("、"))}</p>
        </div>
      </article>
    `)
    .join("");
}

function applyExerciseGuide(name) {
  if (!isOwnerView()) return;
  const guide = exerciseGuides.find((item) => item.name === name);
  if (!guide) return;
  document.querySelector("#workoutType").value = guide.name;
  const minuteMatch = guide.duration.match(/(\d+)-(\d+)\s*分钟/);
  if (minuteMatch) {
    document.querySelector("#workoutMinutes").value = Math.round((Number(minuteMatch[1]) + Number(minuteMatch[2])) / 2);
  }
  const entry = {
    ...readonlyEntry(),
    ...readEntryForm()
  };
  viewedUser().entries[selectedDate()] = entry;
  saveState();
  render();
}

function renderStats() {
  const person = viewedUser();
  const entry = person.entries[selectedDate()] || {};
  const entries = sortedEntries(person);
  const latest = [...entries].reverse().find((item) => numberValue(item.entry.weight) !== "");
  const first = entries.find((item) => numberValue(item.entry.weight) !== "");
  const weekMinutes = entries
    .filter((item) => daysBetween(item.date, selectedDate()) <= 6 && daysBetween(item.date, selectedDate()) >= 0)
    .reduce((sum, item) => sum + (Number(item.entry.workoutMinutes) || 0), 0);

  el.todayCalories.textContent = `${Number(entry.calories) || 0} kcal`;
  el.todayMinutes.textContent = `${Number(entry.workoutMinutes) || 0} 分钟`;
  el.latestWeight.textContent = latest ? `${Number(latest.entry.weight).toFixed(1)} kg` : "-- kg";
  el.streakDays.textContent = `${calculateStreak(person)} 天`;
  el.weekMinutes.textContent = `${weekMinutes} 分钟`;
  el.stageCount.textContent = `${person.stages.length} 条`;

  if (first && latest && first.date !== latest.date) {
    const delta = Number(latest.entry.weight) - Number(first.entry.weight);
    el.weightDelta.textContent = `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg`;
  } else {
    el.weightDelta.textContent = "--";
  }
}

function calorieBurnRate(workoutType = "") {
  const type = workoutType.toLowerCase();
  if (type.includes("hiit") || type.includes("间歇") || type.includes("燃脂")) return 11;
  if (type.includes("跑") || type.includes("run") || type.includes("有氧")) return 9;
  if (type.includes("深蹲") || type.includes("硬拉") || type.includes("力量") || type.includes("划船")) return 7;
  if (type.includes("俯卧撑") || type.includes("平板") || type.includes("核心")) return 6;
  if (type.includes("瑜伽") || type.includes("拉伸") || type.includes("恢复")) return 3;
  return 6;
}

function workoutBurn(entry) {
  return Math.round((Number(entry.workoutMinutes) || 0) * calorieBurnRate(entry.workoutType || ""));
}

function memberBurnSummary(user) {
  const entries = sortedEntries(user);
  const totalBurn = entries.reduce((sum, item) => sum + workoutBurn(item.entry), 0);
  const totalMinutes = entries.reduce((sum, item) => sum + (Number(item.entry.workoutMinutes) || 0), 0);
  const activeDays = entries.filter((item) => Number(item.entry.workoutMinutes) > 0).length;
  return { user, totalBurn, totalMinutes, activeDays };
}

function renderCalorieLeaderboard() {
  const ranking = state.users
    .map(memberBurnSummary)
    .sort((a, b) => b.totalBurn - a.totalBurn || b.totalMinutes - a.totalMinutes);

  const top = ranking[0];
  el.leaderboardTop.textContent = top && top.totalBurn > 0 ? `${top.totalBurn} kcal` : "--";

  if (!ranking.length) {
    el.calorieLeaderboard.innerHTML = `<div class="empty compact-empty">还没有成员数据</div>`;
    return;
  }

  el.calorieLeaderboard.innerHTML = ranking
    .map((item, index) => {
      const maxBurn = Math.max(1, ranking[0].totalBurn);
      const width = Math.max(6, Math.round((item.totalBurn / maxBurn) * 100));
      const active = item.user.id === state.viewingUserId ? " active" : "";
      return `
        <button class="leaderboard-row${active}" type="button" data-rank-user="${item.user.id}">
          <span class="rank-number">${index + 1}</span>
          ${avatarMarkup(item.user)}
          <span class="rank-main">
            <strong>${escapeText(item.user.name)}</strong>
            <small>${item.totalMinutes} 分钟 · ${item.activeDays} 天运动</small>
            <span class="rank-bar"><i style="width:${width}%"></i></span>
          </span>
          <b>${item.totalBurn} kcal</b>
        </button>
      `;
    })
    .join("");
}

function sortedEntries(person) {
  return Object.entries(person.entries || {})
    .map(([date, entry]) => ({ date, entry }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function daysBetween(dateA, dateB) {
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  return Math.round((b - a) / 86400000);
}

function calculateStreak(person) {
  let count = 0;
  const cursor = new Date(`${selectedDate()}T00:00:00`);
  while (true) {
    const key = toDateKey(cursor);
    if (!person.entries[key]) break;
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function renderHistory() {
  const recent = sortedEntries(viewedUser()).reverse().slice(0, 8);
  if (!recent.length) {
    el.historyList.innerHTML = `<div class="empty">还没有记录</div>`;
    return;
  }

  el.historyList.innerHTML = recent
    .map(({ date, entry }) => {
      const diet = [entry.breakfast, entry.lunch, entry.dinner, entry.snacks].filter(Boolean).join(" / ");
      return `
        <article class="history-card">
          <h3>${formatDate(date)}</h3>
          <div class="meta-line">
            <span class="pill">${entry.weight ? `${escapeText(entry.weight)} kg` : "未填体重"}</span>
            <span class="pill">${escapeText(entry.workoutType || "未填运动")}</span>
            <span class="pill">${Number(entry.workoutMinutes) || 0} 分钟</span>
          </div>
          <p>${escapeText(diet || "未填写饮食")}</p>
          ${entry.dailyNotes ? `<p>${escapeText(entry.dailyNotes)}</p>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderStages() {
  const stages = [...viewedUser().stages].reverse();
  if (!stages.length) {
    el.stageList.innerHTML = `<div class="empty">还没有阶段记录</div>`;
    return;
  }

  el.stageList.innerHTML = stages
    .map((stage) => `
      <article class="stage-card">
        ${stage.photo ? `<img class="stage-photo" src="${stage.photo}" alt="${escapeText(stage.title)}">` : `<div class="stage-photo" aria-hidden="true"></div>`}
        <div>
          <h3>${escapeText(stage.title)}</h3>
          <div class="meta-line">
            <span class="pill">${escapeText(stage.date)}</span>
            <span class="pill">腰 ${stage.waist || "--"} cm</span>
            <span class="pill">臀 ${stage.hip || "--"} cm</span>
            <span class="pill">胸 ${stage.chest || "--"} cm</span>
          </div>
          ${stage.notes ? `<p>${escapeText(stage.notes)}</p>` : ""}
        </div>
      </article>
    `)
    .join("");
}

function drawChart() {
  const canvas = el.weightChart;
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  ctx.scale(ratio, ratio);

  const width = rect.width;
  const height = rect.height;
  const pad = { top: 26, right: 24, bottom: 38, left: 44 };
  ctx.clearRect(0, 0, width, height);

  const cutoff = new Date(`${selectedDate()}T00:00:00`);
  cutoff.setDate(cutoff.getDate() - chartRange + 1);
  const points = sortedEntries(viewedUser())
    .filter((item) => numberValue(item.entry.weight) !== "")
    .filter((item) => new Date(`${item.date}T00:00:00`) >= cutoff)
    .map((item) => ({ date: item.date, value: Number(item.entry.weight) }));

  drawGrid(ctx, width, height, pad);

  if (points.length < 2) {
    ctx.fillStyle = "#68736d";
    ctx.font = "14px Microsoft YaHei, Arial";
    ctx.textAlign = "center";
    ctx.fillText("记录至少 2 天体重后显示趋势", width / 2, height / 2);
    return;
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;

  const getX = (index) => pad.left + (plotWidth * index) / (points.length - 1);
  const getY = (value) => pad.top + plotHeight - ((value - min) / (max - min || 1)) * plotHeight;

  ctx.beginPath();
  points.forEach((point, index) => {
    const x = getX(index);
    const y = getY(point.value);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#16784d";
  ctx.lineWidth = 3;
  ctx.stroke();

  points.forEach((point, index) => {
    const x = getX(index);
    const y = getY(point.value);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#16784d";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  ctx.fillStyle = "#68736d";
  ctx.font = "12px Microsoft YaHei, Arial";
  ctx.textAlign = "left";
  ctx.fillText(`${max.toFixed(1)} kg`, 8, pad.top + 4);
  ctx.fillText(`${min.toFixed(1)} kg`, 8, height - pad.bottom + 4);
  ctx.textAlign = "center";
  ctx.fillText(points[0].date.slice(5), pad.left, height - 12);
  ctx.fillText(points.at(-1).date.slice(5), width - pad.right, height - 12);
}

function drawGrid(ctx, width, height, pad) {
  ctx.strokeStyle = "#dce3de";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = pad.top + ((height - pad.top - pad.bottom) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }
}

function readEntryForm() {
  const existing = readonlyEntry();
  const nextEntry = {
    foodItems: existing.foodItems || [],
    foodPhotos: existing.foodPhotos || []
  };
  return fields.reduce((entry, field) => {
    const input = document.querySelector(`#${field}`);
    entry[field] = input.type === "number" ? numberValue(input.value) : input.value.trim();
    return entry;
  }, nextEntry);
}

function isEmptyEntry(entry) {
  return fields.every((field) => entry[field] === "") && !(entry.foodItems || []).length && !(entry.foodPhotos || []).length;
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function readPhoto(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function switchAuthTab(tabName) {
  el.authTabs.forEach((button) => button.classList.toggle("active", button.dataset.authTab === tabName));
  el.loginForm.hidden = tabName !== "login";
  el.registerForm.hidden = tabName !== "register";
  el.loginMessage.textContent = "";
  el.registerMessage.textContent = "";
}

function bindEvents() {
  el.entryDate.value = todayKey();
  el.entryDate.addEventListener("change", render);

  el.authTabs.forEach((button) => {
    button.addEventListener("click", () => switchAuthTab(button.dataset.authTab));
  });

  el.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const account = el.loginAccount.value.trim();
    const password = el.loginPassword.value;
    const user = state.users.find((item) => item.account === account);
    const isValidPassword = user ? await passwordMatches(user, password) : false;
    if (!user || !isValidPassword) {
      el.loginMessage.textContent = "账号或密码不正确。";
      return;
    }
    state.currentUserId = user.id;
    state.viewingUserId = user.id;
    saveState();
    el.loginForm.reset();
    render();
  });

  el.registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = el.registerName.value.trim();
    const account = el.registerAccount.value.trim();
    const password = el.registerPassword.value;
    if (!name || !account || password.length < 4) {
      el.registerMessage.textContent = "请填写昵称、账号，并设置至少 4 位密码。";
      return;
    }
    if (state.users.some((user) => user.account === account)) {
      el.registerMessage.textContent = "这个账号已经被使用。";
      return;
    }
    const user = {
      id: crypto.randomUUID(),
      name,
      account,
      password: "",
      passwordHash: await hashPassword(password),
      avatar: await readPhoto(el.registerAvatar.files[0]),
      entries: {},
      stages: []
    };
    state.users.push(user);
    state.currentUserId = user.id;
    state.viewingUserId = user.id;
    saveState();
    el.registerForm.reset();
    render();
  });

  el.logoutBtn.addEventListener("click", () => {
    state.currentUserId = "";
    state.viewingUserId = "";
    saveState();
    switchAuthTab("login");
    render();
  });

  el.avatarUpload.addEventListener("change", async () => {
    const user = currentUser();
    if (!user) return;
    user.avatar = await readPhoto(el.avatarUpload.files[0]);
    el.avatarUpload.value = "";
    saveState();
    render();
  });

  el.foodSearch.addEventListener("input", renderFoodResults);
  el.foodGrams.addEventListener("input", renderFoodResults);

  el.foodResults.addEventListener("click", (event) => {
    const button = event.target.closest("[data-food]");
    if (!button) return;
    const food = foodDatabase.find((item) => item.name === button.dataset.food);
    if (!food) return;
    addFoodItem(food, Number(el.foodGrams.value) || 100);
  });

  el.foodLog.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-food]");
    if (!button || !isOwnerView()) return;
    const entry = currentEntry();
    entry.foodItems = (entry.foodItems || []).filter((item) => item.id !== button.dataset.removeFood);
    syncCaloriesFromFoods(entry);
    saveState();
    render();
  });

  el.foodPhoto.addEventListener("change", async () => {
    if (!isOwnerView()) return;
    const file = el.foodPhoto.files[0];
    if (!file) return;
    const photo = await readPhoto(file);
    const estimate = estimateFoodFromPhoto(file.name);
    pendingPhotoEstimate = { ...estimate, photo };
    el.foodPhotoPreview.innerHTML = `<img src="${photo}" alt="今日食物照片">`;
    el.photoEstimateTitle.textContent = estimate.name;
    el.photoEstimateText.textContent = `${estimate.confidence}，估算 ${estimate.calories} kcal。`;
    el.applyPhotoEstimateBtn.disabled = false;
  });

  el.applyPhotoEstimateBtn.addEventListener("click", () => {
    if (!pendingPhotoEstimate || !isOwnerView()) return;
    const entry = currentEntry();
    entry.foodItems.push({
      id: crypto.randomUUID(),
      name: pendingPhotoEstimate.name,
      grams: pendingPhotoEstimate.baseFood ? pendingPhotoEstimate.grams : "",
      calories: pendingPhotoEstimate.calories,
      source: "照片估算"
    });
    entry.foodPhotos.push({
      id: crypto.randomUUID(),
      name: pendingPhotoEstimate.name,
      calories: pendingPhotoEstimate.calories,
      photo: pendingPhotoEstimate.photo
    });
    syncCaloriesFromFoods(entry);
    pendingPhotoEstimate = null;
    el.foodPhoto.value = "";
    el.applyPhotoEstimateBtn.disabled = true;
    saveState();
    render();
  });

  el.exerciseSearch.addEventListener("input", renderExerciseGuides);
  el.exerciseGoal.addEventListener("change", renderExerciseGuides);
  el.exerciseResults.addEventListener("click", (event) => {
    const button = event.target.closest("[data-apply-exercise]");
    if (!button) return;
    applyExerciseGuide(button.dataset.applyExercise);
  });

  el.calorieLeaderboard.addEventListener("click", (event) => {
    const button = event.target.closest("[data-rank-user]");
    if (!button) return;
    state.viewingUserId = button.dataset.rankUser;
    saveState();
    render();
  });

  el.entryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isOwnerView()) return;
    const person = viewedUser();
    const entry = readEntryForm();
    if (isEmptyEntry(entry)) delete person.entries[selectedDate()];
    else person.entries[selectedDate()] = entry;
    saveState();
    render();
  });

  el.clearEntryBtn.addEventListener("click", () => {
    if (!isOwnerView()) return;
    delete viewedUser().entries[selectedDate()];
    saveState();
    render();
  });

  el.rangeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      chartRange = Number(button.dataset.range);
      el.rangeButtons.forEach((item) => item.classList.toggle("active", item === button));
      drawChart();
    });
  });

  el.addStageBtn.addEventListener("click", () => {
    if (!isOwnerView()) return;
    el.stageForm.hidden = false;
    document.querySelector("#stageTitle").focus();
  });

  el.cancelStageBtn.addEventListener("click", () => {
    el.stageForm.reset();
    el.stageForm.hidden = true;
  });

  el.stageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!isOwnerView()) return;
    const title = document.querySelector("#stageTitle").value.trim() || `${formatDate(selectedDate())}复盘`;
    const stage = {
      id: crypto.randomUUID(),
      date: selectedDate(),
      title,
      waist: numberValue(document.querySelector("#waist").value),
      hip: numberValue(document.querySelector("#hip").value),
      chest: numberValue(document.querySelector("#chest").value),
      notes: document.querySelector("#stageNotes").value.trim(),
      photo: await readPhoto(document.querySelector("#stagePhoto").files[0])
    };
    viewedUser().stages.push(stage);
    saveState();
    el.stageForm.reset();
    el.stageForm.hidden = true;
    render();
  });

  el.exportBtn.addEventListener("click", () => {
    downloadJson(`fitlog-${todayKey()}.json`, state);
  });

  window.addEventListener("resize", drawChart);
}

bindEvents();
render();
loadCloudState();
subscribeCloudState();
window.addEventListener("focus", loadCloudState);
