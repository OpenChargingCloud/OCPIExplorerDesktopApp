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

import    { OCPI }       from './OCPICommon';
import * as IOCPIv2_1_1  from './IOCPIv2_1_1';

export class OCPIV2_1_1 {

    private readonly common: OCPI;

    constructor(common: OCPI)
    {
        this.common = common;
    }

    public renderEndpoints(endpoints:  Array<IOCPIv2_1_1.IEndpoint>,
                           container:  HTMLDivElement): void {

        for (const endpoint of endpoints) {

            // {
            //     "identifier": "locations",
            //     "url":        "https://api.charging.cloud/ocpi/v2.1.1/cpo/locations"
            // }

            const endpointDiv        = container.appendChild(document.createElement('div')) as HTMLDivElement;
            endpointDiv.className    = "endpoint defaultBox";

            const identifier1Div      = endpointDiv.appendChild(document.createElement('div')) as HTMLDivElement;
            identifier1Div.className  = `identifierLogo ${endpoint.identifier}`;

            switch (endpoint.identifier) {
                case "credentials": identifier1Div.innerHTML = '<i class="fa-regular fa-id-card"></i>';           break;
                case "locations":   identifier1Div.innerHTML = '<i class="fa-solid fa-charging-station"></i>';    break;
                case "tariffs":     identifier1Div.innerHTML = '<i class="fa-solid fa-money-bill-trend-up"></i>'; break;
                case "tokens":      identifier1Div.innerHTML = '<i class="fa-solid fa-passport"></i>';            break;
                case "sessions":    identifier1Div.innerHTML = '<i class="fa-solid fa-user-clock"></i>';          break;
                case "cdrs":        identifier1Div.innerHTML = '<i class="fa-solid fa-file-invoice-dollar"></i>'; break;
                case "commands":    identifier1Div.innerHTML = '<i class="fa-solid fa-terminal"></i>';            break;
                default:            identifier1Div.innerHTML = '<i class="fa-solid fa-square-binary"></i>';       break;
            }

            const rightDiv      = endpointDiv.appendChild(document.createElement('div')) as HTMLDivElement;
            rightDiv.className  = "right";

            const identifierDiv      = rightDiv.appendChild(document.createElement('div')) as HTMLDivElement;
            identifierDiv.className  = "identifier";
            identifierDiv.innerHTML  = endpoint.identifier;

            const urlDiv             = rightDiv.appendChild(document.createElement('div')) as HTMLDivElement;
            urlDiv.className         = "url";
            urlDiv.innerHTML         = `${endpoint.url} <i class="fa-regular fa-copy"></i>`;

            (urlDiv.querySelector("i") as HTMLDivElement).onclick = () => {
                const url = endpoint.url;
                navigator.clipboard.writeText(url).then(() => {
                    console.log(`URL ${url} copied to clipboard!`);
                }).catch(err => {
                    console.error('Failed to copy URL: ', err);
                });
            };

            if (endpoint.identifier === "locations")
                endpointDiv.onclick = async () => {
                    this.GetLocations(endpoint.url);
                };

        }

    }

    private async GetLocations(LocationsURL: string)
    {

        const [ocpiResponse, getHeader] = await this.common.OCPIGetAsync(LocationsURL);

        if (ocpiResponse.status_code >= 1000 &&
            ocpiResponse.status_code <  2000)
        {

            // this.versionsScreen.style.display        = "none";
            // this.versionDetailsScreen.style.display  = "flex";

            if (ocpiResponse.data.version &&
                Array.isArray(ocpiResponse.data.endpoints) &&
                ocpiResponse.data.endpoints.length > 0)
            {

                // this.versionDetailsHTMLDiv.innerHTML = "";
                // this.versionDetailsJSONDiv.innerHTML = "<pre>" + JSON.stringify(ocpiResponse, null, 2) + "</pre>";

                // const versionId = ocpiResponse.data.version as string;

                // if (versionId.startsWith("2.1"))
                //     this.ocpiv2_1_1.renderEndpoints(
                //         ocpiResponse.data.endpoints as IOCPIv2_1_1.IEndpoint[],
                //         this.versionDetailsHTMLDiv
                //     );

                // else if (versionId.startsWith("2.2"))
                //     this.ocpiv2_2_1.renderEndpoints(
                //         ocpiResponse.data.endpoints as IOCPIv2_2_1.IEndpoint[],
                //         this.versionDetailsHTMLDiv
                //     );

                // else if (versionId.startsWith("2.3"))
                //     this.ocpiv2_3.renderEndpoints(
                //         ocpiResponse.data.endpoints as IOCPIv2_3.IEndpoint[],
                //         this.versionDetailsHTMLDiv
                //     );

            }

        }

    }

}
