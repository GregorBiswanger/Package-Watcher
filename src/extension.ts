"use strict";

import * as vscode from "vscode";
import {Package, PackageWatcher} from "./PackageWatcher";
import {NpmService} from "./NpmService";

let packageWatcher: PackageWatcher;
let outputChannel: vscode.OutputChannel;
let npmService: NpmService;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel("Package watcher");
    context.subscriptions.push(outputChannel);

    let path = vscode.workspace.rootPath + "/package.json";

    vscode.workspace.openTextDocument(path).then((file) => {
        let packageJson: Package = JSON.parse(file.getText());
        packageWatcher = new PackageWatcher(packageJson);
        npmService = new NpmService(vscode.workspace.rootPath);
    });

    let watcher = vscode.workspace.createFileSystemWatcher(path);
    watcher.onDidChange((e) => {
        vscode.workspace.openTextDocument(path).then((file) => {
            let packageJson: Package = JSON.parse(file.getText());
            packageWatcher.changed(packageJson, (newPackages, deletedPackes) => {
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

function writeOutput(message: string) {
    outputChannel.append(message);
}

export function deactivate() {
}



