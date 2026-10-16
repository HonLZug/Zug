{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fmodern\fcharset0 Courier;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 const STORAGE_KEY = "honl-zugvergabe-v1";\
\
const categories = [\
    \{ key: "vs", label: "VS", max: 30 \},\
    \{ key: "donations", label: "Spenden", max: 15 \},\
    \{ key: "guard", label: "Wache", max: 3 \},\
    \{ key: "zombies", label: "Zombies", max: 3 \},\
    \{ key: "canyon", label: "Schlucht", max: 10 \},\
    \{ key: "desert", label: "W\'fcste", max: 15 \},\
    \{ key: "svs", label: "SvS", max: 15 \},\
    \{ key: "fairness", label: "Fairness", max: 8 \}\
];\
\
let members = loadMembers();\
\
const memberForm = document.getElementById("memberForm");\
const playerName = document.getElementById("playerName");\
const memberTable = document.getElementById("memberTable");\
const rankingTable = document.getElementById("rankingTable");\
\
function loadMembers() \{\
    try \{\
        const stored = localStorage.getItem(STORAGE_KEY);\
        return stored ? JSON.parse(stored) : [];\
    \} catch (error) \{\
        console.error("Daten konnten nicht geladen werden:", error);\
        return [];\
    \}\
\}\
\
function saveMembers() \{\
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));\
\}\
\
function escapeHTML(value) \{\
    return String(value).replace(/[&<>"']/g, character => (\{\
        "&": "&amp;",\
        "<": "&lt;",\
        ">": "&gt;",\
        '"': "&quot;",\
        "'": "&#39;"\
    \})[character]);\
