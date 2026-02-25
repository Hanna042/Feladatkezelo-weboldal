const API_CIM = "https://jsonplaceholder.typicode.com/todos";


const feladatLista = document.getElementById("feladatLista");
const ujFeladatForm = document.getElementById("ujFeladatForm");
const ujFeladatCim = document.getElementById("ujFeladatCim");
const temaValtasGomb = document.getElementById("Temavalto");
const kereso = document.getElementById("keresoInput");
const keresGomb = document.getElementById("keresGomb");
const keresTorlesGomb = document.getElementById("keresTorlesGomb");


let szabadIdK = [];
let sajatFeladatok = [];


function kovetkezoId() {
    if (szabadIdK.length > 0) {
        return szabadIdK.shift();
    }
    return null;
}


async function feladatokBetoltese() {
    feladatLista.innerHTML = "";
    
    try {
        const valasz = await fetch(API_CIM);
        const adatok = await valasz.json();
        
        let hasznaltIdK = new Set();
        let maxId = 0;
        
        const osszesFeladat = [...sajatFeladatok, ...adatok];
        
        osszesFeladat.forEach(feladat => {
            let keszAllapot = feladat.completed;
            
            const li = document.createElement("div");
            li.className = "card";
            
            const szoveg = document.createElement("span");
            szoveg.className = "feladat-szoveg";
            szoveg.textContent = `${feladat.title} (ID: ${feladat.id})`;
            
            const checkboxDiv = document.createElement("div");
            checkboxDiv.className = "checkboxContainer";
            
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `checkbox_${feladat.id}`;
            checkbox.checked = keszAllapot;
            
            const label = document.createElement("label");
            label.htmlFor = `checkbox_${feladat.id}`;
            label.textContent = keszAllapot ? "Kész" : "Nincs kész";
            
            checkbox.addEventListener("change", function() {
                const ujStatusz = checkbox.checked;
                statuszValtoztat(feladat.id, ujStatusz, szoveg, checkbox, label);
                keszAllapot = ujStatusz;
            });
            
            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            
            const torlesGomb = document.createElement("button");
            torlesGomb.className = "torlesGomb";
            torlesGomb.textContent = "Törlés";
            
            torlesGomb.addEventListener("click", function() {
                feladatTorlese(feladat.id, li);
            });
            
            li.appendChild(szoveg);
            li.appendChild(checkboxDiv);
            li.appendChild(torlesGomb);
            feladatLista.appendChild(li);
            
            hasznaltIdK.add(feladat.id);
            if (feladat.id > maxId) {
                maxId = feladat.id;
            }
        });
        
        szabadIdK = [];
        for (let i = 1; i <= maxId; i++) {
            if (!hasznaltIdK.has(i)) {
                szabadIdK.push(i);
            }
        }
    } catch (hiba) {
        console.error("Hiba a betöltéskor:", hiba);
    }
}


async function keres() {
    const keresendo = kereso.value.toLowerCase().trim();
    
    if (keresendo === "") {
        feladatokBetoltese();
        return;
    }
    
    try {
        const valasz = await fetch(API_CIM);
        const adatok = await valasz.json();
        
        const apiTalalatok = adatok.filter(feladat => 
            feladat.title.toLowerCase().includes(keresendo)
        );
        
        const sajatTalalatok = sajatFeladatok.filter(feladat => 
            feladat.title.toLowerCase().includes(keresendo)
        );
        
        const talalatok = [...sajatTalalatok, ...apiTalalatok];
        
        feladatLista.innerHTML = "";
        
        if (talalatok.length === 0) {
            const nincsElem = document.createElement("div");
            nincsElem.className = "nincsTalalat";
            nincsElem.textContent = "Nincs találat";
            feladatLista.appendChild(nincsElem);
            return;
        }
        
        talalatok.forEach(feladat => {
            let keszAllapot = feladat.completed;
            
            const li = document.createElement("div");
            li.className = "card";
            
            const szoveg = document.createElement("span");
            szoveg.className = "feladat-szoveg";
            szoveg.textContent = `${feladat.title} (ID: ${feladat.id})`;
            
            const checkboxDiv = document.createElement("div");
            checkboxDiv.className = "checkboxContainer";
            
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `checkbox_${feladat.id}`;
            checkbox.checked = keszAllapot;
            
            const label = document.createElement("label");
            label.htmlFor = `checkbox_${feladat.id}`;
            label.textContent = keszAllapot ? "Kész" : "Nincs kész";
            
            checkbox.addEventListener("change", function() {
                const ujStatusz = checkbox.checked;
                statuszValtoztat(feladat.id, ujStatusz, szoveg, checkbox, label);
                keszAllapot = ujStatusz;
            });
            
            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            
            const torlesGomb = document.createElement("button");
            torlesGomb.className = "torlesGomb";
            torlesGomb.textContent = "Törlés";
            
            torlesGomb.addEventListener("click", function() {
                feladatTorlese(feladat.id, li);
            });
            
            li.appendChild(szoveg);
            li.appendChild(checkboxDiv);
            li.appendChild(torlesGomb);
            feladatLista.appendChild(li);
        });
    } catch (hiba) {
        console.error("Hiba a kereséskor:", hiba);
    }
}


