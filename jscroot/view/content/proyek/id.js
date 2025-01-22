import {
    getValue,
    onInput,
  } from "https://cdn.jsdelivr.net/gh/jscroot/element@0.1.7/croot.js";
  import { validatePhoneNumber } from "https://cdn.jsdelivr.net/gh/jscroot/validate@0.0.2/croot.js";
  import { postJSON } from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.7/croot.js";
  import { deleteJSON } from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.8/croot.js";
  import { putJSON } from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.8/croot.js";
  import { getJSON } from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.7/croot.js";
  import { getCookie } from "https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js";
  import { addCSSIn } from "https://cdn.jsdelivr.net/gh/jscroot/element@0.1.5/croot.js";
  import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
  import { id, backend } from "/dashboard/jscroot/url/config.js";
  import { loadScript } from "../../../controller/main.js";
  import { truncateText, addRevealTextListeners } from "../../utils.js";
  
  let dataTable;
  
  export async function main() {
    await addCSSIn(
      "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css",
      id.content
    );
    await addCSSIn("assets/css/custom.css", id.content);
    await loadScript("https://code.jquery.com/jquery-3.6.0.min.js");
    await loadScript("https://cdn.datatables.net/2.0.8/js/dataTables.min.js");
  
    getJSON(
      backend.project.id,
      "login",
      getCookie("login"),
      getResponseFunction
    );
  }
  
  function reloadDataTable() {
    if (dataTable) {
      dataTable.destroy(); // Destroy the existing DataTable
    }
    getJSON(
      backend.project.id,
      "login",
      getCookie("login"),
      getResponseFunction
    );
  }
  
  function getResponseFunction(result) {
    console.log(result);
    const tableBody = document.getElementById("webhook-table-body-id");
    if (tableBody) {
      if (result.status === 200) {
        // Clear existing table body content to avoid duplication
        tableBody.innerHTML = "";
  
        // Destroy existing DataTable instance if it exists
        if ($.fn.DataTable.isDataTable("#myTable")) {
          $("#myTable").DataTable().destroy();
        }
  
        // Menambahkan baris untuk setiap webhook dalam data JSON
        result.data.forEach((barang) => {
          const truncatedDescription = truncateText(barang.barang_terlarang, 50);

          const row = document.createElement("tr");
          
          row.innerHTML = `
            <td>${barang.destinasi}</td>
            <td class="has-text-justified">
              ${truncatedDescription}
              <span class="full-text" style="display:none;">${barang.barang_terlarang || "N/A"}</span>
            </td>
            <td class="has-text-centered">
              <button class="button is-danger removeBarangButton"  data-barang-id="${barang.id_item}">
                <i class="bx bx-trash"></i>          
              </button>
              <button class="button is-warning editBarangButton" data-barang-id="${barang.id_item}" data-barang-terlarang="${barang.barang_terlarang}" data-barang-destinasi="${barang.destinasi}">
                <i class="bx bx-edit"></i>
              </button>
            </td>
          `;
          tableBody.appendChild(row);
          console.log("Setting data-barang-id:", barang.id_item);
        });
  
        // Initialize DataTable after populating the table body
        dataTable = $("#myTable").DataTable({
          responsive: true,
          autoWidth: false,
        });
  
        addRevealTextListeners();
        // addMemberButtonListeners(); //  event listener tambah member
        // addRemoveMemberButtonListeners(); //  event listener hapus member
        addRemoveBarangButtonListeners();
        addEditBarangButtonListeners(); //  event listener edit project
      } else {
        Swal.fire({
          icon: "error",
          title: result.data.status,
          text: result.data.response,
        });
      }
    } else {
      console.error('Element with ID "webhook-table-body-id" not found.');
      console.log("Barang ID:", barnag.id_item);
    }
  }
  
  // Add project event listener
  document.getElementById("addButtonId").addEventListener("click", () => {
    Swal.fire({
      title: "Tambah Barang Terlarang",
      html: `
              <div class="field">
                  <label class="label">Destinasi</label>
                  <div class="control">
                      <input class="input" type="text" id="destinasi" placeholder="masukan destinasi atau negara">
                  </div>
              </div>
              <div class="field">
                  <label class="label">Barang Terlarang</label>
                  <div class="control">
                      <textarea class="textarea" id="barang_terlarang" placeholder="Tulis barang terlarang"></textarea>
                  </div>
              </div>
          `,
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const destinasi = Swal.getPopup().querySelector("#destinasi").value;
        const barangTerlarang= Swal.getPopup().querySelector("#barang_terlarang").value;
  
        if (!destinasi || !barangTerlarang) {
          Swal.showValidationMessage(`Please enter all fields`);
        } else {
          return {
            destinasi: destinasi,
            barang_terlarang: barangTerlarang,
          };
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        let resultData = {
          destinasi: getValue("destinasi"),
          barang_terlarang: getValue("barang_terlarang"),
        };
        if (getCookie("login") === "") {
          redirect("/login");
        } else {
          postJSON(
            backend.project.id,
            "login",
            getCookie("login"),
            resultData,
            responseFunction
          );
        }
      }
    });
  });
  
  
  function responseFunction(result) {
    if (result.status === 200) {
      const katakata = "Pembuatan proyek baru " + result.data._id;
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text:
          "Selamat kak barang " +
          result.data.barang_terlarang +
          " sudah terdaftar dengan ID: " +
          result.data._id,
        footer:
          '<a href="https://wa.me/62895800006000?text=' +
          katakata +
          '" target="_blank">Verifikasi Barang</a>',
        didClose: () => {
          reloadDataTable();
        },
      });
    } else {
      Swal.fire({
        icon: "error",
        title: result.data.status,
        text: result.data.response,
      });
    }
    console.log(result);
  }

  // Remove project mechanism
  function addRemoveBarangButtonListeners() {
    document.getElementById("myTable").addEventListener("click", async (event) => {
      if (event.target.closest(".removeBarangButton")) {
        const button = event.target.closest(".removeBarangButton");
        const barangId = button.getAttribute("data-barang-id");
    
        console.log("Deleting item with ID:", barangId);
    
        if (!barangId || barangId.trim() === "" || barangId === "undefined") {
          console.error("Barang ID is missing or invalid:", barangId);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Barang ID is missing or invalid.",
          });
          return;
        }
    
        const result = await Swal.fire({
          title: "Hapus barang ini?",
          text: "Kamu tidak dapat mengembalikan aksi ini!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Hapus barang",
          cancelButtonText: "Kembali",
        });
    
        if (result.isConfirmed) {
          const barangWillBeDeleted = { _id: barangId.trim() };
          console.log("Payload sent to deleteJSON:", barangWillBeDeleted);
    
          deleteJSON(
            backend.project.id,
            "login",
            getCookie("login"),
            barangWillBeDeleted,
            removeProjectResponse
          );
        }
      }
    });    
  }
  
  function removeProjectResponse(result) {
    if (result.status === 200) {
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Barang has been removed.",
        didClose: () => {
          reloadDataTable();
        },
      });
    } else {
      Swal.fire({
        icon: "error",                                                       
        title: result.data.status,
        text: result.data.response,
      });
    }
    console.log(result);
  }
  
  function addEditBarangButtonListeners() {
    document.getElementById("myTable").addEventListener("click", async (event) => {
      if (event.target.closest(".editBarangButton")) {
        const button = event.target.closest(".editBarangButton");
        const barangId = button.getAttribute("data-barang-id");
        const barangTerlarang = button.getAttribute("data-barang-terlarang");
        const barangDestinasi = button.getAttribute("data-barang-destinasi");
    
        const { value: formValues } = await Swal.fire({
          title: "Edit Barang Terlarang",
          html: `
            <div class="field">
              <label class="label">Destinasi</label>
              <div class="control">
                <input class="input" type="text" id="destinasi" value="${barangDestinasi}">
              </div>
            </div>
            <div class="field">
              <label class="label">Barang Terlarang</label>
              <div class="control">
                <textarea class="textarea" id="barang_terlarang">${barangTerlarang}</textarea>
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "Update",
          cancelButtonText: "Cancel",
          preConfirm: () => {
            const destinasi = Swal.getPopup().querySelector("#destinasi").value;
            const barangTerlarang = Swal.getPopup().querySelector("#barang_terlarang").value;
    
            if (!destinasi || !barangTerlarang) {
              Swal.showValidationMessage(`Please enter all fields`);
            }
    
            return { destinasi, barangTerlarang };
          },
        });
    
        if (formValues) {
          const { destinasi, barangTerlarang } = formValues;
    
          const updatedBarang = {
            id_item: barangId,
            destinasi: destinasi,
            barang_terlarang: barangTerlarang,
          };
    
          console.log("Payload sent to backend:", updatedBarang);
          putJSON(
            backend.project.id, 
            "login",
            getCookie("login"),
            updatedBarang,
            updateResponseFunction
          );
        }
      }
    });    
  }
  
  function updateResponseFunction(result) {
    if (result.status === 200) {
      Swal.fire({
        icon: "success",
        title: "Barang Updated",
        text: `Barang updated successfully.`,
        didClose: () => {
          reloadDataTable();
        },
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: result.data.details || "Failed to update barang.",
      });
    }
    console.log(result);
  }
  