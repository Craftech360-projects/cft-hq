#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const templatesPath = {
    react: "https://github.com/Craftech360-projects/react-boilerplate.git",
    node_express: "https://github.com/Craftech360-projects/node-b.git",
    electron: "https://github.com/Craftech360-projects/node-b.git",
    node_socket: "https://github.com/Craftech360-projects/boilerplate-nodejs.git"
};

const colors = ['\x1b[32m', '\x1b[31m', '\x1b[34m', '\x1b[39m'];

const templates = {
    react: "\x1b[91mReact\x1b[0m",
    node_express: "\x1b[32mNode.js\x1b[0m",
    electron: "\x1b[34melectron\x1b[0m",
    node_socket: "\x1b[34mnode-socket\x1b[0m"
};

function displayTemplates(selectedIndex) {
    console.clear();
    console.log('Available boilerplate templates:');
    Object.entries(templates).forEach(([key, value], index) => {
        const color = colors[index % colors.length]; 

        if (index === selectedIndex) {
             console.log(`${color}-> ${value}`);
        } else {
            console.log(`${color}   ${value}`);
        }
    });
}

let selectedIndex = 0;
displayTemplates(selectedIndex);

const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let isReadlineClosed = false;

interface.input.on('keypress', (str, key) => {
    if (isReadlineClosed) return;
    if (key.name === 'up') {
        selectedIndex = (selectedIndex - 1 + Object.keys(templates).length) % Object.keys(templates).length;
        displayTemplates(selectedIndex);
    } else if (key.name === 'down') {
        selectedIndex = (selectedIndex + 1) % Object.keys(templates).length;
        displayTemplates(selectedIndex);
    } else if (key.name === 'return') {

        isReadlineClosed = true;

        
        const selectedTemplate = Object.keys(templates)[selectedIndex];
        const selectedTemplateUrl = templatesPath[selectedTemplate];
        
        interface.question('\x1b[34mEnter a name for your project: \x1b[0m', (projectName) => {
            const currentPath = process.cwd();
            const projectPath = path.join(currentPath, projectName);

            if (fs.existsSync(projectPath)) {
                console.log(`\x1b[31mThe file ${projectName} already exists in the current directory. Please give it another name.\x1b[0m`);
                process.exit(1);
            }

            console.log('\x1b[36mDownloading Template...\x1b[0m');
            try {
                execSync(`git clone ${selectedTemplateUrl} "${projectPath}"`);
                console.log('\x1b[32m✔ Template Downloaded successfully!\x1b[0m');
                fs.rmdirSync(path.join(projectPath, '.git'), { recursive: true });
                console.log('\x1b[36mInstalling dependencies...\x1b[0m');
                // You may want to run npm install or similar commands here
            } catch (error) {
                console.error(`\x1b[31mFailed to Download the template: ${error.message}\x1b[0m`);
                process.exit(1);
            }


            interface.close();
        });
    }
});

interface.input.setRawMode(true);
interface.input.resume();
