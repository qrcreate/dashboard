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
    backend.project.data,
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
    backend.project.data,
    "login",
    getCookie("login"),
    getResponseFunction
  );
}

function getResponseFunction(result) {
  console.log(result);
  const tableBody = document.getElementById("webhook-table-body");
  if (tableBody) {
    if (result.status === 200) {
      // Clear existing table body content to avoid duplication
      tableBody.innerHTML = "";

      // Destroy existing DataTable instance if it exists
      if ($.fn.DataTable.isDataTable("#myTable")) {
        $("#myTable").DataTable().destroy();
      }

      // Menambahkan baris untuk setiap webhook dalam data JSON
      result.data.forEach((item) => {
        const truncatedDescription = truncateText(item.prohibited_items, 50);

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.destination}</td>
          <td class="has-text-justified">
            ${truncatedDescription}
            <span class="full-text" style="display:none;">${item.prohibited_items || "N/A"}</span>
          </td>
          <td class="has-text-centered">
            <button class="button is-danger removeProjectButton" data-item-id="${item.id_item}">
              <i class="bx bx-trash"></i>          
            </button>
            <button class="button is-warning editProjectButton" data-item-id="${item.id_item}" data-item-prohibited="${item.prohibited_items}" data-item-destination="${item.destination}">
              <i class="bx bx-edit"></i>
            </button>
          </td>
        `;
        tableBody.appendChild(row);
        console.log("Item ID:", item.id_item); // Debugging log
      });

      // Initialize DataTable after populating the table body
      dataTable = $("#myTable").DataTable({
        responsive: true,
        autoWidth: false,
      });

      addRevealTextListeners();
      // addMemberButtonListeners(); //  event listener tambah member
      // addRemoveMemberButtonListeners(); //  event listener hapus member
      addRemoveProjectButtonListeners();
      addEditProjectButtonListeners(); //  event listener edit project
    } else {
      Swal.fire({
        icon: "error",
        title: result.data.status,
        text: result.data.response,
      });
    }
  } else {
    console.error('Element with ID "webhook-table-body" not found.');
  }
}


// Add project event listener
document.getElementById("addButton").addEventListener("click", () => {
  Swal.fire({
    title: "Add Prohibited Items",
    html: `
            <div class="field">
                <label class="label">Destination</label>
                <div class="control">
                    <input class="input" type="text" id="destination" placeholder="Enter Destination">
                </div>
            </div>
            <div class="field">
                <label class="label">Prohibited Item</label>
                <div class="control">
                    <textarea class="textarea" id="prohibited_items" placeholder="Enter Prohibited Item"></textarea>
                </div>
            </div>
        `,
    showCancelButton: true,
    confirmButtonText: "Add",
    cancelButtonText: "Cancel",
    preConfirm: () => {
      const destination = Swal.getPopup().querySelector("#destination").value;
      const prohibitedItems = Swal.getPopup().querySelector("#prohibited_items").value;

      if (!destination || !prohibitedItems) {
        Swal.showValidationMessage(`Please enter all fields`);
      } else {
        return {
          destination : destination,
          prohibited_items: prohibitedItems,
        };
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      let resultData = {
        destination: getValue("destination"),
        prohibited_items: getValue("prohibited_items"),
      };
      if (getCookie("login") === "") {
        redirect("../");
      } else {
        postJSON(
          backend.project.data,
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
    const katakata = "Add Prohibited Item " + result.data._id;
    Swal.fire({
      icon: "success",
      title: "success",
      text:
        "Congratulations! The item " +
        result.data.item +
        " has been successfully registered with ID: " +
        result.data._id,
      footer:
        '<a href="https://wa.me/62895800006000?text=' +
        katakata +
        '" target="_blank">Verifikasi Item</a>',
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
function addRemoveProjectButtonListeners() {
  document.getElementById("myTable").addEventListener("click", async (event) => {
    if (event.target.closest(".removeProjectButton")) {
      const button = event.target.closest(".removeProjectButton");
      const itemId = button.getAttribute("data-item-id");
  
      console.log("Deleting item with ID:", itemId);
  
      if (!itemId || itemId === "undefined") {
        console.error("Item ID is missing or invalid:", itemId);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Item ID is missing or invalid.",
        });
        return;
      }
  
      const result = await Swal.fire({
        title: "Delete this item?",
        text: "You cannot undo this action!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete item",
        cancelButtonText: "Cancel",
      });
  
      if (result.isConfirmed) {
        const itemWillBeDeleted = { _id: itemId.trim() };
  
        console.log("Payload sent to deleteJSON:", itemWillBeDeleted);
  
        deleteJSON(
          backend.project.data,
          "login",
          getCookie("login"),
          itemWillBeDeleted,
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
      text: "Item has been removed.",
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

function addEditProjectButtonListeners() {
  document.getElementById("myTable").addEventListener("click", async (event) => {
    if (event.target.closest(".editProjectButton")) {
      const button = event.target.closest(".editProjectButton");
      const itemId = button.getAttribute("data-item-id");
      const itemProhibited = button.getAttribute("data-item-prohibited");
      const itemDestination = button.getAttribute("data-item-destination");
  
      const { value: formValues } = await Swal.fire({
        title: "Edit Item",
        html: `
          <div class="field">
            <label class="label">Destination</label>
            <div class="control">
              <input class="input" type="text" id="destination" value="${itemDestination}">
            </div>
          </div>
          <div class="field">
            <label class="label">Prohibited Item</label>
            <div class="control">
              <textarea class="textarea" id="prohibited_items">${itemProhibited}</textarea>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Update",
        cancelButtonText: "Cancel",
        preConfirm: () => {
          const destination = Swal.getPopup().querySelector("#destination").value;
          const prohibited_items = Swal.getPopup().querySelector("#prohibited_items").value;
  
          if (!destination || !prohibited_items) {
            Swal.showValidationMessage(`Please enter all fields`);
          }
  
          return { destination, prohibited_items };
        },
      });
  
      if (formValues) {
        const updatedItem = {
          id_item: itemId.trim(),
          destination: formValues.destination,
          prohibited_items: formValues.prohibited_items,
        };
  
        console.log("Payload to Backend:", updatedItem);
  
        putJSON(
          backend.project.data,
          "login",
          getCookie("login"),
          updatedItem,
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
      title: "Item Updated",
      text: `Item ${result.data.prohibitedItems} has been updated successfully.`,
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