function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
}

async function checkPassword() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    const response = await fetch('/api/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // send both
    });
    
    const result = await response.json();
    const strengthClass = result.strength.toLowerCase();
    
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `Password Strength: <strong>${result.strength}</strong>`;
    resultDiv.className = `result ${strengthClass}`;
    
    const criteriaList = Object.entries(result.criteria)
        .map(([key, met]) => `
            <div class="criterion ${met ? 'met' : 'unmet'}">
                ${formatCriterion(key)}: ${met ? '✓' : '✗'}
            </div>
        `).join('');
    
    document.getElementById('criteria').innerHTML = criteriaList;
}

const passwordTemplates = {
    'Basic': { length: 12, uppercase: true, numbers: true, symbols: false },
    'Strong': { length: 16, uppercase: true, numbers: true, symbols: true },
    'PIN': { length: 6, uppercase: false, numbers: true, symbols: false },
    'Passphrase': { length: 20, uppercase: true, numbers: true, symbols: true }
};

function applyTemplate(templateName) {
    const template = passwordTemplates[templateName];
    document.getElementById('length').value = template.length;
    document.getElementById('length-value').textContent = template.length;
    document.getElementById('uppercase').checked = template.uppercase;
    document.getElementById('numbers').checked = template.numbers;
    document.getElementById('symbols').checked = template.symbols;
    generatePassword();
}

function generatePassword() {
    const length = document.getElementById('length').value;
    const useUppercase = document.getElementById('uppercase').checked;
    const useNumbers = document.getElementById('numbers').checked;
    const useSymbols = document.getElementById('symbols').checked;
    
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let chars = lowercase;
    if (useUppercase) chars += uppercase;
    if (useNumbers) chars += numbers;
    if (useSymbols) chars += symbols;
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    document.getElementById('generated-password').textContent = password;
}

function formatCriterion(key) {
    return key.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Initialize range slider value display
document.getElementById('length').addEventListener('input', function() {
    document.getElementById('length-value').textContent = this.value;
});