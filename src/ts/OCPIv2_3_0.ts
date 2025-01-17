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

import    { OCPI, SearchResultsMode }  from './OCPICommon';
import * as IOCPIv2_3_0                from './IOCPIv2_3_0';

export class OCPIV2_3_0 {

    //#region Data

    private readonly common: OCPI;

    //#endregion

    //#region Constructor

    constructor(common: OCPI)
    {
        this.common = common;
    }

    //#endregion


    //#region RenderEndpoints(endpoints, container)

    public RenderEndpoints(endpoints:  Array<IOCPIv2_3_0.IEndpoint>,
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

            const roleDiv            = endpointDiv.appendChild(document.createElement('div')) as HTMLDivElement;
            roleDiv.className        = "role";
            roleDiv.innerHTML        = endpoint.role;

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

            switch (endpoint.identifier)
            {

                case "cdrs":
                    endpointDiv.onclick = async () => this.GetCDRs(endpoint.url);
                    break;

                case "locations":
                    endpointDiv.onclick = async () => this.GetLocations(endpoint.url);
                    break;

                case "sessions":
                    endpointDiv.onclick = async () => this.GetSessions(endpoint.url);
                    break;

                case "tariffs":
                    endpointDiv.onclick = async () => this.GetTariffs(endpoint.url);
                    break;

                case "tokens":
                    endpointDiv.onclick = async () => this.GetTokens(endpoint.url);
                    break;

            }

        }

    }

    //#endregion


    //#region (private) GetCDRs(CDRsURL)

    private async GetCDRs(CDRsURL: string)
    {

        const versionDetailsScreenDiv  = document.          querySelector("#versionDetailsScreen")  as HTMLDivElement;
        const locationsScreenDiv       = document.          querySelector("#locationsScreen")       as HTMLDivElement;
        versionDetailsScreenDiv.style.display = "none";
        locationsScreenDiv.style.display      = "flex";

        this.common.OCPISearch<IOCPIv2_3_0.ICDRMetadata,
                               IOCPIv2_3_0.ICDR>(

            CDRsURL,
            () => {
                return "";
            },
            metadata => { },
            "cdr",
            cdr => cdr.id,
            "cdrs",
            "cdrs",

            // list view
            (resultCounter,
             cdr,
             cdrAnchor) => {

                const locationCounterDiv      = cdrAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                locationCounterDiv.className  = "counter";
                locationCounterDiv.innerHTML  = resultCounter.toString() + ".";

                const cdrIdDiv                = cdrAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                cdrIdDiv.className            = "id";
                cdrIdDiv.innerHTML            = cdr.id;

                const propertiesDiv           = cdrAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                propertiesDiv.className       = "properties";

                this.common.CreateProperty(
                    propertiesDiv,
                    "start",
                    "Start",
                    cdr.start_date_time
                )

                this.common.CreateProperty(
                    propertiesDiv,
                    "end",
                    "end",
                    cdr.end_date_time
                )

                if (cdr.authorization_reference)
                    this.common.CreateProperty(
                        propertiesDiv,
                        "authorizationReference",
                        "Auth Ref",
                        cdr.authorization_reference
                    )

                this.common.CreateProperty(
                    propertiesDiv,
                    "authMethod",
                    "Auth Method",
                    cdr.auth_method
                )

                this.common.CreateProperty(
                    propertiesDiv,
                    "location",
                    "Location",
                    "//ToDo: cdr.location"
                )

                if (cdr.meter_id) {
                    this.common.CreateProperty(
                        propertiesDiv,
                        "meterId",
                        "Meter Id",
                        cdr.meter_id
                    )
                }

                this.common.CreateProperty(
                    propertiesDiv,
                    "currency",
                    "Currency",
                    cdr.currency
                )

                const tariffsDiv      = propertiesDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                tariffsDiv.className  = "tariffs";

                let numberOfTariff = 1;

                if (cdr.tariffs) {
                    for (const tariff of cdr.tariffs) {

                        const tariffDiv          = tariffsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        tariffDiv.className      = "tariff";

                        const numberDiv          = tariffDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        numberDiv.className      = "number";
                        numberDiv.innerHTML      = (numberOfTariff++) + ".";

                        const tariffIdDiv        = tariffDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        tariffIdDiv.className    = "tariffId";
                        tariffIdDiv.innerHTML    = tariff.id;

                        // ...

                    }
                }

                const chargingPeriodsDiv      = propertiesDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                chargingPeriodsDiv.className  = "chargingPeriods";

                let numberOfChargingPeriod = 1;

                if (cdr.charging_periods) {
                    for (const chargingPeriod of cdr.charging_periods) {

                        const chargingPeriodDiv      = chargingPeriodsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        chargingPeriodDiv.className  = "chargingPeriod";

                        const numberDiv              = chargingPeriodDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        numberDiv.className          = "number";
                        numberDiv.innerHTML          = (numberOfChargingPeriod++) + ".";

                        const startDiv               = chargingPeriodDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        startDiv.className           = "start";
                        startDiv.innerHTML           = chargingPeriod.start_date_time;

                        const dimensionsDiv          = chargingPeriodDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        dimensionsDiv.className      = "dimensions";

                        for (const dimension of chargingPeriod.dimensions) {

                            const dimensionTypeDiv        = dimensionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            dimensionTypeDiv.className    = "type";
                            dimensionTypeDiv.innerHTML    = dimension.type;

                            const dimensionVolumeDiv      = dimensionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            dimensionVolumeDiv.className  = "volume";
                            dimensionVolumeDiv.innerHTML  = dimension.volume.toString();

                        }

                    }
                }

                this.common.CreateProperty(
                    propertiesDiv,
                    "totalCost",
                    "Total Cost",
                    cdr.total_cost.toString()
                )

                this.common.CreateProperty(
                    propertiesDiv,
                    "totalEnergy",
                    "Total Energy",
                    cdr.total_energy.toString()
                )

                this.common.CreateProperty(
                    propertiesDiv,
                    "totalTime",
                    "Total Time",
                    cdr.total_time.toString()
                )

                if (cdr.total_parking_time)
                    this.common.CreateProperty(
                        propertiesDiv,
                        "totalParkingTime",
                        "Total Parking Time",
                        cdr.total_parking_time.toString()
                    )

                if (cdr.remark)
                    this.common.CreateProperty(
                        propertiesDiv,
                        "remark",
                        "Remark",
                        cdr.remark
                    )

                const datesDiv      = cdrAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                datesDiv.className  = "dates properties";

                if (cdr.created)
                    this.common.CreateProperty(
                        datesDiv,
                        "created",
                        "Created:",
                        cdr.created
                    )

                    this.common.CreateProperty(
                    datesDiv,
                    "lastUpdated",
                    "Last updated:",
                    cdr.last_updated
                )

            },

            // table view
            (cdrs, cdrsDiv) => {
            },

            // linkPrefix
            undefined,//cdr => "",
            SearchResultsMode.listView,

            context => {
                //statusFilterSelect.onchange = () => {
                //    context.Search(true);
                //}
            }

        );

    }

    //#endregion

    //#region (private) GetLocations(LocationsURL)

    private async GetLocations(LocationsURL: string)
    {

        const versionDetailsScreenDiv  = document.          querySelector("#versionDetailsScreen")  as HTMLDivElement;
        const locationsScreenDiv       = document.          querySelector("#locationsScreen")       as HTMLDivElement;
        versionDetailsScreenDiv.style.display = "none";
        locationsScreenDiv.style.display      = "flex";

        this.common.OCPISearch<IOCPIv2_3_0.ILocationMetadata,
                               IOCPIv2_3_0.ILocation>(

            LocationsURL,
            () => {
                return "";
            },
            metadata => { },
            "location",
            location => location.id,
            "locations",
            "locations",

            // list view
            (resultCounter,
             location,
             locationAnchor) => {

                const locationCounterDiv      = locationAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                locationCounterDiv.className  = "counter";
                locationCounterDiv.innerHTML  = resultCounter.toString() + ".";

                const locationTitleDiv        = locationAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                locationTitleDiv.className    = "title";
                locationTitleDiv.innerHTML    = location.name
                                                    ? location.name + " (" + location.id + ")"
                                                    : location.id;
                                                // country_code
                                                // party_id

                const propertiesDiv           = locationAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                propertiesDiv.className       = "properties";

                if (location.operator) {
                    this.common.CreateProperty(
                        propertiesDiv,
                        "businessDetails operator",
                        "Operator",
                       (location.operator.website
                            ? "<a href=\"" + location.operator.website + "\">" + location.operator.name + "</a>"
                            : location.operator.name)
                    )
                }

                if (location.suboperator) {
                    this.common.CreateProperty(
                         propertiesDiv,
                         "businessDetails suboperator",
                         "Suboperator",
                        (location.suboperator.website
                             ? "<a href=\"" + location.suboperator.website + "\">" + location.suboperator.name + "</a>"
                             : location.suboperator.name)
                     )
                 }

                if (location.owner) {
                    this.common.CreateProperty(
                         propertiesDiv,
                         "businessDetails owner",
                         "Owner",
                         (location.owner.website
                             ? "<a href=\"" + location.owner.website + "\">" + location.owner.name + "</a>"
                             : location.owner.name)
                     )
                 }

                if (location.parking_type)
                    this.common.CreateProperty(
                        propertiesDiv,
                        "parkingType",
                        "Parking Type",
                        location.parking_type
                    )

                this.common.CreateProperty(
                    propertiesDiv,
                    "address",
                    "Address",
                    location.address + ", " + location.postal_code + " " + location.city + ", " + location.country + (location.time_zone ? " (" + location.time_zone + ")" : "")
                );

                this.common.CreateProperty(
                    propertiesDiv,
                    "coordinates",
                    "Lat/Lng",
                    location.coordinates.latitude + ", " + location.coordinates.longitude
                );

                // opening_times?

                // related_locations?
                // directions?
                // facilities?

                // charging_when_closed?
                // images?
                // energy_mix?

                // publish (PlugSurfing extension)

                const evsesDiv        = locationAnchor.appendChild(document.createElement('a')) as HTMLAnchorElement;
                evsesDiv.className    = "evses";

                let numberOfEVSE = 1;

                if (location.evses) {
                    for (const evse of location.evses) {

                        const evseDiv                = evsesDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        evseDiv.className            = "evse evseStatus_" + evse.status;

                        const statusDiv              = evseDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        statusDiv.className          = "evseStatus evseStatus_" + evse.status;
                        statusDiv.innerHTML          = evse.status;

                        const evesIdDiv              = evseDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        evesIdDiv.className          = "evseId";
                        evesIdDiv.innerHTML          = (numberOfEVSE++) + ". " + evse.uid + (evse.evse_id && evse.evse_id != evse.uid ? " (" + evse.evse_id + ")" : "")
                                                           + (evse.physical_reference ? " [" + evse.physical_reference + "]" : "");

                        const evsePropertiesDiv      = evseDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        evsePropertiesDiv.className  = "properties";

                        if (evse.floor_level)
                            this.common.CreateProperty(
                                evsePropertiesDiv,
                                "floorLevel",
                                "Floor Level",
                                evse.floor_level
                            );

                        if (evse.coordinates)
                            this.common.CreateProperty(
                                evsePropertiesDiv,
                                "coordinates",
                                "Lat/Lng",
                                evse.coordinates.latitude + ", " + evse.coordinates.longitude
                            );

                        if (evse.capabilities)
                            this.common.CreateProperty(
                                evsePropertiesDiv,
                                "capabilities",
                                "Capabilities",
                                evse.capabilities.map(capability => capability).join(", ")
                            );

                        if (evse.images)
                            this.common.CreateProperty(
                                evsePropertiesDiv,
                                "images",
                                "Images",
                                evse.images.map(image => image).join("<br />")
                            );

                        if (evse.directions)
                            this.common.CreateProperty(
                                evsePropertiesDiv,
                                "directions",
                                "Directions",
                                evse.directions.map(direction => "(" + direction.language + ") " + direction.text).join("<br />")
                            );

                        if (evse.status_schedule)
                            this.common.CreateProperty(
                                evsePropertiesDiv,
                                "statusSchedule",
                                "Status Schedule",
                                evse.status_schedule.map(statusSchedule => statusSchedule.status + " (" + statusSchedule.period_begin + (statusSchedule.period_end ? " => " + statusSchedule.period_end : "") + ")").join("<br />")
                            );

                        // energy_meter (OCC Calibration Law Extentions)

                        const connectorsDiv     = evseDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        connectorsDiv.className = "connectors";

                        if (evse.connectors) {
                            for (var connector of evse.connectors) {

                                const connectorDiv                = connectorsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                                connectorDiv.className            = "connector";

                                const connectorInfoDiv            = connectorDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                                connectorInfoDiv.className        = "connectorInfo";
                                connectorInfoDiv.innerHTML        = connector.id + ". " + connector.standard + ", " + connector.format + ", " + connector.max_amperage + " A, " + connector.max_voltage + " V, " + connector.power_type;

                                const connectorPropertiesDiv      = connectorDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                                connectorPropertiesDiv.className  = "properties";

                                if (connector.tariff_ids)
                                    this.common.CreateProperty(
                                        connectorPropertiesDiv,
                                        "tariffsInfo",
                                        "Tariffs",
                                        connector.tariff_ids.join(", ")
                                    );

                                if (connector.terms_and_conditions)
                                    this.common.CreateProperty(
                                        connectorPropertiesDiv,
                                        "terms",
                                        "Terms",
                                        connector.terms_and_conditions
                                    );

                                const datesDiv      = connectorDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                                datesDiv.className  = "dates properties";

                                if (connector.created)
                                    this.common.CreateProperty(
                                        datesDiv,
                                        "created",
                                        "Created:",
                                        connector.created
                                    )

                                this.common.CreateProperty(
                                    datesDiv,
                                    "lastUpdated",
                                    "Last updated:",
                                    connector.last_updated
                                )

                            }
                        }

                        const datesDiv      = evseDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        datesDiv.className  = "dates properties";

                        if (evse.created)
                            this.common.CreateProperty(
                                datesDiv,
                                "created",
                                "Created:",
                                evse.created
                            )

                        this.common.CreateProperty(
                            datesDiv,
                            "lastUpdated",
                            "Last updated:",
                            evse.last_updated
                        )

                    }
                }

                const datesDiv      = locationAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                datesDiv.className  = "dates properties";

                if (location.created)
                    this.common.CreateProperty(
                        datesDiv,
                        "created",
                        "Created:",
                        location.created
                    )

                this.common.CreateProperty(
                    datesDiv,
                    "lastUpdated",
                    "Last updated:",
                    location.last_updated
                )

            },

            // table view
            (tariffs, tariffsDiv) => {
            },

            // linkPrefix
            undefined,//tariff => "",
            SearchResultsMode.listView,

            context => {
                //statusFilterSelect.onchange = () => {
                //    context.Search(true);
                //}
            }

        );

    }

    //#endregion

    //#region (private) GetSessions(SessionsURL)

    private async GetSessions(SessionsURL: string)
    {

        const versionDetailsScreenDiv  = document.          querySelector("#versionDetailsScreen")  as HTMLDivElement;
        const locationsScreenDiv       = document.          querySelector("#locationsScreen")       as HTMLDivElement;
        versionDetailsScreenDiv.style.display = "none";
        locationsScreenDiv.style.display      = "flex";

        this.common.OCPISearch<IOCPIv2_3_0.ISessionMetadata,
                               IOCPIv2_3_0.ISession>(

            SessionsURL,
            () => {
                return "";
            },
            metadata => { },
            "session",
            session => session.id,
            "sessions",
            "sessions",

            // list view
            (resultCounter,
            session,
            sessionAnchor) => {

                const locationCounterDiv      = sessionAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                locationCounterDiv.className  = "counter";
                locationCounterDiv.innerHTML  = resultCounter.toString() + ".";

                const sessionIdDiv            = sessionAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                sessionIdDiv.className        = "id";
                sessionIdDiv.innerHTML        = session.id;

                const propertiesDiv           = sessionAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                propertiesDiv.className       = "properties";

                this.common.CreateProperty(
                    propertiesDiv,
                    "start",
                    "Start",
                    session.start_datetime
                )

                if (session.end_datetime) {
                    this.common.CreateProperty(
                        propertiesDiv,
                        "end",
                        "end",
                        session.end_datetime
                    )
                }

                this.common.CreateProperty(
                    propertiesDiv,
                    "kWh",
                    "kWh",
                    session.kwh.toString()
                )

                if (session.authorization_reference)
                    this.common.CreateProperty(
                        propertiesDiv,
                        "authorizationReference",
                        "Auth Ref",
                        session.authorization_reference
                    )

                this.common.CreateProperty(
                    propertiesDiv,
                    "authMethod",
                    "Auth Method",
                    session.auth_method
                )

                this.common.CreateProperty(
                    propertiesDiv,
                    "location",
                    "Location",
                    "//ToDo: session.location"
                )

                if (session.meter_id) {
                    this.common.CreateProperty(
                        propertiesDiv,
                        "meterId",
                        "Meter Id",
                        session.meter_id
                    )
                }

                this.common.CreateProperty(
                    propertiesDiv,
                    "currency",
                    "Currency",
                    session.currency
                )


                const chargingPeriodsDiv      = propertiesDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                chargingPeriodsDiv.className  = "chargingPeriods";

                let numberOfChargingPeriod = 1;

                if (session.charging_periods) {
                    for (const chargingPeriod of session.charging_periods) {

                        const chargingPeriodDiv      = chargingPeriodsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        chargingPeriodDiv.className  = "chargingPeriod";

                        const numberDiv              = chargingPeriodDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        numberDiv.className          = "number";
                        numberDiv.innerHTML          = (numberOfChargingPeriod++) + ".";

                        const startDiv               = chargingPeriodDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        startDiv.className           = "start";
                        startDiv.innerHTML           = chargingPeriod.start_date_time;

                        const dimensionsDiv          = chargingPeriodDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        dimensionsDiv.className      = "dimensions";

                        for (const dimension of chargingPeriod.dimensions) {

                            const dimensionTypeDiv        = dimensionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            dimensionTypeDiv.className    = "type";
                            dimensionTypeDiv.innerHTML    = dimension.type;

                            const dimensionVolumeDiv      = dimensionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            dimensionVolumeDiv.className  = "volume";
                            dimensionVolumeDiv.innerHTML  = dimension.volume.toString();

                        }

                    }
                }

                const datesDiv      = propertiesDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                datesDiv.className  = "dates properties";

                if (session.created)
                    this.common.CreateProperty(
                        datesDiv,
                        "created",
                        "Created:",
                        session.created
                    )

                    this.common.CreateProperty(
                    datesDiv,
                    "lastUpdated",
                    "Last updated:",
                    session.last_updated
                )

            },

            // table view
            (sessions, sessionsDiv) => {
            },

            // linkPrefix
            undefined,//session => "",
            SearchResultsMode.listView,

            context => {
                //statusFilterSelect.onchange = () => {
                //    context.Search(true);
                //}
            }

        );

    }

    //#endregion

    //#region (private) GetTariffs(TariffsURL)

    private async GetTariffs(TariffsURL: string)
    {

        const versionDetailsScreenDiv  = document.          querySelector("#versionDetailsScreen")  as HTMLDivElement;
        const locationsScreenDiv       = document.          querySelector("#locationsScreen")       as HTMLDivElement;
        versionDetailsScreenDiv.style.display = "none";
        locationsScreenDiv.style.display      = "flex";

        this.common.OCPISearch<IOCPIv2_3_0.ITariffMetadata,
                               IOCPIv2_3_0.ITariff>(

            TariffsURL,
            () => {
                return "";
            },
            metadata => { },
            "tariff",
            tariff => tariff.id,
            "tariffs",
            "charging tariffs",

            // list view
            (resultCounter,
             tariff,
             tariffAnchor) => {

                const tariffCounterDiv          = tariffAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                tariffCounterDiv.className      = "counter";
                tariffCounterDiv.innerHTML      = resultCounter.toString() + ".";

                const tariffIdDiv               = tariffAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                tariffIdDiv.className           = "id";
                tariffIdDiv.innerHTML           = tariff.id;

                if (tariff.tariff_alt_url) {
                    const altURLDiv             = tariffAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                    altURLDiv.className         = "altURL";
                    altURLDiv.innerHTML         = "<a href=\"" + tariff.tariff_alt_url + "\">" + tariff.tariff_alt_url + "</a>";
                }

                const tariffAltTextsDiv         = tariffAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                tariffAltTextsDiv.className     = "altTexts";

                if (tariff.tariff_alt_text)
                    for (const tariff_alt_text_instance of tariff.tariff_alt_text) {

                        const altTextDiv            = tariffAltTextsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        altTextDiv.className        = "altText";
                        altTextDiv.innerHTML        = "(" + tariff_alt_text_instance.language + ") " + tariff_alt_text_instance.text;

                    }

                if (tariff.energy_mix) {
                    const altURLDiv             = tariffAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                    altURLDiv.className         = "altURL";
                    altURLDiv.innerHTML         = "<a href=\"" + tariff.tariff_alt_url + "\">" + tariff.tariff_alt_url + "</a>";
                }

                const tariffElementsDiv         = tariffAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                tariffElementsDiv.className     = "tariffElements";


                for (const tariffElement of tariff.elements) {

                    const tariffElementDiv               = tariffElementsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                    tariffElementDiv.className           = "tariffElement";

                    const priceComponentsDiv             = tariffElementDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                    priceComponentsDiv.className         = "priceComponents";

                    for (const priceComponent of tariffElement.price_components) {

                        const priceComponentDiv              = priceComponentsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        priceComponentDiv.className          = "priceComponent";


                        const priceComponentTypeDiv          = priceComponentDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        priceComponentTypeDiv.className      = "type";
                        priceComponentTypeDiv.innerHTML      = priceComponent.type.toString();

                        const priceComponentPriceDiv         = priceComponentDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        priceComponentPriceDiv.className     = "price";
                        priceComponentPriceDiv.innerHTML     = priceComponent.price.toString() + " " + tariff.currency;

                        if (priceComponent.type !== "FLAT") {
                            const priceComponentStepSizeDiv = priceComponentDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            priceComponentStepSizeDiv.className = "stepSize";
                            priceComponentStepSizeDiv.innerHTML = priceComponent.step_size.toString();
                        }

                    }


                    if (tariffElement.restrictions?.start_time   ||
                        tariffElement.restrictions?.end_time     ||
                        tariffElement.restrictions?.start_date   ||
                        tariffElement.restrictions?.end_date     ||
                        tariffElement.restrictions?.min_kwh      ||
                        tariffElement.restrictions?.max_kwh      ||
                        tariffElement.restrictions?.min_power    ||
                        tariffElement.restrictions?.max_power    ||
                        tariffElement.restrictions?.min_duration ||
                        tariffElement.restrictions?.max_duration ||
                        tariffElement.restrictions?.day_of_week) {

                        const tariffRestrictionsDiv = tariffElementDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        tariffRestrictionsDiv.className = "tariffRestrictions";
                        tariffRestrictionsDiv.innerHTML = "Restrictions";

                        const restrictionsDiv = tariffRestrictionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                        restrictionsDiv.className = "restrictions";


                        if (tariffElement.restrictions?.start_time) {

                            const restrictionDiv           = restrictionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionDiv.className       = "restriction";

                            const restrictionKeyDiv        = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionKeyDiv.className    = "key";
                            restrictionKeyDiv.innerHTML    = "Start Time";

                            const restrictionValueDiv      = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionValueDiv.className  = "value";
                            restrictionValueDiv.innerHTML  =  tariffElement.restrictions.start_time;

                        }

                        if (tariffElement.restrictions?.end_time) {

                            const restrictionDiv           = restrictionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionDiv.className       = "restriction";

                            const restrictionKeyDiv        = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionKeyDiv.className    = "key";
                            restrictionKeyDiv.innerHTML    = "End Time";

                            const restrictionValueDiv      = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionValueDiv.className  = "value";
                            restrictionValueDiv.innerHTML  =  tariffElement.restrictions.end_time;

                        }

                        if (tariffElement.restrictions?.start_date) {

                            const restrictionDiv           = restrictionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionDiv.className       = "restriction";

                            const restrictionKeyDiv        = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionKeyDiv.className    = "key";
                            restrictionKeyDiv.innerHTML    = "Start Date";

                            const restrictionValueDiv      = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionValueDiv.className  = "value";
                            restrictionValueDiv.innerHTML  =  tariffElement.restrictions.start_date;

                        }

                        if (tariffElement.restrictions?.end_date) {

                            const restrictionDiv           = restrictionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionDiv.className       = "restriction";

                            const restrictionKeyDiv        = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionKeyDiv.className    = "key";
                            restrictionKeyDiv.innerHTML    = "End Date";

                            const restrictionValueDiv      = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionValueDiv.className  = "value";
                            restrictionValueDiv.innerHTML  =  tariffElement.restrictions.end_date;

                        }

                        if (tariffElement.restrictions?.min_kwh) {

                            const restrictionDiv           = restrictionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionDiv.className       = "restriction";

                            const restrictionKeyDiv        = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionKeyDiv.className    = "key";
                            restrictionKeyDiv.innerHTML    = "min kWh";

                            const restrictionValueDiv      = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionValueDiv.className  = "value";
                            restrictionValueDiv.innerHTML  =  tariffElement.restrictions.min_kwh.toString();

                        }

                        if (tariffElement.restrictions?.max_kwh) {

                            const restrictionDiv           = restrictionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionDiv.className       = "restriction";

                            const restrictionKeyDiv        = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionKeyDiv.className    = "key";
                            restrictionKeyDiv.innerHTML    = "max kWh";

                            const restrictionValueDiv      = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionValueDiv.className  = "value";
                            restrictionValueDiv.innerHTML  =  tariffElement.restrictions.max_kwh.toString();

                        }

                        if (tariffElement.restrictions?.min_power) {

                            const restrictionDiv           = restrictionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionDiv.className       = "restriction";

                            const restrictionKeyDiv        = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionKeyDiv.className    = "key";
                            restrictionKeyDiv.innerHTML    = "min power";

                            const restrictionValueDiv      = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionValueDiv.className  = "value";
                            restrictionValueDiv.innerHTML  =  tariffElement.restrictions.min_power.toString();

                        }

                        if (tariffElement.restrictions?.max_power) {

                            const restrictionDiv           = restrictionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionDiv.className       = "restriction";

                            const restrictionKeyDiv        = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionKeyDiv.className    = "key";
                            restrictionKeyDiv.innerHTML    = "max power";

                            const restrictionValueDiv      = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionValueDiv.className  = "value";
                            restrictionValueDiv.innerHTML  =  tariffElement.restrictions.max_power.toString();

                        }

                        if (tariffElement.restrictions?.min_duration) {

                            const restrictionDiv           = restrictionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionDiv.className       = "restriction";

                            const restrictionKeyDiv        = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionKeyDiv.className    = "key";
                            restrictionKeyDiv.innerHTML    = "min duration";

                            const restrictionValueDiv      = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionValueDiv.className  = "value";
                            restrictionValueDiv.innerHTML  =  tariffElement.restrictions.min_duration.toString();

                        }

                        if (tariffElement.restrictions?.max_duration) {

                            const restrictionDiv           = restrictionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionDiv.className       = "restriction";

                            const restrictionKeyDiv        = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionKeyDiv.className    = "key";
                            restrictionKeyDiv.innerHTML    = "max duration";

                            const restrictionValueDiv      = restrictionDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionValueDiv.className  = "value";
                            restrictionValueDiv.innerHTML  =  tariffElement.restrictions.max_duration.toString();

                        }

                        if (tariffElement.restrictions?.day_of_week) {

                            const restrictionStartTimeDiv           = restrictionsDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionStartTimeDiv.className       = "restriction";

                            const restrictionStartTimeKeyDiv        = restrictionStartTimeDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionStartTimeKeyDiv.className    = "key";
                            restrictionStartTimeKeyDiv.innerHTML    = "day of week";

                            const restrictionStartTimeValueDiv      = restrictionStartTimeDiv.appendChild(document.createElement('div')) as HTMLDivElement;
                            restrictionStartTimeValueDiv.className  = "value";

                            for (const dayOfWeek of tariffElement.restrictions.day_of_week)
                                restrictionStartTimeValueDiv.innerHTML  += " " + dayOfWeek;

                        }

                    }

                }


                const datesDiv = tariffAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                datesDiv.className = "dates properties";

                if (tariff.created)
                    this.common.CreateProperty(
                        datesDiv,
                        "created",
                        "Created:",
                        tariff.created
                    )

                this.common.CreateProperty(
                    datesDiv,
                    "lastUpdated",
                    "Last updated:",
                    tariff.last_updated
                )

            },

            // table view
            (tariffs, tariffsDiv) => {
            },

            // linkPrefix
            undefined,//tariff => "",
            SearchResultsMode.listView,

            context => {
                //statusFilterSelect.onchange = () => {
                //    context.Search(true);
                //}
            }

        );

    }

    //#endregion

    //#region (private) GetTokens(TokensURL)

    private async GetTokens(TokensURL: string)
    {

        const versionDetailsScreenDiv  = document.          querySelector("#versionDetailsScreen")  as HTMLDivElement;
        const locationsScreenDiv       = document.          querySelector("#locationsScreen")       as HTMLDivElement;
        versionDetailsScreenDiv.style.display = "none";
        locationsScreenDiv.style.display      = "flex";

        this.common.OCPISearch<IOCPIv2_3_0.ITokenMetadata,
                               IOCPIv2_3_0.IToken>(

            TokensURL,
            () => {
                return "";
            },
            metadata => { },
            "token",
            token => token.uid,
            "tokens",
            "tokens",

            // list view
            (resultCounter,
            token,
            tokenAnchor) => {

                const locationCounterDiv      = tokenAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                locationCounterDiv.className  = "counter";
                locationCounterDiv.innerHTML  = resultCounter.toString() + ".";

                const tokenIdDiv              = tokenAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                tokenIdDiv.className          = "uid";
                tokenIdDiv.innerHTML          = token.uid;

                const propertiesDiv           = tokenAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                propertiesDiv.className       = "properties";

                this.common.CreateProperty(
                    propertiesDiv,
                    "type",
                    "Type",
                    token.type
                )

                this.common.CreateProperty(
                    propertiesDiv,
                    "contractId",
                    "Contract Id",
                    token.contract_id
                )

                if (token.visual_number) {
                    this.common.CreateProperty(
                        propertiesDiv,
                        "visualNumber",
                        "Visual Number",
                        token.visual_number
                    )
                }

                this.common.CreateProperty(
                    propertiesDiv,
                    "issuer",
                    "Issuer",
                    token.issuer
                )

                this.common.CreateProperty(
                    propertiesDiv,
                    "isValid",
                    "Is Valid",
                    token.valid ? "valid" : "invalid"
                )

                this.common.CreateProperty(
                    propertiesDiv,
                    "whitelist",
                    "Whitelist",
                    token.whitelist
                )

                if (token.language) {
                    this.common.CreateProperty(
                        propertiesDiv,
                        "language",
                        "Language",
                        token.language
                    )
                }

                this.common.CreateProperty(
                    propertiesDiv,
                    "type",
                    "Type",
                    token.type
                )


                const datesDiv      = tokenAnchor.appendChild(document.createElement('div')) as HTMLDivElement;
                datesDiv.className  = "dates properties";

                if (token.created)
                    this.common.CreateProperty(
                        datesDiv,
                        "created",
                        "Created:",
                        token.created
                    )

                this.common.CreateProperty(
                    datesDiv,
                    "lastUpdated",
                    "Last updated:",
                    token.last_updated
                )

            },

            // table view
            (tokens, tokensDiv) => {
            },

            // linkPrefix
            undefined,//token => "",
            SearchResultsMode.listView,

            context => {
                //statusFilterSelect.onchange = () => {
                //    context.Search(true);
                //}
            }

        );

    }

    //#endregion


}
