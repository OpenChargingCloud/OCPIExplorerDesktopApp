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


interface ICommons {
    topLeft:                        HTMLDivElement;
    menuVersions:                   HTMLAnchorElement;
    menuRemoteParties:              HTMLAnchorElement;
}

interface TMetadataDefaults {
    totalCount:    number;
    filteredCount: number;
}

interface ISearchResult<T> {
    totalCount:                      number;
    filteredCount:                   number;
    searchResults:                   Array<T>;
}

interface SearchFilter {
    (): string;
}

interface SearchStartUp<TMetadata> {
    (json: TMetadata): void;
}

interface SearchListView<TSearchResult> {
    (resultCounter:    number,
     searchResult:     TSearchResult,
     searchResultDiv:  HTMLAnchorElement): void;
}

interface SearchTableView<TSearchResult> {
    (searchResult:     Array<TSearchResult>,
     searchResultDiv:  HTMLDivElement): void;
}

interface StatisticsDelegate<TSearchResult> {
    (resultCounter:    number,
     searchResult:     TSearchResult): void;
}
interface StatisticsFinishedDelegate<TSearchResult> {
    (resultCounter:    number): void;
}



interface SearchResult2Link<TSearchResult> {
    (searchResult: TSearchResult): string;
}

interface SearchContext {
    (context: any): void;
}

export enum SearchResultsMode {
    listView,
    tableView
}


export class OCPI {

    //#region Data

    private ocpiAccessToken:          string  = "";
    private ocpiAccessTokenEncoding:  boolean = false;

    //#endregion

    //#region Constructor

    constructor(ocpiAccessToken?:          string,
                ocpiAccessTokenEncoding?:  boolean) {

        if (ocpiAccessToken)
            this.ocpiAccessToken         = ocpiAccessToken;

        if (ocpiAccessTokenEncoding)
            this.ocpiAccessTokenEncoding = ocpiAccessTokenEncoding;

    }

    //#endregion

    //#region SetAccessToken(ocpiAccessToken, ocpiAccessTokenEncoding)

    public SetAccessToken(ocpiAccessToken:          string,
                          ocpiAccessTokenEncoding:  boolean) {

        this.ocpiAccessToken          = ocpiAccessToken;
        this.ocpiAccessTokenEncoding  = ocpiAccessTokenEncoding;

    }

    //#endregion




    public OCPIGet(RessourceURI: string,
                   OnSuccess: (httpStatusCode: number, httpContent: string, httpHeaders: (key: string) => string | null) => void,
                   OnError:   (httpStatusCode: number, httpContent: string, httpHeaders: (key: string) => string | null) => void) {

        const ajax = new XMLHttpRequest();
        ajax.open("GET", RessourceURI, true);
        ajax.setRequestHeader("Accept",   "application/json; charset=UTF-8");
        //ajax.setRequestHeader("X-Portal", "true");

        if (this.ocpiAccessToken.length > 0)
            ajax.setRequestHeader("Authorization", "Token " + (this.ocpiAccessTokenEncoding ? btoa(this.ocpiAccessToken) : this.ocpiAccessToken));

        ajax.onreadystatechange = function () {

            // 0 UNSENT | 1 OPENED | 2 HEADERS_RECEIVED | 3 LOADING | 4 DONE
            if (this.readyState == 4) {

                if (this.status >= 100 && this.status < 300)
                    OnSuccess?.(
                        this.status,
                        ajax.responseText,
                        (key: string) => ajax.getResponseHeader(key)
                    );

                else
                    OnError?.(
                        this.status,
                        ajax.responseText,
                        (key: string) => ajax.getResponseHeader(key)
                    );

            }

        }

        ajax.send();

    }

