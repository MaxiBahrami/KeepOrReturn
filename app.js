var firebaseConfig = {
    apiKey: "AIzaSyD2wmHG5PWSUaCgcnxckyWHF87gLLpvwXE",
    authDomain: "keep-or-return.firebaseapp.com",
    projectId: "keep-or-return",
    storageBucket: "keep-or-return.appspot.com",
    messagingSenderId: "157519872503",
    appId: "1:157519872503:web:144b4029373e30a36b2ef2",
    measurementId: "G-5J7J8DGEFM"
  };

  // 2. Initialisera Firebase
firebase.initializeApp(firebaseConfig);

// 3. Initialisera Firestore
const db = firebase.firestore();

// 4. Funktion för att ladda butiker i dropdown-menyn
function loadStores() {
    const storeSelect = document.getElementById("store-select");
    storeSelect.innerHTML = "<option value=''>Välj butik</option>";

    db.collection("stores").get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            const store = doc.data();
            const option = document.createElement("option");
            option.value = doc.id;
            option.textContent = store.name;
            storeSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error("Fel vid hämtning av butiker: ", error);
    });
}

// 5. Ladda butiker när sidan laddas
window.onload = function() {
    loadStores();
};

// 6. Lägg till en ny butik
document.getElementById("add-store").addEventListener("click", function() {
    const storeName = document.getElementById("store-name").value.trim();

    if (storeName === "") {
        alert("Ange butikens namn!");
        return;
    }

    db.collection("stores").add({
        name: storeName
    })
    .then(() => {
        alert("Butik tillagd!");
        document.getElementById("store-name").value = "";
        loadStores(); // Uppdatera butikslistan
    })
    .catch(error => {
        console.error("Fel vid tillägg av butik: ", error);
    });
});

// 7. Lägg till en ny vara med anteckningar
document.getElementById("item-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const storeId = document.getElementById("store-select").value;
    const itemName = document.getElementById("item-name").value.trim();
    const itemStatus = document.getElementById("item-status").value;
    const itemNotes = document.getElementById("item-notes").value.trim();

    if (storeId === "") {
        alert("Välj en butik!");
        return;
    }

    if (itemName === "") {
        alert("Ange ett namn för varan!");
        return;
    }

    db.collection("items").add({
        storeId: storeId,
        name: itemName,
        status: itemStatus,
        notes: itemNotes
    })
    .then(() => {
        console.log("Vara tillagd!");
        document.getElementById("item-name").value = "";
        document.getElementById("item-notes").value = "";
        document.getElementById("item-status").value = "keep";
    })
    .catch(error => {
        console.error("Fel vid tillägg av vara: ", error);
    });
});

// 8. Hämta och visa varor i realtid
db.collection("items").onSnapshot((snapshot) => {
    const itemList = document.getElementById("list");
    itemList.innerHTML = "";

    snapshot.forEach((doc) => {
        const item = doc.data();
        const itemId = doc.id;

        // Hämta butikens namn
        db.collection("stores").doc(item.storeId).get()
        .then((storeDoc) => {
            const storeName = storeDoc.exists ? storeDoc.data().name : "Okänd butik";

            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <strong>${item.name}</strong> (${storeName}) - <em>${item.status === "keep" ? "Behåll" : "Returnera"}</em>
                <p>Anteckningar: ${item.notes}</p>
                <button onclick="deleteItem('${itemId}')">Ta bort</button>
            `;
            itemList.appendChild(listItem);
        })
        .catch(error => {
            console.error("Fel vid hämtning av butik: ", error);
        });
    });
});

// 9. Funktion för att ta bort en vara
function deleteItem(id) {
    db.collection("items").doc(id).delete()
    .then(() => {
        console.log("Vara borttagen!");
    })
    .catch(error => {
        console.error("Fel vid borttagning av vara: ", error);
    });
}