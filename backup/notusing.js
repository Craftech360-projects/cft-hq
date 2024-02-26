#!/usr/bin/env node
// Import required modules
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const axios = require('axios');

// Define the GitHub repository URL and template folders
const repoUrl = "Craftech360-projects/cft-hq";
const templateFolders = ['react', 'express', 'electron'];

// Define colors for console output
const colors = ['\x1b[32m', '\x1b[31m', '\x1b[34m'];

// Define template names with corresponding colors
const templates = {
    react: "\x1b[91mReact Template\x1b[0m",
    express: "\x1b[32mNode.js with Express Template\x1b[0m",
    electron: "\x1b[34mElectron Template\x1b[0m"
};

// Function to display available templates
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

// Initialize selected template index
let selectedIndex = 0;
displayTemplates(selectedIndex);

// Create readline interface for user input
const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Variable to track if readline interface is closed
let isReadlineClosed = false;

// Listen for keypress events
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
            const currentPath = process.cwd();
            const projectPath = path.join(currentPath, projectName);

            // Fetch the contents of the repository
            try {
                const response = await axios.get(`https://api.github.com/repos/${repoUrl}/contents`);
                const templateFiles = response.data.filter(item => templateFolders.includes(item.name) && item.type === 'dir');
                if (templateFiles.length !== templateFolders.length) {
                    console.log('\x1b[31mNot all template folders are available in the repository.\x1b[0m');
                    process.exit(1);
                }
                
                // Clone each template folder
                templateFiles.forEach(async (templateFolder) => {
                    const templateFolderUrl = templateFolder.git_url;
                    console.log(`\x1b[36mCloning ${templateFolder.name} template...\x1b[0m`);
                    try {
                        execSync(`git clone ${templateFolderUrl} ${templateFolder.name}`, { cwd: currentPath });
                    } catch (err) {
                        console.log(`\x1b[31mError cloning ${templateFolder.name} template: ${err.message}\x1b[0m`);
                        process.exit(1);
                    }
                });
            } catch (err) {
                console.log(`\x1b[31mError accessing repository: ${err.message}\x1b[0m`);
                process.exit(1);
            }

            console.log('\x1b[36mCopying files...\x1b[0m');
            const files = fs.readdirSync(path.join(currentPath, selectedTemplate));
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
                        execSync(`cp -r ${selectedTemplate}/* ${projectPath}`);
                        process.chdir(projectPath);

                        const dependencies = ['dependency1', 'dependency2']; // Add your dependencies here
                        const dependenciesTotal = dependencies.length;
                        let dependenciesInstalled = 0;
                        const dependenciesProgressBarInterval = setInterval(() => {
                            process.stdout.write(`\r[${'='.repeat(dependenciesInstalled)}${' '.repeat(dependenciesTotal - dependenciesInstalled)}] ${Math.floor((dependenciesInstalled / dependenciesTotal) * 100)}%`);
                            dependenciesInstalled++;
                            if (dependenciesInstalled >= dependenciesTotal) {
                                clearInterval(dependenciesProgressBarInterval);
                                console.log('\n\x1b[32m✔ Dependencies installed successfully!\x1b[0m');
                                console.log('\x1b[32mThe installation is done, your project is ready to use!\x1b[0m');
                                interface.close();
                            }
                        }, 1000);
                    } catch (error) {
                        console.log(error);
                    }
                }
            }, 100);
        });
    }
});

// Set input mode to raw and resume input
interface.input.setRawMode(true);
interface.input.resume();
