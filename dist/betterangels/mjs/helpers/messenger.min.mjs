/* ▌██░░ betterangels v0.0.1-prealpha (2022) ║ MIT License ║ https://github.com/Eunomiac/betterangels ░░██▐ */// export const sendAll = (function, ...args) => game.socket.emit("system.betterangels", [funcName, ...args]);
// export const sendAllGM = (function, ...args) => {
// 	game.socket.emit("system.betterangels", [function, ...args]);
// 	function(...args);
// }
// export const sendTo = (userRefs, function, ...args) => {

// }