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

import * as  OCPI         from './OCPICommon';

import * as IOCPIv2_1_1   from './IOCPIv2_1_1';
import     { OCPIV2_1_1 } from './OCPIV2_1_1';

import * as IOCPIv2_2_1   from './IOCPIv2_2_1';
import     { OCPIV2_2_1 } from './OCPIV2_2_1';

import * as IOCPIv2_3     from './IOCPIv2_3';
import     { OCPIV2_3 }   from './OCPIV2_3';


export interface ElectronAPI {

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

export class OCPIExplorer {

    //#region Data

    private readonly common:                          OCPI.OCPI   = new OCPI.OCPI();
    private readonly ocpiv2_1_1:                      OCPIV2_1_1  = new OCPIV2_1_1(this.common);
    private readonly ocpiv2_2_1:                      OCPIV2_2_1  = new OCPIV2_2_1(this.common);
    private readonly ocpiv2_3:                        OCPIV2_3    = new OCPIV2_3  (this.common);

    private readonly baseDiv:                         HTMLDivElement;

    private readonly connectScreen:                   HTMLDivElement;
    private readonly ocpiVersionsURLInput:            HTMLInputElement;
    private readonly ocpiAccessTokenInput:            HTMLInputElement;
    private readonly accessTokenEncodingCheck:        HTMLInputElement;
    private readonly connectButton:                   HTMLButtonElement;

    private readonly versionsScreen:                  HTMLDivElement;
    private readonly versionsDiv:                     HTMLDivElement;
    private readonly versionsHTMLDiv:                 HTMLDivElement;
    private readonly versionsDebugJSONDiv:            HTMLDivElement;
    private readonly versionsJSONDiv:                 HTMLDivElement;
    private readonly versionsScreenBottom:            HTMLDivElement;
    private readonly versionsScreenBackButton:        HTMLButtonElement;

    private readonly versionDetailsScreen:            HTMLDivElement;
    private readonly versionDetailsDiv:               HTMLDivElement;
    private readonly versionDetailsHTMLDiv:           HTMLDivElement;
    private readonly versionDetailsDebugJSONDiv:      HTMLDivElement;
    private readonly versionDetailsJSONDiv:           HTMLDivElement;
    private readonly versionDetailsScreenBottom:      HTMLDivElement;
    private readonly versionDetailsScreenBackButton:  HTMLButtonElement;

    //#endregion

    //#region Constructor

    constructor(baseDiv:                 HTMLDivElement,
                ocpiVersionsURL?:        string,
                ocpiAccessToken?:        string,
                ocpiAccessTokenBase64?:  boolean)
    {

        this.baseDiv = baseDiv;

        //#region Connect Screen

        this.connectScreen             = this.baseDiv.      querySelector("#connectScreen")             as HTMLDivElement;
        this.ocpiVersionsURLInput      = this.connectScreen.querySelector("#ocpiVersionsURLInput")      as HTMLInputElement;
        this.ocpiAccessTokenInput      = this.connectScreen.querySelector("#ocpiAccessTokenInput")      as HTMLInputElement;
        this.accessTokenEncodingCheck  = this.connectScreen.querySelector("#accessTokenEncodingCheck")  as HTMLInputElement;
        this.connectButton             = this.connectScreen.querySelector("#connectButton")             as HTMLButtonElement;

        if (ocpiVersionsURL && ocpiVersionsURL.length > 0)
            this.ocpiVersionsURLInput.value       = ocpiVersionsURL;

        if (ocpiAccessToken && ocpiAccessToken.length > 0)
            this.ocpiAccessTokenInput.value       = ocpiAccessToken;

        if (ocpiAccessTokenBase64 ?? true)
            this.accessTokenEncodingCheck.checked = ocpiAccessTokenBase64 ?? true;

        this.connectButton.onclick = async () => {

            const ocpiEndpointURL = this.ocpiVersionsURLInput.value.trim();

            this.common.SetAccessToken(
                this.ocpiAccessTokenInput.value.trim(),
                this.ocpiAccessTokenInput.checked
            );

            if (this.common.isValidURL(ocpiEndpointURL)) {

                try {

                    const [ocpiResponse, getHeader] = await this.common.OCPIGetAsync(ocpiEndpointURL);

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

                            this.versionsDebugJSONDiv.onclick = () => {
                                this.versionsJSONDiv.style.display = this.versionsJSONDiv.style.display !== "block" ? "block" : "none";
                            };

                            this.versionsJSONDiv.innerHTML = "<pre>" + JSON.stringify(ocpiResponse, null, 2) + "</pre>";

                            for (const version of (ocpiResponse.data as OCPI.IVersion[])) {

                                // {
                                //    "version":  "2.1.1",
                                //    "url":      "https://api.charging.cloud/ocpi/versions/2.1.1"
                                // }

                                const versionDiv        = this.versionsHTMLDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                                versionDiv.className    = "defaultBox version";

                                const versionIdDiv      = versionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                                versionIdDiv.className  = "versionId";
                                versionIdDiv.innerHTML  = version.version;

                                const urlDiv            = versionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                                urlDiv.className        = "versionURL";
                                urlDiv.innerHTML        = version.url;

                                versionDiv.onclick = async () => {
                                    this.GetVersionDetails(version.url);
                                };

                            }
                        
                        }

                    }

                    else
                        this.LogError(JSON.stringify(ocpiResponse, null, 2));

                } catch (exception: any) {
                    this.LogError(exception);
                }

            }

        };

