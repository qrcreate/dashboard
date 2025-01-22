import { onClick,getValue,disableInput,hide,show,onInput } from "https://cdn.jsdelivr.net/gh/jscroot/element@0.1.7/croot.js";
import {validateUserName} from "https://cdn.jsdelivr.net/gh/jscroot/validate@0.0.1/croot.js";
import {postJSON} from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.7/croot.js";
import {getCookie} from "https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js";
import {redirect} from "https://cdn.jsdelivr.net/gh/jscroot/url@0.0.9/croot.js";
import {addCSSIn} from "https://cdn.jsdelivr.net/gh/jscroot/element@0.1.5/croot.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js';
import { id, backend } from "/dashboard/jscroot/url/config.js";

export async function main(){
  onInput('question', validateQuestion);
  await addCSSIn("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css",id.content);
  onClick("tombolbuatfaq",handleFAQSubmit);
}

function handleFAQSubmit() {
  let project={
    question: getValue("question"),
    answer: getValue("answer"),
  };
  if (getCookie("login") === "") {
    redirect("../");
  } else {
    postJSON(
      backend.project.faq,
      "login",
      getCookie("login"),
      project,
      handleFAQResponse
    );
    hide("tombolbuatfaq");
  }
}

function handleFAQResponse(result) {
  if (result.status === 200) {
    const katakata = "New FAQ Creation "+result.data._id;
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Congratulations! FAQ " + result.data.faq + " has been successfully registered with ID: " + result.data._id,
      footer: '<a href="https://wa.me/62895800006000?text='+katakata+'" target="_blank">Verifikasi FAQ</a>',
      didClose: () => {
        disableInput("question");
        disableInput("answer");
      },
    });
  } else {
    Swal.fire({
      icon: "error",
      title: result.data.status,
      text: result.data.response,
    });
    show("tombolbuatfaq");
  }
  console.log(result);
}