\}\
\
function calculateMemberPoints(member) \{\
    const vs = Number(member.vs) || 0;\
    const donations = Number(member.donations) || 0;\
    const guard = Number(member.guard) || 0;\
    const zombies = Number(member.zombies) || 0;\
    const canyon = Number(member.canyon) || 0;\
    const desert = Number(member.desert) || 0;\
    const svs = Number(member.svs) || 0;\
    const fairness = Number(member.fairness) || 0;\
\
    // Vorl\'e4ufige Berechnung:\
    // Die Punkte werden addiert und auf die jeweiligen\
    // Kategorieh\'f6chstwerte begrenzt.\
    const total =\
        Math.min(30, Math.max(0, vs)) +\
        Math.min(15, Math.max(0, donations)) +\
        Math.min(3, Math.max(0, guard)) +\
        Math.min(3, Math.max(0, zombies)) +\
        Math.min(10, Math.max(0, canyon)) +\
        Math.min(15, Math.max(0, desert)) +\
        Math.min(15, Math.max(0, svs)) +\
        Math.min(8, Math.max(0, fairness));\
\
    return total;\
\}\
\
function renderMembers() \{\
    if (members.length === 0) \{\
        memberTable.innerHTML = `\
            <tr>\
                <td colspan="11" class="empty-state">\
                    Noch keine Mitglieder vorhanden.\
                </td>\
            </tr>\
        `;\
        renderRanking();\
        updateStats();\
        return;\
    \}\
\
    memberTable.innerHTML = members.map(member => \{\
        const total = calculateMemberPoints(member);\
\
        const inputs = categories.map(category => `\
            <td>\
                <input\
                    type="number"\
                    min="0"\
                    max="$\{category.max\}"\
                    step="1"\
                    value="$\{Number(member[category.key]) || 0\}"\
                    aria-label="$\{category.label\} Punkte f\'fcr $\{escapeHTML(member.name)\}"\
                    data-id="$\{member.id\}"\
                    data-category="$\{category.key\}"\
                >\
            </td>\
        `).join("");\
\
        return `\
            <tr>\
                <td>$\{escapeHTML(member.name)\}</td>\
                $\{inputs\}\
                <td class="total-cell">$\{total\}</td>\
                <td>\
                    <button\
                        class="button button-danger"\
                        data-delete="$\{member.id\}"\
                    >\
                        L\'f6schen\
                    </button>\
                </td>\
            </tr>\
        `;\
    \}).join("");\
\
    renderRanking();\
    updateStats();\
\}\
\
function renderRanking() \{\
    const sorted = [...members].sort((a, b) => \{\
        return calculateMemberPoints(b) - calculateMemberPoints(a)\
            || a.name.localeCompare(b.name, "de");\
    \});\
\
    if (sorted.length === 0) \{\
        rankingTable.innerHTML = `\
            <tr>\
                <td colspan="5" class="empty-state">\
                    Noch keine Auswertung vorhanden.\
                </td>\
            </tr>\
        `;\
        return;\
    \}\
\
    rankingTable.innerHTML = sorted.map((member, index) => `\
        <tr>\
            <td>$\{index + 1\}</td>\
            <td>$\{escapeHTML(member.name)\}</td>\
            <td class="total-cell">$\{calculateMemberPoints(member)\}</td>\
            <td>$\{escapeHTML(member.lastTrain || "Noch nicht erfasst")\}</td>\
            <td>$\{member.active === false ? "Inaktiv" : "Aktiv"\}</td>\
        </tr>\
    `).join("");\
\}\
\
function updateStats() \{\
    document.getElementById("memberCount").textContent = members.length;\
\
    const totalPoints = members.reduce(\
        (sum, member) => sum + calculateMemberPoints(member),\
        0\
    );\
\
    document.getElementById("totalPoints").textContent = totalPoints;\
\
    // Die 14 Pl\'e4tze sind sieben Zugf\'fchrer- und sieben VIP-Termine.\
    document.getElementById("openSlots").textContent = 14;\
\}\
\
memberForm.addEventListener("submit", event => \{\
    event.preventDefault();\
\
    const name = playerName.value.trim();\
\
    if (!name) return;\
\
    const exists = members.some(\
        member => member.name.toLowerCase() === name.toLowerCase()\
    );\
\
    if (exists) \{\
        alert("Dieses Mitglied ist bereits eingetragen.");\
        return;\
    \}\
\
    members.push(\{\
        id: crypto.randomUUID(),\
        name,\
        vs: 0,\
        donations: 0,\
        guard: 0,\
        zombies: 0,\
        canyon: 0,\
        desert: 0,\
        svs: 0,\
        fairness: 0,\
        lastTrain: "",\
        active: true\
    \});\
\
    saveMembers();\
    renderMembers();\
    playerName.value = "";\
    playerName.focus();\
\});\
\
memberTable.addEventListener("change", event => \{\
    const input = event.target;\
\
    if (!input.matches("input[data-id][data-category]")) return;\
\
    const member = members.find(item => item.id === input.dataset.id);\
    if (!member) return;\
\
    const category = categories.find(\
        item => item.key === input.dataset.category\
    );\
\
    if (!category) return;\
\
    const value = Number(input.value);\
\
    member[category.key] = Math.min(\
        category.max,\
        Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0)\
    );\
\
    saveMembers();\
    renderMembers();\
\});\
\
memberTable.addEventListener("click", event => \{\
    const button = event.target.closest("button[data-delete]");\
    if (!button) return;\
\
    const member = members.find(item => item.id === button.dataset.delete);\
    if (!member) return;\
\
    if (!confirm(`Mitglied "$\{member.name\}" wirklich l\'f6schen?`)) return;\
\
    members = members.filter(item => item.id !== member.id);\
\
    saveMembers();\
    renderMembers();\
\});\
\
document.getElementById("calculateButton").addEventListener("click", () => \{\
    renderMembers();\
    alert("Punkte wurden neu berechnet.");\
\});\
\
document.getElementById("exportButton").addEventListener("click", () => \{\
    const headers = [\
        "Spieler",\
        ...categories.map(category => category.label),\
        "Gesamtpunkte"\
    ];\
\
    const rows = members.map(member => [\
        member.name,\
        ...categories.map(category => Number(member[category.key]) || 0),\
        calculateMemberPoints(member)\
    ]);\
\
    const csv = [headers, ...rows]\
        .map(row => row.map(value => \{\
            const safeValue = String(value).replace(/"/g, '""');\
            return `"$\{safeValue\}"`;\
        \}).join(";"))\
        .join("\\r\\n");\
\
    const blob = new Blob(\
        ["\\uFEFF" + csv],\
        \{ type: "text/csv;charset=utf-8;" \}\
    );\
\
    const url = URL.createObjectURL(blob);\
    const link = document.createElement("a");\
\
    link.href = url;\
    link.download = "honl-zugvergabe.csv";\
    link.click();\
\
    URL.revokeObjectURL(url);\
\});\
\
document.getElementById("resetButton").addEventListener("click", () => \{\
    const confirmed = confirm(\
        "Wirklich alle gespeicherten Mitglieder und Punkte l\'f6schen? " +\
        "Diese Aktion kann nicht r\'fcckg\'e4ngig gemacht werden."\
    );\
\
    if (!confirmed) return;\
\
    members = [];\
    saveMembers();\
    renderMembers();\
\});\
\
renderMembers();\
}