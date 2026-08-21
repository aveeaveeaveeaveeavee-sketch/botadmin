const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const fs = require('fs');

// CONFIGURACOES - TROQUE ESTES VALORES
const TOKEN = 'MTU0MDIyNzk5NjgxMDQ4MTcwNA.Gv545o.aBuJ0NP4f4GWwfezYJANTDw7RE9DJRuUKOm4kE';
const ADMIN_ROLE_ID = '1540228331331649636';
const PORT = 3000;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const app = express();
app.use(express.json());

const ADMINS_FILE = 'admins.json';

function loadAdmins() {
    try {
        const data = fs.readFileSync(ADMINS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveAdmins(admins) {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2));
}

let admins = loadAdmins();

// API para o Roblox consultar
app.get('/check/:username', (req, res) => {
    const username = req.params.username.toLowerCase();
    const authorized = admins.some(a => a.toLowerCase() === username);
    res.json({ authorized: authorized });
});

app.get('/admins', (req, res) => {
    res.json({ admins: admins });
});

app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
});

// Bot Discord
client.once('ready', () => {
    console.log(`Bot logado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const member = message.member;
    if (!member || !member.roles.cache.has(ADMIN_ROLE_ID)) return;

    const args = message.content.split(' ');
    const command = args[0].toLowerCase();

    if (command === '!addadmin') {
        const username = args[1];
        if (!username) return message.reply('Uso: !addadmin <usuario_roblox>');
        if (!admins.includes(username)) {
            admins.push(username);
            saveAdmins(admins);
            message.reply(`✅ ${username} adicionado como admin!`);
        } else {
            message.reply(`⚠️ ${username} ja e admin.`);
        }
    }

    if (command === '!removeadmin') {
        const username = args[1];
        if (!username) return message.reply('Uso: !removeadmin <usuario_roblox>');
        admins = admins.filter(a => a.toLowerCase() !== username.toLowerCase());
        saveAdmins(admins);
        message.reply(`❌ ${username} removido dos admins.`);
    }

    if (command === '!listadmins') {
        if (admins.length === 0) return message.reply('Nenhum admin cadastrado.');
        const list = admins.map((a, i) => `${i + 1}. ${a}`).join('\n');
        message.reply(`**Lista de Admins:**\n${list}`);
    }
});

client.login(TOKEN);