# OCPI Explorer DesktopApp

This project implements the [**Open Charge Point Interface (OCPI)**](https://github.com/ocpi/ocpi) defined by the [EV Roaming Foundation](https://evroaming.org) using [Electron](https://www.electronjs.org), a cross platform Open Source framework for creating native applications with web technologies like Java-/TypeScript, HTML, and (S)CSS. The focus of this project is **testing** and **certification** of the OCPI protocol and 3rd party vendor extensions. This project supports the following protocol versions and extensions:

- [OCPI v2.1.1](https://github.com/ocpi/ocpi/tree/release-2.1.1-bugfixes) *(under development)*
- [OCPI v2.2.1](https://github.com/ocpi/ocpi/tree/release-2.1.1-bugfixes) *(under development)*
- [OCPI v2.3](https://github.com/ocpi/ocpi/tree/release-2.1.1-bugfixes) *(under development)*
- [OCPI v3.0](https://github.com/ocpi/ocpi/tree/release-2.1.1-bugfixes) *(planned)*



## Installation

Install the required Node.js modules...
```
$ npm install
```


## Start

Start the Electron App using the given OCPI Versions URL and acess token, which will be BASE64 encoded before transmission.

```
./run.sh --url=https://api.example.org/ocpi2.1/versions --token=abcd --base64
```


## Security

(Security) updates...
```
$ npm audit fix
$ npm update
```

Forced update of all Node.js modules...
```
$ ./update.sh
```


## License

[GNU Affero General Public License)](LICENSE)
