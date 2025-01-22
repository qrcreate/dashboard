//lib call
import {folderPath} from "https://cdn.jsdelivr.net/gh/jscroot/url@0.0.9/croot.js";
//please always use trailing slash(/) for folder or extension for file.
//never use slash in front of file or directory
//u might change croot parameter based on your path

export const backend={
    user:{
        data:"https://asia-southeast2-civil-epigram-429004-t8.cloudfunctions.net/pibackend/data/user",
        // todo:"https://api.do.my.id/data/user/task/todo",
        // doing:"https://api.do.my.id/data/user/task/doing",
        // done:"https://api.do.my.id/data/user/task/done",
    },
    project:{
        data:"https://asia-southeast2-civil-epigram-429004-t8.cloudfunctions.net/webhook/data/item",
        id:"https://asia-southeast2-civil-epigram-429004-t8.cloudfunctions.net/webhook/data/barang",
        faq:"https://asia-southeast2-civil-epigram-429004-t8.cloudfunctions.net/pibackend/data/faq",
        anggota:"https://api.do.my.id/data/proyek/anggota",
    }
}

export const croot = folderPath()+"jscroot/";

export const folder={
    template:croot+"template/",
    controller : croot+"controller/",
    view : croot+"view/",
}

export const url={
    template:{
        content : folder.template+"content/",
        header: folder.template+"header.html",
        navbar:folder.template+"navbar.html" ,
        settings:folder.template+"settings.html" ,
        sidebar:folder.template+"sidebar.html" ,
        footer:folder.template+"footer.html", 
        rightbar:folder.template+"rightbar.html"
    },
    controller:{
        main : folder.controller+"main.js",
        navbar : folder.controller+"navbar.js"
    },
    view : {
        content:folder.view+"content/",
        header: folder.view+"header.js",
        search:folder.view+"search.js" ,
        settings:folder.view+"settings.js" ,
        navbar:folder.view+"navbar.js" ,
        footer:folder.view+"footer.js" 
    }
}

export const id={
    header:"header__container",
    navbar:"navbar",
    content:"content"
}