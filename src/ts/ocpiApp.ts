/*
 * Copyright 2014-2024 GraphDefined GmbH <achim.friedland@graphdefined.com>
 * This file is part of OCPIExplorer <https://github.com/OpenChargingCloud/OCPIExplorerDesktopApp>
 *
 * Licensed under the Affero GPL license, Version 3.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.gnu.org/licenses/agpl.html
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as OCPI from './OCPIExplorer';

// Automagic imports to be included in the HTML of the final app...
import '@fortawesome/fontawesome-free/css/all.min.css';


declare global {
    interface Window {

        onConnectionSettingsDropDragOver:   (event: DragEvent) => void;
        onConnectionSettingsDropDragLeave:  (event: DragEvent) => void;
        onConnectionSettingsDrop:           (event: DragEvent) => void;

        onFileDropDragOver:                 (event: DragEvent) => void;
        onFileDropDragLeave:                (event: DragEvent) => void;
        onFileDrop:                         (event: DragEvent) => void;

    }
}

class ocpiApp {

    //#region Data

    private readonly ipcRenderer = require('electron').ipcRenderer;

    private readonly appDiv:                             HTMLDivElement;
    private readonly cliParameters:                      any;

    private readonly connectScreen:                      HTMLDivElement;
    private readonly dropArea:                           HTMLDivElement;
    private readonly ocpiEndpoint:                       HTMLDivElement;
    private readonly connectionSettingsDropArea:         HTMLDivElement;
    private readonly connectionSettingsDropAreaTextDiv:  HTMLDivElement;
    private readonly fileDropArea:                       HTMLDivElement;
    private readonly fileDropAreaTextDiv:                HTMLDivElement;
    private readonly fileSelectButton:                   HTMLButtonElement;

    private readonly ocpiVersionsURLInput:               HTMLInputElement;
    private readonly ocpiAccessTokenInput:               HTMLInputElement;
    private readonly accessTokenEncodingCheck:           HTMLInputElement;

    private readonly ocpiExplorerApp:                    OCPI.OCPIExplorer;
    private readonly LogView:                            HTMLDivElement;

    //#endregion

    constructor()
    {

        //#region Expose the following methods to the global scope

        window.onConnectionSettingsDropDragOver   = this.onConnectionSettingsDropDragOver.bind(this);
        window.onConnectionSettingsDropDragLeave  = this.onConnectionSettingsDropDragLeave.bind(this);
        window.onConnectionSettingsDrop           = this.onConnectionSettingsDrop.bind(this);

        window.onFileDropDragOver                 = this.onFileDropDragOver.bind(this);
        window.onFileDropDragLeave                = this.onFileDropDragLeave.bind(this);
        window.onFileDrop                         = this.onFileDrop.bind(this);

        //#endregion


        //#region Process CLI Parameters

        this.cliParameters                      = this.ipcRenderer.               sendSync     ('getCLIParameters');

        //#endregion

        this.appDiv                             = document.                       querySelector("#app")                         as HTMLDivElement;

        this.connectScreen                      = this.appDiv.                    querySelector("#connectScreen")               as HTMLDivElement;

        this.dropArea                           = this.connectScreen.             querySelector("#dropArea")                    as HTMLDivElement;
        this.ocpiEndpoint                       = this.connectScreen.             querySelector("#ocpiEndpoint")                as HTMLDivElement;
        this.connectionSettingsDropArea         = this.connectScreen.             querySelector("#connectionSettingsDropArea")  as HTMLDivElement;
        this.connectionSettingsDropAreaTextDiv  = this.connectionSettingsDropArea.querySelector(".text")                        as HTMLDivElement;

        this.fileDropArea                       = this.connectScreen.             querySelector("#fileDropArea")                as HTMLDivElement;
        this.fileDropAreaTextDiv                = this.fileDropArea.              querySelector(".text")                        as HTMLDivElement;
        this.fileSelectButton                   = this.fileDropAreaTextDiv.       querySelector("#fileSelectButton")            as HTMLButtonElement;
        this.fileSelectButton.onclick = () => {

            const fileInput     = document.createElement('input');
            fileInput.type      = 'file';
            fileInput.accept    = '.json';
            fileInput.multiple  = true;
            fileInput.onchange  = (event) => {

                const files = (event.target as HTMLInputElement).files;

                if (files && files.length > 0) {
                    this.onFileDrop(new DragEvent('drop', { dataTransfer: new DataTransfer() }));
                    this.processFiles(files);
                }

            };

            fileInput.click();

        };

        this.ocpiVersionsURLInput               = this.connectScreen.querySelector("#ocpiVersionsURLInput")      as HTMLInputElement;
        this.ocpiAccessTokenInput               = this.connectScreen.querySelector("#ocpiAccessTokenInput")      as HTMLInputElement;
        this.accessTokenEncodingCheck           = this.connectScreen.querySelector("#accessTokenEncodingCheck")  as HTMLInputElement;

        this.LogView                            = document.          querySelector("#logView")                   as HTMLDivElement;

        this.ocpiExplorerApp                    = new OCPI.OCPIExplorer(
                                                      this.appDiv,
                                                      this.cliParameters.ocpiVersionsURL,
                                                      this.cliParameters.ocpiAccessToken,
                                                     !this.cliParameters.ocpiAccessTokenBase64
                                                  );

    }


    //#region Connection Settings Drag&Drop

    private onConnectionSettingsDropDragOver(event: DragEvent) {

        event.preventDefault();

        if (event.dataTransfer)
        {

            event.dataTransfer.dropEffect = 'copy';

            if (this.dropArea.contains(event.target as Node))
            {

                event.stopPropagation();

                this.connectionSettingsDropArea.classList.remove('error');
                this.connectionSettingsDropArea.classList.add   ('active');
                this.ocpiEndpoint.style.opacity = "hidden";

            }

        }

    }

    private onConnectionSettingsDropDragLeave(event: DragEvent) {

        event.preventDefault();

        if (event.target === this.connectionSettingsDropArea) {

            event.stopPropagation();

            this.connectionSettingsDropArea.classList.remove('active');
            this.ocpiEndpoint.style.visibility = "visible";

        }

    }

    private async onConnectionSettingsDrop(event: DragEvent) {

        event.preventDefault();

        if (event.dataTransfer) {

            event.stopPropagation();

            this.connectionSettingsDropArea.classList.remove('error');

            let   text:     string|undefined  = undefined;
            let   url:      string|undefined  = undefined;
            let   token:    string|undefined  = undefined;
            let   encoding: string|undefined  = undefined;

            const file = event.dataTransfer.files[0];
            if (file) {
                try {
                    text = await this.readFileAsText(file);
                } catch (error) {
                    this.connectionSettingsDropArea.classList.add('error');
                    this.connectionSettingsDropAreaTextDiv.textContent = "Invalid connection settings file!";
                }
            }

            else
                text = event.dataTransfer.getData("text");


            if (text)
            {

                //#region Try to parse the JSON format

                try {

                    const json = JSON.parse(text);

                    if (json.urls && Array.isArray(json.urls)) {
                        const validURLs = json.urls.filter((url: string) =>
                            url.startsWith('http://')  ||
                            url.startsWith('https://') ||
                            url.startsWith('ws://')    ||
                            url.startsWith('wss://')
                        );
                        if (validURLs.length > 0)
                            url = validURLs[Math.floor(Math.random() * validURLs.length)];
                    }

                    url       = json.url;
                    token     = json.token;
                    encoding  = json.encoding;

                }
                catch (error) {
                }

                //#endregion

                //#region Try to parse the text format

                // Always use the last URL and token found in the text...
                if (url === undefined && token === undefined) {

                    // urls: https://example.org, http://evil.org ...choose one randomly!
                    const urlsMatch      = [...text.matchAll(/urls\s*:\s*(.*)/g)];
                    if (urlsMatch.length > 0) {

                        const validURLs = urlsMatch[urlsMatch.length-1]![1]?.split(',').map(url => url.trim()).filter((url: string) =>
                                              url.startsWith('http://')  ||
                                              url.startsWith('https://') ||
                                              url.startsWith('ws://')    ||
                                              url.startsWith('wss://')
                                          ) ?? [];

                        if (validURLs.length > 0)
                            url = validURLs[Math.floor(Math.random() * validURLs.length)];

                    }

                    if (url === undefined) {
                        const urlMatch   = [...text.matchAll(/url\s*:\s*(https?:\/\/[^\s]+|http?:\/\/[^\s]+|ws?:\/\/[^\s]+|wss?:\/\/[^\s]+)/g)];
                        url              = urlMatch.     length > 0 ? urlMatch     [urlMatch.     length-1]![1] : undefined;
                    }

                    const tokenMatch     = [...text.matchAll(/token\s*:\s*([^\s]+)/g)];
                    token                = tokenMatch.   length > 0 ? tokenMatch   [tokenMatch.   length-1]![1] : undefined;

                    const encodingMatch  = [...text.matchAll(/encoding\s*:\s*([^\s]+)/g)];
                    encoding             = encodingMatch.length > 0 ? encodingMatch[encodingMatch.length-1]![1] : undefined;

                }

                //#endregion

            }

            if (url === undefined && token === undefined) {

                this.connectionSettingsDropArea.classList.add('error');
                this.connectionSettingsDropAreaTextDiv.textContent = "Invalid connection settings!";

                setTimeout(() => {
                    this.connectionSettingsDropArea.classList.remove('error');
                    this.ocpiEndpoint.style.visibility = "visible";
                }, 3000);

            }

            if (url)
                this.ocpiVersionsURLInput.value = url;

            if (token)
                this.ocpiAccessTokenInput.value = token;

            if (encoding)
                this.accessTokenEncodingCheck.checked = encoding === "base64";


            this.connectionSettingsDropArea.classList.remove('active');
            this.ocpiEndpoint.style.visibility = "visible";

        }

    }

    //#endregion


    //#region File Drag&Drop

    private onFileDropDragOver(event: DragEvent) {

        event.preventDefault();

        if (event.dataTransfer)
        {

            if (event.ctrlKey) {
                event.dataTransfer.dropEffect = 'link';
            } else {
                event.dataTransfer.dropEffect = 'copy';
            }

            this.fileDropArea.classList.remove('error');
            this.fileDropArea.classList.add   ('active');

        }

    }

    private onFileDropDragLeave(event: DragEvent) {

        event.preventDefault();
        event.stopPropagation();

        this.fileDropArea.classList.remove('active');

    }

    private async onFileDrop(event: DragEvent) {

        event.preventDefault();
        console.log("handleFileDrop");

        this.fileDropArea.classList.remove('active');

        if (event.dataTransfer &&
            event.dataTransfer.files.length > 0) {

            this.processFiles(event.dataTransfer.files);

        }

    }


    private async processFiles(files: FileList) {

        const jsonFiles = new Array<any>();
        const errors    = new Array<string>();

        for (const file of Array.from(files)) {
            try {
                jsonFiles.push(
                    JSON.parse(
                        await this.readFileAsText(file)
                    )
                );
            } catch (error) {
                errors.push(`Invalid JSON file '${file.name}'!`);
            }
        }

        if (errors.length > 0) {
            this.fileDropArea.classList.add('error');
            this.fileDropAreaTextDiv.innerHTML = errors.join('<br>');
        }

        else if (jsonFiles.length > 0)
            this.processJSONFiles(jsonFiles);

    }

    private readFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result != null && typeof reader.result === 'string')
                    resolve(reader.result);
                else
                    reject(new Error("File reading error"));
            };
            reader.onerror = () => reject(new Error("File reading error"));
            reader.readAsText(file);
        });
    }

    private processJSONFiles(jsonData: Array<any>) {

        this.fileDropArea.classList.remove('error');
        this.fileDropAreaTextDiv.textContent = "Valid JSON file(s) dropped!";

    }

    //#endregion

}

document.addEventListener('DOMContentLoaded', (event) => {
    const app = new ocpiApp();
});


