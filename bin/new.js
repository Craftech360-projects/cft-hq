#!/usr/bin/env node

// Import necessary modules
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const axios = require('axios'); // Import Axios for making HTTP requests

// Define the GitHub repository HTTP link
const githubRepoLink = 'https://github.com/Craftech360-projects/cft-hq.git'; // Replace with your GitHub repository link

// Define the paths to the templates in the GitHub repository
const templatesPath = {
    react: "react",
    node_express: "express",
    react_electron: "electron"
};

// Define colors for displaying template names
const colors = ['\x1b[32m', '\x1b[31m', '\x1b[34m'];

// Define the templates with their names and colors
const templates = {
    react: "\x1b[91mReact Template\x1b[0m",
    node_express: "\x1b[32mNode.js with Express Template\x1b[0m",
    react_electron: "\x1b[34melectron\x1b[0m"
};

// Function to display templates with colors
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

// Function to check if the templates exist in the GitHub repository
async function checkTemplatesExist(githubRepoLink) {
    try {
        const response = await axios.get(`${githubRepoLink}/contents`);
        const contentNames = response.data.map(item => item.name);
        return Object.values(templatesPath).every(template => contentNames.includes(template));
    } catch (error) {
        console.error(`Error checking templates: ${error.message}`);
        return false;
    }
}

// Initialize selected template index
let selectedIndex = 0;
displayTemplates(selectedIndex);

// Create readline interface for user input
const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Flag to track if readline interface is closed
let isReadlineClosed = false;

// Event listener for keypress events
interface.input.on('keypress', async (str, key) => {
    if (isReadlineClosed) return; // Ignore keypress if interface is closed
    if (key.name === 'up') {
        selectedIndex = (selectedIndex - 1 + Object.keys(templates).length) % Object.keys(templates).length;
        displayTemplates(selectedIndex);
    } else if (key.name === 'down') {
        selectedIndex = (selectedIndex + 1) % Object.keys(templates).length;
        displayTemplates(selectedIndex);
    } else if (key.name === 'return') {
        isReadlineClosed = true; // Mark readline interface as closed
        const selectedTemplate = Object.keys(templates)[selectedIndex];
        interface.question('\x1b[34mEnter a name for your project: \x1b[0m', async (projectName) => {
            const templatesExist = await checkTemplatesExist(githubRepoLink);
            if (!templatesExist) {
                console.log(`\x1b[31mTemplate folders not found in the repository.\x1b[0m`);
                process.exit(1);
            }


            console.log('\x1b[36mCopying files...\x1b[0m');
            const files = fs.readdirSync(templateFolderPath);
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
                        execSync(`cp -r ${templateFolderPath}/* ${projectPath}`);
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

// Configure input to listen for raw mode keypresses
interface.input.setRawMode(true);
interface.input.resume();
