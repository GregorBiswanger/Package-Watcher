"use strict";

import * as vscode from "vscode";
import {Package, PackageWatcher} from "./PackageWatcher";
import {NpmService} from "./NpmService";
import {BowerService} from "./BowerService";

let npmPackageWatcher: PackageWatcher;
let bowerPackageWatcher: PackageWatcher;
let outputChannel: vscode.OutputChannel;
let npmService: NpmService;
let bowerService: BowerService;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel("Package watcher");
    context.subscriptions.push(outputChannel);

    startNpmWatch(context);
    startBowerWatch(context);
}

function startNpmWatch(context: vscode.ExtensionContext) {
    let path = vscode.workspace.rootPath + "/package.json";

    initNpmWatcher(path);

    let watcher = vscode.workspace.createFileSystemWatcher(path);
    watcher.onDidChange((e) => {
        if (isNpmWatcherDeactivated()) {
            initNpmWatcher(path);
        }

        vscode.workspace.openTextDocument(path).then((file) => {
            let packageJson: Package = JSON.parse(file.getText());
            npmPackageWatcher.changed(packageJson, (newPackages, deletedPackes) => {
                // Install
                npmService.install(newPackages.dependencies, writeOutput);
                npmService.install(newPackages.devDependencies, writeOutput);

                // Uninstall
                npmService.uninstall(deletedPackes.dependencies, writeOutput);
                npmService.uninstall(deletedPackes.devDependencies, writeOutput);
            });
        });
    });

    context.subscriptions.push(watcher);
}

function isNpmWatcherDeactivated() {
    return !npmPackageWatcher;
}

function initNpmWatcher(path: string) {
    vscode.workspace.openTextDocument(path).then((file) => {
        let packageJson: Package = JSON.parse(file.getText());
        npmPackageWatcher = new PackageWatcher(packageJson);
        npmService = new NpmService(vscode.workspace.rootPath);
    });
}

function startBowerWatch(context: vscode.ExtensionContext) {
    let path = vscode.workspace.rootPath + "/bower.json";

    initBowerWatcher(path);

    let watcher = vscode.workspace.createFileSystemWatcher(path);
    watcher.onDidChange((e) => {
        if (isBowerWatcherDeactivated()) {
            initBowerWatcher(path);
        }

        vscode.workspace.openTextDocument(path).then((file) => {
            let bowerJson: Package = JSON.parse(file.getText());
            bowerPackageWatcher.changed(bowerJson, (newPackages, deletedPackes) => {
                // Install
                bowerService.install(newPackages.dependencies, writeOutput);
                bowerService.install(newPackages.devDependencies, writeOutput);

                // Uninstall
                bowerService.uninstall(deletedPackes.dependencies, writeOutput);
                bowerService.uninstall(deletedPackes.devDependencies, writeOutput);
            });
        });
    });

    context.subscriptions.push(watcher);
}

function isBowerWatcherDeactivated() {
    return !bowerPackageWatcher;
}

function initBowerWatcher(path: string) {
    vscode.workspace.openTextDocument(path).then((file) => {
        let bowerJson: Package = JSON.parse(file.getText());
        bowerPackageWatcher = new PackageWatcher(bowerJson);
        bowerService = new BowerService(vscode.workspace.rootPath);
    });
}

function writeOutput(message: string) {
    outputChannel.append(message);
}

export function deactivate() {
}