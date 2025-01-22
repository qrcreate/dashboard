import { onClick,getValue,disableInput,hide,show,onInput } from "https://cdn.jsdelivr.net/gh/jscroot/element@0.1.7/croot.js";
import {validateUserName} from "https://cdn.jsdelivr.net/gh/jscroot/validate@0.0.1/croot.js";
import {postJSON} from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.7/croot.js";
import {getCookie} from "https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js";
import {redirect} from "https://cdn.jsdelivr.net/gh/jscroot/url@0.0.9/croot.js";
import {addCSSIn} from "https://cdn.jsdelivr.net/gh/jscroot/element@0.1.5/croot.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js';
import { id, backend } from "/dashboard/jscroot/url/config.js";

export async function main(){
    onInput('destinasi', validateDestinasiBarang);
    await addCSSIn("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css",id.content);
    onClick("tombolbuatbarang",actionfunctionname);
}

function actionfunctionname(){
    let project={
        destinasi: getValue("destinasi"),
        barang_terlarang: getValue("barang_terlarang")
    };
    if (getCookie("login")===""){
        redirect("../");
    }else{
        postJSON(backend.project.id,"login",getCookie("login"),project,responseFunction);
        hide("tombolbuatbarang");
    }  
}

function responseFunction(result){
    if(result.status === 200){
        const katakata = "Penambahan Barang baru "+result.data._id;
        Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Selamat! barang " + result.data.prohibited_items + " berhasil ditambahkan dengan ID: " + result.data._id,
            footer: '<a href="https://wa.me/62895800006000?text='+katakata+'" target="_blank">Verifikasi Barang</a>',
            didClose: () => {
                disableInput("destinasi");
                disableInput("barang_terlarang");
            }
          });
    }else{
        Swal.fire({
            icon: "error",
            title: result.data.status,
            text: result.data.response
          });
          show("tombolbuatbarang");
    }
    console.log(result);
}