    public async OCPIGetAsync(RessourceURL: string): Promise<[IOCPIResponse, (key: string) => string | null]> {

        return new Promise((resolve, reject) => {

            const ajax = new XMLHttpRequest();
            ajax.open("GET", RessourceURL, true);
            ajax.setRequestHeader("Accept", "application/json; charset=UTF-8");

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



    public OCPISearch<TMetadata extends TMetadataDefaults, TSearchResult>(requestURL:     string,
                                                                          searchFilters:  SearchFilter,
                                                                          doStartUp:      SearchStartUp<TMetadata>,
                                                                          nameOfItem:     string,
                                                                          idOfItem:       (searchResult: TSearchResult) => string,
                                                                          nameOfItems:    string,
                                                                          nameOfItems2:   string,
                                                                          doListView:     SearchListView<TSearchResult>,
                                                                          doTableView:    SearchTableView<TSearchResult>,
                                                                          linkPrefix?:    SearchResult2Link<TSearchResult>,
                                                                          startView?:     SearchResultsMode,
                                                                          context?:       SearchContext) {

        requestURL = requestURL.indexOf('?') === -1
                        ? requestURL + '?'
                        : requestURL.endsWith('&')
                            ? requestURL
                            : requestURL + '&';

        let   firstSearch                  = true;
        let   offset                       = 0;
        let   limit                        = 10;
        let   currentDateFrom:string|null  = null;
        let   currentDateTo:string|null    = null;
        let   viewMode                     = startView !== null ? startView : SearchResultsMode.listView;
        const context__                    = { Search: Search };
        let   numberOfResults              = 0;
        let   linkURL                      = "";
        let   filteredNumberOfResults      = 0;
        let   totalNumberOfResults         = 0;

        const controlsDiv              = document.    getElementById("controls")              as HTMLDivElement;
        const patternFilter            = controlsDiv. querySelector ("#patternFilterInput")   as HTMLInputElement;
        const takeSelect               = controlsDiv. querySelector ("#takeSelect")           as HTMLSelectElement;
        const searchButton             = controlsDiv. querySelector ("#searchButton")         as HTMLButtonElement;
        const leftButton               = controlsDiv. querySelector ("#leftButton")           as HTMLButtonElement;
        const rightButton              = controlsDiv. querySelector ("#rightButton")          as HTMLButtonElement;

        const dateFilters              = controlsDiv. querySelector ("#dateFilters")          as HTMLDivElement;
        const dateFrom                 = dateFilters?.querySelector ("#dateFromText")         as HTMLInputElement;
        const dateTo                   = dateFilters?.querySelector ("#dateToText")           as HTMLInputElement;
        //const datepicker               = dateFilters != null ? new DatePicker() : null;

        const listViewButton           = controlsDiv. querySelector ("#listView")             as HTMLButtonElement;
        const tableViewButton          = controlsDiv. querySelector ("#tableView")            as HTMLButtonElement;

        const messageDiv               = document.    getElementById('message')               as HTMLDivElement;
        const localSearchMessageDiv    = document.    getElementById('localSearchMessage')    as HTMLDivElement;
        const searchResultsDiv         = document.    querySelector (".searchResults")        as HTMLDivElement;
        const downLoadButton           = document.    getElementById("downLoadButton")        as HTMLAnchorElement;


        const that=this;

        function DoSearchError(Message: string) {

            messageDiv.innerHTML = Message;

            if (downLoadButton)
                downLoadButton.style.display = "none";

        }

        function Search(deletePreviousResults: boolean,
                        resetSkip?:            boolean,
                        whenDone?:             any)
        {

            if (resetSkip)
                offset = 0;

            // handle local searches
            if (patternFilter.value[0] === '#')
            {

                if (whenDone !== null)
                    whenDone();

                return;

            }

            // To avoid multiple clicks while waiting for the results from a slow server
            leftButton.disabled   = true;
            rightButton.disabled  = true;

            //#region Build search query parameters

            const queryParameters: string[] = [];

            if (patternFilter.value !== "")
                queryParameters.push("match=" + encodeURI(patternFilter.value));

            if (searchFilters) {
                const searchPattern = searchFilters();
                if (searchPattern !== "")
                    queryParameters.push(searchPattern);
            }

            if (currentDateFrom != null && currentDateFrom !== "")
                queryParameters.push("from=" + currentDateFrom);

            if (currentDateTo != null && currentDateTo !== "")
                queryParameters.push("to=" + currentDateTo);

            //#endregion

            //#region Build download link

            if (downLoadButton)
                downLoadButton.href = requestURL + (queryParameters.length > 0
                                                        ? queryParameters.join("&") + "&download"
                                                        : "download");

            //#endregion

            //#region Add pagination query parameters

            queryParameters.push("offset=" + offset);
            queryParameters.push("limit="  + limit);

            //#endregion

            // Do the search... will always have pagination query parameters
            that.OCPIGet(requestURL + queryParameters.join("&"),

                    (status, response, httpHeaders) => {

                        try
                        {

                            if (status == 200 && response) {

                                const ocpiResponse = JSON.parse(response) as IOCPIResponse;

                                if (ocpiResponse.status_code >= 1000 &&
                                    ocpiResponse.status_code <  2000)
                                {

                                    if (ocpiResponse?.data &&
                                        Array.isArray(ocpiResponse.data))
                                    {

                                        const searchResults = ocpiResponse.data as Array<TSearchResult>;

                                        numberOfResults          = searchResults.length;

                                        // https://github.com/ocpi/ocpi/blob/release-2.1.1-bugfixes/transport_and_format.md
                                        linkURL                  = httpHeaders("Link")                             ?? "";
                                        totalNumberOfResults     = Number.parseInt(httpHeaders("X-Total-Count")    ?? "0");
                                        filteredNumberOfResults  = Number.parseInt(httpHeaders("X-Filtered-Count") ?? "0");
                                        //limit                    = Number.parseInt(httpHeaders("X-Limit"));

                                        if (Number.isNaN(totalNumberOfResults))
                                            totalNumberOfResults     = numberOfResults;

                                        if (Number.isNaN(filteredNumberOfResults))
                                            filteredNumberOfResults  = totalNumberOfResults;

                                        if (deletePreviousResults)
                                            searchResultsDiv.innerHTML = "";

                                        //if (firstSearch && doStartUp) {
                                        //    //doStartUp(JSONresponse);
                                        //    firstSearch = false;
                                        //}

                                        switch (viewMode)
                                        {

                                            case SearchResultsMode.tableView:
                                                try
                                                {
                                                    doTableView(
                                                        searchResults,
                                                        searchResultsDiv
                                                    );
                                                }
                                                catch (exception)
                                                {
                                                    console.debug("Exception in search table view: " + exception);
                                                }
                                                break;

                                            case SearchResultsMode.listView:
                                                if (searchResults.length > 0) {

                                                    let resultCounter = offset + 1;

                                                    for (const searchResult of searchResults) {

                                                        try {

                                                            const searchResultAnchor      = searchResultsDiv.appendChild(document.createElement('a')) as HTMLAnchorElement;
                                                            searchResultAnchor.id         = nameOfItem + "_" + idOfItem(searchResult);
                                                            searchResultAnchor.className  = "searchResult " + nameOfItem;

                                                            if (linkPrefix) {

                                                                const prefix = linkPrefix(searchResult);

                                                                if (prefix != null && prefix.length > 0)
                                                                    searchResultAnchor.href = prefix + nameOfItems + "/" + idOfItem(searchResult);

                                                            }

                                                            doListView(
                                                                resultCounter,
                                                                searchResult,
                                                                searchResultAnchor
                                                            );

                                                            resultCounter++;

                                                        }
                                                        catch (exception)
                                                        {
                                                            DoSearchError("Exception in search list view: " + exception);
                                                            //break;
                                                        }

                                                    }

                                                    if (downLoadButton)
                                                        downLoadButton.style.display = "block";

                                                }
                                                else
                                                {
                                                    if (downLoadButton)
                                                        downLoadButton.style.display = "none";
                                                }
                                                break;

                                        }

                                        messageDiv.innerHTML = searchResults.length > 0
                                                                ? "showing results " + (offset + 1) + " - " + (offset + Math.min(searchResults.length, limit)) +
                                                                        " of " + filteredNumberOfResults
                                                                : "no matching " + nameOfItems2 + " found";

                                        if (offset > 0)
                                            leftButton.disabled  = false;

                                        if (offset + limit < filteredNumberOfResults)
                                            rightButton.disabled = false;

                                    }
                                    else
                                        DoSearchError("Invalid search results!");

                                }
                                else
                                    DoSearchError("OCPI Status Code " + ocpiResponse.status_code + (ocpiResponse.status_message ? ": " + ocpiResponse.status_message : ""));

                            }
                            else
                                DoSearchError("HTTP Status Code " + status + (response ? ": " + response : ""));

                        }
                        catch (exception)
                        {
                            DoSearchError("Exception occured: " + exception);
                        }

                        if (whenDone)
                            whenDone();

                    },

                    (status, response, httpHeaders) => {

                        DoSearchError("Server error: " + status + "<br />" + response);

                        if (whenDone)
                            whenDone();

                    });

        }


        if (patternFilter !== null)
        {

            patternFilter.onchange = () => {
                if (patternFilter.value[0] !== '#') {
                    offset = 0;
                }
            }

            patternFilter.onkeyup = (ev: KeyboardEvent) => {

                if (patternFilter.value[0] !== '#') {
                    if (ev.key === 'Enter')
                        Search(true);
                }

                // Client-side searches...
                else
                {

                    const pattern          = patternFilter.value.substring(1);
                    const logLines         = Array.from(document.getElementById('searchResults')?.getElementsByClassName('searchResult') ?? []) as HTMLDivElement[];
                    let   numberOfMatches  = 0;

                    for (const logLine of logLines) {

                        if (logLine.innerHTML.indexOf(pattern) > -1) {
                            logLine.style.display = 'block';
                            numberOfMatches++;
                        }

                        else
                            logLine.style.display = 'none';

                    }

                    if (localSearchMessageDiv !== null) {

                        localSearchMessageDiv.innerHTML = numberOfMatches > 0
                                                            ? numberOfMatches + " local matches"
                                                            : "no matching " + nameOfItems2 + " found";

                    }

                }

            }

        }

        limit = parseInt(takeSelect.options[takeSelect.selectedIndex]?.value ?? "10");
        takeSelect.onchange = () => {
            limit = parseInt(takeSelect.options[takeSelect.selectedIndex]?.value ?? "10");
            Search(true);
        }

        searchButton.onclick = () => {
            Search(true);
        }

        leftButton.disabled = true;
        leftButton.onclick = () => {

            leftButton.classList.add("busy", "busyActive");
            rightButton.classList.add("busy");

            offset -= limit;

            if (offset < 0)
                offset = 0;

            Search(true, false, () => {
                leftButton.classList.remove("busy", "busyActive");
                rightButton.classList.remove("busy");
            });

        }

        rightButton.disabled = true;
        rightButton.onclick = () => {

            leftButton.classList.add("busy");
            rightButton.classList.add("busy", "busyActive");

            offset += limit;

            Search(true, false, () => {
                leftButton.classList.remove("busy");
                rightButton.classList.remove("busy", "busyActive");
            });

        }

        document.onkeydown = (ev: KeyboardEvent) => {

            if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
                if (leftButton.disabled === false)
                    leftButton.click();
                return;
            }

            if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
                if (rightButton.disabled === false)
                    rightButton.click();
                return;
            }

            if (ev.key === 'Home') {
                // Will set skip = 0!
                Search(true, true);
                return;
            }

            if (ev.key === 'End') {
                offset = Math.trunc(filteredNumberOfResults / limit) * limit;
                Search(true, false);
                return;
            }

        }

        // if (dateFrom != null) {
        //     dateFrom.onclick = () => {
        //         datepicker.show(dateFrom,
        //             currentDateFrom,
        //             function (newDate) {
        //                 dateFrom.value = parseUTCDate(newDate);
        //                 currentDateFrom = newDate;
        //                 Search(true, true);
        //             });
        //     }
        // }

        // if (dateTo != null) {
        //     dateTo.onclick = () => {
        //         datepicker.show(dateTo,
        //             currentDateTo,
        //             function (newDate) {
        //                 dateTo.value = parseUTCDate(newDate);
        //                 currentDateTo = newDate;
        //                 Search(true, true);
        //             });
        //     }
        // }

        if (listViewButton !== null) {
            listViewButton.onclick = () => {
                viewMode = SearchResultsMode.listView;
                Search(true);
            }
        }

        if (tableViewButton !== null) {
            tableViewButton.onclick = () => {
                viewMode = SearchResultsMode.tableView;
                Search(true);
            }
        }


        if (context)
            context(context__);

        Search(true);

        return context__;

    }




    //#region Helpers

    public CreateProperty(parent:     HTMLDivElement | HTMLAnchorElement,
                          className:  string,
                          key:        string,
                          innerHTML:  string | HTMLDivElement): HTMLDivElement {

        const rowDiv = parent.appendChild(document.createElement('div')) as HTMLDivElement;
        rowDiv.className = "row";

        // key
        const keyDiv = rowDiv.appendChild(document.createElement('div')) as HTMLDivElement;
        keyDiv.className = "key";
        keyDiv.innerHTML = key;

        // value
        const valueDiv = rowDiv.appendChild(document.createElement('div')) as HTMLDivElement;
        valueDiv.className = "value " + className;

        if (typeof innerHTML === 'string')
            valueDiv.innerHTML = innerHTML;

        else if (innerHTML instanceof HTMLDivElement)
            valueDiv.appendChild(innerHTML);


        return rowDiv;

    }


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
