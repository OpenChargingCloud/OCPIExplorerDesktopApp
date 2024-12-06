/*
 * Copyright 2018-2024 GraphDefined GmbH <achim.friedland@graphdefined.com>
 * This file is part of OCPIExplorer <https://github.com/OpenChargingCloud/OCPIExplorer>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface ElectronAPI {

    onWebSocketClientConnected: (callback: (data: { clientId: string, clientName: string, remoteSocket:  string, subprotocol: string }) => void) => void;
    onWSTextMessage:            (callback: (data: { clientId: string, clientName: string, textMessage:   string })                      => void) => void;
    onWSBinaryMessage:          (callback: (data: { clientId: string, clientName: string, binaryMessage: Buffer })                      => void) => void;
    onWSClientDisconnected:     (callback: (data: { clientId: string })                                                                 => void) => void;

    sendWSTextMessage:          (clientId: string, textMessage:   string) => void;
    sendWSBinaryMessage:        (clientId: string, binaryMessage: Buffer) => void;

    on:                         (callback: (ocpiVersionsURL: string, ocpiAccessToken: string) => void) => void;
        // const validChannels = ['init-params'];
    //     if (validChannels.includes(channel)) {
    //         ipcRenderer.on(channel, (event, ...args) => callback(event, ...args));
    //     }
    // //   }

}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}


import * as OCPPv2_1   from './IOCPIv2_1_1';
import * as OCPPv2_2   from './IOCPIv2_2_1';

interface WriteToScreenDelegate {
    (message: string|Element): void;
}

export class OCPIExplorer {

    //#region Data

    private          ocpiAccessToken:                                   string  = "";
    private          ocpiAccessTokenEncoding:                           boolean = false;

    private readonly appDiv:                                            HTMLDivElement;
    private readonly connectScreen:                                     HTMLDivElement;
    private readonly ocpiVersionsURLInput:                              HTMLInputElement;
    private readonly ocpiAccessTokenInput:                              HTMLInputElement;
    private readonly accessTokenEncodingCheck:                          HTMLInputElement;
    private readonly connectButton:                                     HTMLButtonElement;

    private readonly versionsScreen:                                    HTMLDivElement;
    private readonly versionsDiv:                                       HTMLDivElement;
    private readonly versionsHTMLDiv:                                   HTMLDivElement;
    private readonly versionsJSONDiv:                                   HTMLDivElement;
    private readonly versionsScreenBottom:                              HTMLDivElement;
    private readonly versionsScreenBackButton:                          HTMLButtonElement;

    private readonly versionDetailsScreen:                              HTMLDivElement;
    private readonly versionDetailsDiv:                                 HTMLDivElement;
    private readonly versionDetailsHTMLDiv:                             HTMLDivElement;
    private readonly versionDetailsJSONDiv:                             HTMLDivElement;
    private readonly versionDetailsScreenBottom:                        HTMLDivElement;
    private readonly versionDetailsScreenBackButton:                    HTMLButtonElement;

    private readonly WriteToScreen:                                     WriteToScreenDelegate;

    //#endregion

    //#region Constructor

    constructor(WriteToScreen:           WriteToScreenDelegate,
                ocpiVersionsURL?:        string,
                ocpiAccessToken?:        string,
                ocpiAccessTokenBase64?:  string)
    {

        this.WriteToScreen = WriteToScreen;

        //#region Data

        this.appDiv                          = document.                 querySelector("#app")                   as HTMLDivElement;

        //#region Connect Screen

        this.connectScreen             = this.appDiv.       querySelector("#connectScreen")             as HTMLDivElement;
        this.ocpiVersionsURLInput      = this.connectScreen.querySelector("#ocpiVersionsURLInput")      as HTMLInputElement;
        this.ocpiAccessTokenInput      = this.connectScreen.querySelector("#ocpiAccessTokenInput")      as HTMLInputElement;
        this.accessTokenEncodingCheck  = this.connectScreen.querySelector("#accessTokenEncodingCheck")  as HTMLInputElement;
        this.connectButton             = this.connectScreen.querySelector("#connectButton")             as HTMLButtonElement;

        if (ocpiVersionsURL && ocpiVersionsURL.length > 0)
            this.ocpiVersionsURLInput.value       = ocpiVersionsURL;

        if (ocpiAccessToken && ocpiAccessToken.length > 0)
            this.ocpiAccessTokenInput.value       = ocpiAccessToken;

        if (ocpiAccessTokenBase64 && ocpiAccessTokenBase64.length > 0)
            this.accessTokenEncodingCheck.checked = ocpiAccessTokenBase64 == "true";

        this.connectButton.onclick = async () => {

            const ocpiEndpointURL          = this.ocpiVersionsURLInput.value.trim();
            this. ocpiAccessToken          = this.ocpiAccessTokenInput.value.trim();
            this. ocpiAccessTokenEncoding  = this.ocpiAccessTokenInput.checked;

            if (this.isValidURL(ocpiEndpointURL)) {

                try {

                    const [ocpiResponse, getHeader] = await this.OCPIGetAsync(ocpiEndpointURL);

                    if (ocpiResponse.status_code >= 1000 &&
                        ocpiResponse.status_code <  2000)
                    {

                        this.connectScreen.style.display   = "none";
                        this.versionsScreen.style.display  = "flex";

                        if (ocpiResponse?.data != undefined  &&
                            ocpiResponse?.data != null       &&
                            Array.isArray(ocpiResponse.data) &&
                            ocpiResponse.data.length > 0)
                        {

                            this.versionsHTMLDiv.innerHTML = "";
                            this.versionsJSONDiv.innerHTML = "<pre>" + JSON.stringify(ocpiResponse, null, 2) + "</pre>";

                            for (const version of (ocpiResponse.data as OCPPv2_1.IVersion[])) {

                                // {
                                //    "version":  "2.1.1",
                                //    "url":      "https://api.charging.cloud/ocpi/versions/2.1.1"
                                // }

                                const versionIdDiv      = this.versionsHTMLDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                                versionIdDiv.className  = "version";
                                versionIdDiv.innerHTML  = "Version " + version.version + "<br /><span class=\"versionLink\">" + version.url + "</span>";

                                versionIdDiv.onclick = async () => {
                                    this.GetVersionDetails(version.url);
                                };

                            }
                        
                        }

                    }

                    else
                        this.WriteToScreen(JSON.stringify(ocpiResponse, null, 2));

                } catch (exception: any) {
                    this.WriteToScreen(exception);
                }

            }

        };

        //#endregion

        //#region Version Screen

        this.versionsScreen                  = this.appDiv.              querySelector("#versionsScreen")        as HTMLDivElement;
        this.versionsDiv                     = this.versionsScreen.      querySelector(".versions")              as HTMLDivElement;
        this.versionsHTMLDiv                 = this.versionsDiv.         querySelector(".versionsHTML")          as HTMLDivElement;
        this.versionsJSONDiv                 = this.versionsDiv.         querySelector(".versionsJSON")          as HTMLDivElement;

        this.versionsScreenBottom            = this.versionsScreen.      querySelector(".bottom")                as HTMLDivElement;
        this.versionsScreenBackButton        = this.versionsScreenBottom.querySelector(".backButton")            as HTMLButtonElement;

        this.versionsScreenBackButton.onclick = async () => {
            this.connectScreen.style.display   = "flex";
            this.versionsScreen.style.display  = "none";
        };

        //#endregion

        //#region Version Details Screen

        this.versionDetailsScreen            = this.appDiv.              querySelector("#versionDetailsScreen")  as HTMLDivElement;
        this.versionDetailsDiv               = this.versionDetailsScreen.querySelector(".versionDetails")        as HTMLDivElement;
        this.versionDetailsHTMLDiv           = this.versionDetailsDiv.   querySelector(".versionDetailsHTML")    as HTMLDivElement;
        this.versionDetailsJSONDiv           = this.versionDetailsDiv.   querySelector(".versionDetailsJSON")    as HTMLDivElement;

        this.versionDetailsScreenBottom      = this.versionDetailsScreen.querySelector(".bottom")                as HTMLDivElement;
        this.versionDetailsScreenBackButton  = this.versionDetailsScreen.querySelector(".backButton")            as HTMLButtonElement;

        this.versionDetailsScreenBottom.onclick = async () => {
            this.versionsScreen.style.display        = "flex";
            this.versionDetailsScreen.style.display  = "none";
        };

        //#endregion

        //#endregion

    }

    //#endregion




    private async GetVersionDetails(VersionDetailsURL: string)
    {

        const [ocpiResponse, getHeader] = await this.OCPIGetAsync(VersionDetailsURL);

        if (ocpiResponse.status_code >= 1000 &&
            ocpiResponse.status_code <  2000)
        {

            this.versionsScreen.style.display        = "none";
            this.versionDetailsScreen.style.display  = "flex";

            if (ocpiResponse.data.version &&
                Array.isArray(ocpiResponse.data.endpoints) &&
                ocpiResponse.data.endpoints.length > 0)
            {

                this.versionDetailsHTMLDiv.innerHTML = "";
                this.versionDetailsJSONDiv.innerHTML = "<pre>" + JSON.stringify(ocpiResponse, null, 2) + "</pre>";

                const versionId = ocpiResponse.data.version as string;

                if (versionId.startsWith("2.1"))
                    for (const endpoint of (ocpiResponse.data.endpoints as OCPPv2_1.IEndpoint[])) {

                        // {
                        //     "identifier": "locations",
                        //     "url":        "https://api.charging.cloud/ocpi/v2.1.1/cpo/locations"
                        // }

                        const endpointDiv      = this.versionDetailsHTMLDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        endpointDiv.className  = "endpoint";
                        endpointDiv.innerHTML  = endpoint.identifier + "<br /><span class=\"endpointLink\">" + endpoint.url + "</span>";

                        // endpointDiv.onclick = async () => {
                        //     this.GetVersionDetails(version.url);
                        // };

                    }

                else if (versionId.startsWith("2.2"))
                    for (const endpoint of (ocpiResponse.data.endpoints as OCPPv2_2.IEndpoint[])) {

                        // {
                        //     "identifier": "locations",
                        //     "role":       "SENDER",
                        //     "url":        "https://api.charging.cloud/ocpi/v2.1.1/cpo/locations"
                        // }

                        const endpointDiv      = this.versionDetailsHTMLDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        endpointDiv.className  = "endpoint";
                        endpointDiv.innerHTML  = endpoint.identifier + "<br />" + endpoint.role + "<br /><span class=\"endpointLink\">" + endpoint.url + "</span>";

                        // endpointDiv.onclick = async () => {
                        //     this.GetVersionDetails(version.url);
                        // };

                    }


            }

        }

    }






    private async OCPIGetAsync(RessourceURL: string): Promise<[OCPPv2_1.IOCPIResponse, (key: string) => string | null]> {

        return new Promise((resolve, reject) => {

            const ajax = new XMLHttpRequest();
            ajax.open("GET", RessourceURL, true);
            ajax.setRequestHeader("Accept",    "application/json; charset=UTF-8");

            if (this.ocpiAccessToken.length > 0)
                ajax.setRequestHeader("Authorization", "Token " + (this.ocpiAccessTokenEncoding ? btoa(this.ocpiAccessToken) : this.ocpiAccessToken));

            ajax.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status >= 100 && this.status < 300) {
                        try {

                            const ocpiResponse = JSON.parse(ajax.responseText) as OCPPv2_1.IOCPIResponse;

                            if (ocpiResponse.status_code >= 1000 &&
                                ocpiResponse.status_code <  2000) {
                                resolve([ocpiResponse, (key: string) => ajax.getResponseHeader(key)]);
                            }
                            else
                                reject(new Error(ocpiResponse.status_code + (ocpiResponse.status_message ? ": " + ocpiResponse.status_message : "")));

                        }
                        catch (exception: any) {
                            reject(new Error(exception));
                        }
                    } else {
                        reject(new Error(`HTTP Status Code ${this.status}: ${ajax.responseText}`));
                    }
                }
            };

            ajax.send();

        });

    }









    //#region Helpers

    private isValidURL(url: string): boolean {
        try {
            if (url.length > 0)
            {
                new URL(url);
                return true;
            }
        } catch { }
        return false;
    }

    private showDialog(dialogDiv: HTMLDivElement) {

        for (const dialog of Array.from(document.querySelectorAll<HTMLDivElement>("#commands .command")))
            dialog.style.display = "none";

        dialogDiv.style.display = "block";

    }

    private removeNullsAndEmptyObjects(obj: any): any {
        for (let key in obj) {
            if (obj[key] == null || obj[key] === "") {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                obj[key] = this.removeNullsAndEmptyObjects(obj[key]);
    
                // After cleaning the inner object, if it's empty, delete it too.
                if (Object.keys(obj[key]).length === 0) {
                    delete obj[key];
                }
            }
        }
        return obj;
    }

    //#endregion

}
