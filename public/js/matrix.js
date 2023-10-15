const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

const charSets = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん",
    "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
    "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"
];

const fontSize = 12;
let columns = canvas.width / fontSize;
const drops = [];
const columnCharSets = [];
const startDelays = [];
let startTime = Date.now();

function initializeMatrix() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    columns = canvas.width / fontSize;

    for (let i = 0; i < columns; i++) {
        columnCharSets[i] = charSets[Math.floor(Math.random() * charSets.length)];
        drops[i] = Math.floor(Math.random() * -canvas.height / fontSize);  // Negative random start position for each column
        startDelays[i] = Math.random() * 5000; // Random delay up to 5 seconds
    }
    startTime = Date.now();
}

window.addEventListener('resize', function() {
    initializeMatrix();
});

function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff00";
    ctx.font = fontSize + "px Courier New";

    let currentTime = Date.now();

    for (let i = 0; i < drops.length; i++) {
        const text = columnCharSets[i].charAt(Math.floor(Math.random() * columnCharSets[i].length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Only update the drop's position if the current time has surpassed its start delay
        if (currentTime - startTime > startDelays[i]) {
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
}

setInterval(draw, 44);

// Call the initializeMatrix function to set the initial state
initializeMatrix();
