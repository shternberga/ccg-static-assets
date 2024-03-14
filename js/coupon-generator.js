document.addEventListener('DOMContentLoaded', () => {
    initForm();
});

let generatedCodes = new Set(); 

function initForm() {
    const form = document.querySelector('.ccg-coupon-form');
    const codesArea = getDefaultCodesArea();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        resetCodesArea(codesArea);
        await generateAndDisplayCodes(codesArea);
    });
}

function getDefaultCodesArea() {
    const codesArea = document.querySelector('.codes-area');
    codesArea.style.justifyContent = 'center';
    codesArea.innerHTML = '<div class="inner-rectangle">Coupon codes will appear here...</div>';
    return codesArea;
}

function resetCodesArea(codesArea) {
    codesArea.innerHTML = '';
    codesArea.style.justifyContent = 'flex-start';
}

async function generateAndDisplayCodes(codesArea) {
    const numberOfCodes = parseInt(document.getElementById('numCodes').value, 10);
    const prefix = document.getElementById('prefix').value;
    const postfix = document.getElementById('postfix').value;
    const separator = document.getElementById('includeDashes').checked ? '-' : '';
    const format = document.getElementById('caseOptions').value;
    const codeLength = parseInt(document.getElementById('codeFormat').value, 10);

    let codesGenerated = 0;

    while (codesGenerated < numberOfCodes) {
        const code = await generateCode(prefix, postfix, separator, format, codeLength);
        if (!generatedCodes.has(code)) {
            generatedCodes.add(code);
            displayCode(code, codesArea);
            codesGenerated++;
        }
    }
}

async function generateCode(prefix, postfix, separator, format, length) {
    let uniquePart = await generateUniquePart(length, format);
    let chunkSize;
    if (length % 4 === 0 && length !== 4) {
        chunkSize = 4;
    } else if (length % 3 === 0 && length !== 3) {
        chunkSize = 3;
    } else if (length === 4) {
        chunkSize = 2;
    } else {
        chunkSize = 3; 
    }

    uniquePart = uniquePart.match(new RegExp('.{1,' + chunkSize + '}', 'g')).join(separator);
    let code = (prefix ? prefix + separator : '') + uniquePart + (postfix ? separator + postfix : '');

    return code;
}

async function generateUniquePart(length, format) {
    let uniquePart = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(Date.now() + Math.random().toString()));
    uniquePart = Array.from(new Uint8Array(uniquePart)).map(b => b.toString(16).padStart(2, '0')).join('');

    switch (format) {
        case 'uppercase':
            uniquePart = uniquePart.toUpperCase();
            break;
        case 'lowercase':
            uniquePart = uniquePart.toLowerCase();
            break;            
        case 'numbers':
            uniquePart = Array.from(uniquePart).map(c => isNaN(c) ? '' : c).join(''); // remove non-numeric characters
            break;
        case 'mixed':
            uniquePart = Array.from(uniquePart).map(c => Math.random() < 0.5 ? c.toUpperCase() : c).join('');
            break;
        default:
            uniquePart = Array.from(uniquePart).map(c => Math.random() < 0.5 ? c.toUpperCase() : c).join('');
    }

    return Array.from({ length }, () => uniquePart.charAt(Math.floor(Math.random() * uniquePart.length))).join('');
}

function displayCode(code, container) {
    const codeElement = document.createElement('div');
    codeElement.className = 'code-element';
    codeElement.innerText = code;
    container.appendChild(codeElement);
}

function setupButtons() {
    document.querySelector('.buttons .ccg-btn.copy').addEventListener('click', copyCodesToClipboard);
    document.querySelector('.buttons .ccg-btn.export').addEventListener('click', exportCodesToCSV);
}

async function copyCodesToClipboard() {
    const codes = getCodesFromDOM().join('\n');
    try {
        await navigator.clipboard.writeText(codes);
        alert('Codes copied to clipboard!');
    } catch (err) {
        console.error('Error copying codes to clipboard:', err);
    }
}

function exportCodesToCSV() {
    const codes = getCodesFromDOM();
    const csvContent = codes.map(e => `"${e}"`).join("\n");
    downloadCSV(csvContent, 'generated_codes.csv');
}

function getCodesFromDOM() {
    const codes = document.querySelectorAll('.codes-area .code-element');
    return Array.from(codes).map(code => code.textContent);
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function validateNumberInput(input) {
    if (input.value > 10000) {
        input.value = 10000;
    }
    if (input.value < 0) {
        input.value = 0;
    }
}

let timeoutId;

function validateCodeFormatInput(input) {
    clearTimeout(timeoutId); 

    timeoutId = setTimeout(function() {
        if (input.value !== "" && (input.value < 4 || input.value > 20)) {
            if (input.value < 4) {
                input.value = 4;
            } else if (input.value > 20) {
                input.value = 20;
            }
        } 
    }, 500); 
}

// Initialization
setupButtons();
