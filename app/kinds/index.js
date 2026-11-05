// @generated
/**
 * Every kind Hanzo Design makes, in the order the home and the pills list them.
 * (3D mesh, cinema video, and audio/music stems belong to @hanzo/studio.)
 */
import { ad } from './ad.js';
import { app } from './app.js';
import { document_, slides } from './document.js';
import { image } from './image.js';
import { poster } from './poster/index.js';
import { type } from './type/index.js';
export const ALL = [image, poster, document_, slides, type, ad, app];
export const kind = (id) => ALL.find((k) => k.id === id) ?? image;
/** The kind a tool name calls. */
export const called = (tool) => ALL.find((k) => k.tool.name === tool) ?? null;
