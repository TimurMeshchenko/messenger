const comment_textarea = document.querySelector(".Input_input___YBKm");
const button_submit_comment = document.querySelector(".Button_button__JOS9_");

comment_textarea?.addEventListener("input", () => change_comment_post_state());

function change_comment_post_state() {
  const textarea_length = comment_textarea.value.replace(/\s/g, "").length;

  if (textarea_length > 500) {
    button_submit_comment.type = "button";
    button_submit_comment.style.color = "red";
  } else {
    button_submit_comment.type = "submit";
    button_submit_comment.style.color = "black";
  }

  comment_textarea.style.height = "auto";
  comment_textarea.style.height = comment_textarea.scrollHeight + "px";
}
