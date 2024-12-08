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
import * as IOCPIv2_2_1  from './IOCPIv2_2_1';

export class OCPIV2_2_1 {

    private readonly common: OCPI;

    constructor(common: OCPI)
    {
        this.common = common;
    }

    public renderEndpoints(endpoints:  Array<IOCPIv2_2_1.IEndpoint>,
                           container:  HTMLDivElement): void {

        for (const endpoint of endpoints) {

            // {
            //     "identifier": "locations",
            //     "role":       "SENDER",
            //     "url":        "https://api.charging.cloud/ocpi/v2.2.1/cpo/locations"
            // }

            const endpointDiv        = container.appendChild(document.createElement('div')) as HTMLDivElement;
            endpointDiv.className    = "endpoint";

            const identifierDiv      = endpointDiv.appendChild(document.createElement('div')) as HTMLDivElement;
            identifierDiv.className  = "identifier";
            identifierDiv.innerHTML  = endpoint.identifier;

            const roleDiv            = endpointDiv.appendChild(document.createElement('div')) as HTMLDivElement;
            roleDiv.className        = "role";
            roleDiv.innerHTML        = endpoint.role;

            const urlDiv             = endpointDiv.appendChild(document.createElement('div')) as HTMLDivElement;
            urlDiv.className         = "identifier";
            urlDiv.innerHTML         = endpoint.url;

            // endpointDiv.onclick = async () => {
            //     this.GetVersionDetails(version.url);
            // };

        }

    }

}
