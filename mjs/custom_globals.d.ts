declare var window: Window & typeof globalThis;

interface Point2D {x: number, y: number}
interface Point3D extends Point2D {z: number}
type Point = Point2D | Point3D

declare class XCircle { }

type SetSpread = [
	[number, number, number, number, number, number, number, number, number, number],
	[number, number, number, number, number, number, number, number, number, number],
	[number, number, number, number, number, number, number, number, number, number],
	[number, number, number, number, number, number, number, number, number, number],
	[number, number, number, number, number, number, number, number, number, number],
	[number, number, number, number, number, number, number, number, number, number],
	[number, number, number, number, number, number, number, number, number, number],
	[number, number, number, number, number, number, number, number, number, number],
	[number, number, number, number, number, number, number, number, number, number],
	[number, number, number, number, number, number, number, number, number, number]
];