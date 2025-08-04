const card = document.getElementById("card");
const status = document.getElementById("status");
const reward = document.getElementById("reward");
const error = document.getElementById("error");

// Simulated backend response (replace with real call)
const mockFetchLoyalty = async () => {
  return {
    success: true,
    stamps: 3,
    required: 5,
    rewardUnlocked: false
  };
};

const drawStamps = (stamps, required) => {
  card.innerHTML = "";
  for (let i = 1; i <= required; i++) {
    const el = document.createElement("div");
    el.className = "stamp" + (i <= stamps ? " active" : "");
    el.textContent = "🍔";
    card.appendChild(el);
  }
};

const loadLoyalty = async () => {
  try {
    const result = await mockFetchLoyalty(); // replace with fetch('/api/loyalty')
    if (!result.success) throw new Error("Could not load loyalty data.");

    status.textContent = `You have ${result.stamps} out of ${result.required} stamps.`;
    drawStamps(result.stamps, result.required);

    if (result.rewardUnlocked) {
      reward.classList.remove("hidden");
    }
  } catch (err) {
    console.error(err);
    error.textContent = err.message;
    error.classList.remove("hidden");
    status.textContent = "";
  }
};

loadLoyalty();
