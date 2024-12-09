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

import '@fortawesome/fontawesome-free/css/all.min.css';

class ocpiApp {

    //#region Data

    private readonly ipcRenderer = require('electron').ipcRenderer;

    private readonly appDiv:           HTMLDivElement;
    private readonly cliParameters:    any;
    private readonly ocpiExplorerApp:  OCPI.OCPIExplorer;
    private readonly LogView:          HTMLDivElement;

    //#endregion

    constructor()
    {

        this.appDiv           = document.querySelector("#app") as HTMLDivElement;
        this.cliParameters    = this.ipcRenderer.sendSync('getCLIParameters');

        this.ocpiExplorerApp  = new OCPI.OCPIExplorer(
                                    this.appDiv,
                                    this.cliParameters.ocpiVersionsURL,
                                    this.cliParameters.ocpiAccessToken,
                                   !this.cliParameters.ocpiAccessTokenBase64
                                );

        this.LogView          = document.querySelector("#logView") as HTMLDivElement;
        //this.LogView.innerHTML = 'XXXX';

    }

}

document.addEventListener('DOMContentLoaded', (event) => {
    const app = new ocpiApp();
});


