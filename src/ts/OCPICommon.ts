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

export interface IOCPIResponse {
    data:             any;
    status_code:      number;
    status_message?:  string;
    timestamp:        Date;
}

export interface IVersion {
    version:          VersionNumber;
    url:              string;
}

export type VersionNumber =
    "2.0"   |
    "2.1"   | // DEPRECATED, do not use, use 2.1.1 instead
    "2.1.1" |
    "2.2"   | // DEPRECATED, do not use, use 2.2.1 instead
    "2.2.1" |
    "2.3"   |
    "3.0"   |
     string;


export class OCPI {

    //#region Data

    private ocpiAccessToken:          string  = "";
    private ocpiAccessTokenEncoding:  boolean = false;

    //#endregion

    constructor()
    {}


    public SetAccessToken(ocpiAccessToken:          string,
                          ocpiAccessTokenEncoding:  boolean) {

        this.ocpiAccessToken          = ocpiAccessToken;
        this.ocpiAccessTokenEncoding  = ocpiAccessTokenEncoding;

    }


    public async OCPIGetAsync(RessourceURL: string): Promise<[IOCPIResponse, (key: string) => string | null]> {

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

                            const ocpiResponse = JSON.parse(ajax.responseText) as IOCPIResponse;

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

    public AppendLog(LogView:  HTMLDivElement,
                     Message:  string|Element) {

        if (typeof Message === 'string')
            LogView.insertAdjacentHTML("afterbegin",
                                       "<p>" + Message + "</p>");

        else
            LogView.insertAdjacentElement("afterbegin",
                                          document.createElement('p').
                                                   appendChild(Message));

    }

    public isValidURL(url: string): boolean {
        try {
            if (url.length > 0)
            {
                new URL(url);
                return true;
            }
        } catch { }
        return false;
    }

    public removeNullsAndEmptyObjects(obj: any): any {
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
