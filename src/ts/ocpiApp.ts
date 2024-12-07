/*
 * Copyright 2018-2024 GraphDefined GmbH <achim.friedland@graphdefined.com>
 * This file is part of CSMSApp <https://github.com/OpenChargingCloud/CSMSApp>
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

import * as OCPI from './OCPIExplorer';

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
                                    this.cliParameters?.ocpiVersionsURL,
                                    this.cliParameters?.ocpiAccessToken,
                                    this.cliParameters?.ocpiAccessTokenBase64
                                );

        this.LogView          = document.querySelector("#logView") as HTMLDivElement;

    }

}

document.addEventListener('DOMContentLoaded', (event) => {
    const app = new ocpiApp();
});


