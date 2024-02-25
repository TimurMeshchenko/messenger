async function get_user_id_from_localstorage() {
  let user_id = localStorage.getItem("user_id");
  const response = await fetch(`/api/is_user_exists?user_id=${user_id}`);
  const is_user_exists = await response.json();
  if (!user_id || !is_user_exists) {
    user_id = Math.floor(Math.random() * 1000000) + 1;
    localStorage.setItem("user_id", user_id);
    // Создать чат с админом. Создать endpoint для создания чата, chats_users, message
    // и использовать здесь с данными для чата с админом
  }
  return user_id;
}

async function load_chats() {
    const response = await fetch("/api/get_chats?user_id=1");
    const data = await response.json();
    const chatlist_ul = document.querySelector(".chatlist");
    chatlist_ul.insertAdjacentHTML('beforeend', data)
    listen_chats_click();
}

function listen_chats_click() {
  const chats = document.querySelectorAll(".chatlist-chat");
  const chat_id = get_chat_id_from_url();
  for (let chat of chats) {
    if (chat_id == chat.dataset.peerId) {
      chat.classList.add("active");
    }
    chat.addEventListener("click", () => {
      document.querySelector(".chatlist-chat.active").classList.remove("active");
      chat.classList.add("active");
      load_messages(chat.dataset.peerId);
    });
  }
}

function get_chat_id_from_url() {
  const hash = window.location.hash;
  const id = hash.substring(1);
  return id;
}

async function load_messages(chat_element_id=null) {
  const chat_id = chat_element_id || get_chat_id_from_url();
  if (!chat_id) {
    return null;
  }
  const response = await fetch(`/api/get_messages?chat_id=${chat_id}&user_id=1`);
  const data = await response.json();
  const bubbles_date_group_section = document.querySelector(".bubbles-date-group");
  bubbles_date_group_section.innerHTML = '';
  bubbles_date_group_section.insertAdjacentHTML("beforeend", data);
}

// Переписать, как синхронную get_user_id_from_localstorage, 
// чтобы user_id присвоить константе const user_id = get_user...
get_user_id_from_localstorage();
load_chats();
load_messages();