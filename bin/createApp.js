#!/usr/bin/env node
const { execSync } = require('child_process'); // Importing execSync to execute shell commands
const path = require('path'); // Importing path module to handle file paths
const fs = require('fs'); // Importing fs module to interact with the file system
const readline = require('readline'); // Importing readline module to interact with the command line
const axios = require('axios'); // Importing axios to make HTTP requests

// Define the GitHub repository URL for each template
const templatesPath = {
    react: "https://github.com/Craftech360-projects/react-boilerplate.git",
    node_express: "https://github.com/Craftech360-projects/node-b.git",
    electron: "https://github.com/Craftech360-projects/node-b.git"
};

// Define colors for styling console output
const colors = ['\x1b[32m', '\x1b[31m', '\x1b[34m'];

// Define the names and descriptions of available templates
const templates = {
    react: "\x1b[91mReact Template\x1b[0m",
    node_express: "\x1b[32mNode.js with Express Template\x1b[0m",
    electron: "\x1b[34mElectron Template\x1b[0m"
};

// Function to display available templates with colors
function displayTemplates(selectedIndex) {
    console.clear();
    console.log('Available boilerplate templates:');
    Object.entries(templates).forEach(([key, value], index) => {
        const color = colors[index % colors.length]; 

        if (index === selectedIndex) {
             console.log(`${color}-> ${key}`);
        } else {
            console.log(`${color}   ${key}`);
        }
    });
}

// Initialize the selected index for template selection
let selectedIndex = 0;
displayTemplates(selectedIndex);

// Create an interface for reading user input from the command line
const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Flag to track if the readline interface is closed
let isReadlineClosed = false;

// Event listener for keypress events
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
        interface.question('\x1b[34mEnter a name for your project: \x1b[0m', async (projectName) => {
            const selectedTemplateRepo = templatesPath[selectedTemplate];
            const currentPath = process.cwd();
            const projectPath = path.join(currentPath, projectName);

            // Clone the template repository
            console.log('\x1b[36mCloning template repository...\x1b[0m');
            try {
                execSync(`git clone ${selectedTemplateRepo} ${projectName}`);
            } catch (err) {
                console.log(`\x1b[31mError cloning repository: ${err.message}\x1b[0m`);
                process.exit(1);
            }

            try {
                fs.mkdirSync(projectPath);
            } catch (err) {
                if (err.code === 'EEXIST') {
                    console.log(`\x1b[31mThe file ${projectName} already exists in the current directory. Please give it another name.\x1b[0m`);
                } else {
                    console.log(err);
                }
                process.exit(1);
            }

            console.log('\x1b[36mCopying files...\x1b[0m');
            const files = fs.readdirSync(projectName);
            const progressBarWidth = 50;
            let progress = 0;
            const progressBarInterval = setInterval(() => {
                process.stdout.write(`\r[${'='.repeat(progress)}${' '.repeat(progressBarWidth - progress)}] ${Math.floor((progress / files.length) * 100)}%`);
                progress++;
                if (progress >= files.length) {
                    clearInterval(progressBarInterval);
                    console.log('\n\x1b[32m✔ Files copied successfully!\x1b[0m');
                    console.log('\x1b[36mInstalling dependencies...\x1b[0m');

                    // Start dependency installation
                    try {
                        process.chdir(projectPath);
                        console.log('\x1b[36mInstalling dependencies...\x1b[0m');
                        execSync('npm install', { stdio: 'inherit' }); // For npm
                        console.log('\x1b[32m✔ Dependencies installed successfully!\x1b[0m');
                        console.log('\x1b[32mThe installation is done, your project is ready to use!\x1b[0m');
                        interface.close();
                    } catch (error) {
                        console.log('\x1b[31mError installing dependencies:\x1b[0m', error);
                        process.exit(1);
                    }
                }
            }, 100);
        });
    }
});

// Enable raw mode for the input stream
interface.input.setRawMode(true);
// Resume the input stream
interface.input.resume();