async function statuszValtoztat(id, ujStatusz, szovegElem, checkboxElem, labelElem) {
    const frissitettFeladat = {
        completed: ujStatusz
    };
    
    try {
        const valasz = await fetch(`${API_CIM}/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(frissitettFeladat)
        });
        const adat = await valasz.json();
        
        labelElem.textContent = ujStatusz ? "Kész" : "Nincs kész";
        
        const sajatIndex = sajatFeladatok.findIndex(f => f.id === id);
        if (sajatIndex !== -1) {
            sajatFeladatok[sajatIndex].completed = ujStatusz;
        }
    } catch (hiba) {
        console.error("Hiba a státusz módosításakor:", hiba);
    }
}


async function feladatTorlese(id, liElem) {
    try {
        const valasz = await fetch(`${API_CIM}/${id}`, {
            method: "DELETE"
        });
        
        if (valasz.ok) {
            liElem.remove();
            
            szabadIdK.push(id);
            szabadIdK.sort((a, b) => a - b);
            
            sajatFeladatok = sajatFeladatok.filter(f => f.id !== id);
        }
    } catch (hiba) {
        console.error("Hiba a törléskor:", hiba);
    }
}


async function ujFeladatHozzaadasa(cim, id) {
    const ujFeladat = {
        title: cim,
        completed: false,
        userId: 1,
        id: id
    };
    
    sajatFeladatok.push(ujFeladat);
    
    try {
        const valasz = await fetch(API_CIM, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ujFeladat)
        });
        const adat = await valasz.json();
        
        let keszAllapot = false;
        
        const li = document.createElement("div");
        li.className = "card";
        
        const szoveg = document.createElement("span");
        szoveg.className = "feladat-szoveg";
        szoveg.textContent = `${cim} (ID: ${id})`;
        
        const checkboxDiv = document.createElement("div");
        checkboxDiv.className = "checkboxContainer";
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `checkbox_${id}`;
        checkbox.checked = false;
        
        const label = document.createElement("label");
        label.htmlFor = `checkbox_${id}`;
        label.textContent = "Nincs kész";
        
        checkbox.addEventListener("change", function() {
            const ujStatusz = checkbox.checked;
            statuszValtoztat(id, ujStatusz, szoveg, checkbox, label);
            keszAllapot = ujStatusz;
        });
        
        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        
        const torlesGomb = document.createElement("button");
        torlesGomb.className = "torlesGomb";
        torlesGomb.textContent = "Törlés";
        
        torlesGomb.addEventListener("click", function() {
            feladatTorlese(id, li);
        });
        
        li.appendChild(szoveg);
        li.appendChild(checkboxDiv);
        li.appendChild(torlesGomb);
        feladatLista.appendChild(li);
        
        ujFeladatCim.value = "";
    } catch (hiba) {
        console.error("Hiba a hozzáadáskor:", hiba);
    }
}


ujFeladatForm.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const ujId = kovetkezoId();
    
    if (ujId) {
        ujFeladatHozzaadasa(ujFeladatCim.value, ujId);
    } else {
        let maxId = 0;
        document.querySelectorAll("#feladatLista li").forEach(li => {
            const idEgyezes = li.textContent.match(/ID: (\d+)/);
            if (idEgyezes) {
                const id = parseInt(idEgyezes[1]);
                if (id > maxId) maxId = id;
            }
        });
        
        if (maxId === 0) maxId = 200;
        ujFeladatHozzaadasa(ujFeladatCim.value, maxId + 1);
    }
});


temaValtasGomb.addEventListener("click", function() {
    document.body.classList.toggle("sotet-mod");
});


keresGomb.addEventListener("click", keres);


kereso.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        keres();
    }
});


keresTorlesGomb.addEventListener("click", function() {
    kereso.value = "";
    feladatokBetoltese();
});

feladatokBetoltese();