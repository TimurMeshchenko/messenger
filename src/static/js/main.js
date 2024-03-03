async function get_user_id_from_localstorage() {
  let user_id = localStorage.getItem("user_id");
  const response = await fetch(`/api/is_user_exists?user_id=${user_id}`);
  const is_user_exists = await response.json();
  if (!user_id || !is_user_exists) {
    user_id = Math.floor(Math.random() * 1000000) + 1;
    localStorage.setItem("user_id", user_id);
    await create_chat_with_admin(user_id); 
  }
  document.querySelector(".user_name").innerHTML += user_id;
  return user_id;
}

async function create_chat_with_admin(user_id) {
  const chat_id = await get_response(`/api/create_chat?chat_name=Admin`);
  await get_response(
    `/api/create_chat_user?user_id=${user_id}&chat_id=${chat_id}`
  );
  const admin_message = `Для проверки работоспособности, зайдите в режим инкогнито и получите новый аккаунт, с которым можно начать переписку.`;
  await get_response(
    `/api/create_message?user_id=0&chat_id=${chat_id}`,
    admin_message
  );
}

async function get_response(url, data=null) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await response.json()
}

async function load_chats() {
    // const response = await fetch("/api/get_chats?user_id=1");
    const response = await fetch(`/api/get_chats?user_id=${await user_id}`);
    const data = await response.json();
    const chatlist_ul = document.querySelector(".chatlist");
    chatlist_ul.insertAdjacentHTML('afterbegin', data)
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
      document.querySelector(".chatlist-chat.active")?.classList.remove("active");
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
  // const response = await fetch(`/api/get_messages?chat_id=${chat_id}&user_id=1`);
  const response = await fetch(`/api/get_messages?chat_id=${chat_id}&user_id=${await user_id}`);
  const data = await response.json();
  const bubbles_date_group_section = document.querySelector(".bubbles-date-group");
  bubbles_date_group_section.innerHTML = '';
  bubbles_date_group_section.insertAdjacentHTML("beforeend", data);
}

async function listen_input() {
  document
  .querySelector(".Button_button__JOS9_")
  .addEventListener("click", async () => {
    if (comment_textarea.value.length > 0) {
      const chat_id = document.querySelector(".chatlist-chat.active").dataset.peerId;
      const bubbles_date_group = document.querySelector(".bubbles-date-group");
      await get_response(
        `/api/create_message?user_id=${await user_id}&chat_id=${chat_id}`,
        comment_textarea.value
      );
      bubbles_date_group.insertAdjacentHTML(
        "beforeend",
        `<div class="bubbles-group">
        <div class="bubble hide-name is-out can-have-tail is-group-first is-group-last" style="--peer-color-rgb: var(--peer-0-color-rgb); --peer-border-background: var(--peer-0-border-background);">
            <div class="bubble-content-wrapper">
                <div class="bubble-content">
                    <div class="message spoilers-container" dir="auto">
                        ${comment_textarea.value}
                        <span class="time"><span class="i18n" dir="auto"></span>
                            <div class="time-inner"><span class="i18n" dir="auto">${getCurrentTime()}</span></div>
                        </span></div>
                    </div>
                </div>
              </div>
        </div>`
      );
      comment_textarea.value = '';
    }
  });
}

function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const meridiem = hours >= 12 ? "PM" : "AM";

  return `${hours}:${minutes} ${meridiem}`;
}

function listen_add_contact() {
  const textarea_add_contact = document.querySelector(".textarea_add_contact");
  const overflow_add_contact = document.querySelector(".overflow_add_contact");
  document.querySelector(".add_contact").addEventListener("click", () => {
    textarea_add_contact.style.display = "flex";
    overflow_add_contact.style.display = "block";
  });
  document
    .querySelector(".overflow_add_contact")
    .addEventListener("click", () => {
      textarea_add_contact.style.display = "none";
      overflow_add_contact.style.display = "none";
    });
}

const user_id = get_user_id_from_localstorage();
load_chats();
load_messages();
listen_input();
listen_add_contact();