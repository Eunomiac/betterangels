/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Sep 28 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

const wiggle = (midPoint, range, paddingMult = 0) => {
  const padding = paddingMult * range / 2;
  return midPoint + (Math.random() - 0.5) * (range - padding * 2);
};
const [midPoint, range, paddingMult] = [200, 100, 0.6];
const wiggles = [];
let maxVal = -100000000;
let minVal = 100000000;
for (let i = 0; i < 10000; i++) {
  const thisVal = wiggle(midPoint, range, paddingMult);
  maxVal = Math.max(thisVal, maxVal);
  minVal = Math.min(thisVal, minVal);
};
console.log(minVal, maxVal);