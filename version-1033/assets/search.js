const searchItems = window.searchItems || [];

const form = document.querySelector("[data-global-search-form]");
const input = document.querySelector("[data-global-search-input]");
const results = document.querySelector("[data-search-results]");
const chips = Array.from(document.querySelectorAll("[data-global-chip]"));

const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q") || "";

if (input) {
  input.value = initialQuery;
}

render(initialQuery);

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = input?.value || "";
  const nextUrl = new URL(window.location.href);
  if (query.trim()) {
    nextUrl.searchParams.set("q", query.trim());
  } else {
    nextUrl.searchParams.delete("q");
  }
  window.history.replaceState({}, "", nextUrl.toString());
  render(query);
});

input?.addEventListener("input", () => {
  render(input.value);
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const query = chip.dataset.globalChip || "";
    if (input) {
      input.value = query;
    }
    chips.forEach((other) => other.classList.toggle("active", other === chip));
    render(query);
  });
});

function render(query) {
  if (!results) {
    return;
  }

  const term = normalize(query);
  const matches = searchItems
    .filter((item) => {
      if (!term) {
        return true;
      }
      return normalize([
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.oneLine,
        ...(item.tags || [])
      ].join(" ")).includes(term);
    })
    .slice(0, 96);

  if (!matches.length) {
    results.innerHTML = '<div class="search-empty">没有找到匹配影片，可以换一个片名、年份、地区或类型继续搜索。</div>';
    return;
  }

  results.innerHTML = matches.map(toCard).join("");
}

function toCard(item) {
  const tags = (item.tags || []).slice(0, 3).join(" / ") || item.genre;
  return `
    <article class="movie-card compact-card">
      <a class="card-link" href="${escapeAttribute(item.url)}" title="${escapeAttribute(item.title)} 在线观看">
        <div class="poster" style="--poster-image: url('${escapeAttribute(item.cover)}');">
          <span class="type-pill">${escapeHtml(item.type)}</span>
          <span class="year-pill">${escapeHtml(item.year)}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.oneLine)}</p>
          <div class="card-meta">
            <span>${escapeHtml(item.region)}</span>
            <span>${escapeHtml(tags)}</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}
