import * as childProcess from "child_process";
import {Dependency} from "./PackageWatcher";

export class NpmService {
    constructor(private rootPath: string) { }

    install(dependency: Dependency, stateCallback: StateCallback) {
        for (let key in dependency) {
            stateCallback(`Installing NPM package ${key} version ${dependency[key]}\n`);

            let command = `npm install ${key}`;

            if (dependency[key] !== "*") {
                command += `@${dependency[key]}`;
            }

            let installProcess = childProcess.exec(command, { cwd: this.rootPath, env: process.env });
            installProcess.stderr.on("data", (stateMessage) => {
                stateCallback(stateMessage);
            });

            installProcess.stdout.on("data", (stateMessage) => {
                stateCallback(stateMessage);
            });
        }
    }

    uninstall(dependency: Dependency, stateCallback: StateCallback) {
        for (let key in dependency) {
            stateCallback(`Uninstalling NPM package ${key} version ${dependency[key]}\n`);

            let command = `npm uninstall ${key}`;
            let installProcess = childProcess.exec(command, { cwd: this.rootPath, env: process.env });
            installProcess.stderr.on("data", (stateMessage) => {
                stateCallback(stateMessage);
            });

            installProcess.stdout.on("data", (stateMessage) => {
                stateCallback(stateMessage);
            });
        }
    }
}

export interface StateCallback {
    (state): any;
}