        //#endregion

        //#region Version Screen

        this.versionsScreen                  = this.baseDiv.             querySelector("#versionsScreen")        as HTMLDivElement;
        this.versionsDiv                     = this.versionsScreen.      querySelector(".versions")              as HTMLDivElement;
        this.versionsHTMLDiv                 = this.versionsDiv.         querySelector(".versionsHTML")          as HTMLDivElement;
        this.versionsDebugJSONDiv            = this.versionsDiv.         querySelector(".debugJSON")             as HTMLDivElement;
        this.versionsJSONDiv                 = this.versionsDiv.         querySelector(".versionsJSON")          as HTMLDivElement;

        this.versionsScreenBottom            = this.versionsScreen.      querySelector(".bottom")                as HTMLDivElement;
        this.versionsScreenBackButton        = this.versionsScreenBottom.querySelector(".backButton")            as HTMLButtonElement;

        this.versionsScreenBackButton.onclick = async () => {
            this.connectScreen.style.display   = "flex";
            this.versionsScreen.style.display  = "none";
        };

        //#endregion

        //#region Version Details Screen

        this.versionDetailsScreen            = this.baseDiv.             querySelector("#versionDetailsScreen")  as HTMLDivElement;
        this.versionDetailsDiv               = this.versionDetailsScreen.querySelector(".versionDetails")        as HTMLDivElement;
        this.versionDetailsHTMLDiv           = this.versionDetailsDiv.   querySelector(".versionDetailsHTML")    as HTMLDivElement;
        this.versionDetailsDebugJSONDiv      = this.versionDetailsDiv.   querySelector(".debugJSON")             as HTMLDivElement;
        this.versionDetailsJSONDiv           = this.versionDetailsDiv.   querySelector(".versionDetailsJSON")    as HTMLDivElement;

        this.versionDetailsScreenBottom      = this.versionDetailsScreen.querySelector(".bottom")                as HTMLDivElement;
        this.versionDetailsScreenBackButton  = this.versionDetailsScreen.querySelector(".backButton")            as HTMLButtonElement;

        this.versionDetailsScreenBottom.onclick = async () => {
            this.versionsScreen.style.display        = "flex";
            this.versionDetailsScreen.style.display  = "none";
        };

        //#endregion

    }

    //#endregion




    private async GetVersionDetails(VersionDetailsURL: string)
    {

        const [ocpiResponse, getHeader] = await this.common.OCPIGetAsync(VersionDetailsURL);

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

                this.versionDetailsDebugJSONDiv.onclick = () => {
                    this.versionDetailsJSONDiv.style.display = this.versionDetailsJSONDiv.style.display !== "block" ? "block" : "none";
                };

                this.versionDetailsJSONDiv.innerHTML = "<pre>" + JSON.stringify(ocpiResponse, null, 2) + "</pre>";

                const versionId = ocpiResponse.data.version as string;

                if (versionId.startsWith("2.1"))
                    this.ocpiv2_1_1.renderEndpoints(
                        ocpiResponse.data.endpoints as IOCPIv2_1_1.IEndpoint[],
                        this.versionDetailsHTMLDiv
                    );

                else if (versionId.startsWith("2.2"))
                    this.ocpiv2_2_1.renderEndpoints(
                        ocpiResponse.data.endpoints as IOCPIv2_2_1.IEndpoint[],
                        this.versionDetailsHTMLDiv
                    );

                else if (versionId.startsWith("2.3"))
                    this.ocpiv2_3.renderEndpoints(
                        ocpiResponse.data.endpoints as IOCPIv2_3.IEndpoint[],
                        this.versionDetailsHTMLDiv
                    );

            }

        }

    }


    private LogError(Error: string)
    {
        //this.errorLog.innerHTML = Error;
    }


    //#region Helpers

    private showDialog(dialogDiv: HTMLDivElement) {

        for (const dialog of Array.from(document.querySelectorAll<HTMLDivElement>("#commands .command")))
            dialog.style.display = "none";

        dialogDiv.style.display = "block";

    }

    //#endregion

}
