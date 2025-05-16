/*
 * Copyright 2014-2024 GraphDefined GmbH <achim.friedland@graphdefined.com>
 * This file is part of OCPIExplorer <https://github.com/OpenChargingCloud/OCPIExplorerWebApp>
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

export interface TMetadataDefaults {
    totalCount:                     number;
    filteredCount:                  number;
}


export interface IOCPIResponse {
    data:                           any;                            // Contains the actual response data object or list of objects from each request, depending on the data, this is an array (card. * or +), or a single object (card. 1 or ?)
    status_code:                    number;                         // OCPI status code, as listed in Status Codes, indicates how the request was handled. To avoid confusion with HTTP codes, OCPI status codes consist of four digits.
    status_message?:                string;                         // An optional status message which may help when debugging.
    timestamp:                      Date;                           // The time this message was generated.
    routed_receiver?:               string;                         // The party ID of the party that a Roaming Hub is answering the request on behalf of, if any.
}

export type VersionNumber =
    "2.0"   |
    "2.1"   | // DEPRECATED, do not use, use 2.1.1 instead
    "2.1.1" |
    "2.2"   | // DEPRECATED, do not use, use 2.2.1 instead
    "2.2.1" |
    "2.3"   |
    "3.0"   |
    (string & {});


export type PartyId =
     string;

export type ModuleId =
    "cdrs"               |
    "chargingprofiles"   |
    "commands"           |
    "evsestatuses"       |
    "credentials"        |
    "irrs"               |
    //"hubclientinfo"      |
    "locations"          |
    "sessions"           |
    "meterreadings"      |
    "tariffs"            |
    "tariffassociations" |
    "tokens"             |
    (string & {});

export type InterfaceRole =
    "SENDER" |
    "RECEIVER";

export interface IVersion {
    version:                        VersionNumber;                  // The version number.
    url:                            string;                         // URL to the endpoint containing version specific information.
}

export interface IVersionDetail {
    version:                        VersionNumber;                  // The version number.
    endpoints:                      Array<IEndpoint>;               // A list of supported endpoints for this version.
}

export interface IEndpoint {
    identifier:                     ModuleId;                       // Endpoint identifier.
    role:                           InterfaceRole;                  // Interface role this endpoint implements.
    url:                            string;                         // URL to the endpoint.
}

export interface IPartyIssuedObjectReference {
    id:                             string;                         // An identifier that uniquely identifies this Party Issued Object among other objects issued for the same module by the same party.
}

export interface PartyIssuedObjectUpdate extends IPartyIssuedObjectReference {
    issuer_party:                   PartyId;                        // The party ID of the party that issued this object.
    version:                        number;                         // The version of the Party Issued Object that is in the payload field.
    payload:                        any;                            // The representation of the Party Issued Object at the version given in the version field.
}

export interface IRegularHours {
    weekday:                        number;                         // Number of day in the week, from Monday (1) till Sunday (7)
    period_begin:                   string;                         // Begin of the regular period, in local time, given in hours and minutes. Must be in 24h format with leading zeros. Example: "18:15". Hour/Minute separator: ":" Regex: ([0-1][0-9]|2[0-3]):[0-5][0-9].
    period_end:                     string;                         // End of the regular period, in local time, syntax as for period_begin. Must be later than period_begin.
}

export interface IExceptionalPeriod {
    period_begin:                   string;                         // Begin of the exception. In UTC, time_zone field can be used to convert to local time.
    period_end:                     string;                         // End of the exception. In UTC, time_zone field can be used to convert to local time.
}

export interface IHours {
    twentyfourseven:                boolean;                        // True to represent 24 hours a day and 7 days a week, except the given exceptions.
    regular_hours?:                 Array<IRegularHours>;           // Regular hours, weekday-based. Only to be used if twentyfourseven=false, then this field needs to contain at least one RegularHours object.
    exceptional_openings?:          Array<IExceptionalPeriod>;      // Exceptions for specified calendar dates, time-range based. Periods the station is operating/accessible. Additional to regular_hours. May overlap regular rules.
    exceptional_closings?:          Array<IExceptionalPeriod>;      // Exceptions for specified calendar dates, time-range based. Periods the station is not operating/accessible. Additional to regular_hours. May overlap regular rules.
}

export interface ILocation extends IPartyIssuedObjectReference {
    publish:                        boolean;                        // Whether the receiving Party or Platform may publish the Location. When this is set to false, the receiving Party or Platform MAY NOT disclose information from this Location object
                                                                    // to anyone not holding a Token listed in the field publish_allowed_to. When the same physical facility has both some EVSEs that may be published and other ones that may not be published,
                                                                    // the sender Party SHOULD send two separate Location objects for the two groups of EVSEs.
    publish_allowed_to?:            Array<IPublishToken>;           // This field SHALL NOT be used unless the publish field is set to false. Only holders of Tokens that match all the set fields of one PublishToken in the list are allowed to be shown this Location.
    name?:                          string;                         // Display name of the location.
    address?:                       IAddress;                       // Address and geographical location of the Location. This has to be present unless the publish field is set to false.
    related_locations?:             Array<IAdditionalGeoLocation>;  // Geographical location of related points relevant to the user.
    parking_type?:                  ParkingType;                    // The general type of parking at the Location.
    charging_pool:                  Array<IChargingStation>;        // The Charging Pool of this Location, that is, the list of Charging Stations that make up the physical charging infrastructure of this Location.
    directions?:                    Array<IDisplayText>;            // Human-readable directions on how to reach the location.
    operator?:                      IBusinessDetails;               // Information of the operator. When not specified, the information retrieved with Use Case Request Parties Served by Platform, selected by the Party ID of the Party that issued this Location, MAY be used instead.
    suboperator?:                   IBusinessDetails;               // Information of the suboperator if available.
    owner?:                         IBusinessDetails;               // Information of the owner if available.
    services?:                      Array<LocationService>;         // Optional list of services that are offered at the Location by the CPO or their affiliated partners.
    facilities?:                    Array<Facility>;                // Optional list of facilities this charging location directly belongs to.
    time_zone:                      string;                         // One of the TZ-values from [TZVAL] representing the time zone of the Location. Examples: "Europe/Oslo", "Europe/Zurich".
    opening_times?:                 IHours;                         // The times when the EVSEs at the Location can be accessed for charging.
    charging_when_closed?:          boolean;                        // Indicates if the EVSEs are still charging outside the opening hours of the location. E.g. when the parking garage closes its barriers over night, is it allowed to charge till the next morning? Default: true
    images?:                        Array<IImage>;                  // Links to images related to the location such as photos or logos.
    energy_mix?:                    IEnergyMix;                     // Details on the energy supplied at this location.
    max_power?:                     ILocationMaxPower;              // How much power or current this Location can draw from the grid at any one time.
    help_phone?:                    string;                         // A telephone number that a Driver using the Location may call for assistance. Calling this number will typically connect the caller to the CPO’s customer service department.
    created?:                       string;                         // Optional timestamp when this location was created [OCPI Computer Science Extension!]
    last_updated:                   string;                         // Timestamp when this location or one of its EVSEs or connectors were last updated (or created).
}

export interface ILocationMetadata extends TMetadataDefaults {

}

export interface IAddress {
    address:                        string;                         // Street/block name and house number if available.
    city:                           string;                         // City or town.
    postal_code?:                   string;                         // Postal code of the location.
    state?:                         string;                         // State or province of the location. This is intended to be used only in locales where a state or province is commonly given in addresses.
                                                                    // This field would typically be filled for locations in the United States of America and be left unset for locations in The Netherlands for example.
    country:                        string;                         // ISO 3166-1 alpha-3 code for the country of this location.
    coordinates:                    IGeoLocation;                   // Coordinates of the location. This could be the geographical location of one or more Charging Stations within a facility, but it can also be the
                                                                    // entrance of a parking or other facility where Charging Stations are located. It is up to the CPO to use the point that makes the most sense to a
                                                                    // Driver for a given Location. Once arrived at the Location’s coordinates, any further instructions to reach a Charging Station from the Location
                                                                    // coordinates are stored in the Charging Station object itself (such as the floor number, visual identification or written instructions).
}

export interface IGeoLocation {
    latitude:                       string;                         // Latitude of the point in decimal degree.  Example:   50.770774. Decimal separator: "." Regex: -?[0-9]{1,2}\.[0-9]{5,7}
    longitude:                      string;                         // Longitude of the point in decimal degree. Example: -126.104965. Decimal separator: "." Regex: -?[0-9]{1,3}\.[0-9]{5,7}
}

export interface IAdditionalGeoLocation {
    latitude:                       string;                         // Latitude of the point in decimal degree.  Example:   50.770774. Decimal separator: "." Regex: -?[0-9]{1,2}\.[0-9]{5,7}
    longitude:                      string;                         // Longitude of the point in decimal degree. Example: -126.104965. Decimal separator: "." Regex: -?[0-9]{1,3}\.[0-9]{5,7}
    name?:                          IDisplayText                    // Name of the point in local language or as written at the location. For example the street name of a parking lot entrance or it’s number.
}

export interface ILocationMaxPower {
    unit:                           ChargingRateUnit;               // The unit in which the maximum draw is expressed.
    value:                          number;                         // The maximum power or current that the Location can draw.
}

export interface IDisplayText {
    language:                       string;                         // Language Code ISO 639-1.
    text:                           string;                         // Text to be displayed to a end user. No markup, html etc. allowed.
}

export interface IBusinessDetails {
    name:                           string;                         // Name of the operator.
    website?:                       string;                         // Link to the operator’s website.
    logo?:                          string;                         // Image link to the operator’s logo.
}

export interface IImage {
    url:                            string;                         // URL from where the image data can be fetched through a web browser.
    thumbnail?:                     string;                         // URL from where a thumbnail of the image can be fetched through a webbrowser.
    category:                       ImageCategory;                  // Describes what the image is used for.
    type:                           string;                         // Image type like: gif, jpeg, png, svg.
    width?:                         string;                         // Width of the full scale image.
    height?:                        string;                         // Height of the full scale image.
}

export interface IEnergyMix {
    is_green_energy:                boolean;                        // True if 100% from regenerative sources. (CO2 and nuclear waste is zero)
    energy_sources?:                Array<IEnergySource>;           // Key-value pairs (enum + percentage) of energy sources of this location’s tariff.
    environ_impact?:                Array<IEnvironmentalImpact>;    // Key-value pairs (enum + percentage) of nuclear waste and CO2 exhaust of this location’s tariff.
    supplier_name?:                 string;                         // Name of the energy supplier, delivering the energy for this location or tariff.*
    energy_product_name?:           string;                         // Name of the energy suppliers product/tariff plan used at this location.*
}

export interface IEnergySource {
    source:                         EnergySourceCategory;           // The type of energy source.
    percentage:                     number;                         // Percentage of this source (0-100) in the mix.
}

export interface IEnvironmentalImpact {
    category:                       EnvironmentalImpactCategory;    // The environmental impact category of this value.
    amount:                         number;                         // Amount of this portion in g/kWh.
}

export type ChargingRateUnit =
    "W" |                                                           // Watts (power)
                                                                    // This is the TOTAL allowed charging power. If used for AC Charging, the phase current should be calculated via: Current per phase = Power / (Line Voltage * Number of Phases).
                                                                    // The "Line Voltage" used in the calculation is the Line to Neutral Voltage (VLN). In Europe and Asia VLN is typically 220V or 230V and the corresponding Line to Line Voltage (VLL)
                                                                    // is 380V and 400V. The "Number of Phases" is the numberPhases from the ChargingProfilePeriod. It is usually more convenient to use this for DC charging.
                                                                    // Note that if numberPhases in a ChargingProfilePeriod is absent, 3 SHALL be assumed.
    "A";                                                            // Amperes (current)
                                                                    // The amount of Ampere per phase, not the sum of all phases. It is usually more convenient to use this for AC charging.

export type Capability =
    "CHARGING_PROFILE_CAPABLE"         |                            // The EVSE supports charging profiles.
    "CHARGING_PREFERENCES_CAPABLE"     |                            // The EVSE supports charging preferences.
    "CHIP_CARD_SUPPORT"                |                            // EVSE has a payment terminal that supports chip cards.
    "CONTACTLESS_CARD_SUPPORT"         |                            // EVSE has a payment terminal that supports contactless cards.
    "CREDIT_CARD_PAYABLE"              |                            // EVSE has a payment terminal that makes it possible to pay for charging using a credit card.
    "DEBIT_CARD_PAYABLE"               |                            // EVSE has a payment terminal that makes it possible to pay for charging using a debit card.
    "ISO_15118_2_PLUG_AND_CHARGE"      |                            // The EVSE supports authentication of the Driver using a contract certificate stored in the vehicle according to ISO 15118-2.
    "ISO_15118_20_PLUG_AND_CHARGE"     |                            // The EVSE supports authentication of the Driver using a contract certificate stored in the vehicle according to ISO 15118-20.
    "PED_TERMINAL"                     |                            // EVSE has a payment terminal with a pin-code entry device.
    "REMOTE_START_STOP_CAPABLE"        |                            // The EVSE can remotely be started/stopped.
    "RESERVABLE"                       |                            // The EVSE can be reserved.
    "RFID_READER"                      |                            // Charging at this EVSE can be authorized with an RFID token.
    "START_SESSION_CONNECTOR_REQUIRED" |                            // When a StartSession is sent to this EVSE, the MSP is required to add the optional connector_id field in the StartSession object.
    "TOKEN_GROUP_CAPABLE"              |                            // This Charging Station supports token groups, two or more tokens work as one, so that a session can be started with one token and stopped with another (handy when a card and
                                                                    // key-fob are given to the EV-driver).
    "UNLOCK_CAPABLE"                   |                            // Connectors have mechanical lock that can be requested by the eMSP to be unlocked.
    (string & {});

export type LocationService =
    "ACCESSIBLE_CHARGING" |                                         // One or more EVSEs have accessibility modifications in place to allow use by people with disabilities.
                                                                    // Note that more information on accessibility modifications can be provided using the various fields for images and in the parking field of the EVSE object.
    "ASSISTANCE"          |                                         // Assistance from on-site staff is available to help a Driver charge at the location.
    "CAMERA_SURVEILLANCE" |                                         // Security monitoring with video cameras is in place at the location.
    "EMERGENCY_CALL"      |                                         // A voice communication channel is available for the Driver to contact security staff from the location.
    "WIFI"                |                                         // WLAN Internet connectivity is available at the location.
    (string & {});

export type ConnectorFormat =
    "SOCKET" |                                                      // The connector is a socket; the EV user needs to bring a fitting plug.
    "CABLE";                                                        // The connector is an attached cable; the EV users car needs to have a fitting inlet.

export type ConnectorType =
    "CHADEMO"               |                                       // The connector type is CHAdeMO, DC
    "CHAOJI"                |                                       // The ChaoJi connector. The new generation charging connector, harmonized between CHAdeMO and GB/T. DC.
    "DOMESTIC_A"            |                                       // Standard/Domestic household, type "A", NEMA 1-15, 2 pins
    "DOMESTIC_B"            |                                       // Standard/Domestic household, type "B", NEMA 5-15, 3 pins
    "DOMESTIC_C"            |                                       // Standard/Domestic household, type "C", CEE 7/17, 2 pins
    "DOMESTIC_D"            |                                       // Standard/Domestic household, type "D", 3 pin
    "DOMESTIC_E"            |                                       // Standard/Domestic household, type "E", CEE 7/5 3 pins
    "DOMESTIC_F"            |                                       // Standard/Domestic household, type "F", CEE 7/4, Schuko, 3 pins
    "DOMESTIC_G"            |                                       // Standard/Domestic household, type "G", BS 1363, Commonwealth, 3 pins
    "DOMESTIC_H"            |                                       // Standard/Domestic household, type "H", SI-32, 3 pins
    "DOMESTIC_I"            |                                       // Standard/Domestic household, type "I", AS 3112, 3 pins
    "DOMESTIC_J"            |                                       // Standard/Domestic household, type "J", SEV 1011, 3 pins
    "DOMESTIC_K"            |                                       // Standard/Domestic household, type "K", DS 60884-2-D1, 3 pins
    "DOMESTIC_L"            |                                       // Standard/Domestic household, type "L", CEI 23-16-VII, 3 pins
    "DOMESTIC_M"            |                                       // Standard/Domestic household, type "M", BS 546, 3 pins
    "DOMESTIC_N"            |                                       // Standard/Domestic household, type "N", NBR 14136, 3 pins"
    "DOMESTIC_O"            |                                       // Standard/Domestic household, type "O", TIS 166-2549, 3 pins
    "GBT_AC"                |                                       // Guobiao GB/T 20234.2 AC socket/connector
    "GBT_DC"                |                                       // Guobiao GB/T 20234.3 DC connector
    "IEC_60309_2_single_16" |                                       // IEC 60309-2 Industrial Connector single phase 16 amperes (usually blue)
    "IEC_60309_2_three_16"  |                                       // IEC 60309-2 Industrial Connector three phases 16 amperes (usually red)
    "IEC_60309_2_three_32"  |                                       // IEC 60309-2 Industrial Connector three phases 32 amperes (usually red)
    "IEC_60309_2_three_64"  |                                       // IEC 60309-2 Industrial Connector three phases 64 amperes (usually red)
    "IEC_62196_T1"          |                                       // IEC 62196 Type 1 "SAE J1772"
    "IEC_62196_T1_COMBO"    |                                       // Combo Type 1 based, DC
    "IEC_62196_T2"          |                                       // IEC 62196 Type 2 "Mennekes"
    "IEC_62196_T2_COMBO"    |                                       // Combo Type 2 based, DC
    "IEC_62196_T3A"         |                                       // IEC 62196 Type 3A
    "IEC_62196_T3C"         |                                       // IEC 62196 Type 3C "Scame"
    "MCS"                   |                                       // The MegaWatt Charging System (MCS) connector as developed by CharIN.
    "NEMA_5_20"             |                                       // NEMA 5-20, 3 pins
    "NEMA_6_30"             |                                       // NEMA 6-30, 3 pins
    "NEMA_6_50"             |                                       // NEMA 6-50, 3 pins
    "NEMA_10_30"            |                                       // NEMA 10-30, 3 pins
    "NEMA_10_50"            |                                       // NEMA 10-50, 3 pins
    "NEMA_14_30"            |                                       // NEMA 14-30, 3 pins, rating of 30 A
    "NEMA_14_50"            |                                       // NEMA 14-50, 3 pins, rating of 50 A
    "PANTOGRAPH_BOTTOM_UP"  |                                       // On-board Bottom-up-Pantograph typically for bus charging
    "PANTOGRAPH_TOP_DOWN"   |                                       // Off-board Top-down-Pantograph typically for bus charging
    "SAE_J3400"             |                                       // SAE J3400, also known as North American Charging Standard (NACS), developed by Tesla, Inc in 2021.
    "TESLA_R"               |                                       // Tesla Connector "Roadster" - type(round, 4 pin)
    "TESLA_S"               |                                       // Tesla Connector "Model-S" - type(oval, 5 pin). Mechanically compatible with SAE J3400 but uses CAN bus for communication instead of power line communication.
    (string & {});

export type EnergySourceCategory =
    "NUCLEAR"        |                                              // Nuclear power sources.
    "GENERAL_FOSSIL" |                                              // All kinds of fossil power sources.
    "COAL"           |                                              // Fossil power from coal.
    "GAS"            |                                              // Fossil power from gas.
    "GENERAL_GREEN"  |                                              // All kinds of regenerative power sources.
    "SOLAR"          |                                              // Regenerative power from PV.
    "WIND"           |                                              // Regenerative power from wind turbines.
    "WATER"          |                                              // Regenerative power from water turbines.
    (string & {});

export type EnvironmentalImpactCategory =
    "NUCLEAR_WASTE"  |                                              // Produced nuclear waste in gramms per kilowatthour.
    "CARBON_DIOXIDE" |                                              // Exhausted carbon dioxide in gramms per kilowarrhour.
    (string & {});

export type Facility =
    "HOTEL"           |                                             // A hotel.
    "RESTAURANT"      |                                             // A restaurant.
    "CAFE"            |                                             // A cafe.
    "MALL"            |                                             // A mall or shopping center.
    "SUPERMARKET"     |                                             // A supermarket.
    "SPORT"           |                                             // Sport facilities: gym, field etc.
    "RECREATION_AREA" |                                             // A Recreation area.
    "NATURE"          |                                             // Located in, or close to, a park, nature reserve/park etc.
    "MUSEUM"          |                                             // A museum.
    "BIKE_SHARING"    |                                             // A bike/e-bike/e-scooter sharing location.
    "BUS_STOP"        |                                             // A bus stop.
    "TAXI_STAND"      |                                             // A taxi stand.
    "TRAM_STOP"       |                                             // A tram stop/station.
    "METRO_STATION"   |                                             // A metro station.
    "TRAIN_STATION"   |                                             // A train station.
    "AIRPORT"         |                                             // An airport.
    "PARKING_LOT"     |                                             // A parking lot.
    "CARPOOL_PARKING" |                                             // A carpool parking.
    "FUEL_STATION"    |                                             // A Fuel station.
    "WIFI"            |                                             // Wifi or other type of internet available.
    (string & {});

export type ImageCategory =
    "CHARGER"  |                                                    // Photo of the physical device that contains one or more EVSEs.
    "ENTRANCE" |                                                    // Location entrance photo.Should show the car entrance to the location from street side.
    "LOCATION" |                                                    // Location overview photo.
    "NETWORK"  |                                                    // logo of an associated roaming network to be displayed with the EVSE for example in lists, maps and detailed information view
    "OPERATOR" |                                                    // logo of the charge points operator, for example a municipality, to be displayed with the EVSEs detailed information view or in lists and maps, if no networkLogo is present
    "OTHER"    |                                                    // Other
    "OWNER"    |                                                    // logo of the charge points owner, for example a local store, to be displayed with the EVSEs detailed information view
    (string & {});

export type ParkingType =
    "ALONG_MOTORWAY"     |                                          // Location on a parking facility/rest area along a motorway, freeway, interstate, highway etc.
    "PARKING_GARAGE"     |                                          // Multistorey car park.
    "PARKING_LOT"        |                                          // A cleared area that is intended for parking vehicles, i.e.at super markets, bars, etc.
    "ON_DRIVEWAY"        |                                          // Location is on the driveway of a house/building.
    "ON_STREET"          |                                          // Parking in public space.
    "UNDERGROUND_GARAGE" |                                          // Multistorey car park, mainly underground.
    (string & {});

export interface ParkingRestriction {
    group:                          Array<ParkingRestrictionGroup>; // One or more groups that drivers have to be in to be allowed to park here.
    applies_outside_opening_hours:  boolean;                        // Whether the restriction applies also outside opening hours of the establishment that
                                                                    // the Location belongs to. This field can be used for example to create a ParkingRestriction
                                                                    // that signals that a certain EVSE is for employees only during opening hours, but can be
                                                                    // used by everyone outside those opening hours.
}

export type ParkingRestrictionGroup =
    "EMPLOYEES"   |                                                 // Parking only for people who work at a site, building, or complex that the Location belongs to.
    "EV_ONLY"     |                                                 // Reserved parking spot for electric vehicles.
    "PLUGGED"     |                                                 // Parking is only allowed while plugged in (charging).
    "CUSTOMERS"   |                                                 // Parking spot for customers/guests only, for example in case of a hotel or shop.
    "TAXI"        |                                                 // Parking only for taxi vehicles.
    "TENANTS"     |                                                 // Parking only for people who live in a complex that the Location belongs to.
    (string & {});

export type VehicleType =
    "MOTORCYCLE"                    |                               // A motorcycle
    "PERSONAL_VEHICLE"              |                               // personal vehicle, a passenger car
    "PERSONAL_VEHICLE_WITH_TRAILER" |                               // A personal vehicle with a trailer attached
    "VAN"                           |                               // A light-duty van with a height smaller than 275 cm
    "SEMI_TRACTOR"                  |                               // A heavy-duty tractor unit without a trailer
    "RIGID"                         |                               // A heavy-duty truck without an articulation point"
    "TRUCK_WITH_TRAILER"            |                               // A heavy-duty truck (tractor or rigid) with a trailer attached
    "BUS"                           |                               // A bus or a motor coach
    "DISABLED"                      |                               // A vehicle with a permit for parking spaces for people with disabilities
    (string & {});

export type PowerType =
    "AC_1_PHASE"       |                                            // AC single phase
    "AC_2_PHASE"       |                                            // AC two phases, only two of the three available phases connected
    "AC_2_PHASE_SPLIT" |                                            // AC two phases using split phase system
    "AC_3_PHASE"       |                                            // AC three phases
    "DC";                                                           // Direct Current

export type Status  =
    "AVAILABLE"   |                                                 // The EVSE/Connector is able to start a new charging session.
    "BLOCKED"     |                                                 // The EVSE/Connector is not accessible because of a physical barrier, i.e.a car.
    "CHARGING"    |                                                 // The EVSE/Connector is in use.
    "INOPERATIVE" |                                                 // The EVSE/Connector is not yet active, or temporarily not available for use, but not broken or defect.
    "OUTOFORDER"  |                                                 // The EVSE/Connector is currently out of order, some part/components may be broken/defect.
    "PLANNED"     |                                                 // The EVSE/Connector is planned, will be operating soon.
    "REMOVED"     |                                                 // The EVSE/Connector was discontinued/removed.
    "RESERVED"    |                                                 // The EVSE/Connector is reserved for a particular EV driver and is unavailable for other drivers.
    "UNKNOWN"     |                                                 // No status information available (also used when offline).
    (string & {});

export interface IChargingStation {
    id:                             string;                         // An identifier that uniquely indentifiers this Charging Station among all Charging Stations in all Locations issued by the same Party.
    evses?:                         Array<IEVSE>;                   // List of EVSEs that belong to this Charging Station.
    capabilities?:                  Array<Capability>;              // List of functionalities that the Charging Station is capable of.
    floor_level?:                   string;                         // Level on which the Charging Station is located (in garage buildings) in the locally displayed numbering scheme.
    coordinates?:                   IGeoLocation;                   // Coordinates of the Charging Station.
    physical_reference?:            string;                         // A number/string printed on the outside of the Charging Station for visual identification.
    directions?:                    Array<IDisplayText>;            // Multi-language human-readable directions when more detailed information on how to reach the Charging Station from the Location is required.
    images?:                        Array<IImage>;                  // Links to images related to the Charging Station such as photos or logos.
    created?:                       string;                         // Optional timestamp when this Charging Station was created [OCPI Computer Science Extension!]
    last_updated:                   string;                         // Timestamp when this Charging Station or one of its EVSEs was last updated (or created).
}

export interface IEVSE extends IPartyIssuedObjectReference {
    uid:                            string;                         // Uniquely identifies the EVSE among all EVSEs of all Locations of the same Party. This field can never be changed, modified or renamed. This is the 'technical'
                                                                    // identification of the EVSE, not to be used as 'human readable' identification, use the field evse_id for that. This field is named uid instead of id, because id could be
                                                                    // confused with evse_id which is the field containing an ID in the EMI3 defined "EVSE-ID" format. Note that in order to fulfill both the requirement that an EVSE’s uid be
                                                                    // unique within a CPO’s platform and the requirement that EVSEs are never deleted, a CPO will typically want to avoid using identifiers of the physical hardware for this
                                                                    // uid property. If they do use such a physical identifier, they will find themselves breaking the uniqueness requirement for uid when the same physical EVSE is redeployed
                                                                    // at another Location.
    evse_id?:                       string;                         // Compliant with the following specification for EVSE ID from "eMI3 standard version V1.0" (http://emi3group.com/documents-links/) "Part 2: business objects."
                                                                    // Optional because: if an evse_id is to be re-used in the real world, the evse_id can be removed from an EVSE object if the status is set to REMOVED.
    presence:                       PresenceStatus;                 // Whether this EVSE is currently physically present, or only planned for the future, or already removed.
    status_schedule?:               Array<IStatusSchedule>;         // Indicates a planned status update of the EVSE.
    connectors:                     Array<IConnector>;              // List of available connectors on the EVSE.
    physical_reference?:            string;                         // A number/string printed on the outside of the EVSE for visual identification.
    parking:                        IParking;                       // A description of the available parking for the EVSE.
    images?:                        Array<IImage>;                  // Links to images related to the EVSE such as photos or logos.
    calibration_info_url?:          string;                         // Link to a URL where certificates, identifiers and public keys related to the calibration of meters in this EVSE can be found.
    energy_meter?:                  IEnergyMeter;                   // Optional energy meter [OCPI Computer Science Extension!]
    created?:                       string;                         // Optional timestamp when this EVSE was created [OCPI Computer Science Extension!]
    last_updated:                   string;                         // Timestamp when this EVSE or one of its connectors was last updated (or created).
}

export interface IEVSEStatus extends IPartyIssuedObjectReference {
    status:                         Status;                         // The current status of the EVSE.
    timestamp?:                     string;                         // The optional timestamp of the status update.
}

export interface IStatusSchedule {
    period_begin:                   string;                         // Begin of the scheduled period.
    period_end?:                    string;                         // End of the scheduled period, if known.
    status:                         Status;                         // Status value during the scheduled period.
}

export interface IConnector {
    id:                             string;                         // Identifier of the Connector within the EVSE. Two Connectors may have the same id as long as they do not belong to the same EVSE object.
    standard:                       ConnectorType;                  // The standard of the installed connector.
    format:                         ConnectorFormat;                // The format (socket/cable) of the installed connector.
    cable_length?:                  number;                         // The length of the attached cable in centimeters. Only applicable if the value of the format field is CABLE.
    power_type:                     PowerType;                      // The power type of the connector.
    max_voltage:                    number;                         // Maximum voltage of the connector (line to neutral for AC_3_PHASE), in volt [V]. For example: DC Chargers might vary the voltage during charging when battery almost full.
    max_amperage:                   number;                         // Maximum amperage of the connector, in ampere [A].
    max_electric_power?:            number;                         // Maximum electric power that can be delivered by this connector, in Watts (W). When the maximum electric power is lower than the calculated value from voltage and amperage, this value should be set. For example: A DC Charge Point which can delivers up to 920V and up to 400A can be limited to a maximum of 150kW (max_electric_power = 150000). Depending on the car, it may supply max voltage or current, but not both at the same time. For AC Charge Points, the amount of phases used can also have influence on the maximum power.
    terms_and_conditions?:          string;                         // URL to the operator’s terms and conditions.
    capabilities?:                  Array<ConnectorCapability>;     // A list of functionalities that the connector is capable of.
    created?:                       string;                         // Optional timestamp when this connector was created [OCPI Computer Science Extension!]
    last_updated:                   string;                         // Timestamp when this connector was last updated (or created).
}

export interface IParking {
    vehicle_types:                  Array<VehicleType>;             // The vehicle types that the EVSE is intended for and that the associated parking is designed to accomodate.
    max_vehicle_weight?:            number;                         // The maximum vehicle weight that can park at the EVSE, in kilograms. A value for this field should be provided unless the value of the vehicle_types field contains no values other than PERSONAL_VEHICLE or MOTORCYCLE.
    max_vehicle_height?:            number;                         // The maximum vehicle height that can park at the EVSE, in centimeters. A value for this field should be provided unless the value of the vehicle_types field contains no values other than PERSONAL_VEHICLE or MOTORCYCLE.
    max_vehicle_length?:            number;                         // The maximum vehicle length that can park at the EVSE, in centimeters. A value for this field should be provided unless the value of the vehicle_types field contains no values other than PERSONAL_VEHICLE or MOTORCYCLE.
    max_vehicle_width?:             number;                         // The maximum vehicle width that can park at the EVSE, in centimeters. A value for this field should be provided unless the value of the vehicle_types field contains no values other than PERSONAL_VEHICLE or MOTORCYCLE.
    parking_bay_length?:            number;                         // The length of the parking bay, in centimeters. A value for this field should be provided unless the value of the vehicle_types field contains no values other than PERSONAL_VEHICLE or MOTORCYCLE.
    parking_bay_width?:             number;                         // The width of the parking bay, in centimeters. A value for this field should be provided unless the value of the vehicle_types field contains no values other than PERSONAL_VEHICLE or MOTORCYCLE.
    dangerous_goods_allowed?:       boolean;                        // Whether vehicles loaded with dangerous substances are allowed to park at the EVSE. A value for this field should be provided unless the value of the vehicle_types field contains no values other than PERSONAL_VEHICLE or MOTORCYCLE.
    evse_position:                  EVSEPosition;                   // The position of the EVSE relative to the parking space.
    direction:                      ParkingDirection;               // The direction in which the vehicle is to be parked next to this EVSE.
    restricted_to_type:             boolean;                        // Whether it is forbidden for vehicles of a type not listed in vehicle_types to park at this EVSE, even if they can physically park there safely.
    parking_restrictions?:          Array<ParkingRestriction>;      // All applicable restrictions on who can park at this EVSE, apart from those related to the vehicle type.
    reservation_required:           boolean;                        // Whether a reservation is required for parking at the EVSE.
    time_limit?:                    number;                         // A time limit. If this field is present, vehicles may not park in this parking longer than this number of minutes.
    roofed?:                        boolean;                        // Whether the vehicle will be parked under a roof while charging.
    images?:                        Array<IImage>;                  // Photos of the parking space at the EVSE. At least one photograph should be provided if the value of vehicle_types includes the DISABLED vehicle type.
    lighting?:                      boolean;                        // Whether the parking space for the EVSE is lit by artificial lighting.
    standards?:                     Array<string>                   // A list of standards that the parking space conforms to, e.g. PAS 1899 for parking for people with disabilities
}

export type EVSEPosition =
    "LEFT"   |                                                      // The EVSE is to the left of the vehicle.
                                                                    // For streetside parking, the CPO can assume the vehicle is facing the same way as traffic
                                                                    // on the side of the road that the EVSE is on. This means that LEFT is used for all streetside
                                                                    // parking in locales with left-hand traffic.
                                                                    // For parking bays leading sideways from a roadway, the CPO can assume the vehicle is
                                                                    // parking with the nose away from the roadway (that is, entering the parking bay driving forward).
    "RIGHT"  |                                                      // The EVSE is to the right of the vehicle when parked.
                                                                    // For streetside parking, the CPO can assume the vehicle is facing the same way as traffic
                                                                    // on the side of the road that the EVSE is on. This means that RIGHT is used for all
                                                                    // streetside parking in locales with right-hand traffic.
                                                                    // For parking bays leading sideways from a roadway, the CPO can assume the vehicle is
                                                                    // parking with the nose away from the roadway (that is, entering the parking bay driving forward).
    "CENTER" |                                                      // The EVSE is at the center of the impassable narrow end of a parking bay
    (string & {});

export type ParkingDirection =
    "PARALLEL"      |                                               // Parking happens parallel to the roadway on which vehicles approach the EVSE.
    "PERPENDICULAR" |                                               // Parking happens perpendicular to the roadway on which vehicles approach the EVSE.
    "ANGLE"         |                                               // Parking happens at an angle to the roadway on which vehicles approach the EVSE (i.e. echelon parking).
    "DRIVE_THROUGH" |                                               // A vehicle can stop, charge, and proceed without reversing into or out of a parking bay
    (string & {});

export type PresenceStatus =
    "PRESENT" |                                                     // The EVSE is currently present and whether it is currently usable can be indicated using the EVSE Status module.
    "PLANNED" |                                                     // The EVSE is not currently present but it is planned for the future.
    "REMOVED" |                                                     // The EVSE is not currently present but it is used to be present in the past.
    (string & {});

export type ConnectorCapability =
    "IEC_15118_2_PLUG_AND_CHARGE"  |                                // The Connector supports authentication of the Driver using a contract certificate stored in the vehicle according to IEC 15118-2.
    "IEC_15118_20_PLUG_AND_CHARGE" |                                // The Connector supports authentication of the Driver using a contract certificate stored in the vehicle according to IEC 15118-20.
    (string & {});

export type TariffType =
    "AD_HOC_PAYMENT" |                                              // Used to describe that a Tariff is valid when ad-hoc payment is used at the Charge Point (for example: Debit or Credit card payment terminal).
    "PROFILE_CHEAP"  |                                              // Used to describe that a Tariff is valid when Charging Preference: CHEAP is set for the session.
    "PROFILE_FAST"   |                                              // Used to describe that a Tariff is valid when Charging Preference: FAST is set for the session.
    "PROFILE_GREEN"  |                                              // Used to describe that a Tariff is valid when Charging Preference: GREEN is set for the session.
    "REGULAR"        |                                              // Used to describe that a Tariff is valid when using an RFID, without any Charging Preference, or when Charging Preference: REGULAR is set for the session.
    (string & {});


export type TaxIncluded =
    "YES" |                                                         // Taxes are included in the prices in this Tariff.
    "NO"  |                                                         // Taxes are not included, and will be added on top of the prices in this Tariff.
    "N/A";                                                          // No taxes are applicable to this Tariff.

export interface ITaxAmount {
    name:                           string,                         // A description of the tax. In countries where a tax name is required like Canada this can be something like "QST". In countries where this is not required, this can be something more generic like "VAT" or "General Sales Tax".
    account_number?:                string,                         // Tax Account Number of the business entity remitting these taxes. Optional as this is not required in all countries.
    percentage?:                    number,                         // Tax percentage. Optional as this is not required in all countries.
    amount:                         number                          // The amount of money of this tax that is due.
}

export interface IPrice {
    before_taxes:                   number;                         // Price/Cost excluding taxes.
    taxes?:                         Array<ITaxAmount>;              // All taxes that are applicable to this price and relevant to the receiver of the Session or CDR.
}

export interface IPriceLimit {
    before_taxes:                   number;                         // Maximum or minimum cost excluding taxes.
    after_taxes?:                   number;                         // Maximum or minimum cost including taxes.
}

export interface ITariff extends IPartyIssuedObjectReference {
    currency:                       string,                         // ISO-4217 code of the currency of this tariff.
    tariff_alt_text?:               Array<IDisplayText>,            // Optional list of multi-language alternative tariff info texts.
    tariff_alt_url?:                string,                         // URL to a web page that contains an explanation of the tariff information in human readable form.
    min_price?:                     IPrice,                         // When this field is set, a Charging Session with this tariff will at least cost this amount. This is different from a FLAT fee (Start Tariff, Transaction Fee), as a FLAT fee is a
                                                                    // fixed amount that has to be paid for any Charging Session. A minimum price indicates that when the cost of a Charging Session is lower than this amount, the cost of the Session
                                                                    // will be equal to this amount. (Also see note below)
    max_price?:                     IPrice,                         // When this field is set, a Charging Session with this tariff will NOT cost more than this amount. (See note below)
    elements:                       Array<ITariffElement>,          // List of tariff elements
    energy_mix?:                    IEnergyMix,                     // Details on the energy supplied with this tariff.
    created?:                       string;                         // Optional timestamp when this Tariff was created [OCPI Computer Science Extension!]
    last_updated:                   string                          // Timestamp when this tariff was last updated (or created).
}

export interface ITariffMetadata extends TMetadataDefaults {

}

export interface ITariffElement {
    price_components:               Array<IPriceComponent>,         // List of price components that make up the pricing of this tariff
    restrictions?:                  ITariffRestrictions             // Tariff restrictions object
}

export type TariffDimension =
    "ENERGY"       |                                                // Defined in kWh, step_size multiplier: 1 Wh
    "FLAT"         |                                                // Flat fee without unit for step_size
    "PARKING_TIME" |                                                // Time not charging: defined in hours, step_size multiplier: 1 second
    "TIME"         |                                                // Time charging: defined in hours, step_size multiplier: 1 second. Can also be used in combination with a RESERVATION restriction to describe the price of the reservation time.
    (string & {});

export interface IPriceComponent {
    type:                           TariffDimension,                // The dimension that is being priced.
    price:                          number,                         // Price per unit for this dimension. This is including or excluding taxes according to the `tax_included` field of the Tariff that this PriceComponent is contained in.
    taxes?:                         Array<ITaxPercentage>           // Applicable taxes for this tariff dimension. If omitted, no taxes applicable. Not providing any taxes may is different from 0% VAT, which would be a value of a single tax
                                                                    // percentage with name "VAT" and percentage 0 here.
}

export interface ITaxPercentage {
    name:                           string;                         // The name of the tax. Although up to 50 characters are technically allowed here, the intention is that Parties use short names where possible, preferring e.g. "VAT" over "Value Added Tax".
    percentage:                     number;                         // The applicable tax percentage.
}

export type DayOfWeek =
    "MONDAY"    |
    "TUESDAY"   |
    "WEDNESDAY" |
    "THURSDAY"  |
    "FRIDAY"    |
    "SATURDAY"  |
    "SUNDAY";

export type ReservationRestriction =
    "RESERVATION" |                                                 // Used in Tariff Elements to describe costs for a reservation.
    "RESERVATION_EXPIRES";                                          // Used in Tariff Elements to describe costs for a reservation that expires (i.e. driver does not start a charging session before expiry_date of the reservation).

export interface ITariffRestrictions {
    start_time?:                    string,                         // Start time of day in local time, the time zone is defined in the time_zone field of the Location, for example 13:30, valid from this time of the day.
                                                                    // Must be in 24h format with leading zeros. Hour/Minute separator: ":" Regex: ([0-1][0-9]|2[0-3]):[0-5][0-9]
    end_time?:                      string,                         // End time of day in local time, the time zone is defined in the time_zone field of the Location, for example 19:45, valid until this time of the day. Same syntax as start_time.
                                                                    // If end_time < start_time then the period wraps around to the next day. To stop at end of the day use: 00:00.
    min_energy?:                    number,                         // Minimum consumed energy in kWh, for example 20, valid from this amount of energy (inclusive) being used.
    max_energy?:                    number,                         // Maximum consumed energy in kWh, for example 50, valid until this amount of energy (exclusive) being used.
    min_current?:                   number,                         // Sum of the minimum current (in Amperes) over all phases, for example 5. When the EV is charging with more than, or equal to, the defined amount of current, this TariffElement is/becomes
                                                                    // active. If the charging current is or becomes lower, this TariffElement is not or no longer valid and becomes inactive. This describes NOT the minimum current over the entire
                                                                    // Charging Session. This restriction can make a TariffElement become active when the charging current is above the defined value, but the TariffElement MUST no longer be active when the
                                                                    // charging current drops below the defined value.
    max_current?:                   number,                         // Sum of the maximum current (in Amperes) over all phases, for example 20. When the EV is charging with less than the defined amount of current, this TariffElement becomes/is active.
                                                                    // If the charging current is or becomes higher, this TariffElement is not or no longer valid and becomes inactive. This describes NOT the maximum current over the entire Charging Session.
                                                                    // This restriction can make a TariffElement become active when the charging current is below this value, but the TariffElement MUST no longer be active when the charging current raises
                                                                    // above the defined value.
    min_power?:                     number,                         // Minimum power in kW, for example 5. When the EV is charging with more than, or equal to, the defined amount of power, this TariffElement is/becomes active. If the charging power is or
                                                                    // becomes lower, this TariffElement is not or no longer valid and becomes inactive. This describes NOT the minimum power over the entire Charging Session. This restriction can make a
                                                                    // TariffElement become active when the charging power is above this value, but the TariffElement MUST no longer be active when the charging power drops below the defined value.
    max_power?:                     number,                         // Maximum power in kW, for example 20. When the EV is charging with less than the defined amount of power, this TariffElement becomes/is active. If the charging power is or becomes higher,
                                                                    // this TariffElement is not or no longer valid and becomes inactive. This describes NOT the maximum power over the entire Charging Session. This restriction can make a TariffElement become
                                                                    // active when the charging power is below this value, but the TariffElement MUST no longer be active when the charging power raises above the defined value.
    min_duration?:                  number,                         // Minimum duration in seconds the Charging Session MUST last (inclusive). When the duration of a Charging Session is longer than the defined value, this TariffElement is or becomes active.
                                                                    // Before that moment, this TariffElement is not yet active.
    max_duration?:                  number,                         // Maximum duration in seconds the Charging Session MUST last (exclusive). When the duration of a Charging Session is shorter than the defined value, this TariffElement is or becomes active.
                                                                    // After that moment, this TariffElement is no longer active.
    min_restrictions_duration?:     number,                         // Minimum duration in seconds that the other restrictions for this TariffElement must have been fulfilled. When the other restrictions of the TariffElement have been fulfilled for this many
                                                                    // seconds, this TariffElement becomes active.
    day_of_week?:                   Array<DayOfWeek>,               // Which day(s) of the week this TariffElement is active.
    reservation?:                   ReservationRestriction          // When this field is present, the TariffElement describes reservation costs. A reservation starts when the reservation is made, and ends when the driver starts charging on the reserved
                                                                    // EVSE/Location, or when the reservation expires. A reservation can only have: FLAT and TIME TariffDimensions, where TIME is for the duration of the reservation.
    vehicle_requesting_power?:      boolean                         // Restricts the applicability of the PriceComponent to situations where the vehicle is requesting power from the EVSE, or to situations where the vehicle is not requesting power.
                                                                    // Note that the difference between "vehicle_requesting_power": false and something like "max_power": 0.01 is that the former only applies when the vehicle itself indicates towards the
                                                                    // EVSE that it will not take more energy. "max_power": 0.01 would also apply when the EVSE is not delivering energy while the vehicle is asking for it, as can be the case due to local
                                                                    // shortage of electric power for example.
}

export interface ITariffAssociation {
    start_date_time:                string,                         // The timestamp at which this Tariff Association comes into effect (inclusive)
    tariff_id:                      string,                         // The ID of the Tariff that is applied by this Tariff Association.
    connectors:                     Array<IConnectorReference>,      // The identifiers of the connectors that this Tariff Association applies a Tariff to. The receiver SHALL NOT send an error response when it receives a Tariff Association object referencing
                                                                    // connectors that it did not yet receive via the Locations module. It SHOULD instead store these dangling references as such and attempt to resolve them once it is looking up a Tariff for
                                                                    // a Session.
    audience:                       TariffAudience,                 // The audience (MSP contract holders, ad-hoc paying drivers, …) that the Tariff Association applies a Tariff for.
    created?:                       string,                         // Optional timestamp when this TariffAssociation was created [OCPI Computer Science Extension!]
    last_updated:                   string                          // The timestamp when this Tariff Association was last updated or created by the Party issuing it.
}

export interface IConnectorReference {
    evse_uid:                       string,                         // The UID of the EVSE in which the connector is that this ConnectorReference refers to.
    connector_id:                   string                          // The ID of the connector that this ConnectorReference refers to.
}

export type TariffAudience =
    "AD_HOC_PAYMENT" |                                              // Used to describe that a Tariff Association applies when ad-hoc payment is used at the Charging Station (for example: Debit or Credit card payment terminal).
    "PROFILE_CHEAP"  |                                              // Used to describe that a Tariff Association applies when Charging Preference CHEAP is set for the session.
    "PROFILE_FAST"   |                                              // Used to describe that a Tariff Association applies when Charging Preference: FAST is set for the session.
    "PROFILE_GREEN"  |                                              // Used to describe that a Tariff Association applies when Charging Preference: GREEN is set for the session.
    "REGULAR"        |                                              // Used to describe that a Tariff Association applies when using an MSP Charging Token, without any Charging Preference, or when Charging Preference: REGULAR is set for the session.
    (string & {});

export type TokenType =
    "AD_HOC_USER" |                                                 // One time use Token ID generated by a server (or App.) The eMSP uses this to bind a Session to a customer, probably an app user.
    "APP_USER"    |                                                 // Token ID generated by a server (or App.) to identify a user of an App. The same user uses the same Token for every Session.
    "EMAID"       |                                                 // An EMAID. EMAIDs are used as Tokens when the Charging Station and the vehicle are using ISO 15118 for communication.
    "RFID"        |                                                 // RFID Token
    (string & {});

export type Allowed =
    "ALLOWED"     |                                                 // This Token is allowed to charge at this location.
    "BLOCKED"     |                                                 // This Token is blocked.
    "EXPIRED"     |                                                 // This Token has expired.
    "NO_CREDIT"   |                                                 // This Token belongs to an account that has not enough credits to charge at the given location.
    "NOT_ALLOWED" |                                                 // Token is valid, but is not allowed to charge at the given location.
    (string & {});

export type WhitelistType =
    "ALWAYS"          |                                             // Token always has to be whitelisted, realtime authorization is not possible/allowed. CPO shall always allow any use of this Token.
    "ALLOWED"         |                                             // It is allowed to whitelist the token, realtime authorization is also allowed. The CPO may choose which version of authorization to use.
    "ALLOWED_OFFLINE" |                                             // In normal situations realtime authorization shall be used. But when the CPO cannot get a response from the eMSP (communication between CPO and eMSP is offline), the CPO shall allow this Token to be used.
    "NEVER";                                                        // Whitelisting is forbidden, only realtime authorization is allowed. CPO shall always send a realtime authorization for any use of this Token to the eMSP.

export type ProfileType =
    "CHEAP"   |                                                     // Driver wants to use the cheapest charging profile possible.
    "FAST"    |                                                     // Driver wants his EV charged as quickly as possible and is willing to pay a premium for this, if needed.
    "GREEN"   |                                                     // Driver wants his EV charged with as much regenerative (green) energy as possible.
    "REGULAR" |                                                     // Driver does not have special preferences.
    (string & {});

export interface IEnergyContract {
    supplier_name:                  string;                         // Name of the energy supplier for this token.
    contract_id?:                   string;                         // Contract ID at the energy supplier, that belongs to the owner of this token.
}

export interface IPublishToken {
    uid?:                           string;                         // Unique ID by which this Token can be identified.
    type?:                          TokenType;                      // Type of the token
    visual_number?:                 string;                         // Visual readable number/identification as printed on the Token (RFID card).
    issuer?:                        string;                         // Issuing company, most of the times the name of the company printed on the token (RFID card), not necessarily the eMSP.
    group_id?:                      string;                         // This ID groups a couple of tokens. This can be used to make two or more tokens work as one.
}

export interface IToken {
    uid:                            string;                         // Unique ID by which this Token, combined with the Token type, can be identified. In the case of RFID tokens, this is the UID according to ISO/IEC 14443, which is the field used by
                                                                    // CPO system (RFID reader on the Charge Point) to identify this token. If this is a APP_USER or AD_HOC_USER Token, it will be a unique ID generated by the eMSP. If this is an EMAID
                                                                    // Token, it will be the contract ID. This means that for Tokens with type EMAID, the fields uid and contract_id will hold the same value.
    type:                           TokenType;                      // Type of the token
    contract_id:                    string;                         // Uniquely identifies the EV Driver contract token within the eMSP’s platform (and suboperator platforms). Recommended to follow the specification for eMA ID from "eMI3 standard
                                                                    // version V1.0" (http://emi3group.com/documents-links/) "Part 2: business objects."
    visual_number?:                 string;                         // Visual readable number/identification as printed on the Token (RFID card), might be equal to the contract_id.
    issuer:                         string;                         // Issuing company, most of the times the name of the company printed on the token (RFID card), not necessarily the eMSP.
    group_id?:                      string;                         // This ID groups a couple of tokens. This can be used to make two or more tokens work as one, so that a session can be started with one token and stopped with another, handy when a
                                                                    // card and key-fob are given to the EV-driver. Beware that OCPP 1.5/1.6 only support group_ids (it is called parentId in OCPP 1.5/1.6) with a maximum length of 20.
    valid_from:                     string;                         // A point in time from which the Token is valid, inclusive.
    valid_until?:                   string;                         // A point in time when the validity of the token ends.
    whitelist:                      WhitelistType;                  // Indicates what type of white-listing is allowed.
    language?:                      string;                         // Language Code ISO 639-1. This optional field indicates the Token owner’s preferred interface language. If the language is not provided or not supported then the CPO is free to choose its own language.
    default_profile_type?:          ProfileType;                    // The default Charging Preference. When this is provided, and a charging session is started on an Charge Point that support Preference base Smart Charging and support this ProfileType, the Charge Point can start using this ProfileType, without this having to be set via: Set Charging Preferences.
    energy_contract?:               IEnergyContract;                // When the Charge Point supports using your own energy supplier/contract at a Charge Point, information about the energy supplier/contract is needed so the CPO knows which energy supplier to use. NOTE: In a lot of countries it is currently not allowed/possible to use a drivers own energy supplier/contract at a Charge Point.
    created?:                       string;                         // Optional timestamp when this token was created [OCPI Computer Science Extension!]
    last_updated:                   string;                         // Timestamp when this Token was last updated (or created).
}

export interface ITokenMetadata extends TMetadataDefaults {

}


export type AuthMethod =
    "AUTH_REQUEST" |                                                // Authentication request from the eMSP
    "WHITELIST"    |                                                // Whitelist used to authenticate, no request done to the eMSP
    (string & {});

export type CdrDimensionType =
    "ENERGY"       |                                                // defined in kWh, default step_size is 1 Wh
    "FLAT"         |                                                // flat fee, no unit
    "MAX_CURRENT"  |                                                // defined in A (Ampere), Maximum current reached during charging session
    "MIN_CURRENT"  |                                                // defined in A (Ampere), Minimum current used during charging session
    "PARKING_TIME" |                                                // time not charging: defined in hours, default step_size is 1 second
    "TIME"         |                                                // time charging: defined in hours, default step_size is 1 second
    (string & {});

export type SessionStatus =
    "ACTIVE"      |                                                 // The session has been accepted and is active. All pre-conditions were met: Communication between EV and EVSE (for example: cable plugged in correctly), EV or driver is authorized.
                                                                    // EV is being charged, or can be charged. Energy is, or is not, being transfered.
    "COMPLETED"   |                                                 // The session has been finished successfully. No more modifications will be made to the Session object using this state.
    "INVALID"     |                                                 // The Session object using this state is declared invalid and will not be billed.
    "PENDING"     |                                                 // The session is pending, it has not yet started. Not all pre-conditions are met. This is the initial state. The session might never become an active session.
    "RESERVATION" |                                                 // The session is started due to a reservation, charging has not yet started. The session might never become an active session.
    (string & {});

export interface ICDRDimension {
    type:                           CdrDimensionType;               // Type of cdr dimension
    volume:                         number;                         // Volume of the dimension consumed, measured according to the dimension type.
}

export interface IChargingPeriod {
    start_date_time:                string;                         // Start date and time of this charging period.
    dimensions:                     Array<ICDRDimension>;           // List of dimensions for this charging period.
    tariff_id?:                     string;                         // Unique identifier of the Tariff that is relevant for this Charging Period. If not provided, no Tariff is relevant during this period.
}

export interface ISession extends IPartyIssuedObjectReference {
    start_date_time:                string;                         // The timestamp when the session became ACTIVE in the Charging Station.
                                                                    // When the session is still PENDING, this field SHALL be set to the time the Session was created at the Chrging Station. When a Session goes from PENDING to ACTIVE, this field
                                                                    // SHALL be updated to the moment the Session went to ACTIVE in the Charging Station.
    end_date_time?:                 string;                         // The timestamp when the session was completed/finished, charging might have finished before the session ends, for example: EV is full, but parking cost also has to be paid.
    energy:                         number;                         // How many kWh of energy were transferred through the EVSE into the vehicle.
    cdr_token:                      ICDRToken;                      // Token used to start this charging session, including all the relevant information to identify the unique token.
    auth_method:                    AuthMethod;                     // Method used for authentication. This might change during a session, for example when the session was started with a reservation: ReserveNow: COMMAND. When the driver arrives
                                                                    // and starts charging using a Token that is whitelisted: WHITELIST.
    authorization_reference?:       string;                         // Reference to the authorization given by the eMSP. When the eMSP provided an authorization_reference in either: real-time authorization, StartSession or ReserveNow this field
                                                                    // SHALL contain the same value. When different authorization_reference values have been given by the eMSP that are relevant to this Session, the last given value SHALL be used here.
    location_id:                    string;                         // Location ID of the Location object of this CPO, on which the charging session is/was happening.
    connector?:                     ISessionConnector;              // The Connector that the Session happened on. This is allowed to be unset if and only if the Session is created for a reservation for which no EVSE has been assigned yet.
    meter_id?:                      string;                         // Optional identification of the kWh meter.
    currency:                       string;                         // ISO 4217 code of the currency used for this session.
    charging_periods?:              Array<IChargingPeriod>;         // An optional list of Charging Periods that can be used to calculate and verify the total cost.
    tariff_association_id:          ITariff;                        // The ID of the Tariff Association that was used to look up the Tariff of this Session. When the session is free, the ID of a Tariff Association for a Free of Charge tariff is
                                                                    // to be given in this field.
    tariff_id?:                     ITariff;                        // The ID of the Tariff that was used to compute what this Session costs. When the session is free, the ID of a Free of Charge tariff is to be given in this field.
    total_cost?:                    IPrice;                         // The total cost of the session in the specified currency. This is the price that the eMSP will have to pay to the CPO. A total_cost of 0.00 means free of charge. When omitted,
                                                                    // i.e. no price information is given in the Session object, it does not imply the session is/was free of charge.
    status:                         SessionStatus;                  // The status of the session.
    created?:                       string;                         // Optional timestamp when this session was created [OCPI Computer Science Extension!]
    last_updated:                   string;                         // Timestamp when this session was last updated (or created).
}

export interface ISessionMetadata extends TMetadataDefaults {

}

export interface ISessionConnector {
    evse_uid:                       string;                         // EVSE.uid of the EVSE of this Location on which the charging session is/was happening.
    connector_id:                   string;                         // Connector ID of the Connector of this Location where the charging session is/was happening.
}

export interface ICDRToken {
    country_code:                   string;                         // ISO-3166 alpha-2 country code of the MSP that 'owns' this Token.
    party_id:                       string;                         // ID of the eMSP that 'owns' this Token (following the ISO-15118 standard).
    uid:                            string;                         // Unique ID by which this Token can be identified. This is the field used by the CPO’s system (RFID reader on the Charge Point) to identify this token. Currently, in most cases: type=RFID, this is the RFID hidden ID as read by the RFID reader, but that is not a requirement. If this is a type=APP_USER Token, it will be a unique, by the eMSP, generated ID.
    type:                           TokenType;                      // Type of the token.
    contract_id:                    string;                         // Uniquely identifies the EV driver contract token within the eMSP’s platform (and suboperator platforms). Recommended to follow the specification for eMA ID from "eMI3 standard version V1.0" (https://web.archive.org/web/20230603153631/https://emi3group.com/documents-links/) "Part 2: business objects."
}

export interface ICDRLocation {
    id:                             string;                         // Uniquely identifies the location within the CPO’s platform (and suboperator platforms). This field can never be changed, modified or renamed.
    name?:                          string;                         // Display name of the location.
    address:                        string;                         // Street/block name and house number if available.
    city:                           string;                         // City or town.
    postal_code?:                   string;                         // Postal code of the location, may only be omitted when the location has no postal code: in some countries charging locations at highways don’t have postal codes.
    state?:                         string;                         // State only to be used when relevant.
    country:                        string;                         // ISO 3166-1 alpha-2 code for the country of this location.
    coordinates:                    IGeoLocation;                   // Coordinates of the location.
    evse_uid:                       string;                         // Uniquely identifies the EVSE within the CPO’s platform (and suboperator platforms). For example a database unique ID or the actual EVSE ID. This field can never be changed, modified or renamed. This is the technical identification of the EVSE, not to be used as human readable identification, use the field: evse_id for that. Allowed to be set to: #NA when this CDR is created for a reservation that never resulted in a charging session.
    evse_id:                        string;                         // Human readable identification of the EVSE. This is the identification that is shown to the EV driver. Allowed to be set to: #NA when this CDR is created for a reservation that never resulted in a charging session.
    connector_id:                   string;                         // Identifier of the connector within the EVSE. Allowed to be set to: #NA when this CDR is created for a reservation that never resulted in a charging session.
    connector_standard:             ConnectorType;                  // The standard of the installed connector. When this CDR is created for a reservation that never resulted in a charging session, this field can be set to any value and should be ignored by the Receiver.
    connector_format:               ConnectorFormat;                // The format (socket/cable) of the installed connector. When this CDR is created for a reservation that never resulted in a charging session, this field can be set to any value and should be ignored by the Receiver.
    connector_power_type:           PowerType;                      // The power type of the installed connector. When this CDR is created for a reservation that never resulted in a charging session, this field can be set to any value and should be ignored by the Receiver.
}

export interface ISignedValue {
    nature:                         string;                         // Nature of the value, in other words, the event this value belongs to. Possible values at moment of writing: - Start (value at the start of the Session) - End (signed value at the end of the Session) - Intermediate (signed values take during the Session, after Start, before End) Others might be added later.
    plain_data:                     string;                         // The un-encoded string of data. The format of the content depends on the EncodingMethod field.
    signed_data:                    string;                         // Blob of signed data, base64 encoded. The format of the content depends on the EncodingMethod field.
}

export type SignedDataEncodingMethod =
    "OCMF"                       |                                  // Open Charge Point Protocol (OCPP) Message Format
    "Alfen Eichrecht"            |                                  // Alfen Eichrecht encoding / implementation
    "EDL40 E-Mobility Extension" |                                  // eBee smart technologies implementation
    "EDL40 Mennekes"             |                                  // Mennekes implementation
    (string & {});

export interface ISignedData {
    encoding_method:                SignedDataEncodingMethod;       // The name of the encoding used in the SignedData field. This is the name given to the encoding by a company or group of companies. See note below.
    encoding_method_version?:       number;                         // Version of the EncodingMethod (when applicable)
    public_key?:                    string;                         // Public key used to sign the data, base64 encoded.
    signed_values:                  Array<ISignedValue>;            // One or more signed values.
    url?:                           string;                         // URL that can be shown to an EV driver. This URL gives the EV driver the possibility to check the signed data from a charging session.
}

export interface ICDR extends IPartyIssuedObjectReference {
    start_date_time:                string;                         // Start timestamp of the charging session, or in-case of a reservation (before the start of a session) the start of the reservation.
    end_date_time:                  string;                         // The timestamp when the session was completed/finished, charging might have finished before the session ends, for example: EV is full, but parking cost also has to be paid.
    session_id?:                    string;                         // Unique ID of the Session for which this CDR is sent. Is only allowed to be omitted when the CPO has not implemented the Sessions module or this CDR is the result of a reservation that never became a charging session, thus no OCPI Session.
    cdr_token:                      ICDRToken;                      // Token used to start this charging session, including all the relevant information to identify the unique token.
    auth_method:                    AuthMethod;                     // Method used for authentication.
    authorization_reference?:       string;                         // Reference to the authorization given by the eMSP. When the eMSP provided an authorization_reference in either: real-time authorization, StartSession or ReserveNow, this field SHALL contain the same value. When different authorization_reference values have been given by the eMSP that are relevant to this Session, the last given value SHALL be used here.
    cdr_location:                   ICDRLocation;                   // Location where the charging session took place, including only the relevant EVSE and Connector.
    meter_id?:                      string;                         // Identification of the Meter inside the Charge Point.
    currency:                       string;                         // Currency of the CDR in ISO 4217 Code.
    tariff_association_id:          string;                         // The ID of the Tariff Association that was used to look up the Tariff of this CDR. When the session is free, the ID of a Tariff Association for a Free of Charge tariff is to be given in this field.
    tariff_id:                      string;                         // The ID of the Tariff that was used to compute what the Session of this CDR costs. When the session is free, the ID of a Free of Charge tariff is to be given in this field.
    charging_periods:               Array<IChargingPeriod>;         // List of Charging Periods that make up this charging session.
    signed_data?:                   ISignedData;                    // Signed data that belongs to this charging Session.
    total_cost:                     IPrice;                         // Total sum of all the costs of this transaction in the specified currency.
    total_fixed_cost?:              IPrice;                         // Total sum of all the fixed costs in the specified currency, except fixed price components of parking and reservation. The cost not depending on amount of time/energy used etc. Can contain costs like a start tariff.
    total_energy:                   number;                         // Total energy charged, in kWh.
    total_energy_cost?:             IPrice;                         // Total sum of all the cost of all the energy used, in the specified currency.
    total_time:                     number;                         // Total duration of the charging session (including the duration of charging and not charging), in hours.
    total_time_cost?:               IPrice;                         // Total sum of all the cost related to duration of charging during this transaction, in the specified currency.
    total_reservation_cost?:        IPrice;                         // Total sum of all the cost related to a reservation of a Charge Point, including fixed price components, in the specified currency.
    remark?:                        string;                         // Optional remark, can be used to provide additional human readable information to the CDR, for example: reason why a transaction was stopped.
    credit?:                        boolean;                        // When set to true, this is a Credit CDR, and the field credit_reference_id needs to be set as well.
    credit_reference_id?:           string;                         // Is required to be set for a Credit CDR. This SHALL contain the id of the CDR for which this is a Credit CDR.
    home_charging_compensation?:    boolean;                        // When set to true, this CDR is for a charging session using the home charger of the EV Driver for which the energy cost needs to be financial compensated to the EV Driver.
    created?:                       string;                         // Optional timestamp when this CDR was created [OCPI Computer Science Extension!]
    last_updated:                   string;                         // Timestamp when this CDR was last updated (or created).
}

export interface ICDRMetadata extends TMetadataDefaults {

}



// -----------------------------
// OCPI Management Extensions!
// -----------------------------

export type Role =
    "CPO"   |                                                       // Charge Point Operator Role.
    "EMSP"  |                                                       // eMobility Service Provider Role.
    "NAP"   |                                                       // National Access Point Role (national Database with all Location information of a country).
    "NSP"   |                                                       // Navigation Service Provider Role, role like an eMSP (probably only interested in Location information).
    "OTHER" |                                                       // Other role.
    "SCSP"  |                                                       // Smart Charging Service Provider Role.
    (string & {});

export interface IRemoteParty {
    //id:                              string;
    //"@context":                      string;
    countryCode:                     string;
    partyId:                         string;
    role:                            Role;
    businessDetails:                 IBusinessDetails;
    partyStatus:                     string;
    localAccessInfos:                Array<ILocalAccessInfo>;
    remoteAccessInfos:               Array<IRemoteAccessInfo>;
    created:                         string;
    last_updated:                    string;
}

export interface IRemotePartyMetadata extends TMetadataDefaults {

}

export interface IAccessInfo {
    token:                           string;
    status:                          string;
}

export interface ILocalAccessInfo {
    accessToken:                     string;
    status:                          string;
    notBefore?:                      string;
    notAfter?:                       string;
    accessTokenIsBase64Encoded:      boolean;
    allowDowngrades:                 boolean;
}

export interface IRemoteAccessInfo {
    accessToken:                     string;
    versionsURL:                     string;
    versionIds:                      Array<string>;
    selectedVersionId:               string;
    status:                          string;
    notBefore?:                      string;
    notAfter?:                       string;
    accessTokenIsBase64Encoded:      boolean;
    allowDowngrades:                 boolean;
}




// -----------------------------------
// OCPI Computer Science Extensions!
// -----------------------------------
export interface IEnergyMeter {
    id:                              string;
    model?:                          string;
    model_url?:                      string;
    hardware_version?:               string;
    firmware_version?:               string;
    manufacturer?:                   string;
    manufacturer_url?:               string;
    public_keys?:                    Array<string>;
    public_key_certificate_chain?:   string;
    transparency_softwares?:         Array<ITransparencySoftwareStatus>;

}

// OCPI Computer Science Extension!
export interface ITransparencySoftwareStatus {
    transparency_software:           ITransparencySoftware;
    legal_status:                    string;
    certificate:                     string;
    certificate_issuer:              string;
    not_before:                      string;
    not_after:                       string;
}

// OCPI Computer Science Extension!
export interface ITransparencySoftware {
    name:                            string;
    version:                         string;
    open_source_license:             Array<IOpenSourceLicense>;
    vendor:                          string;
    logo?:                           string;
    how_to_use?:                     string;
    more_information?:               string;
    source_code_repository?:         string;
}

// OCPI Computer Science Extension!
export interface IOpenSourceLicense {
    id:                              string;
    description?:                    Array<IDisplayText>;
    urls?:                           Array<string>;
}

export interface IOpenDataLicense {
    id:                              string;
    description?:                    Array<IDisplayText>;
    urls?:                           Array<string>;
}
