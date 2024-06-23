async function get_user_id_from_localstorage() {
  user_id = localStorage.getItem("user_id");
  const response = await fetch(
    `/messenger/api/is_user_exists?user_id=${user_id}`
  );
  const is_user_exists = await response.json();
  if (!user_id || !is_user_exists) {
    user_id = Math.floor(Math.random() * 1000000) + 1;
    localStorage.setItem("user_id", user_id);
    await create_chat_with_admin(user_id); 
  }
  document.querySelector(".user_name").innerHTML += user_id;
}

async function create_chat_with_admin(user_id) {
  const chat_id = await get_response(
    `/messenger/api/create_chat?chat_name=Admin`
  );
  await get_response(
    `/messenger/api/create_chat_user?user_id=${user_id}&chat_id=${chat_id}`
  );
  const admin_message = `Для проверки работоспособности, зайдите в режим инкогнито и получите новый аккаунт, с которым можно начать переписку. Для создания нового чата, нажмите на зеленую кнопку плюс и введите имя в левом нижнем углу второго аккаунта`;
  await get_response(
    `/messenger/api/create_message?user_id=0&chat_id=${chat_id}`,
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
    const response = await fetch(`/messenger/api/get_chats?user_id=${user_id}`);
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
      document.querySelector(".chat-input.chat-input-main").style.display = "block";
    }
    chat.addEventListener("click", () => {
      document.querySelector(".chatlist-chat.active")?.classList.remove("active");
      chat.classList.add("active");
      document.querySelector(".chat-input.chat-input-main").style.display =
        "block";
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
  const response = await fetch(
    `/messenger/api/get_messages?chat_id=${chat_id}&user_id=${user_id}`
  );
  const data = await response.json();
  const bubbles_date_group_section = document.querySelector(".bubbles-date-group");
  bubbles_date_group_section.innerHTML = '';
  bubbles_date_group_section.insertAdjacentHTML("beforeend", data);
}

async function listen_input(ws) {
  const comment_textarea = document.querySelector(".comment_textarea");
  const send_message_button = document.querySelector(".Button_button__JOS9_")

  send_message_button.addEventListener("click", async () => {
    if (comment_textarea.value.length > 0) {
      const chat_id = document.querySelector(".chatlist-chat.active").dataset.peerId;
      ws.send(
        JSON.stringify({
          recipient_id: document.querySelector(
            ".chatlist-chat.active .peer-title"
          ).textContent,
          content: comment_textarea.value,
          chat_id: chat_id,
        })
      );
      await get_response(
        `/messenger/api/create_message?user_id=${await user_id}&chat_id=${chat_id}`,
        comment_textarea.value
      );
      comment_textarea.value = '';
    }
  });

  comment_textarea.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          send_message_button.click();
      }
  });
}

function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const meridiem = hours >= 12 ? "PM" : "AM";

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return `${hours}:${minutes} ${meridiem}`;
}

function listen_add_contact() {
  document.querySelector(".add_contact").addEventListener("click", () => {
    textarea_add_contact.style.display = "flex";
    overflow_add_contact.style.display = "block";
  });
  document
    .querySelector(".overflow_add_contact")
    .addEventListener("click", () => {
      hide_add_contact_window();
    });
}

function hide_add_contact_window() {
  textarea_add_contact.style.display = "none";
  overflow_add_contact.style.display = "none";
  textarea_add_contact.style.border = "";
}

async function listen_add_contact_button(ws) {
  button_add_contact.addEventListener("click", async() => {
    const contact_user_id = contact_textarea.value;
    const response = await fetch(
      `/messenger/api/is_user_exists?user_id=${contact_user_id}`
    );
    const is_user_exists = await response.json();
    const added_contacts = []
    for (let chat_title of document.querySelectorAll(".peer-title")) {
      added_contacts.push(chat_title.textContent);
    }

    if (
      is_user_exists &&
      contact_user_id != user_id &&
      !added_contacts.includes(contact_user_id)
    ) {
      hide_add_contact_window();
      const chat_id = await get_response(
        `/messenger/api/create_chat?chat_name=${contact_user_id}`
      );
      await get_response(
        `/messenger/api/create_chat_user?user_id=${user_id}&chat_id=${chat_id}`
      );
      await get_response(
        `/messenger/api/create_chat_user?user_id=${contact_user_id}&chat_id=${chat_id}`
      );
      window.location.hash = `#${chat_id}`;

      ws.send(
        JSON.stringify({
          type: "reload",
          user_id: contact_user_id,
          chat_id: chat_id
        })
      );
      location.reload();
    } else {
      textarea_add_contact.style.border = "1px solid red";
    }
  });
}

function websocket_onmessage(ws) {
  ws.onmessage = function (event) {
    const response = JSON.parse(event.data);
    if (response.type == 'reload') {
      window.location.hash = `#${response.chat_id}`;
      location.reload()
    }
    if (response.chat_id != get_chat_id_from_url()) {
      return
    }

    document.querySelector(".bubbles-date-group").insertAdjacentHTML(
      "beforeend",
      `<div class="bubbles-group">
      <div class="bubble hide-name can-have-tail is-group-first is-group-last" style="--peer-color-rgb: var(--peer-0-color-rgb); --peer-border-background: var(--peer-0-border-background);">
          <div class="bubble-content-wrapper">
              <div class="bubble-content">
                  <div class="message spoilers-container" dir="auto">
                      ${response.content}
                      <span class="time"><span class="i18n" dir="auto"></span>
                          <div class="time-inner"><span class="i18n" dir="auto">${getCurrentTime()}</span></div>
                      </span></div>
                  </div>
              </div>
            </div>
      </div>`
    );

    const bubbles = document.querySelectorAll(".bubble");
    const lastBubble = bubbles[bubbles.length - 1];
    if (response.user_id == user_id) {
      lastBubble.classList.add("is-out");
    }
    else {
      lastBubble.classList.add("is-in");
    }
    document.querySelector(
      ".chatlist-chat.active .dialog-subtitle-span"
    ).textContent = response.content;
  };
}

const textarea_add_contact = document.querySelector(".textarea_add_contact");
const overflow_add_contact = document.querySelector(".overflow_add_contact");
const button_add_contact = document.querySelector(".button_add_contact");
const contact_textarea = document.querySelector(".contact_textarea");

get_user_id_from_localstorage().then(() => {
  const ws = new WebSocket(
    `ws://${window.location.host}:8003/ws/${user_id}`
  );
  load_chats();
  load_messages();
  listen_input(ws);
  listen_add_contact();
  listen_add_contact_button(ws);
  websocket_onmessage(ws);
});