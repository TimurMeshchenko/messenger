async function load_chats() {
    const response = await fetch("/api/get_chats?user_id=1");
    const data = await response.json();
    const chatlist_ul = document.querySelector(".chatlist");
    chatlist_ul.insertAdjacentHTML('beforeend', data)
}

async function load_messages() {
  // Если нет # в url return null

  const response = await fetch(
    "/api/get_messages?chat_id=65d220a834ddb6612a2b67a2&user_id=1"
  );
  const data = await response.json();
  const bubbles_date_group_section = document.querySelector(".bubbles-date-group");
  bubbles_date_group_section.insertAdjacentHTML("beforeend", data);
}

load_chats();
load_messages();