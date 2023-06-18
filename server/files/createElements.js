export function createNavButton(text, link, navElement) {
  let listItem = document.createElement("li");
  listItem.classList.add("btn", "btn-outline-light");
  let anchor = document.createElement("a");
  anchor.href = link;
  anchor.textContent = text;
  listItem.appendChild(anchor);
  navElement.appendChild(listItem);
}
